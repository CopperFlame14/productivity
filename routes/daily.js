const express = require('express');
const router = express.Router();
const DailyRecord = require('../models/DailyRecord');
const User = require('../models/User');
const {
    calculateProductivityScore,
    calculateSevenDayAverage,
    calculateFinalScore,
    getRank,
    calculateXP,
    calculateLevel,
    calculateHP,
    calculateAnimeRewards
} = require('../utils/calculations');

/**
 * POST /api/daily
 * Save or update daily record with automatic calculations
 */
router.post('/', async (req, res) => {
    try {
        const { tasks, date } = req.body;

        // Use provided date or today
        const recordDate = date ? new Date(date) : new Date();
        recordDate.setHours(0, 0, 0, 0);

        if (Number.isNaN(recordDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date supplied' });
        }

        if (!tasks || typeof tasks !== 'object') {
            return res.status(400).json({ error: 'Task data is required' });
        }

        // Find the existing record so updates apply reward deltas rather than
        // awarding the same day's XP and episodes again.
        let record = await DailyRecord.findOne({
            user: req.user.id,
            date: recordDate
        });
        const previousXpEarned = record?.xp?.earned || 0;
        const previousAnimeUnlocked = record?.anime?.totalUnlocked || 0;
        const previousAnimeWatched = record?.anime?.watched || 0;
        const previousPenaltyApplied = record?.anime?.penaltyApplied || false;

        if (!record) {
            record = new DailyRecord({
                user: req.user.id,
                date: recordDate,
                tasks
            });
        } else {
            record.tasks = tasks;
        }

        // Calculate productivity score
        const rawScore = calculateProductivityScore(tasks);

        // Get recent scores for 7-day average
        const recentRecords = await DailyRecord.find({
            user: req.user.id,
            date: { $lt: recordDate }
        })
            .sort({ date: -1 })
            .limit(6)
            .select('scores.rawScore');

        const recentScores = recentRecords.map(r => r.scores.rawScore);
        recentScores.push(rawScore);

        const { average, bonus } = calculateSevenDayAverage(recentScores);

        // Check if all core tasks completed
        const allCompleted = record.allCoreTasksCompleted();

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Recompute today's streak from yesterday's saved record. Re-saving
        // the same date therefore cannot increment the streak repeatedly.
        const previousDate = new Date(recordDate);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousRecord = await DailyRecord.findOne({
            user: req.user.id,
            date: previousDate
        }).select('streak.current');
        const currentStreak = allCompleted
            ? (previousRecord?.streak?.current || 0) + 1
            : 0;
        user.stats.currentStreak = currentStreak;
        user.stats.bestStreak = Math.max(user.stats.bestStreak || 0, currentStreak);

        // Calculate final score with streak multiplier
        const finalScore = calculateFinalScore(rawScore, currentStreak, bonus);
        const rank = getRank(finalScore);

        // Calculate XP
        const xpEarned = calculateXP(finalScore);
        // Replace this record's previous contribution instead of adding it
        // again every time the user edits and saves today's tasks.
        user.stats.totalXP = Math.max(
            0,
            (user.stats.totalXP || 0) - previousXpEarned + xpEarned
        );
        const level = calculateLevel(user.stats.totalXP);
        user.stats.level = level;

        // Calculate HP
        const hp = calculateHP(tasks);

        // Calculate anime rewards
        const animeRewards = calculateAnimeRewards(tasks);

        // Add level bonuses
        if (level >= 10) {
            animeRewards.bonusEpisodes += 1;
        } else if (level >= 5) {
            animeRewards.bonusEpisodes += 0.5;
        }
        animeRewards.totalUnlocked = animeRewards.baseEpisodes + animeRewards.bonusEpisodes;

        // Replace this record's previous episode contribution.
        user.stats.animeEpisodesUnlocked = Math.max(
            0,
            (user.stats.animeEpisodesUnlocked || 0) -
                previousAnimeUnlocked +
                animeRewards.totalUnlocked
        );

        // Update record
        record.scores = {
            rawScore,
            finalScore,
            sevenDayAverage: average,
            rank
        };
        record.streak = {
            current: currentStreak,
            multiplier: calculateFinalScore(1, currentStreak, 0)
        };
        record.hp = hp;
        record.xp = {
            earned: xpEarned,
            total: user.stats.totalXP,
            level
        };
        record.anime = {
            baseEpisodes: animeRewards.baseEpisodes,
            bonusEpisodes: animeRewards.bonusEpisodes,
            totalUnlocked: animeRewards.totalUnlocked,
            watched: previousAnimeWatched,
            penaltyApplied: previousPenaltyApplied
        };

        await record.save();
        await user.save();

        res.json({
            success: true,
            message: 'Daily record saved',
            record: {
                id: record._id,
                date: record.date,
                tasks: record.tasks,
                scores: record.scores,
                streak: record.streak,
                hp: record.hp,
                xp: record.xp,
                anime: record.anime
            }
        });
    } catch (error) {
        console.error('Save daily record error:', error);
        res.status(500).json({ error: 'Failed to save daily record' });
    }
});

/**
 * GET /api/daily
 * Get today's record
 */
router.get('/', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let record = await DailyRecord.findOne({
            user: req.user.id,
            date: today
        });

        if (!record) {
            // Create empty record for today
            record = new DailyRecord({
                user: req.user.id,
                date: today
            });
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
 * Get history of daily records
 */
router.get('/history', async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        startDate.setHours(0, 0, 0, 0);

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
 * Reset today's tasks
 */
router.post('/reset', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const record = await DailyRecord.findOne({
            user: req.user.id,
            date: today
        });

        if (record) {
            // Reset all tasks
            record.tasks = {
                workout: { completed: false, minutes: 0, bonusMinutes: 0 },
                leetcode: { completed: false, problemsSolved: 0, bonusProblems: 0 },
                project: { completed: false, minutes: 0, bonusMinutes: 0 },
                study: { completed: false, minutes: 0, bonusMinutes: 0 },
                water: { completed: false, glasses: 0 }
            };
            await record.save();
        }

        res.json({
            success: true,
            message: 'Tasks reset successfully'
        });
    } catch (error) {
        console.error('Reset tasks error:', error);
        res.status(500).json({ error: 'Failed to reset tasks' });
    }
});

module.exports = router;
