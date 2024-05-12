const express = require('express')
const config = require('./config');
const app = express()

const port = config.port;
const fetchGameScore = require('./gamePageParser');

app.get('/get-match/:matchId', async (req, res) => {
    const matchId = req.params.matchId;
    var data = await fetchGameScore('https://www.flashscore.com/match/' + matchId + '/#/match-summary');
    res.send(data);
});

app.listen(port, () => {
    console.log('Flashscore API service is running on port ' + port)
})