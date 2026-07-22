import { test, expect } from '@playwright/test';

// Iterate over common icons or categories to test their visual states
const ICONS_TO_TEST = ['knowledge-graph', 'shield-lock', 'database']; 

test.describe('Icon Visual Regressions', () => {
  // Turn off animations in Playwright for stable screenshots (freezes first frame)
  test.use({ colorScheme: 'light', reducedMotion: 'reduce' });

  for (const iconId of ICONS_TO_TEST) {
    test.describe(`Icon: ${iconId}`, () => {
      
      test.beforeEach(async ({ page }) => {
        // Navigate to the dynamic docs page which renders the icon preview
        await page.goto(`/docs/icons/${iconId}`);
        // Ensure the preview container is fully loaded
        await page.waitForSelector('.icon-preview-container svg');
      });

      test('Idle - Light Mode', async ({ page }) => {
        const svg = page.locator('.icon-preview-container svg');
        await expect(svg).toHaveScreenshot(`${iconId}-idle-light.png`);
      });

      test('Hover state', async ({ page }) => {
        const svg = page.locator('.icon-preview-container svg');
        await svg.hover();
        await expect(svg).toHaveScreenshot(`${iconId}-hover.png`);
      });

      test('Focus state', async ({ page }) => {
        const svg = page.locator('.icon-preview-container svg');
        await svg.focus();
        await expect(svg).toHaveScreenshot(`${iconId}-focus.png`);
      });
    });
  }
});

test.describe('Icon Visual Regressions - Dark Mode', () => {
  test.use({ colorScheme: 'dark', reducedMotion: 'reduce' });

  for (const iconId of ICONS_TO_TEST) {
    test('Idle - Dark Mode', async ({ page }) => {
      await page.goto(`/docs/icons/${iconId}`);
      const svg = page.locator('.icon-preview-container svg');
      await expect(svg).toHaveScreenshot(`${iconId}-idle-dark.png`);
    });
  }
});
