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
        detached: true,
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

            const svgTypes = {
                'M17 2.93a9.96 9.96 0 1 0-14.08 14.1A9.96 9.96 0 0 0 17 2.92Zm.41 2.77a8.5 8.5 0 0 1 1.1 3.43L16.66 8.1l.75-2.4Zm-1.37-1.8.37.4-1.11 3.57-1.33.4-3.32-2.41V4.5l3.16-2.2a8.6 8.6 0 0 1 2.22 1.6ZM9.96 1.4c.78-.01 1.55.1 2.3.3l-2.3 1.6-2.3-1.6c.75-.2 1.52-.31 2.3-.3ZM3.9 3.9a8.6 8.6 0 0 1 2.22-1.6l3.16 2.2v1.36l-3.32 2.4-1.32-.4L3.52 4.3l.37-.4ZM2.52 5.7l.75 2.4-1.85 1.03a8.5 8.5 0 0 1 1.1-3.43Zm1.37 10.35-.22-.23H5.7l.65 1.95a8.6 8.6 0 0 1-2.45-1.72Zm2.01-1.6H2.63A8.5 8.5 0 0 1 1.4 10.7l2.75-1.55 1.41.43 1.28 3.91-.95.95Zm6.05 3.89c-1.3.3-2.66.3-3.97 0l-1.01-3.02 1.1-1.1h3.79l1.1 1.1-1.01 3.02Zm-.07-5.44H8.05L6.86 9.25 9.96 7l3.1 2.25-1.18 3.65Zm4.15 3.15a8.6 8.6 0 0 1-2.45 1.72l.66-1.94h2.01l-.22.22Zm-2-1.6-.95-.95 1.27-3.91 1.41-.43 2.76 1.55a8.5 8.5 0 0 1-1.22 3.74h-3.27Z': 'Goal',
                'card-ico yellowCard-ico': 'Yellow Card',
                'card-ico redCard-ico': 'Red Card',
            };
            
            const getStats = (className, team) => {
                return Array.from(document.getElementsByClassName(className)).map(element => {
                    const svg = element.querySelector('svg');
                    const dAttribute = svg.querySelector('path')?.getAttribute('d');
                    const svgClass = svg?.getAttribute('class');
                    const svgTitle = svg.querySelector('title')?.textContent;
            
                    const type = svgTitle || svgTypes[svgClass] || svgTypes[dAttribute] || null;
            
                    if (!type) {
                        return null;
                    }

                    return {
                        'type': type,
                        'time': parseInt(element.innerText.split('\n')[0]),
                        'info': element.innerText.split('\n')[1] ?? 'No info',
                        'team': team,
                    };
                }).filter(item => item !== null);
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
