const mongoose = require('mongoose');

const dailyRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    // Core tasks data
    tasks: {
        workout: {
            completed: { type: Boolean, default: false },
            minutes: { type: Number, default: 0 },
            bonusMinutes: { type: Number, default: 0 }
        },
        leetcode: {
            completed: { type: Boolean, default: false },
            problemsSolved: { type: Number, default: 0 },
            bonusProblems: { type: Number, default: 0 }
        },
        project: {
            completed: { type: Boolean, default: false },
            minutes: { type: Number, default: 0 },
            bonusMinutes: { type: Number, default: 0 }
        },
        study: {
            completed: { type: Boolean, default: false },
            minutes: { type: Number, default: 0 },
            bonusMinutes: { type: Number, default: 0 }
        },
        water: {
            completed: { type: Boolean, default: false },
            glasses: { type: Number, default: 0 }
        }
    },
    // Calculated scores
    scores: {
        rawScore: { type: Number, default: 0 },
        finalScore: { type: Number, default: 0 },
        sevenDayAverage: { type: Number, default: 0 },
        rank: {
            type: String,
            enum: ['S', 'A', 'B', 'C'],
            default: 'C'
        }
    },
    // Streak
    streak: {
        current: { type: Number, default: 0 },
        multiplier: { type: Number, default: 1.0 }
    },
    // HP (Health Points)
    hp: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    // XP and Level
    xp: {
        earned: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        level: { type: Number, default: 1 }
    },
    // Anime rewards
    anime: {
        baseEpisodes: { type: Number, default: 0 },
        bonusEpisodes: { type: Number, default: 0 },
        totalUnlocked: { type: Number, default: 0 },
        watched: { type: Number, default: 0 },
        penaltyApplied: { type: Boolean, default: false }
    },
    // Burnout tracking
    burnout: {
        score: { type: Number, default: 0, min: 0, max: 100 },
        level: {
            type: String,
            enum: ['Healthy', 'Moderate', 'High'],
            default: 'Healthy'
        },
        factors: [String]
    },
    // Custom goals progress
    customGoals: [{
        goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
        timeSpent: { type: Number, default: 0 },
        completed: { type: Boolean, default: false }
    }],
    // Weekly boss battle
    weeklyProgress: {
        daysCompleted: { type: Number, default: 0 },
        bossRewardEarned: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Create compound index for efficient queries
dailyRecordSchema.index({ user: 1, date: -1 });

// Method to check if all core tasks completed
dailyRecordSchema.methods.allCoreTasksCompleted = function () {
    return this.tasks.workout.completed &&
        this.tasks.leetcode.completed &&
        this.tasks.project.completed &&
        this.tasks.study.completed &&
        this.tasks.water.completed;
};

module.exports = mongoose.model('DailyRecord', dailyRecordSchema);
