function isValidEpisodeCount(value) {
    return Number.isSafeInteger(value) && value > 0;
}

module.exports = { isValidEpisodeCount };
