function checkAlertCondition(gameData) {
    // [first half is, second half is not]
    const halfCombos = [
        ['1 - 0', '0 - 0'],
        // ['0 - 0', '0 - 0'],
    ];

    for (const combo of halfCombos) {
        if (gameData.firstHalf === combo[0] && gameData.secondHalf !== combo[1]) {
            console.log('Alert condition met:', combo);
            return `First Half ${gameData.firstHalf}, Second Half ${gameData.secondHalf}`;
        }
    };

    return false;
}

module.exports = checkAlertCondition;
