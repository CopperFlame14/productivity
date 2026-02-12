/**
 * Productivity Calculation Engine
 * Handles all game mechanics calculations including scores, XP, HP, rewards
 */

// Target values for core tasks
const TARGETS = {
    WORKOUT_MINUTES: 20,
    LEETCODE_PROBLEMS: 1,
    PROJECT_MINUTES: 30,
    STUDY_MINUTES: 20,
    WATER_GLASSES: 8
};

// Weights for productivity score
const WEIGHTS = {
    WORKOUT: 0.20,
    LEETCODE: 0.25,
    PROJECT: 0.25,
    STUDY: 0.20,
    WATER: 0.10
};

// XP and level constants
const XP_PER_LEVEL = 500;
const HP_LOSS = {
    WORKOUT: 20,
    WATER: 10
};

/**
 * Calculate productivity score
 */
function calculateProductivityScore(tasks) {
    const { workout, leetcode, project, study, water } = tasks;

    // Normalize values (cap at 1.2 for over-performance)
    const normalized = {
        workout: Math.min(1.2, workout.minutes / TARGETS.WORKOUT_MINUTES),
        leetcode: Math.min(1.2, leetcode.problemsSolved / TARGETS.LEETCODE_PROBLEMS),
        project: Math.min(1.2, project.minutes / TARGETS.PROJECT_MINUTES),
        study: Math.min(1.2, study.minutes / TARGETS.STUDY_MINUTES),
        water: Math.min(1.2, water.glasses / TARGETS.WATER_GLASSES)
    };

    // Calculate weighted raw score
    const rawScore = (
        normalized.workout * WEIGHTS.WORKOUT +
        normalized.leetcode * WEIGHTS.LEETCODE +
        normalized.project * WEIGHTS.PROJECT +
        normalized.study * WEIGHTS.STUDY +
        normalized.water * WEIGHTS.WATER
    ) * 100;

    return Math.min(100, rawScore);
}

/**
 * Calculate streak multiplier
 */
function getStreakMultiplier(streak) {
    if (streak >= 14) return 1.15;
    if (streak >= 7) return 1.10;
    if (streak >= 3) return 1.05;
    return 1.0;
}

/**
 * Calculate 7-day average and bonus
 */
function calculateSevenDayAverage(recentScores) {
    if (recentScores.length === 0) return { average: 0, bonus: 0 };

    const sum = recentScores.reduce((acc, score) => acc + score, 0);
    const average = sum / recentScores.length;

    // Consistency bonus: if today's score is higher than average
    const todayScore = recentScores[recentScores.length - 1] || 0;
    const bonus = Math.max(0, (todayScore - average) * 0.2);

    return { average, bonus };
}

/**
 * Calculate final productivity score with multipliers
 */
function calculateFinalScore(rawScore, streak, sevenDayBonus) {
    const multiplier = getStreakMultiplier(streak);
    const finalScore = rawScore * multiplier + sevenDayBonus;
    return Math.min(100, finalScore);
}

/**
 * Get rank from score
 */
function getRank(score) {
    if (score >= 90) return 'S';
    if (score >= 75) return 'A';
    if (score >= 50) return 'B';
    return 'C';
}

/**
 * Calculate XP earned and level
 */
function calculateXP(finalScore) {
    return Math.floor(finalScore);
}

function calculateLevel(totalXP) {
    return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

/**
 * Calculate HP (Health Points)
 */
function calculateHP(tasks) {
    let hp = 100;

    if (!tasks.workout.completed) {
        hp -= HP_LOSS.WORKOUT;
    }

    if (!tasks.water.completed) {
        hp -= HP_LOSS.WATER;
    }

    return Math.max(0, hp);
}

/**
 * Calculate anime episode rewards
 */
function calculateAnimeRewards(tasks) {
    let baseEpisodes = 0;
    let bonusEpisodes = 0;

    // Base unlocks (max 4)
    if (tasks.workout.completed) baseEpisodes += 1;
    if (tasks.leetcode.completed) baseEpisodes += 1;
    if (tasks.project.completed) baseEpisodes += 1;
    if (tasks.study.completed) baseEpisodes += 1;

    // Bonus rewards (no cap)
    if (tasks.leetcode.bonusProblems > 0) {
        bonusEpisodes += tasks.leetcode.bonusProblems * 0.5;
    }
    if (tasks.workout.bonusMinutes >= 20) {
        bonusEpisodes += Math.floor(tasks.workout.bonusMinutes / 20) * 0.5;
    }
    if (tasks.project.bonusMinutes >= 30) {
        bonusEpisodes += Math.floor(tasks.project.bonusMinutes / 30) * 0.5;
    }
    if (tasks.study.bonusMinutes >= 20) {
        bonusEpisodes += Math.floor(tasks.study.bonusMinutes / 20) * 0.5;
    }

    return {
        baseEpisodes,
        bonusEpisodes,
        totalUnlocked: baseEpisodes + bonusEpisodes
    };
}

/**
 * Calculate burnout score
 */
function calculateBurnoutScore(data) {
    let score = 0;
    const factors = [];

    // Check work time vs available time
    const totalWorkMinutes =
        data.tasks.workout.minutes +
        data.tasks.project.minutes +
        data.tasks.study.minutes;

    const availableMinutes = data.availableHours * 60;

    if (totalWorkMinutes > availableMinutes * 0.8) {
        score += 30;
        factors.push('High work load (>80% of available time)');
    }

    // Check if too many high-priority goals
    if (data.highPriorityGoals > 5) {
        score += 20;
        factors.push('Too many high-priority goals');
    }

    // Check declining productivity trend
    if (data.productivityTrend < 0) {
        score += 15;
        factors.push('Declining productivity trend');
    }

    // Check low hobby engagement
    if (data.hobbyTime < 30) {
        score += 15;
        factors.push('Low hobby engagement');
    }

    // Check long streak without rest
    if (data.streak > 21) {
        score += 10;
        factors.push('Long streak without rest day');
    }

    // Check repeated over-scheduling
    if (data.overScheduledDays > 3) {
        score += 10;
        factors.push('Repeatedly over-scheduled');
    }

    const finalScore = Math.min(100, score);
    let level = 'Healthy';
    if (finalScore >= 70) level = 'High';
    else if (finalScore >= 40) level = 'Moderate';

    return { score: finalScore, level, factors };
}

/**
 * Check if weekly boss battle is won
 */
function checkWeeklyBossWin(weeklyDaysCompleted) {
    return weeklyDaysCompleted >= 5;
}

/**
 * Calculate smart time allocation
 */
function calculateTimeAllocation(goals, availableHours) {
    const totalWeight = goals.reduce((sum, goal) => sum + goal.getPriorityWeight(), 0);

    const allocations = goals.map(goal => {
        const weight = goal.getPriorityWeight();
        const allocatedMinutes = Math.floor((weight / totalWeight) * availableHours * 60);

        return {
            goalId: goal._id,
            goalName: goal.name,
            priority: goal.priority,
            allocatedMinutes,
            targetMinutes: goal.targetTime
        };
    });

    return allocations;
}

module.exports = {
    TARGETS,
    WEIGHTS,
    XP_PER_LEVEL,
    HP_LOSS,
    calculateProductivityScore,
    getStreakMultiplier,
    calculateSevenDayAverage,
    calculateFinalScore,
    getRank,
    calculateXP,
    calculateLevel,
    calculateHP,
    calculateAnimeRewards,
    calculateBurnoutScore,
    checkWeeklyBossWin,
    calculateTimeAllocation
};
