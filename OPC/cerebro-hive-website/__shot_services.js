const { chromium } = require('playwright');

const breakpoints = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'desktop-1280', width: 1280, height: 1000 },
  { name: 'tablet-1024', width: 1024, height: 1000 },
  { name: 'tablet-768', width: 768, height: 1000 },
  { name: 'mobile-430', width: 430, height: 1000 },
  { name: 'mobile-390', width: 390, height: 1000 },
  { name: 'mobile-360', width: 360, height: 1000 },
];

const pages = [
  { path: '/services/', prefix: 'services-index' },
  { path: '/services/ai-strategy', prefix: 'services-detail' },
];

(async () => {
  const browser = await chromium.launch();
  for (const pg of pages) {
    for (const bp of breakpoints) {
      const page = await browser.newPage({ viewport: { width: bp.width, height: bp.height } });
      await page.goto(`http://localhost:3000${pg.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({
        path: `C:\\Users\\LOQ\\AppData\\Local\\Temp\\claude\\d---MY-PROJECTS---OPC-cerebro-hive--OPC-cerebro-hive-website\\c6012e71-26f9-4b53-b19d-92a8edf539c1\\scratchpad\\${pg.prefix}-${bp.name}.png`,
        fullPage: true,
      });
      await page.close();
      console.log(`captured ${pg.prefix}-${bp.name}`);
    }
  }
  await browser.close();
})();
