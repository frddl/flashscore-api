const puppeteer = require('puppeteer');
const db = require('./db');

async function fetchGameScore(game) {
    const browser = await puppeteer.launch({  
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox'],
        // executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });

    const page = await browser.newPage();
    await page.goto(game.link, { waitUntil: 'networkidle2' });

    try {
        await page.waitForSelector('body', {timeout: 5000});
        // console.log('Selector found', page.url());

        const halfStatus = await page.evaluate(() => 
            Array.from(document.querySelectorAll('.fixedHeaderDuel__detailStatus'), element => element.textContent)
        );

        if (halfStatus[0] !== '2-й тайм') {
            console.log('Not second half, skipping...');

            if (halfStatus[0] === 'ЗАВЕРШЕН') {
                db.deactivate(game.id);
            }

            await browser.close();
            return;
        }

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

        // name format is ШАР 1-0 ЭЙП | Шарлеруа - Эйпен | Обзор

        const name = title.split('|')[1].trim();

        // console.log('Halftime score:', firstHalf);
        // console.log('Score:', secondHalf);

        return {
            firstHalf,
            secondHalf,
            name,
        };
    } catch (error) {
        console.error('Error fetching game data:', error);
    } finally {
        await browser.close();
    }

    return null;  // Ensure a value is always returned
}


module.exports = fetchGameScore;
