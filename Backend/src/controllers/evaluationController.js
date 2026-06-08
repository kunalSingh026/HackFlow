const Evaluation = require('../models/evaluation.model');
const Team = require('../models/team.model');
const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const sendLeaderboardEmail = require('../utils/sendLeaderboardEmail');
const mongoose = require('mongoose');

/**
 * @description Get all submitted projects for an event (Judging Dashboard)
 * @route GET /api/events/:eventId/submissions
 * @access Private (Admin / Judges)
 */
exports.getEventSubmissions = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: "Event not found" });

        const isJudge = event.judges.map(id => id.toString()).includes(userId);
        if (req.user.role !== 'admin' && !isJudge) {
            return res.status(403).json({ message: "Access denied. You are not a judge for this event." });
        }

        const submissions = await Team.find({
            event: eventId,
            $or: [
                { 'project.githubLink': { $nin: ["", null] } },
                { 'project.demoVideo': { $nin: ["", null] } },
                { 'project.presentationLink': { $nin: ["", null] } },
                { 'project.description': { $nin: ["", null] } },
            ]
        }).populate('members', 'firstName lastName email skills');

        // Fetch evaluations submitted by this judge for this event
        const judgeEvaluations = await Evaluation.find({ event: eventId, judge: userId });
        const evalMap = {};
        judgeEvaluations.forEach(e => {
            evalMap[e.team.toString()] = e;
        });

        const submissionsWithStatus = submissions.map(sub => {
            const hasEval = evalMap[sub._id.toString()];
            return {
                ...sub.toObject(),
                isGraded: !!hasEval,
                grade: hasEval || null
            };
        });

        res.status(200).json({
            count: submissionsWithStatus.length,
            judgingCriteria: event.judgingCriteria || [],
            eventStatus: event.status,
            submissions: submissionsWithStatus
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * @description Submit or update an evaluation score for a team
 * @route POST /api/teams/:teamId/evaluate
 * @access Private (Assigned Judges Only)
 */
exports.submitEvaluation = async (req, res) => {
    try {
        const { teamId } = req.params;
        const judgeId = req.user.id;
        const { scores, feedback } = req.body;

        const team = await Team.findById(teamId).populate('event');
        if (!team) return res.status(404).json({ message: "Team not found." });

        const event = await Event.findById(team.event._id);
        if (!event) return res.status(404).json({ message: "Event not found." });

        if (event.status === 'completed') {
            return res.status(400).json({ message: "Grading is locked. This event is completed." });
        }

        const authorizedJudges = event.judges.map(id => id.toString());
        if (req.user.role !== 'admin' && !authorizedJudges.includes(judgeId)) {
            return res.status(403).json({ message: "Security Alert: You are not authorized to score this event." });
        }

        let evaluation = await Evaluation.findOne({ team: teamId, judge: judgeId });
        if (evaluation) {
            evaluation.scores = scores;
            evaluation.feedback = feedback;
        } else {
            evaluation = new Evaluation({
                team: teamId,
                event: team.event._id,
                judge: judgeId,
                scores,
                feedback
            });
        }

        await evaluation.save();

        res.status(201).json({
            message: "Evaluation submitted successfully!",
            totalScore: evaluation.totalScore
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * @description Get the final leaderboard for an event (Calculates average scores)
 * @route GET /api/events/:eventId/leaderboard
 * @access Private / Public (RBAC)
 */
exports.getLeaderboard = async(req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if(!event) return res.status(404).json({ message: "Event not found" });

        const isOrganizer = event.organizer.toString() === req.user?.id;
        const isAdmin = req.user?.role === 'admin';

        // Restriction: Leaderboard only viewable by participants if event is completed
        if (event.status !== 'completed' && !isOrganizer && !isAdmin) {
            return res.status(403).json({ 
                message: "Leaderboard has not been published yet.",
                isPublished: false
            });
        }

        const leaderboard = await Evaluation.aggregate([
            {
                $match:{ event: new mongoose.Types.ObjectId(eventId) }
            },
            {
                $group: {
                    _id: "$team",
                    averageScore: { $avg: "$totalScore" },
                    judgesCount: { $sum: 1 }
                }
            },
            {
                $sort: { averageScore: -1 }
            },
            {
                $lookup: {
                    from: 'teams',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'teamData'
                }
            },
            {
                $unwind: '$teamData'
            },
            {
                $project: {
                    _id: 0,
                    teamId: '$_id',
                    teamName: "$teamData.name",
                    averageScore: { $round: ["$averageScore", 2] },
                    judgesCount: 1,
                    projectDetails: "$teamData.project"
                }
            }
        ]);

        const rankedLeaderboard = leaderboard.map((team, index) => ({
            ...team,
            rank: index + 1
        }));

        res.status(200).json({
            message: "Leaderboard generated successfully!",
            event: event.title,
            isPublished: event.status === 'completed',
            totalRankedTeams: rankedLeaderboard.length,
            leaderboard: rankedLeaderboard
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * @description Publish Leaderboard, lock grading, and update event status to Completed. Dispatch emails.
 * @route PUT /api/events/:eventId/publish-leaderboard
 * @access Private (Admin / Organizer Only)
 */
exports.publishLeaderboard = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: "Event not found" });

        const isOrganizer = event.organizer.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOrganizer && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to publish results for this event." });
        }

        event.status = 'completed';
        await event.save();

        // Fetch all registrations
        const registrations = await Registration.find({ event: eventId, status: 'registered' }).populate('user');

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const leaderboardLink = `${frontendUrl}/events/${eventId}/leaderboard`;

        // Send emails asynchronously in the background
        registrations.forEach(reg => {
            if (reg.user && reg.user.email) {
                sendLeaderboardEmail({
                    email: reg.user.email,
                    username: `${reg.user.firstName} ${reg.user.lastName}`,
                    eventTitle: event.title,
                    leaderboardLink
                }).catch(err => {
                    console.error(`Error sending leaderboard email to ${reg.user.email}:`, err.message);
                });
            }
        });

        res.status(200).json({
            message: "Leaderboard published successfully! Status updated to Completed and notification emails have been dispatched.",
            eventStatus: event.status
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};