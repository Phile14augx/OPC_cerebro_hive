import { test, expect } from '@playwright/test';

test.describe('Engineering Review End-to-End Journey', () => {
  test('Complete journey: Dashboard -> Review -> Finding -> Evidence', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');

    // Ensure we are redirected to login if unauthenticated (assuming mock auth or ignoring auth for this simple E2E test right now)
    // For this e2e test, we will assume we have a mock token or we bypass login for local testing.
    
    // We should see the Engineering Reviews section
    await expect(page.locator('text=Engineering Reviews')).toBeVisible();

    // Click on a review card
    const firstReviewCard = page.locator('[data-testid="review-card"]').first();
    await expect(firstReviewCard).toBeVisible();
    await firstReviewCard.click();

    // Verify Review Details Page loads
    await expect(page.locator('text=Findings')).toBeVisible();
    await expect(page.locator('text=Contributors')).toBeVisible();

    // Click on the first finding
    const firstFinding = page.locator('[data-testid="finding-row"]').first();
    await expect(firstFinding).toBeVisible();
    await firstFinding.click();

    // Verify Finding Details Page loads
    await expect(page.locator('text=Evidence')).toBeVisible();

    // Click on an evidence item
    const evidenceItem = page.locator('[data-testid="evidence-item"]').first();
    if (await evidenceItem.isVisible()) {
      await evidenceItem.click();
      
      // Verify evidence viewer or modal is open
      await expect(page.locator('[data-testid="evidence-viewer"]')).toBeVisible();
    }
  });
});
