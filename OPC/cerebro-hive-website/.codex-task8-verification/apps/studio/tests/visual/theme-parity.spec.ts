import { test, expect } from '@playwright/test';

test.describe('Theme Motion Parity & Visual Regression', () => {
  
  test('Home Hero - Light Theme (Executive Blueprint)', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    
    // Switch to light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    });

    // Wait for animations to settle
    await page.waitForTimeout(1500);

    // Verify visual snapshot
    await expect(page).toHaveScreenshot('home-hero-light.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });

  test('Home Hero - Dark Theme (Mission Control)', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    
    // Switch to dark theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });

    // Wait for animations to settle
    await page.waitForTimeout(1500);

    // Verify visual snapshot
    await expect(page).toHaveScreenshot('home-hero-dark.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });

});
