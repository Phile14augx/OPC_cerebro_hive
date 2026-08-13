import { test, expect } from '@playwright/test';

test.describe('Theme Motion Parity & Visual Regression', () => {
  
  test('Home Hero - Light Theme (Executive Blueprint)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });

    // Go to home page
    await page.goto('/');
    
    // Switch to light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    });

    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Verify visual snapshot
    await expect(hero).toHaveScreenshot('home-hero-light.png', {
      maxDiffPixels: 200,
    });
  });

  test('Home Hero - Dark Theme (Mission Control)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

    // Go to home page
    await page.goto('/');
    
    // Switch to dark theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });

    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Verify visual snapshot
    await expect(hero).toHaveScreenshot('home-hero-dark.png', {
      maxDiffPixels: 200,
    });
  });

});
