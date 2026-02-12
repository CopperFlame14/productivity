const express = require('express');
const router = express.Router();
const DailyRecord = require('../models/DailyRecord');
const User = require('../models/User');
const Achievement = require('../models/Achievement');

/**
 * GET /api/analytics/productivity
 * Get productivity scores and trends
 */
router.get('/productivity', async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const records = await DailyRecord.find({
            user: req.user.id,
            date: { $gte: startDate }
        })
            .select('date scores')
            .sort({ date: 1 });

        if (records.length === 0) {
            return res.json({
                message: 'No data available',
                records: []
            });
        }

        // Calculate best and worst days
        let bestDay = records[0];
        let worstDay = records[0];

        records.forEach(record => {
            if (record.scores.finalScore > bestDay.scores.finalScore) {
                bestDay = record;
            }
            if (record.scores.finalScore < worstDay.scores.finalScore) {
                worstDay = record;
            }
        });

        // Calculate trend
        const recentAvg = records.slice(-7).reduce((sum, r) => sum + r.scores.finalScore, 0) / Math.min(7, records.length);
        const olderAvg = records.slice(0, 7).reduce((sum, r) => sum + r.scores.finalScore, 0) / Math.min(7, records.length);
        const trend = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';

        res.json({
            records,
            stats: {
                bestDay: {
                    date: bestDay.date,
                    score: bestDay.scores.finalScore,
                    rank: bestDay.scores.rank
                },
                worstDay: {
                    date: worstDay.date,
                    score: worstDay.scores.finalScore,
                    rank: worstDay.scores.rank
                },
                trend,
                averageScore: records.reduce((sum, r) => sum + r.scores.finalScore, 0) / records.length
            }
        });
    } catch (error) {
        console.error('Get productivity analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * GET /api/analytics/streak
 * Get streak data
 */
router.get('/streak', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            currentStreak: user.stats.currentStreak,
            bestStreak: user.stats.bestStreak
        });
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({ error: 'Failed to fetch streak data' });
    }
});

/**
 * GET /api/analytics/achievements
 * Get achievements
 */
router.get('/achievements', async (req, res) => {
    try {
        const achievements = await Achievement.find({ user: req.user.id });

        res.json(achievements);
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

module.exports = router;
