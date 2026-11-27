const express = require('express');
const router = express.Router();
const DailyRecord = require('../models/DailyRecord');
const User = require('../models/User');
const {
    calculateProductivityScore,
    calculateSevenDayAverage,
    calculateHP
} = require('../utils/calculations');
const { recalculateDailyStats } = require('../utils/dailyStats');

function parseRecordDate(value) {
    if (!value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    // Treat YYYY-MM-DD as a calendar date, not as a UTC timestamp.
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        const parsed = new Date(year, month - 1, day);
        if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
            return null;
        }
        return parsed;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
}

function defaultTasks() {
    return {
        workout: { completed: false, minutes: 0, bonusMinutes: 0 },
        leetcode: { completed: false, problemsSolved: 0, bonusProblems: 0 },
        project: { completed: false, minutes: 0, bonusMinutes: 0 },
        study: { completed: false, minutes: 0, bonusMinutes: 0 },
        water: { completed: false, glasses: 0 }
    };
}

async function rebuildUserStats(userId, user) {
    const records = await DailyRecord.find({ user: userId }).sort({ date: 1 });
    const scores = [];

    for (const record of records) {
        const rawScore = calculateProductivityScore(record.tasks);
        const { average, bonus } = calculateSevenDayAverage([...scores.slice(-6), rawScore]);
        record.scores = {
            ...record.scores.toObject(),
            rawScore,
            sevenDayAverage: average
        };
        // The helper recomputes final score, streak, XP, levels and rewards.
        scores.push(rawScore);
    }

    const totals = recalculateDailyStats(records, user.stats.animeEpisodesWatched || 0);
    for (const record of records) await record.save();

    user.stats.totalXP = totals.totalXP;
    user.stats.level = totals.level;
    user.stats.currentStreak = totals.currentStreak;
    user.stats.bestStreak = totals.bestStreak;
    user.stats.animeEpisodesUnlocked = totals.animeEpisodesUnlocked;
    await user.save();
    return records;
}

/**
 * POST /api/daily
 * Save or update a daily record and rebuild derived totals chronologically.
 */
router.post('/', async (req, res) => {
    try {
        const { tasks, date } = req.body;
        const recordDate = parseRecordDate(date);

        if (!recordDate) {
            return res.status(400).json({ error: 'Invalid date supplied' });
        }
        if (!tasks || typeof tasks !== 'object' || Array.isArray(tasks)) {
            return res.status(400).json({ error: 'Task data is required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let record = await DailyRecord.findOne({ user: req.user.id, date: recordDate });
        if (!record) {
            record = new DailyRecord({ user: req.user.id, date: recordDate, tasks });
        } else {
            record.tasks = tasks;
        }

        record.scores = {
            ...record.scores.toObject(),
            rawScore: calculateProductivityScore(tasks)
        };
        record.hp = calculateHP(tasks);
        await record.save();

        const records = await rebuildUserStats(req.user.id, user);
        const saved = records.find(item => item._id.equals(record._id)) || record;

        res.json({
            success: true,
            message: 'Daily record saved',
            record: {
                id: saved._id,
                date: saved.date,
                tasks: saved.tasks,
                scores: saved.scores,
                streak: saved.streak,
                hp: saved.hp,
                xp: saved.xp,
                anime: saved.anime
            }
        });
    } catch (error) {
        console.error('Save daily record error:', error);
        res.status(500).json({ error: 'Failed to save daily record' });
    }
});

/**
 * GET /api/daily
 * Get today's record.
 */
router.get('/', async (req, res) => {
    try {
        const today = parseRecordDate();
        let record = await DailyRecord.findOne({ user: req.user.id, date: today });
        if (!record) {
            record = new DailyRecord({ user: req.user.id, date: today });
            await record.save();
        }
        res.json(record);
    } catch (error) {
        console.error('Get daily record error:', error);
        res.status(500).json({ error: 'Failed to fetch daily record' });
    }
});

/**
 * GET /api/daily/history
 * Get history of daily records.
 */
router.get('/history', async (req, res) => {
    try {
        const days = Math.max(1, Math.min(365, Number.parseInt(req.query.days, 10) || 30));
        const startDate = parseRecordDate();
        startDate.setDate(startDate.getDate() - days);
        const records = await DailyRecord.find({
            user: req.user.id,
            date: { $gte: startDate }
        }).sort({ date: -1 });
        res.json(records);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

/**
 * POST /api/daily/reset
 * Reset today's tasks and rebuild derived rewards and stats.
 */
router.post('/reset', async (req, res) => {
    try {
        const today = parseRecordDate();
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const record = await DailyRecord.findOne({ user: req.user.id, date: today });
        if (record) {
            record.tasks = defaultTasks();
            record.hp = 70;
            await record.save();
            await rebuildUserStats(req.user.id, user);
        }

        res.json({ success: true, message: 'Tasks reset successfully' });
    } catch (error) {
        console.error('Reset tasks error:', error);
        res.status(500).json({ error: 'Failed to reset tasks' });
    }
});

module.exports = router;
