const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const Team = require('../models/team.model');
const cloudinary = require('../config/cloudinary');

/**
 * @description Create a new Hackathon Event
 * @route POST /api/events
 * @access Private (Admin Only)
 */
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      timing,
      registrationDeadline,
      mode,
      images,
      ticketing,
      visibility,
      sponsors,
      contactInfo,
      phases,
      tracks,
      customProblemStatements,
      prizes,
      judgingCriteria,
      eligibility,
      logistics,
      venue,
    } = req.body;

    // Fallbacks for schema compliance if using the new phase-based timelines
    let eventTiming = timing || {};
    if (phases) {
      if (phases.hackingStart && !eventTiming.startDate)
        eventTiming.startDate = phases.hackingStart;
      if (phases.hackingEnd && !eventTiming.endDate) eventTiming.endDate = phases.hackingEnd;
    }
    let regDeadline = registrationDeadline;
    if (phases && phases.registrationEnd && !regDeadline) {
      regDeadline = phases.registrationEnd;
    }

    // Date Validation: End date cannot be before start date
    if (new Date(eventTiming.startDate) > new Date(eventTiming.endDate)) {
      return res.status(400).json({ message: 'End date cannot be before start date.' });
    }

    // Deadline Validation: Registration must close before the event ends
    if (new Date(regDeadline) > new Date(eventTiming.endDate)) {
      return res
        .status(400)
        .json({ message: 'Registration deadline must be before the event ends.' });
    }

    // Ticketing Logic: When creating an event, available seats must equal total seats
    const eventTicketing = {
      ...ticketing,
      availableSeats: ticketing ? ticketing.totalSeats : 0,
    };

    //-----Create the Event ------
    const newEvent = new Event({
      title,
      description,
      category,
      tags,
      timing: eventTiming,
      registrationDeadline: regDeadline,
      mode,
      images,
      ticketing: eventTicketing,
      visibility,
      sponsors,
      contactInfo,
      phases,
      tracks,
      customProblemStatements,
      prizes,
      judgingCriteria,
      eligibility,
      logistics,
      venue,
      organizer: req.user.id, // Injected by our protect middleware
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Event created successfully!',
      event: newEvent,
    });
  } catch (error) {
    // handle Mongoose Validation Errors (e.g., missing a 'required' field)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Get all events (with Pagination)
 * @route GET /api/events
 * @access Public / Private
 */
exports.getAllEvents = async (req, res) => {
  try {
    // 1. Extract page and limit from the query string
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // 2. Calculate the skip value
    const startIndex = (page - 1) * limit;

    // 3. Fire parallel queries (This is the ONLY place 'events' should be declared)
    const [events, totalDocuments] = await Promise.all([
      Event.find().sort({ createdAt: -1 }).skip(startIndex).limit(limit),
      Event.countDocuments(),
    ]);

    // 4. Calculate total pages
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      message: 'Events retrieved successfully',
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalDocuments,
        itemsPerPage: limit,
      },
      data: events,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Get a single event by ID
 * @route GET /api/events/:eventId
 * @access Public
 */
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate('organizer', 'firstName lastName email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({
      message: 'Event retrieved successfully',
      data: event,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Get live stats for the admin dashboard
 * @route GET /api/events/:eventId/stats
 * @access Private (Admin Only)
 */
exports.getEventStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const [totalRegistrations, totalCheckedIn, totalTeams, teamsWithSubmissions] =
      await Promise.all([
        Registration.countDocuments({ event: eventId }),

        Registration.countDocuments({ event: eventId, checkInStatus: true }),

        Team.countDocuments({ event: eventId }),

        Team.countDocuments({
          event: eventId,
          'project.githubLink': { $exists: true, $ne: '' },
        }),
      ]);
    res.status(200).json({
      message: 'Live stats retrieved successfully',
      event: event.title,
      stats: {
        totalRegistrations,
        totalCheckedIn,
        totalTeams,
        projectsSubmitted: teamsWithSubmissions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Update an existing Event
 * @route PUT /api/events/:eventId
 * @access Private (Host or Admin Only)
 */
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Authorization check: User must be organizer or an admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to edit this event.' });
    }

    const {
      title,
      description,
      category,
      tags,
      timing,
      registrationDeadline,
      mode,
      ticketing,
      visibility,
      phases,
      tracks,
      customProblemStatements,
      prizes,
      judgingCriteria,
      eligibility,
      logistics,
      venue,
    } = req.body;

    // Apply changes
    if (title) event.title = title;
    if (description) {
      if (description.short) event.description.short = description.short;
      if (description.detailed) event.description.detailed = description.detailed;
    }
    if (category) event.category = category;
    if (tags) event.tags = tags;
    if (mode) event.mode = mode;
    if (venue !== undefined) event.venue = venue;
    if (visibility) event.visibility = { ...event.visibility, ...visibility };
    if (phases) event.phases = { ...event.phases, ...phases };
    if (tracks) event.tracks = tracks;
    if (customProblemStatements) event.customProblemStatements = customProblemStatements;
    if (prizes) event.prizes = { ...event.prizes, ...prizes };
    if (judgingCriteria) event.judgingCriteria = judgingCriteria;
    if (eligibility) event.eligibility = { ...event.eligibility, ...eligibility };
    if (logistics) event.logistics = { ...event.logistics, ...logistics };

    if (ticketing) {
      const regCount = event.registrationCount || 0;
      const total =
        ticketing.totalSeats !== undefined
          ? Number(ticketing.totalSeats)
          : event.ticketing.totalSeats;
      event.ticketing.totalSeats = total;
      event.ticketing.availableSeats = Math.max(0, total - regCount);
    }

    if (timing) {
      event.timing = { ...event.timing, ...timing };
    }
    if (registrationDeadline) event.registrationDeadline = registrationDeadline;

    await event.save();

    res.status(200).json({
      message: 'Event updated successfully!',
      event,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Create a new announcement for an event
 * @route POST /api/events/:eventId/announcements
 * @access Private (Host or Admin Only)
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Authorization check
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'You are not authorized to post announcements for this event.' });
    }

    const newAnnouncement = {
      title,
      content,
      createdAt: new Date(),
    };

    event.announcements.push(newAnnouncement);
    await event.save();

    res.status(201).json({
      message: 'Announcement broadcasted successfully!',
      announcements: event.announcements,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Upload promotional banner for an event
 * @route POST /api/events/:eventId/upload-banner
 * @access Private (Host or Admin Only)
 */
exports.uploadEventBanner = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file.' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Authorization check
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'You are not authorized to upload banners for this event.' });
    }

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'hackflow_banners' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await uploadStream();
    event.images.banner = result.secure_url;
    await event.save();

    res.status(200).json({
      message: 'Banner uploaded successfully!',
      bannerUrl: result.secure_url,
      event,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Get events assigned to the logged-in judge
 * @route GET /api/events/judge/assigned
 * @access Private (Judge Only)
 */
exports.getAssignedEvents = async (req, res) => {
  try {
    const events = await Event.find({ judges: req.user.id }).populate(
      'organizer',
      'firstName lastName email'
    );
    res.status(200).json({
      message: 'Assigned events retrieved successfully',
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Get general public stats (for landing page / uptime monitoring)
 * @route GET /api/events/public-stats
 * @access Public
 */
exports.getPublicStats = async (req, res) => {
  try {
    // Simple health check query to ensure DB connectivity
    const [totalEvents, totalRegistrations, totalTeams] = await Promise.all([
      Event.countDocuments(),
      Registration.countDocuments(),
      Team.countDocuments(),
    ]);

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date(),
      data: {
        totalEvents,
        totalRegistrations,
        totalTeams,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
};
