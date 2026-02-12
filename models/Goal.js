const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['goal', 'hobby'],
        default: 'goal'
    },
    targetTime: {
        type: Number, // minutes per day
        required: true,
        min: 1
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    active: {
        type: Boolean,
        default: true
    },
    tracking: {
        totalTimeSpent: { type: Number, default: 0 },
        daysCompleted: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        bestStreak: { type: Number, default: 0 },
        lastCompletedDate: { type: Date }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
goalSchema.index({ user: 1, active: 1 });

// Method to calculate priority weight
goalSchema.methods.getPriorityWeight = function () {
    const weights = {
        'High': 3,
        'Medium': 2,
        'Low': 1
    };
    return weights[this.priority] || 2;
};

module.exports = mongoose.model('Goal', goalSchema);
