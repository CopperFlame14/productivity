const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * GET /api/user
 * Get user profile
 */
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            settings: user.settings,
            stats: user.stats,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

/**
 * PUT /api/user
 * Update user profile
 */
router.put('/', async (req, res) => {
    try {
        const { name, settings } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (name) user.name = name;
        if (settings) {
            user.settings = { ...user.settings, ...settings };
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                settings: user.settings
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * DELETE /api/user
 * Delete user account
 */
router.delete('/', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Also delete all related data
        const DailyRecord = require('../models/DailyRecord');
        const Goal = require('../models/Goal');
        const Achievement = require('../models/Achievement');

        await Promise.all([
            DailyRecord.deleteMany({ user: req.user.id }),
            Goal.deleteMany({ user: req.user.id }),
            Achievement.deleteMany({ user: req.user.id })
        ]);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;
