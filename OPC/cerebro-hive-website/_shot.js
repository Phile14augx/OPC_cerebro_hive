const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: process.argv[2] || 'home.png' });
  const box = await page.locator('h1').first().boundingBox();
  console.log('H1 boundingBox:', JSON.stringify(box));
  await browser.close();
})();
