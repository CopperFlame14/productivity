const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { calculateTimeAllocation } = require('../utils/calculations');

/**
 * POST /api/goals
 * Create new custom goal
 */
router.post('/', async (req, res) => {
    try {
        const { name, type, targetTime, priority } = req.body;

        if (!name || !targetTime) {
            return res.status(400).json({ error: 'Name and target time are required' });
        }

        const goal = new Goal({
            user: req.user.id,
            name,
            type: type || 'goal',
            targetTime,
            priority: priority || 'Medium'
        });

        await goal.save();

        res.status(201).json({
            success: true,
            message: 'Goal created successfully',
            goal
        });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

/**
 * GET /api/goals
 * Get all user goals
 */
router.get('/', async (req, res) => {
    try {
        const { active = 'true' } = req.query;

        const query = { user: req.user.id };
        if (active === 'true') {
            query.active = true;
        }

        const goals = await Goal.find(query).sort({ priority: -1, createdAt: -1 });

        res.json(goals);
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

/**
 * PUT /api/goals/:id
 * Update goal
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, type, targetTime, priority, active } = req.body;

        const goal = await Goal.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        if (name) goal.name = name;
        if (type) goal.type = type;
        if (targetTime) goal.targetTime = targetTime;
        if (priority) goal.priority = priority;
        if (active !== undefined) goal.active = active;

        await goal.save();

        res.json({
            success: true,
            message: 'Goal updated successfully',
            goal
        });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

/**
 * DELETE /api/goals/:id
 * Delete goal
 */
router.delete('/:id', async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json({
            success: true,
            message: 'Goal deleted successfully'
        });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

/**
 * POST /api/goals/:id/progress
 * Update goal progress
 */
router.post('/:id/progress', async (req, res) => {
    try {
        const { timeSpent, completed } = req.body;

        const goal = await Goal.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        if (timeSpent) {
            goal.tracking.totalTimeSpent += timeSpent;
        }

        if (completed) {
            goal.tracking.daysCompleted += 1;
            goal.tracking.currentStreak += 1;

            if (goal.tracking.currentStreak > goal.tracking.bestStreak) {
                goal.tracking.bestStreak = goal.tracking.currentStreak;
            }

            goal.tracking.lastCompletedDate = new Date();
        }

        await goal.save();

        res.json({
            success: true,
            message: 'Goal progress updated',
            goal
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

/**
 * POST /api/goals/schedule
 * Calculate smart time allocation
 */
router.post('/schedule', async (req, res) => {
    try {
        const { availableHours } = req.body;

        if (!availableHours || availableHours <= 0) {
            return res.status(400).json({ error: 'Valid available hours required' });
        }

        const goals = await Goal.find({
            user: req.user.id,
            active: true
        });

        if (goals.length === 0) {
            return res.json({
                message: 'No active goals found',
                schedule: []
            });
        }

        const schedule = calculateTimeAllocation(goals, availableHours);

        res.json({
            success: true,
            availableHours,
            schedule
        });
    } catch (error) {
        console.error('Calculate schedule error:', error);
        res.status(500).json({ error: 'Failed to calculate schedule' });
    }
});

module.exports = router;
