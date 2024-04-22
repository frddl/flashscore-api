const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const startParser = require('./parser');
const db = require('./db');

const bot = new TelegramBot(config.telegramToken, { polling: true });

bot.onText(/\/add (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // Full command text after /add
    const args = resp.split(';'); // Split the input into components

    if (args.length !== 1) {
        bot.sendMessage(chatId, "Please use the format: /add [link]");
        return;
    }

    const [link] = args;

    db.run('INSERT INTO games (link) VALUES (?)', [link], function(err) {
        if (err) {
            console.error(err.message);
            bot.sendMessage(chatId, "Failed to add game.");
            return;
        }
        bot.sendMessage(chatId, `Game added successfully with ID: ${this.lastID}`);
    });
});

bot.onText(/\/list/, (msg) => {
    const chatId = msg.chat.id;
    db.all('SELECT id, name FROM games WHERE is_active = 1 and alert_sent_at is null', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            bot.sendMessage(chatId, "Failed to retrieve games.");
            return;
        }
        if (rows.length === 0) {
            bot.sendMessage(chatId, "No games available.");
            return;
        }
        const response = rows.map((game) => `${game.id}: ${game.name}`).join('\n');
        bot.sendMessage(chatId, response);
    });
});

bot.onText(/\/remove (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const id = match[1]; // Extracted ID from the command

    db.run('DELETE FROM games WHERE id = ?', [id], function(err) {
        if (err) {
            console.error(err.message);
            bot.sendMessage(chatId, "Failed to remove game.");
            return;
        }
        if (this.changes === 0) {
            bot.sendMessage(chatId, "No game found with the given ID.");
            return;
        }
        bot.sendMessage(chatId, "Game removed successfully.");
    });
});

startParser();