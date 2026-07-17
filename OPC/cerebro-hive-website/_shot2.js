const { chromium } = require('playwright');

const routes = ['/services', '/company', '/research', '/products'];

(async () => {
  const browser = await chromium.launch();
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3000' + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const name = route.replace(/\//g, '') || 'home';
    await page.screenshot({ path: process.argv[2] + '/' + name + '.png' });
    await page.close();
  }
  await browser.close();
})();
