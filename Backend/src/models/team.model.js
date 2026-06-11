const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // NEW: Array to hold users who want to join but need approval
    pendingRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    invitedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    joinCode: {
      type: String,
      required: true,
      unique: true,
    },
    // Future proofing for Phase 8 (Judging/Submissions)
    project: {
      githubLink: { type: String, default: '' },
      demoVideo: { type: String, default: '' },
      presentationLink: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

TeamSchema.index({ event: 1, name: 1 }, { unique: true });
TeamSchema.index({ event: 1, leader: 1 }, { unique: true });

module.exports = mongoose.model('Team', TeamSchema);
