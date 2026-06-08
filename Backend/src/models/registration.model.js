const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        enum: ['registered', 'waitlisted', 'cancelled'],
        default: 'registered'
    },
    checkInStatus: {
        type: Boolean,
        default: false
    },
    checkInTime: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// CRITICAL: This creates a compound index ensuring a user can only register for a specific event ONCE. 
// The database itself will reject duplicate tickets!
RegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);