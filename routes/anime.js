const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * GET /api/anime/balance
 * Get current anime episode balance
 */
router.get('/balance', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { animeEpisodesUnlocked, animeEpisodesWatched } = user.stats;
        const remaining = Math.max(0, animeEpisodesUnlocked - animeEpisodesWatched);

        res.json({
            unlocked: animeEpisodesUnlocked,
            watched: animeEpisodesWatched,
            remaining
        });
    } catch (error) {
        console.error('Get anime balance error:', error);
        res.status(500).json({ error: 'Failed to fetch anime balance' });
    }
});

/**
 * POST /api/anime/watch
 * Record watched episode with validation
 */
router.post('/watch', async (req, res) => {
    try {
        const { episodes = 1 } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { animeEpisodesUnlocked, animeEpisodesWatched } = user.stats;
        const remaining = animeEpisodesUnlocked - animeEpisodesWatched;

        // Validate: can't watch more than unlocked
        if (episodes > remaining) {
            return res.status(400).json({
                error: 'Not enough episodes unlocked',
                unlocked: animeEpisodesUnlocked,
                watched: animeEpisodesWatched,
                remaining,
                requested: episodes
            });
        }

        // Update watched count
        user.stats.animeEpisodesWatched += episodes;
        await user.save();

        res.json({
            success: true,
            message: `${episodes} episode(s) watched`,
            unlocked: user.stats.animeEpisodesUnlocked,
            watched: user.stats.animeEpisodesWatched,
            remaining: user.stats.animeEpisodesUnlocked - user.stats.animeEpisodesWatched
        });
    } catch (error) {
        console.error('Watch anime error:', error);
        res.status(500).json({ error: 'Failed to record watched episode' });
    }
});

/**
 * GET /api/anime/history
 * Get anime watch history from daily records
 */
router.get('/history', async (req, res) => {
    try {
        const DailyRecord = require('../models/DailyRecord');

        const records = await DailyRecord.find({
            user: req.user.id,
            'anime.watched': { $gt: 0 }
        })
            .select('date anime')
            .sort({ date: -1 })
            .limit(30);

        res.json(records);
    } catch (error) {
        console.error('Get anime history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
