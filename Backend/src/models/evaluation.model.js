const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    judge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scores: [{
        criteriaName: { type: String, required: true },
        score: { type: Number, required: true, min: 0, max: 10 }
    }],
    totalScore: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true
});

EvaluationSchema.index({ team: 1, judge: 1 }, { unique: true });

EvaluationSchema.pre('save', async function() {
    try {
        const Event = mongoose.model('Event');
        const event = await Event.findById(this.event);
        if (!event) {
            throw new Error('Event not found');
        }

        let totalWeightedScore = 0;
        let totalWeight = 0;

        if (event.judgingCriteria && event.judgingCriteria.length > 0) {
            this.scores.forEach(s => {
                const criterion = event.judgingCriteria.find(c => c.criteriaName === s.criteriaName);
                if (criterion) {
                    totalWeightedScore += s.score * criterion.weightage;
                    totalWeight += criterion.weightage;
                }
            });
            this.totalScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 10 : 0;
        } else {
            const sum = this.scores.reduce((acc, curr) => acc + curr.score, 0);
            this.totalScore = this.scores.length > 0 ? (sum / this.scores.length) * 10 : 0;
        }
    } catch (err) {
        throw err;
    }
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);