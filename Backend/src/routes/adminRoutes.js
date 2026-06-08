const express = require('express');
const { 
    toggleUserBan, 
    addItineraryRound,
    getAllUsers,
    updateUserRole,
    assignJudgesToEvent,
    getAllEventsAdmin
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(isAdmin);

/**
 * @route PUT /api/admin/users/:userId/ban
 * @desc Ban or Unban a specific user
 */
router.put('/users/:userId/ban', toggleUserBan);

/**
 * @route POST /api/admin/events/:eventId/itinerary
 * @desc Admin adds a new phase/round to the hackathon timeline
 */
router.post('/events/:eventId/itinerary', addItineraryRound);

/**
 * @route GET /api/admin/users
 * @desc Admin lists all registered users
 */
router.get('/users', getAllUsers);

/**
 * @route PUT /api/admin/users/:userId/role
 * @desc Admin promotes or demotes a user's role
 */
router.put('/users/:userId/role', updateUserRole);

/**
 * @route PUT /api/admin/events/:eventId/judges
 * @desc Admin assigns an array of judges to an event
 */
router.put('/events/:eventId/judges', assignJudgesToEvent);

/**
 * @route GET /api/admin/events
 * @desc Admin lists all events
 */
router.get('/events', getAllEventsAdmin);

module.exports = router;