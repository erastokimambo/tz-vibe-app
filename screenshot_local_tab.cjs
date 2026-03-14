const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to the user's current mobile view
  await page.setViewport({ width: 500, height: 713 });
  
  await page.goto('http://localhost:5173/app/list-business', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(3000); 

  await page.screenshot({path: 'tzvibe_form_debug.png'});
  await browser.close();
})();
