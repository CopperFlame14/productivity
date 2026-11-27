const test = require('node:test');
const assert = require('node:assert/strict');
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

const completeTasks = () => ({
    workout: { completed: true, minutes: 20, bonusMinutes: 0 },
    leetcode: { completed: true, problemsSolved: 1, bonusProblems: 0 },
    project: { completed: true, minutes: 30, bonusMinutes: 0 },
    study: { completed: true, minutes: 20, bonusMinutes: 0 },
    water: { completed: true, glasses: 8 }
});

test('a day meeting every target receives a score of 100', () => {
    assert.equal(calculateProductivityScore(completeTasks()), 100);
});

test('productivity score is capped when targets are exceeded', () => {
    const tasks = completeTasks();
    tasks.workout.minutes = 1000;
    tasks.leetcode.problemsSolved = 100;
    assert.equal(calculateProductivityScore(tasks), 100);
});

test('seven-day average and consistency bonus are calculated', () => {
    const result = calculateSevenDayAverage([40, 60, 80]);
    assert.equal(result.average, 60);
    assert.equal(result.bonus, 4);
});

test('final score applies streak multiplier and caps at 100', () => {
    assert.equal(calculateFinalScore(80, 7, 0), 88);
    assert.equal(calculateFinalScore(100, 14, 10), 100);
});

test('rank boundaries are stable', () => {
    assert.equal(getRank(90), 'S');
    assert.equal(getRank(75), 'A');
    assert.equal(getRank(50), 'B');
    assert.equal(getRank(49.99), 'C');
});

test('XP and level calculations use 500 XP per level', () => {
    assert.equal(calculateXP(82.9), 82);
    assert.equal(calculateLevel(0), 1);
    assert.equal(calculateLevel(500), 2);
    assert.equal(calculateLevel(999), 2);
});

test('health points apply workout and hydration penalties', () => {
    const tasks = completeTasks();
    tasks.workout.completed = false;
    tasks.water.completed = false;
    assert.equal(calculateHP(tasks), 70);
});

test('anime rewards count completed core activities and bonuses', () => {
    const tasks = completeTasks();
    tasks.leetcode.bonusProblems = 2;
    tasks.workout.bonusMinutes = 40;
    assert.deepEqual(calculateAnimeRewards(tasks), {
        baseEpisodes: 4,
        bonusEpisodes: 2,
        totalUnlocked: 6
    });
});
