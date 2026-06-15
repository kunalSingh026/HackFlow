const express = require('express');
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventStats,
  getEventById,
  updateEvent,
  createAnnouncement,
  uploadEventBanner,
  getAssignedEvents,
  getPublicStats,
} = require('../controllers/eventController');

const {
  registerForEvent,
  checkInUser,
  getMyRegistrations,
} = require('../controllers/registrationController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getEventSubmissions,
  getLeaderboard,
  publishLeaderboard,
} = require('../controllers/evaluationController');
const { validateCreateEvent } = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @route GET /api/events
 * @description Get all hackathon events
 * @access Public (Anyone can view events)
 */
router.get('/', getAllEvents);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/judge/assigned', protect, getAssignedEvents);
router.get('/public-stats', getPublicStats);
router.get('/:eventId', getEventById);

/**
 * @route POST /api/events
 * @description Create a new hackathon
 * @access Private (Admin Only)
 */
router.post('/', protect, authorizeRoles('admin'), validateCreateEvent, createEvent);

router.post('/:eventId/register', protect, registerForEvent);

router.get('/:eventId/stats', protect, authorizeRoles('admin'), getEventStats);

router.post('/:eventId/checkin/:registrationId', protect, authorizeRoles('admin'), checkInUser);

/**
 * @route GET /api/events/:eventId/submissions
 * @desc Judge view all submitted projects
 */
router.get('/:eventId/submissions', protect, getEventSubmissions);

/**
 * @route GET /api/events/:eventId/leaderboard
 * @desc Get the mathematically ranked leaderboard fot the event
 */
router.get('/:eventId/leaderboard', protect, getLeaderboard);

/**
 * @route PUT /api/events/:eventId/publish-leaderboard
 * @desc Publish the leaderboard and lock grading
 */
router.put('/:eventId/publish-leaderboard', protect, publishLeaderboard);

/**
 * @desc Host or Admin updates event details
 */
router.put('/:eventId', protect, updateEvent);

/**
 * @desc Host or Admin broadcasts an announcement
 */
router.post('/:eventId/announcements', protect, createAnnouncement);

/**
 * @desc Host or Admin uploads a promotional banner
 */
router.post('/:eventId/upload-banner', protect, upload.single('banner'), uploadEventBanner);

module.exports = router;
