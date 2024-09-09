const Sentry = require("@sentry/node");
const express = require('express');
const config = require('./config');
const { fetchGameScore, closeBrowser, initializeBrowser } = require('./gamePageParser');
const app = express();

const port = config.port;

// Initialize Puppeteer browser once when the server starts
(async () => {
    await initializeBrowser();
})();

// Health check route
app.get('/', (req, res) => {
    res.send({ 'status': 'OK' });
});

// Fetch game match data
app.get('/get-match/:matchId', async (req, res) => {
    const matchId = req.params.matchId;

    try {
        // Fetch game data using the matchId
        const data = await fetchGameScore(`https://www.flashscore.com/match/${matchId}/#/match-summary`);
        res.status(200).send(data);
    } catch (error) {
        // Capture the error using Sentry and respond with a 500 status code
        Sentry.captureException(error);
        res.status(500).send({ error: 'Failed to fetch match data', details: error.message });
    }
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});

// Gracefully shut down the Puppeteer browser when the application exits
process.on('SIGINT', async () => {
    console.log('Shutting down Puppeteer...');
    await closeBrowser();  // Gracefully close Puppeteer
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down Puppeteer...');
    await closeBrowser();  // Gracefully close Puppeteer
    process.exit(0);
});

// Start the server
app.listen(port, () => {
    console.log('Flashscore API service is running on port ' + port);
});
