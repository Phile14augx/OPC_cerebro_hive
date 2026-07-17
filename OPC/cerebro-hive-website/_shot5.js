const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/research', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const sec = document.querySelector('h1').closest('section');
    const cs = getComputedStyle(sec);
    // find which stylesheet rule actually wins for padding-top
    const matched = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch (e) { continue; }
      for (const rule of rules) {
        if (rule.selectorText && sec.matches(rule.selectorText.split(',')[0].trim())) {
          if (rule.style && (rule.style.padding || rule.style.paddingTop || rule.style.margin)) {
            matched.push(rule.cssText.slice(0, 200));
          }
        }
      }
    }
    return {
      className: sec.className,
      paddingTop: cs.paddingTop,
      padding: cs.padding,
      matchedRules: matched,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
