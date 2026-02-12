const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { checkLeetCodeCompletion, validateLeetCodeUsername } = require('../utils/leetcode');

/**
 * POST /api/leetcode/check
 * Check for new LeetCode problems solved
 * Returns: mode (auto/manual/failed), completed count, message
 */
router.post('/check', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { leetcodeUsername, leetcodeAutoDetect, leetcodeLastCount } = user.settings;

        // If auto-detect is disabled, return manual mode
        if (!leetcodeAutoDetect || !leetcodeUsername) {
            return res.json({
                mode: 'manual',
                completed: 0,
                newCount: null,
                message: 'Auto-detection disabled. Please enter problems completed manually.'
            });
        }

        // Attempt auto-detection
        const result = await checkLeetCodeCompletion(leetcodeUsername, leetcodeLastCount);

        // Update last count if auto-detection succeeded
        if (result.mode === 'auto' && result.newCount !== null) {
            user.settings.leetcodeLastCount = result.newCount;
            await user.save();
        }

        res.json(result);
    } catch (error) {
        console.error('LeetCode check error:', error);
        // Even on server error, fallback gracefully
        res.json({
            mode: 'failed',
            completed: 0,
            newCount: null,
            message: 'Server error during auto-detection. Please use manual input.'
        });
    }
});

/**
 * POST /api/leetcode/validate
 * Validate LeetCode username and fetch current count
 */
router.post('/validate', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || username.trim() === '') {
            return res.status(400).json({ error: 'Username is required' });
        }

        const result = await validateLeetCodeUsername(username);

        res.json(result);
    } catch (error) {
        console.error('LeetCode validate error:', error);
        res.status(500).json({
            valid: false,
            message: 'Error validating username. Please check and try again.'
        });
    }
});

/**
 * PUT /api/leetcode/settings
 * Update LeetCode settings (username, auto-detect preference)
 */
router.put('/settings', async (req, res) => {
    try {
        const { leetcodeUsername, leetcodeAutoDetect } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update settings
        if (leetcodeUsername !== undefined) {
            user.settings.leetcodeUsername = leetcodeUsername.trim();
        }

        if (leetcodeAutoDetect !== undefined) {
            user.settings.leetcodeAutoDetect = leetcodeAutoDetect;
        }

        // If enabling auto-detect, fetch initial count
        if (leetcodeAutoDetect && leetcodeUsername) {
            const { fetchLeetCodeStats } = require('../utils/leetcode');
            const result = await fetchLeetCodeStats(leetcodeUsername.trim());

            if (result.success) {
                user.settings.leetcodeLastCount = result.count;
            }
        }

        await user.save();

        res.json({
            success: true,
            message: 'LeetCode settings updated',
            settings: {
                leetcodeUsername: user.settings.leetcodeUsername,
                leetcodeAutoDetect: user.settings.leetcodeAutoDetect,
                leetcodeLastCount: user.settings.leetcodeLastCount
            }
        });
    } catch (error) {
        console.error('LeetCode settings update error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

/**
 * GET /api/leetcode/settings
 * Get current LeetCode settings
 */
router.get('/settings', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            leetcodeUsername: user.settings.leetcodeUsername,
            leetcodeAutoDetect: user.settings.leetcodeAutoDetect,
            leetcodeLastCount: user.settings.leetcodeLastCount
        });
    } catch (error) {
        console.error('LeetCode settings fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

module.exports = router;
