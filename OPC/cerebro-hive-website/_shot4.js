const { chromium } = require('playwright');

const routes = ['/research', '/products'];

(async () => {
  const browser = await chromium.launch();
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3000' + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const h1Box = await page.locator('h1').first().boundingBox();
    const sectionBox = await page.locator('section').first().boundingBox();
    const navBox = await page.locator('nav').first().boundingBox();
    const computed = await page.evaluate(() => {
      const sec = document.querySelector('section');
      const h1 = document.querySelector('h1');
      const cs = getComputedStyle(sec);
      return {
        sectionPaddingTop: cs.paddingTop,
        sectionMinHeight: cs.minHeight,
        sectionHeight: cs.height,
        sectionDisplay: cs.display,
        sectionJustify: cs.justifyContent,
        h1MarginTop: getComputedStyle(h1).marginTop,
        h1Text: h1.textContent,
      };
    });
    console.log('---', route, '---');
    console.log('nav box:', JSON.stringify(navBox));
    console.log('section box:', JSON.stringify(sectionBox));
    console.log('h1 box:', JSON.stringify(h1Box));
    console.log('computed:', JSON.stringify(computed));
    await page.close();
  }
  await browser.close();
})();
