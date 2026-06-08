const Registration = require('../models/registration.model');
const Event = require('../models/event.model');
const QRCode = require('qrcode');
const sendTicketEmail = require('../utils/sendTicketEmail');

/**
 * @description Register a user for an event and send QR Ticket
 * @route POST /api/events/:eventId/register
 * @access Private (Logged in users only)
 */
exports.registerForEvent = async (req, res) => {
    try {
        let eventId = req.params.eventId;
        if (eventId.startsWith(':')) {
            eventId = eventId.substring(1);
        }
        const userId = req.user.id;

        // Find the Event
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });



        // Check deadlines and capacity
        if(new Date() > new Date(event.registrationDeadline)) {
            return res.status(400).json({ message: 'Registration deadline has passed.' })
        }
        if (event.ticketing.availableSeats <= 0) {
            return res.status(400).json({ message: 'Sorry, this event is completely sold out.' });
        }

        // Check for double booking
        const existingRegistration = await Registration.findOne({ user: userId, event: eventId });
        if(existingRegistration) {
            return res.status(400).json({ message: 'You are already registered for this event!' });
        }

        //Create the Registration Ticket in DB
        const newRegistration = new Registration({ user: userId, event: eventId });
        await newRegistration.save();

        // Update available seats and registration count in database
        event.ticketing.availableSeats = Math.max(0, event.ticketing.availableSeats - 1);
        event.registrationCount = (event.registrationCount || 0) + 1;
        await event.save();

        // --- NEW TICKET AND EMAIL LOGIC START HERE ---

        // Generate the QR Code
        // We encode the specific registration ID and event ID in a JSON structure. Later, the admin's scanner app will parse this.
        const qrDataString = JSON.stringify({
            eventId: eventId,
            registrationId: newRegistration._id.toString()
        });
        const qrCodeDataUri = await QRCode.toDataURL(qrDataString);

        await sendTicketEmail({
            email: req.user.email,
            username: `${req.user.firstName} ${req.user.lastName}`,
            eventTitle: event.title,
            eventDate: new Date(event.timing.startDate).toDateString(),
            eventMode: event.mode.toUpperCase(),
            ticketId: newRegistration._id.toString().slice(-6).toUpperCase(), // Grab last 6 chars for a clean visual ID
            qrCodeDataUri: qrCodeDataUri
        });
        res.status(201).json({
            message: 'Successfully registered! Ticket has been send to your email.',
            registration: newRegistration
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @description Admin scans a QR code to check-in a participant
 * @route POST /api/events/:eventId/checkin/:registartionId
 * @access Private (Admin Only)
 */
exports.checkInUser = async(req, res) => {
    try {
        const { eventId, registrationId } = req.params;

        const registration = await Registration.findById(registrationId)
            .populate('user', 'firstName lastName email profilePicture');

            if(!registration) {
                return res.status(404).json({ message: "Invalid Ticket. No registration found." });
            }

            if (registration.event.toString() !== eventId) {
                return res.status(400).json({ message: "Ticket mismatch! This ticket is for a different event." });
            }

            if(registration.checkInStatus) {
                return res.status(400).json({ 
                    message: "WARNING: This user is already checked in!",
                    checkedIn: registration.checkInTime
                 });
            }

            registration.checkInStatus = true;
            registration.checkInTime = new Date();

            await registration.save();

            res.status(200).json({
                message: "Check-in successfull!",
                attendee: {
                    name: `${registration.user.firstName} ${registration.user.lastName}`,
                    email: registration.user.email,
                    profileImage: registration.user.profilePicture,
                    checkInTime: registration.checkInTime
                }
            });
    } catch (error) {
        if(error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid QR Code / Registration ID format.' });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @description Get all registrations for the logged in user
 * @route GET /api/events/my-registrations
 * @access Private
 */
exports.getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user.id }).populate('event');
        res.status(200).json({
            success: true,
            registrations
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};