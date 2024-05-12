const puppeteer = require('puppeteer');

async function fetchGameScore(game) {
    console.log('Fetching game data... ' + game);
    
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
        const secondHalf = scores[1].split('</div><div>')[1].replace('</div>', '').trim();

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
                    'info': elements[i].innerText.split('\n')[1],
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

        // console.log('Halftime score:', firstHalf);
        // console.log('Score:', secondHalf);

        return {
            firstHalf,
            secondHalf,
            name,
            timeline,
            totalScore,
            'initialBets': {
                'home': '@todo',
                'draw': '@todo',
                'away': '@todo',
            },
        };
    } catch (error) {
        console.error('Error fetching game data:', error);
    } finally {
        await browser.close();
    }

    return null;  // Ensure a value is always returned
}


module.exports = fetchGameScore;
