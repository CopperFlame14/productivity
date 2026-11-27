const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const DailyRecord = require('../models/DailyRecord');

const mongoUri = process.env.MONGODB_URI;

test('MongoDB replica set supports transactions and enforces unique daily records', {
    skip: !mongoUri && 'MONGODB_URI is not configured; integration test requires MongoDB'
}, async () => {
    await mongoose.connect(mongoUri);

    const email = `integration-${randomUUID()}@example.test`;
    let user;

    try {
        await User.init();
        await DailyRecord.init();

        user = await User.create({
            name: 'Integration Test',
            email,
            password: 'integration-test-password'
        });

        const date = new Date(2026, 10, 28);
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                await DailyRecord.create([{
                    user: user._id,
                    date
                }], { session });
            });
        } finally {
            await session.endSession();
        }

        const saved = await DailyRecord.findOne({ user: user._id, date });
        assert.ok(saved, 'transaction should persist the daily record');

        await assert.rejects(
            DailyRecord.create({ user: user._id, date }),
            error => error && error.code === 11000,
            'a second record for the same user/date must violate the unique index'
        );
    } finally {
        if (user) {
            await DailyRecord.deleteMany({ user: user._id });
            await User.deleteOne({ _id: user._id });
        }
        await mongoose.disconnect();
    }
});
