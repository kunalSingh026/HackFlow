const express = require('express');
const router = express.Router();

const {
    createTeam,
    requestToJoin,
    approveJoinRequest,
    getAvailableParticipants,
    inviteUserToTeam,
    acceptInvite,
    leaveTeam,
    removeMember,
    disbandTeam,
    submitProject,
    getMyTeam,
    getMyInvitations,
    rejectInvite
} = require('../controllers/teamController');

const { submitEvaluation } = require('../controllers/evaluationController');


const { protect } = require('../middleware/authMiddleware');

/**
 * @route POST /api/teams/event/:eventId
 * @desc Create a new team for a specific event
 * @access Private (Logged in & Registered Users)
 */
router.post('/event/:eventId', protect, createTeam);

/**
 * @routes POST /api/teams/:teamId/request
 * @desc Send a request to join a team
 * @access Private (Logged in & Registered Users)
 */
router.post('/:teamId/request', protect, requestToJoin);

/**
 * @route POST /api/teams/:teamId/approve/:userId
 * @desc Team leader approves a pending join request
 * @access Private (Team Leader Only)
 */
router.post('/:teamId/approve/:userId', protect, approveJoinRequest);

/**
 * @route GET /api/teams/event/:eventId/participants
 * @desc Get available participants for matchmaking
 */
router.get('/event/:eventId/participants', protect, getAvailableParticipants);

/**
 * @route POST /api/teams/:teamId/invite/:userId
 * @desc Leader invites a user to the team
 */
router.post('/:teamId/invite/:userId', protect, inviteUserToTeam);

/**
 * @route POST /api/teams/:teamId/accept-invite
 * @desc User accepts an invitation to join a team
 */
router.post('/:teamId/accept-invite', protect, acceptInvite);

/**
 * @route POST /api/teams/:teamId/leave
 * @desc Standard member leaves the team (Locked 24h before event)
 */
router.post('/:teamId/leave', protect, leaveTeam);

/**
 * @route POST /api/teams/:teamId/remove/:userId
 * @desc Captain removes a member
 */
router.post('/:teamId/remove/:userId', protect, removeMember);

/**
 * @route DELETE /api/teams/:teamId
 * @desc Captain disbands the entire team
 */
router.delete('/:teamId', protect, disbandTeam);

/**
 * @route PUT /api/teams/:teamId/submit
 * @desc Team Captain Submits the final project links
 */
router.put('/:teamId/submit', protect, submitProject);

/**
 * @route GET /api/teams/my
 * @desc Get the user's current team
 */
router.get('/my-team', protect, getMyTeam);

/**
 * @route GET /api/teams/invitations
 * @desc Get the user's pending invitations
 */
router.get('/invitations', protect, getMyInvitations);

/**
 * @route POST /api/teams/:teamId/reject-invite
 * @desc User rejects a team invitation
 */
router.post('/:teamId/reject-invite', protect, rejectInvite);

/**
 * @route POST /api/teams/:teamId/evaluate
 * @desc Judges submit scores for a team
 */
router.post('/:teamId/evaluate', protect, submitEvaluation);

module.exports = router;