const {
    calculateFinalScore,
    calculateLevel,
    calculateAnimeRewards,
    getRank,
    calculateXP
} = require('./calculations');

function isConsecutiveDay(previousDate, currentDate) {
    if (!previousDate || !currentDate) return false;
    const previous = new Date(previousDate);
    const current = new Date(currentDate);
    const expected = new Date(previous);
    expected.setDate(expected.getDate() + 1);
    return expected.getFullYear() === current.getFullYear() &&
        expected.getMonth() === current.getMonth() &&
        expected.getDate() === current.getDate();
}

function allCoreTasksCompleted(tasks = {}) {
    return ['workout', 'leetcode', 'project', 'study', 'water']
        .every(name => tasks[name]?.completed === true);
}

function calendarDayNumber(value) {
    const date = new Date(value);
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

/**
 * Rebuild derived user totals and daily streak/XP/reward snapshots from
 * chronological daily records. The asOfDate argument makes current-streak
 * behaviour deterministic in tests and production.
 */
function recalculateDailyStats(records, watchedEpisodes = 0, asOfDate = new Date()) {
    const ordered = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
    let totalXP = 0;
    let totalUnlocked = 0;
    let bestStreak = 0;
    let previousRecord = null;

    for (const record of ordered) {
        const currentStreak = allCoreTasksCompleted(record.tasks)
            ? (previousRecord && isConsecutiveDay(previousRecord.date, record.date)
                ? previousRecord.streak?.current || 0
                : 0) + 1
            : 0;

        const rawScore = record.scores?.rawScore || 0;
        const average = record.scores?.sevenDayAverage || 0;
        const sevenDayBonus = Math.max(0, (rawScore - average) * 0.2);
        const finalScore = calculateFinalScore(rawScore, currentStreak, sevenDayBonus);
        const xpEarned = calculateXP(finalScore);

        totalXP += xpEarned;
        const level = calculateLevel(totalXP);

        const taskRewards = calculateAnimeRewards(record.tasks || {});
        const levelBonus = level >= 10 ? 1 : level >= 5 ? 0.5 : 0;
        const totalRecordUnlocked = taskRewards.totalUnlocked + levelBonus;
        totalUnlocked += totalRecordUnlocked;
        bestStreak = Math.max(bestStreak, currentStreak);

        record.streak = {
            current: currentStreak,
            multiplier: calculateFinalScore(1, currentStreak, 0)
        };
        record.scores = {
            ...(record.scores?.toObject ? record.scores.toObject() : record.scores || {}),
            rawScore,
            finalScore,
            rank: getRank(finalScore)
        };
        record.xp = {
            ...(record.xp?.toObject ? record.xp.toObject() : record.xp || {}),
            earned: xpEarned,
            total: totalXP,
            level
        };
        record.anime = {
            ...(record.anime?.toObject ? record.anime.toObject() : record.anime || {}),
            baseEpisodes: taskRewards.baseEpisodes,
            bonusEpisodes: taskRewards.bonusEpisodes + levelBonus,
            totalUnlocked: totalRecordUnlocked
        };

        previousRecord = record;
    }

    const lastRecord = ordered[ordered.length - 1];
    const daysSinceLastRecord = lastRecord
        ? calendarDayNumber(asOfDate) - calendarDayNumber(lastRecord.date)
        : Infinity;
    const currentStreak = daysSinceLastRecord >= 0 && daysSinceLastRecord <= 1
        ? lastRecord.streak.current
        : 0;
    const safeWatchedEpisodes = Math.max(0, Number.isFinite(watchedEpisodes) ? watchedEpisodes : 0);

    return {
        totalXP,
        level: calculateLevel(totalXP),
        currentStreak,
        bestStreak,
        // Never make already-watched episodes exceed the unlocked balance
        // after a historical edit or reset causes rewards to be recalculated.
        animeEpisodesUnlocked: Math.max(totalUnlocked, safeWatchedEpisodes),
        animeEpisodesWatched: safeWatchedEpisodes
    };
}

module.exports = { recalculateDailyStats, isConsecutiveDay, allCoreTasksCompleted };
