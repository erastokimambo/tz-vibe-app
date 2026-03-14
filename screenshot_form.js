const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewport({ width: 1280, height: 900 });
  
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(3000); 

  // Force navigate directly to the form page 
  // (Assuming we bypassed auth or the local server allows direct navigation)
  await page.goto('http://localhost:5173/app/list-business');
  await page.waitForTimeout(3000);

  await page.screenshot({path: 'list_business_dark_mode.png'});
  await browser.close();
})();
