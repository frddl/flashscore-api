const puppeteer = require('puppeteer');

async function fetchGameScore(game) {
    console.log('Fetching game data... ' + game);
    
    const startTime = Date.now();

    const browser = await puppeteer.launch({  
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1280x800',
            '--disable-features=site-per-process'
        ],
        defaultViewport: {
            width: 1280,
            height: 800
        },
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    });

    const page = await browser.newPage();
    
    await page.setCacheEnabled(false);
    await page.setRequestInterception(true);
    page.on('request', request => {
        const resourceType = request.resourceType();
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
            request.abort();
        } else {
            request.continue();
        }
    });

    await page.goto(game, { waitUntil: 'networkidle2' });

    try {
        await page.waitForSelector('.smv__incidentsHeader.section__title', { timeout: 5000 });

        const gameData = await page.evaluate(() => {
            const classification = document.querySelector('.tournamentHeader__country').innerText.split(': ');
            const country = classification[0];
            const league = classification[1].split(' - ')[0];

            const scores = Array.from(document.querySelectorAll('.smv__incidentsHeader.section__title'), element => element.innerHTML);
            const firstHalf = scores[0].split('</div><div>')[1].replace('</div>', '').trim();
            const secondHalf = scores.length > 1 ? scores[1].split('</div><div>')[1].replace('</div>', '').trim() : null;
            const title = document.title;

            const getStats = (className, team) => {
                return Array.from(document.getElementsByClassName(className)).map(element => ({
                    'type': element.querySelector('title').innerHTML,
                    'time': parseInt(element.innerText.split('\n')[0]),
                    'info': element.innerText.split('\n')[1] ?? 'No info',
                    'team': team,
                }));
            };

            const homeStats = getStats('smv__homeParticipant', 'home');
            const awayStats = getStats('smv__awayParticipant', 'away');
            const timeline = homeStats.concat(awayStats).sort((a, b) => a.time - b.time);

            const totalScore = document.querySelector('.detailScore__wrapper').innerText.replaceAll('\n', ' ');

            const details = {
                startedAt: document.querySelector('.duelParticipant__startTime').innerText,
                status: document.querySelector('.fixedHeaderDuel__detailStatus').innerText,
                timestamp: document.querySelector('.eventAndAddedTime').innerText,
            };

            return {
                country,
                league,
                title,
                details,
                totalScore,
                firstHalf,
                secondHalf,
                timeline,
            };
        });

        const endTime = Date.now();

        return {
            country: gameData.country,
            league: gameData.league,
            name: gameData.title.split('|')[1].trim(),
            details: gameData.details,
            totalScore: gameData.totalScore,
            firstHalf: gameData.firstHalf,
            secondHalf: gameData.secondHalf,
            timeline: gameData.timeline,
            initialBets: {
                home: '@todo',
                draw: '@todo',
                away: '@todo',
            },
            responseTime: (endTime - startTime) / 1000,
        };
    } catch (error) {
        console.error('Error fetching game data:', error);
    } finally {
        await browser.close();
    }

    return null;  // Ensure a value is always returned
}

module.exports = fetchGameScore;
