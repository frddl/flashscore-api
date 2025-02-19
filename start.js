const Sentry = require("@sentry/node");
const express = require('express')
const config = require('./config');
const app = express()

const port = config.port;
const fetchGameScore = require('./gamePageParser');

app.get('/', (req, res) => {
    res.send({'status': 'OK'});
    return;
});

app.get('/get-match/:matchId', async (req, res, next) => {
    try {
        const matchId = req.params.matchId;
        const data = await fetchGameScore('https://www.flashscore.com/match/' + matchId + '/#/match-summary');
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({ error: 'Data not found for match.' });
        }
    } catch (error) {
        next(error); // Forward the error to Sentry's error handler
    }
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.listen(port, () => {
    console.log('Flashscore API service is running on port ' + port)
})