const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(3000); // Wait for firebase auth to load
  await page.screenshot({path: 'screenshot.png'});
  await browser.close();
})();
