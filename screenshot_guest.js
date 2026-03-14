const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:5173/');
  
  // Wait for the app to load and Firebase Auth to initialize
  await page.waitForTimeout(5000); 
  
  // Force click sign out if logged in, just to guarantee guest state
  try {
     await page.goto('http://localhost:5173/menu');
     await page.waitForTimeout(2000);
     const signOutBtn = await page.$('button:has-text("Sign Out")');
     if (signOutBtn) {
         await signOutBtn.click();
         await page.waitForTimeout(3000);
     }
  } catch(e) {}

  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(3000);
  
  await page.screenshot({path: 'tzvibe_guest_nav.png'});
  await browser.close();
})();
