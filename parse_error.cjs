const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(4000); 

  // Grab any text from Vite's error overlay (which is in a shadow DOM)
  const overlayError = await page.evaluate(() => {
    const overlay = document.querySelector('vite-error-overlay');
    if (overlay) {
      if (overlay.shadowRoot) {
          return overlay.shadowRoot.innerHTML;
      }
      return 'Overlay exists but no shadow DOM';
    }
    return 'No overlay';
  });

  console.log("Overlay Error:", overlayError);
  await browser.close();
})();
