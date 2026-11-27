const test = require('node:test');
const assert = require('node:assert/strict');
const DailyRecord = require('../models/DailyRecord');

test('daily records enforce one record per user and date', () => {
    const uniqueDailyIndex = DailyRecord.schema.indexes().find(([keys, options]) =>
        keys.user === 1 && keys.date === 1 && options.unique === true
    );

    assert.ok(uniqueDailyIndex, 'expected a unique compound index on user and date');
});
