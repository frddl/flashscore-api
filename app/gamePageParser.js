const puppeteer = require('puppeteer');

async function fetchGameScore(game) {
    console.log('Fetching game data... ' + game);
    
    const startTime = Date.now();

    const browser = await puppeteer.launch({  
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-features=site-per-process'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    });

    const page = await browser.newPage();
    await page.goto(game, { waitUntil: 'networkidle2' });

    try {
        await page.waitForSelector('.smv__incidentsHeader.section__title');
        // console.log('Selector found', page.url());

        const scores = await page.evaluate(() => 
            Array.from(document.querySelectorAll('.smv__incidentsHeader.section__title'), element => element.innerHTML)
        );

        // console.log(scores[0]); // Debugging log
        // console.log(scores[1]); // Debugging log

        const firstHalf = scores[0].split('</div><div>')[1].replace('</div>', '').trim();
        var secondHalf = null;

        if (scores.length > 1){
            secondHalf = scores[1].split('</div><div>')[1].replace('</div>', '').trim();
        }

        const title = await page.evaluate(() => 
            document.title
        );

        const awayStats = await page.evaluate(() => {
            const stats = [];

            const elements = document.getElementsByClassName('smv__awayParticipant');
            for (let i = 0; i < elements.length; i++) {
                stats.push({
                    'type': elements[i].querySelector('title').innerHTML,
                    'time': parseInt(elements[i].innerText.split('\n')[0]),
                    'info': elements[i].innerText.split('\n')[1] ?? 'No info',
                    'team': 'away',
                });
            }

            return stats;
        });

        const homeStats = await page.evaluate(() => {
            const stats = [];

            const elements = document.getElementsByClassName('smv__homeParticipant');
            for (let i = 0; i < elements.length; i++) {
                stats.push({
                    'type': elements[i].querySelector('title').innerHTML,
                    'time': parseInt(elements[i].innerText.split('\n')[0]),
                    'info': elements[i].innerText.split('\n')[1],
                    'team': 'home',
                });
            }

            return stats;
        });

        const timeline = homeStats.concat(awayStats).sort((a, b) => a.time - b.time);

        const totalScore = await page.evaluate(() => {
            return document.querySelector('.detailScore__wrapper').innerText.replaceAll('\n', ' ');
        });

        // name format is ШАР 1-0 ЭЙП | Шарлеруа - Эйпен | Обзор

        const name = title.split('|')[1].trim();

        const details = await page.evaluate(() => {
            const startedAt = document.querySelector('.duelParticipant__startTime').innerText;
            const status = document.querySelector('.fixedHeaderDuel__detailStatus').innerText;
            const timestamp = document.querySelector('.eventAndAddedTime').innerText;

            return {
                startedAt,
                status,
                timestamp,
            };
        });

        // console.log('Halftime score:', firstHalf);
        // console.log('Score:', secondHalf);

        const endTime = Date.now();

        return {
            name,
            details,
            totalScore,
            firstHalf,
            secondHalf,
            timeline,
            'initialBets': {
                'home': '@todo',
                'draw': '@todo',
                'away': '@todo',
            },
            'responseTime': (endTime - startTime) / 1000,
        };
    } catch (error) {
        console.error('Error fetching game data:', error);
    } finally {
        await browser.close();
    }

    return null;  // Ensure a value is always returned
}


module.exports = fetchGameScore;
