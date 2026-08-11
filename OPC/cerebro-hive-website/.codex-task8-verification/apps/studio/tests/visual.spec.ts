import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('Homepage layout matches baseline', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for animations/fonts to load
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic/animated elements if necessary to prevent flaky tests
    await page.evaluate(() => {
      document.querySelectorAll('.animate-pulse').forEach(el => el.classList.remove('animate-pulse'));
    });

    // Take full page screenshot and compare
    await expect(page).toHaveScreenshot('homepage-layout.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05 // Allow 5% diff for minor font rendering differences
    });
  });

  test('Research Hub layout matches baseline', async ({ page }) => {
    await page.goto('/research');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('research-layout.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05
    });
  });
});
