const Team = require('../models/team.model');
const Registration = require('../models/registration.model');
const User = require('../models/user.model'); // Added missing User import
const sendTeamEmail = require('../utils/sendTeamEmail');
const crypto = require('crypto');

/**
 * @description Create a new team for an event
 * @route POST /api/events/:eventId/teams
 * @access Private
 */
exports.createTeam = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const { name } = req.body;

    // Verify user is actually registered for this event
    const isRegistered = await Registration.findOne({ user: userId, event: eventId });
    if (!isRegistered) {
      return res
        .status(403)
        .json({ message: 'You must register for the event before creating a team.' }); // Fixed typo
    }

    const existingTeam = await Team.findOne({
      event: eventId,
      $or: [{ leader: userId }, { members: userId }],
    });
    if (existingTeam) {
      return res.status(400).json({ message: 'You are already part of a team for this event.' });
    }

    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Create the Team (Leader is automatically the first member)
    const newTeam = new Team({
      name,
      event: eventId,
      leader: userId,
      members: [userId],
      joinCode,
    });
    await newTeam.save();

    res.status(201).json({
      message: 'Team created successfully!',
      team: newTeam,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'A team with this name already exists for this event.' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Request to join a team
 * @route POST /api/teams/:teamId/request
 * @access Private
 */
exports.requestToJoin = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId)
      .populate('leader', 'email firstName')
      .populate('event', 'title');

    if (!team) return res.status(404).json({ message: 'Team not found.' });

    // 1. Verify user is registered for the event
    const isRegistered = await Registration.findOne({ user: userId, event: team.event._id });
    if (!isRegistered) {
      return res
        .status(403)
        .json({ message: 'You must register for the event before joining a team.' });
    }

    // 2. Capacity & Duplication Checks
    if (team.members.length >= 4)
      return res.status(400).json({ message: 'This team is already full.' });
    if (team.members.includes(userId))
      return res.status(400).json({ message: 'You are already a member of this team.' });
    if (team.pendingRequests.includes(userId))
      return res.status(400).json({ message: 'You have already sent a request to this team.' });

    // 3. Extract populated fields BEFORE save
    const leaderEmail = team.leader.email;
    const eventTitle = team.event.title;
    const teamName = team.name;

    // 4. Add user to pending requests
    team.pendingRequests.push(userId);
    await team.save();

    // 5. Send Email Notification to the Team Leader
    await sendTeamEmail({
      type: 'JOIN_REQUEST',
      email: leaderEmail,
      teamName: teamName,
      actionUserName: `${req.user.firstName} ${req.user.lastName}`,
      eventTitle: eventTitle,
    });

    res
      .status(200)
      .json({ message: 'Join request sent successfully! The leader has been notified.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Leader approves a user's request to join the team
 * @route POST /api/teams/:teamId/approve/:userId
 * @access Private (Leader Only)
 */
exports.approveJoinRequest = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const leaderId = req.user.id;

    const team = await Team.findById(teamId)
      .populate('pendingRequests', 'email firstName')
      .populate('event', 'title');

    if (!team) return res.status(404).json({ message: 'Team not found.' });

    if (team.leader.toString() !== leaderId) {
      return res.status(403).json({ message: 'Only the team leader can approve requests.' });
    }

    const pendingUser = team.pendingRequests.find((u) => u._id.toString() === userId);
    if (!pendingUser) {
      return res.status(404).json({ message: 'User is not in the pending requests list.' });
    }

    if (team.members.length >= 4) {
      return res.status(400).json({ message: 'Cannot approve request. The team is already full.' });
    }

    const pendingUserEmail = pendingUser.email;
    const eventTitle = team.event.title;
    const teamName = team.name;

    // The Database Swap
    team.pendingRequests = team.pendingRequests.filter((u) => u._id.toString() !== userId);
    team.members.push(userId);

    await team.save();

    await sendTeamEmail({
      type: 'TEAM_INVITE_APPROVED',
      email: pendingUserEmail,
      teamName: teamName,
      eventTitle: eventTitle,
    });

    res.status(200).json({ message: 'Member approved and added to the team successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Get all registered users for an event who are NOT in a team yet (Paginated)
 * @route GET /api/teams/event/:eventId/participants
 * @access Private
 */
exports.getAvailableParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // 1. Find all teams for this specific event
    const teams = await Team.find({ event: eventId });

    // 2. Extract all user IDs who are already in a team
    const usersInTeams = teams.flatMap((team) => team.members);

    // 3. Build the query: Registered for this event, BUT NOT in the usersInTeams array
    const query = {
      event: eventId,
      user: { $nin: usersInTeams },
    };

    // 4. Fire parallel queries to get paginated registrations and the total count
    const [availableRegistrations, totalDocuments] = await Promise.all([
      Registration.find(query)
        .populate('user', 'firstName lastName bio skills profilePicture')
        .skip(startIndex)
        .limit(limit),
      Registration.countDocuments(query),
    ]);

    // 5. Extract just the user objects from the populated registrations
    const availableUsers = availableRegistrations.map((reg) => reg.user);

    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalDocuments,
        itemsPerPage: limit,
      },
      data: availableUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Team Leader invites a user to their team
 * @route POST /api/teams/:teamId/invite/:userId
 * @access Private (Leader Only)
 */
exports.inviteUserToTeam = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const leaderId = req.user.id;

    const team = await Team.findById(teamId).populate('event', 'title');
    if (!team) return res.status(404).json({ message: 'Team not found.' });

    if (team.leader.toString() !== leaderId) {
      return res.status(403).json({ message: 'Only the team leader can invite members.' });
    }

    if (team.members.length >= 4) return res.status(400).json({ message: 'Team is already full.' }); // Fixed typo .jsoon

    const isRegistered = await Registration.findOne({ user: userId, event: team.event._id });
    if (!isRegistered)
      return res.status(400).json({ message: 'This user is not registered for the event.' });

    const isUserInTeam = await Team.findOne({ event: team.event._id, members: userId });
    if (isUserInTeam)
      return res.status(400).json({ message: 'User has already joined another team.' });

    if (team.invitedUsers.includes(userId)) {
      return res.status(400).json({ message: 'You have already invited this user.' });
    }

    team.invitedUsers.push(userId);
    await team.save();

    const targetUser = await User.findById(userId); // Uses top-level import now
    await sendTeamEmail({
      type: 'TEAM_INVITATION',
      email: targetUser.email,
      teamName: team.name,
      actionUserName: targetUser.firstName,
      eventTitle: team.event.title,
    });

    res.status(200).json({ message: 'Invitation sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description User accepts an invitation from a team
 * @route POST /api/teams/:teamId/accept-invite
 * @access Private (Target User Only)
 */
exports.acceptInvite = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found.' });

    if (!team.invitedUsers.includes(userId)) {
      return res
        .status(403)
        .json({ message: 'You do not have a pending invitation to this team.' });
    }

    if (team.members.length >= 4) {
      return res.status(400).json({ message: 'Sorry, this team is now full.' });
    }

    team.invitedUsers = team.invitedUsers.filter((id) => id.toString() !== userId);
    team.members.push(userId);
    await team.save();

    res.status(200).json({ message: `You have successfully joined ${team.name}!` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description A member voluntarily leaves the team (Locked 24hrs before event)
 * @route POST /api/teams/:teamId/leave
 * @access Private (Standard Members Only)
 */
exports.leaveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId).populate('event');
    if (!team) return res.status(404).json({ message: 'Team not found.' });

    if (team.leader.toString() === userId) {
      return res
        .status(400)
        .json({
          message:
            'As the team captain, you cannot leave. You must disband the team or transfer leadership.',
        });
    }

    if (!team.members.includes(userId)) {
      return res.status(400).json({ message: 'You are not a member of this team.' });
    }

    const eventStartDate = new Date(team.event.timing.startDate);
    const now = new Date();

    const timeDifferenceMs = eventStartDate.getTime() - now.getTime();
    const hoursUntilEvent = timeDifferenceMs / (1000 * 60 * 60);

    if (now >= eventStartDate) {
      return res
        .status(403)
        .json({ message: 'The hackathon has already started. Roster is locked!' });
    }

    if (hoursUntilEvent < 24) {
      return res.status(403).json({
        message: `Roster is locked! You cannot leave the team less than 24 hours before the event starts. (Starts in ${Math.floor(hoursUntilEvent)} hours)`,
      });
    }

    team.members = team.members.filter((id) => id.toString() !== userId);
    await team.save();

    res.status(200).json({ message: 'You have successfully left the team.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Team Captain removes a specific member
 * @route POST /api/teams/:teamId/remove/:userId
 * @access Private (Leader Only)
 */
exports.removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const leaderId = req.user.id;

    const team = await Team.findById(teamId).populate('event');
    if (!team) return res.status(404).json({ message: 'Team not found.' });

    if (team.leader.toString() !== leaderId) {
      return res.status(403).json({ message: 'Only the team captain can remove members.' });
    }

    if (userId === leaderId) {
      return res
        .status(400)
        .json({ message: 'You cannot remove yourself. Use the disband route instead.' });
    }

    const eventEndDate = new Date(team.event.timing.endDate);
    if (new Date() > eventEndDate) {
      return res
        .status(403)
        .json({ message: 'The hackathon has ended. You can no longer modify the team.' });
    }

    const initialLength = team.members.length;
    team.members = team.members.filter((id) => id.toString() !== userId);

    if (team.members.length === initialLength) {
      return res.status(404).json({ message: 'User is not a member of this team.' });
    }
    await team.save();

    res.status(200).json({ message: 'Member has been removed from the team.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Team Captain disbands (deletes) the entire team
 * @route DELETE /api/teams/:teamId
 * @access Private (Leader Only)
 */
exports.disbandTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const leaderId = req.user.id;

    const team = await Team.findById(teamId).populate('event');
    if (!team) return res.status(404).json({ message: 'Team not found.' });

    if (team.leader.toString() !== leaderId) {
      return res.status(403).json({ message: 'Only the team captain can disband the team.' });
    }

    const eventEndDate = new Date(team.event.timing.endDate);
    if (new Date() > eventEndDate) {
      return res
        .status(403)
        .json({ message: 'The hackathon has ended. Teams are locked for judging.' });
    }

    await Team.findByIdAndDelete(teamId);

    res
      .status(200)
      .json({ message: 'Team has been permanently disbanded. All members are now free agents.' }); // Fixed typo .sjon
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Team Captain submits the final project
 * @route PUT /api/teams/:teamId/submit
 * @access Private (Leader Only)
 */
exports.submitProject = async (req, res) => {
  try {
    const { teamId } = req.params;
    const leaderId = req.user.id;
    const { githubLink, demoVideo, presentationLink, description } = req.body;

    const team = await Team.findById(teamId).populate('event');
    if (!team) return res.status(404).json({ message: 'Team not found.' });

    if (team.leader.toString() !== leaderId) {
      return res
        .status(403)
        .json({ message: 'Only the team captain can submit the final project.' });
    }

    const eventEndDate = new Date(team.event.timing.endDate);
    if (new Date() > eventEndDate) {
      return res.status(403).json({
        message: 'Submission rejected. The hackathon deadline has officially passed!',
      });
    }

    team.project.githubLink = githubLink || team.project.githubLink;
    team.project.demoVideo = demoVideo || team.project.demoVideo;
    team.project.presentationLink = presentationLink || team.project.presentationLink;
    team.project.description = description || team.project.description;

    await team.save();

    res.status(200).json({
      message: 'Project submitted successfully! Incredible work.',
      project: team.project,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getMyTeam = async (req, res) => {
  try {
    const { eventId } = req.query;
    let query = {
      $or: [{ leader: req.user.id }, { members: req.user.id }],
    };
    if (eventId) {
      query.event = eventId;
    }
    const team = await Team.findOne(query)
      .populate('leader', 'firstName lastName email mobileNumber profilePicture')
      .populate('members', 'firstName lastName email mobileNumber profilePicture')
      .populate('event');
    if (!team) {
      return res.status(200).json({ success: true, team: null });
    }
    res.status(200).json({ success: true, team });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getMyInvitations = async (req, res) => {
  try {
    const userId = req.user.id;
    const invitations = await Team.find({ invitedUsers: userId })
      .populate('leader', 'firstName lastName email profilePicture')
      .populate('event', 'title description timing');
    res.status(200).json({ success: true, invitations });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.rejectInvite = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found.' });

    if (!team.invitedUsers.includes(userId)) {
      return res
        .status(400)
        .json({ message: 'You do not have a pending invitation to this team.' });
    }

    team.invitedUsers = team.invitedUsers.filter((id) => id.toString() !== userId);
    await team.save();

    res
      .status(200)
      .json({
        success: true,
        message: `You have successfully declined the invitation from ${team.name}.`,
      });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
