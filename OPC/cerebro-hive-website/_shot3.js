const { chromium } = require('playwright');

const routes = ['/research', '/products'];

(async () => {
  const browser = await chromium.launch();
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3000' + route, { waitUntil: 'networkidle' });
    const scrollY1 = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(300);
    const scrollY2 = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    const scrollY3 = await page.evaluate(() => window.scrollY);
    const name = route.replace(/\//g, '');
    console.log(name, 'scrollY at load:', scrollY1, 'after 300ms:', scrollY2, 'after forced scrollTo0 + 800ms:', scrollY3);
    await page.screenshot({ path: process.argv[2] + '/' + name + '_top.png' });
    await page.close();
  }
  await browser.close();
})();
