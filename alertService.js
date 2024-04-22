const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

const bot = new TelegramBot(config.telegramToken, { polling: false });

function sendAlert(game, message) {
    const gameName = game.name || 'Unknown game';
    bot.sendMessage(config.telegramChatId, `Alert for ${gameName}: ${message}`);
}

module.exports = sendAlert;
