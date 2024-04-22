const db = require('./db');
const fetchGameScore = require('./gamePageParser');
const checkAlertCondition = require('./gameConditions');
const sendAlert = require('./alertService');
const SECOND = 1000;

async function checkGames() {
    
    db.all('SELECT * FROM games WHERE alert_sent_at IS NULL and is_active = 1', [], async (err, games) => {
        if (err) {
            console.error('Error accessing database:', err);
            return;
        }

        const checkPromises = games.map(async (game) => {
            const gameData = await fetchGameScore(game);

            if (!gameData) {
                console.log(`No data fetched for game ID ${game.id}. Skipping...`);
                return;
            }

            if (gameData && !game.name) {
                db.setName(game.id, gameData.name);
            }

            const condition = checkAlertCondition(gameData);
            console.log('Condition: ', condition)
            
            if (condition) {
                console.log('Alert condition met: ', condition)
                console.log('Game Alert Sent At: ', game.alert_sent_at)
                if (!game.alert_sent_at) {
                    sendAlert(game, condition);
                    db.setAlertSentAt(game.id);
                }
            }
        });

        try {
            await Promise.all(checkPromises);
        } catch (error) {
            console.error('Error checking games:', error);
        }
    });
}

// checkGames();
function startParser(){
    console.log('Starting parser...')
    setInterval(checkGames, 10 * SECOND);
}

module.exports = startParser;