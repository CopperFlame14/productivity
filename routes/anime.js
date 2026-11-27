const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * GET /api/anime/balance
 * Get current anime episode balance.
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
 * Record watched episodes without allowing invalid counts or concurrent
 * requests to spend the same unlocked episode balance more than once.
 */
router.post('/watch', async (req, res) => {
    try {
        const episodes = req.body?.episodes === undefined ? 1 : req.body.episodes;

        if (!Number.isSafeInteger(episodes) || episodes <= 0) {
            return res.status(400).json({
                error: 'Episodes must be a positive whole number'
            });
        }

        const user = await User.findOneAndUpdate(
            {
                _id: req.user.id,
                $expr: {
                    $lte: [
                        { $add: [{ $ifNull: ['$stats.animeEpisodesWatched', 0] }, episodes] },
                        { $ifNull: ['$stats.animeEpisodesUnlocked', 0] }
                    ]
                }
            },
            { $inc: { 'stats.animeEpisodesWatched': episodes } },
            { new: true }
        );

        if (user) {
            return res.json({
                success: true,
                message: `${episodes} episode(s) watched`,
                unlocked: user.stats.animeEpisodesUnlocked,
                watched: user.stats.animeEpisodesWatched,
                remaining: Math.max(0, user.stats.animeEpisodesUnlocked - user.stats.animeEpisodesWatched)
            });
        }

        const existingUser = await User.findById(req.user.id);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const remaining = Math.max(
            0,
            existingUser.stats.animeEpisodesUnlocked - existingUser.stats.animeEpisodesWatched
        );
        return res.status(400).json({
            error: 'Not enough episodes unlocked',
            unlocked: existingUser.stats.animeEpisodesUnlocked,
            watched: existingUser.stats.animeEpisodesWatched,
            remaining,
            requested: episodes
        });
    } catch (error) {
        console.error('Watch anime error:', error);
        res.status(500).json({ error: 'Failed to record watched episode' });
    }
});

/**
 * GET /api/anime/history
 * Get anime watch history from daily records.
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
