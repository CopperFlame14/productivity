require('dotenv').config();
const mongoose = require('mongoose');
const DailyRecord = require('../models/DailyRecord');

async function main() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured. Set it in your .env file.');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const duplicates = await DailyRecord.aggregate([
        {
            $group: {
                _id: { user: '$user', date: '$date' },
                count: { $sum: 1 },
                recordIds: { $push: '$_id' }
            }
        },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1 } }
    ]);

    if (duplicates.length === 0) {
        console.log('No duplicate user/date records found.');
        return;
    }

    console.log(`Found ${duplicates.length} duplicate user/date group(s):`);
    for (const duplicate of duplicates) {
        console.log(JSON.stringify({
            user: duplicate._id.user.toString(),
            date: duplicate._id.date.toISOString(),
            count: duplicate.count,
            recordIds: duplicate.recordIds.map(id => id.toString())
        }, null, 2));
    }

    process.exitCode = 1;
}

main()
    .catch(error => {
        console.error('Duplicate check failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
