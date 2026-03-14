const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Intercept console logs to read AuthContext state
  page.on('console', msg => {
    if (msg.text().includes('AUTH_STATE')) {
        console.log(msg.text());
    }
  });

  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(5000); 
  
  // Inject a logger into window to check AuthContext
  const result = await page.evaluate(() => {
     let root = document.getElementById('root');
     return JSON.stringify({ 
         href: window.location.href,
         bodySize: document.body.innerHTML.length
     });
  });
  console.log("Page loaded:", result);

  await browser.close();
})();
