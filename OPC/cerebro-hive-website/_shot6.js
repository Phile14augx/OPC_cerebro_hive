const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const rootSpacing = getComputedStyle(document.documentElement).getPropertyValue('--spacing');
    const el = document.querySelector('.pt-32');
    const cs = el ? getComputedStyle(el) : null;
    // find the actual CSS rule text for .pt-32 by scanning all stylesheets (incl nested layers)
    function findRule(sheet, out) {
      let rules;
      try { rules = sheet.cssRules; } catch (e) { return; }
      for (const r of rules) {
        if (r.cssRules) { findRule(r, out); }
        else if (r.selectorText && r.selectorText.split(',').some(s => s.trim() === '.pt-32')) {
          out.push(r.cssText);
        }
      }
    }
    const found = [];
    for (const sheet of document.styleSheets) findRule(sheet, found);
    return {
      rootSpacingVar: rootSpacing,
      elClass: el ? el.className : null,
      elTag: el ? el.tagName : null,
      paddingTop: cs ? cs.paddingTop : null,
      ptRuleText: found,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
