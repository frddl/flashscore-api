require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
};
