const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    settings: {
        leetcodeUsername: {
            type: String,
            default: '',
            trim: true
        },
        leetcodeAutoDetect: {
            type: Boolean,
            default: false
        },
        leetcodeLastCount: {
            type: Number,
            default: 0
        },
        theme: {
            type: String,
            enum: ['dark', 'light'],
            default: 'dark'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    stats: {
        totalXP: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 1
        },
        currentStreak: {
            type: Number,
            default: 0
        },
        bestStreak: {
            type: Number,
            default: 0
        },
        animeEpisodesUnlocked: {
            type: Number,
            default: 0
        },
        animeEpisodesWatched: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate level from XP
userSchema.methods.calculateLevel = function () {
    return Math.floor(this.stats.totalXP / 500) + 1;
};

module.exports = mongoose.model('User', userSchema);
