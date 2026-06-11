const User = require('../models/user.model');
const Team = require('../models/team.model');
const Event = require('../models/event.model');

/**
 * @description Toggle a user's ban status (Ban/Unban)
 * @route PUT /api/admin/users/:userId/ban
 * @access Private (Admin Only)
 */
exports.toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'You cannot ban another administrator.' });
    }

    user.isBanned = !user.isBanned;
    await user.save({ validateBeforeSave: false });

    if (user.isBanned) {
      await Team.updateMany({ members: userId }, { $pull: { members: userId } });
    }
    res.status(200).json({
      message: `User ${user.firstName} has been successfully ${user.isBanned ? 'banned' : 'unbanned'}.`,
      isBanned: user.isBanned,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Admin adds a new round to the event itinerary
 * @route POST /api/admin/events/:eventId/itinerary
 * @access Private (Admin Only)
 */
exports.addItineraryRound = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, startTime, endTime, meetingUrl } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }
    const newRound = {
      title,
      description,
      startTime,
      endTime,
      meetingUrl,
    };
    event.itinerary.push(newRound);

    await event.save();

    res.status(201).json({
      message: 'Itinerary round added successfully.',
      itinerary: event.itinerary,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Get all users registered on HackFlow
 * @route GET /api/admin/users
 * @access Private (Admin Only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      '-password -emailVerificationOtp -otpExpires -resetPasswordToken -resetPasswordExpires'
    );
    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Update user role (participant, judge, admin)
 * @route PUT /api/admin/users/:userId/role
 * @access Private (Admin Only)
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['participant', 'judge', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role value.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: `User ${user.firstName}'s role has been successfully updated to ${role}.`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Assign judges to a specific event
 * @route PUT /api/admin/events/:eventId/judges
 * @access Private (Admin Only)
 */
exports.assignJudgesToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { judgeIds } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Populate event's judges list
    event.judges = judgeIds;
    await event.save();

    res.status(200).json({
      message: 'Judges assigned successfully to event.',
      judges: event.judges,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Get all events (Admin Portal view with organizer & judges populated)
 * @route GET /api/admin/events
 * @access Private (Admin Only)
 */
exports.getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'firstName lastName email')
      .populate('judges', 'firstName lastName email username');
    res.status(200).json({
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
