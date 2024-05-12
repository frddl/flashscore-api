const express = require('express')
const app = express()
const port = 3000
const fetchGameScore = require('./gamePageParser');

app.get('/get-match/:matchId', async (req, res) => {
    const matchId = req.params.matchId;
    var data = await fetchGameScore('https://www.flashscore.com/match/' + matchId + '/#/match-summary');
    res.send(data);
});

app.listen(port, () => {
    console.log('Flashscore API service is running on port ' + port)
})