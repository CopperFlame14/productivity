const express = require('express');
const mongoose = require('mongoose');
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

async function rebuildUserStats(userId, user, session) {
    const records = await DailyRecord.find({ user: userId })
        .sort({ date: 1 })
        .session(session);
    const scores = [];

    for (const record of records) {
        const rawScore = calculateProductivityScore(record.tasks);
        const { average } = calculateSevenDayAverage([...scores.slice(-6), rawScore]);
        record.scores = {
            ...record.scores.toObject(),
            rawScore,
            sevenDayAverage: average
        };
        scores.push(rawScore);
    }

    const totals = recalculateDailyStats(records, user.stats.animeEpisodesWatched || 0);
    for (const record of records) await record.save({ session });

    user.stats.totalXP = totals.totalXP;
    user.stats.level = totals.level;
    user.stats.currentStreak = totals.currentStreak;
    user.stats.bestStreak = totals.bestStreak;
    user.stats.animeEpisodesUnlocked = totals.animeEpisodesUnlocked;
    await user.save({ session });
    return records;
}

/**
 * POST /api/daily
 * Save a daily record and rebuild its derived stats atomically.
 */
router.post('/', async (req, res) => {
    if (!req.body.tasks || typeof req.body.tasks !== 'object' || Array.isArray(req.body.tasks)) {
        return res.status(400).json({ error: 'Task data is required' });
    }

    const recordDate = parseRecordDate(req.body.date);
    if (!recordDate) {
        return res.status(400).json({ error: 'Invalid date supplied' });
    }

    const session = await mongoose.startSession();
    let responseRecord;

    try {
        await session.withTransaction(async () => {
            const user = await User.findById(req.user.id).session(session);
            if (!user) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }

            const record = await DailyRecord.findOneAndUpdate(
                { user: req.user.id, date: recordDate },
                {
                    $set: {
                        tasks: req.body.tasks,
                        hp: calculateHP(req.body.tasks),
                        'scores.rawScore': calculateProductivityScore(req.body.tasks)
                    }
                },
                { new: true, upsert: true, setDefaultsOnInsert: true, session }
            );

            const records = await rebuildUserStats(req.user.id, user, session);
            const saved = records.find(item => item._id.equals(record._id)) || record;
            responseRecord = {
                id: saved._id,
                date: saved.date,
                tasks: saved.tasks,
                scores: saved.scores,
                streak: saved.streak,
                hp: saved.hp,
                xp: saved.xp,
                anime: saved.anime
            };
        });

        res.json({
            success: true,
            message: 'Daily record saved',
            record: responseRecord
        });
    } catch (error) {
        console.error('Save daily record error:', error);
        res.status(error.status || 500).json({
            error: error.status === 404 ? 'User not found' : 'Failed to save daily record'
        });
    } finally {
        await session.endSession();
    }
});

/**
 * GET /api/daily
 * Get today's record, creating it only once under the unique index.
 */
router.get('/', async (req, res) => {
    try {
        const today = parseRecordDate();
        const record = await DailyRecord.findOneAndUpdate(
            { user: req.user.id, date: today },
            { $setOnInsert: { user: req.user.id, date: today } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
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
 * Reset today's tasks and derived stats atomically.
 */
router.post('/reset', async (req, res) => {
    const today = parseRecordDate();
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const user = await User.findById(req.user.id).session(session);
            if (!user) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }

            const record = await DailyRecord.findOne({ user: req.user.id, date: today }).session(session);
            if (record) {
                record.tasks = defaultTasks();
                record.hp = calculateHP(record.tasks);
                await record.save({ session });
                await rebuildUserStats(req.user.id, user, session);
            }
        });

        res.json({ success: true, message: 'Tasks reset successfully' });
    } catch (error) {
        console.error('Reset tasks error:', error);
        res.status(error.status || 500).json({
            error: error.status === 404 ? 'User not found' : 'Failed to reset tasks'
        });
    } finally {
        await session.endSession();
    }
});

module.exports = router;
