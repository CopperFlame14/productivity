const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidEpisodeCount } = require('../utils/anime');

test('episode watch count accepts positive whole numbers only', () => {
    assert.equal(isValidEpisodeCount(1), true);
    assert.equal(isValidEpisodeCount(25), true);
    assert.equal(isValidEpisodeCount(0), false);
    assert.equal(isValidEpisodeCount(-1), false);
    assert.equal(isValidEpisodeCount(1.5), false);
    assert.equal(isValidEpisodeCount('1'), false);
    assert.equal(isValidEpisodeCount(Number.MAX_SAFE_INTEGER + 1), false);
});
