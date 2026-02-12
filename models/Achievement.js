const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'first_7_day_streak',
            'streak_30_days',
            'leetcode_50_solved',
            'workout_20_completed',
            'study_50_sessions',
            'perfect_week',
            'level_5',
            'level_10',
            'rank_s_first',
            'boss_battle_win'
        ]
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    unlocked: {
        type: Boolean,
        default: false
    },
    unlockedAt: {
        type: Date
    },
    progress: {
        current: { type: Number, default: 0 },
        target: { type: Number, required: true }
    },
    icon: {
        type: String,
        default: '🏅'
    }
}, {
    timestamps: true
});

// Index for efficient queries
achievementSchema.index({ user: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
