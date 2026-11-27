const test = require('node:test');
const assert = require('node:assert/strict');
const { recalculateDailyStats } = require('../utils/dailyStats');

function tasks(completed) {
    return {
        workout: { completed, minutes: completed ? 20 : 0, bonusMinutes: 0 },
        leetcode: { completed, problemsSolved: completed ? 1 : 0, bonusProblems: 0 },
        project: { completed, minutes: completed ? 30 : 0, bonusMinutes: 0 },
        study: { completed, minutes: completed ? 20 : 0, bonusMinutes: 0 },
        water: { completed, glasses: completed ? 8 : 0 }
    };
}

function record(date, completed) {
    return {
        date: new Date(date),
        tasks: tasks(completed),
        scores: { rawScore: completed ? 100 : 0, sevenDayAverage: 0 },
        streak: { current: 0, multiplier: 1 },
        xp: { earned: 0, total: 0, level: 1 },
        anime: { watched: 0, penaltyApplied: false }
    };
}

test('rebuilds streaks chronologically even when records arrive out of order', () => {
    const records = [
        record('2026-11-03', true),
        record('2026-11-01', true),
        record('2026-11-02', true)
    ];

    const totals = recalculateDailyStats(records, 2);
    const ordered = [...records].sort((a, b) => a.date - b.date);

    assert.deepEqual(ordered.map(item => item.streak.current), [1, 2, 3]);
    assert.equal(totals.currentStreak, 3);
    assert.equal(totals.bestStreak, 3);
    assert.equal(totals.animeEpisodesWatched, 2);
});

test('an edited historical day resets following streaks when the chain breaks', () => {
    const records = [
        record('2026-11-01', true),
        record('2026-11-02', false),
        record('2026-11-03', true)
    ];

    const totals = recalculateDailyStats(records);
    assert.deepEqual(records.map(item => item.streak.current), [1, 0, 1]);
    assert.equal(totals.currentStreak, 1);
    assert.equal(totals.bestStreak, 1);
});

test('resetting a day removes its XP and episode contribution on rebuild', () => {
    const first = record('2026-11-01', true);
    const second = record('2026-11-02', true);
    const before = recalculateDailyStats([first, second]);
    assert.ok(before.totalXP > 0);
    assert.ok(before.animeEpisodesUnlocked > 0);

    second.tasks = tasks(false);
    second.scores.rawScore = 0;
    const after = recalculateDailyStats([first, second]);

    assert.ok(after.totalXP < before.totalXP);
    assert.ok(after.animeEpisodesUnlocked < before.animeEpisodesUnlocked);
    assert.equal(after.currentStreak, 0);
});

test('rebuilding repeatedly is idempotent and preserves watched episode count', () => {
    const records = [record('2026-11-01', true), record('2026-11-02', true)];
    const first = recalculateDailyStats(records, 1);
    const second = recalculateDailyStats(records, 1);

    assert.deepEqual(second, first);
});
