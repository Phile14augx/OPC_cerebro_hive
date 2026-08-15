import { expect, test } from '@playwright/test';

test.describe('Twin Studio Command Center', () => {
  test('gate 1: /app/ boots Twin Studio with /app assets', async ({ page }) => {
    const response = await page.goto('/app/');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(/Twin Studio/);
    await expect(page.getByText('CH').first()).toBeVisible();
    await expect(page.getByText('/TWIN').first()).toBeVisible();
    const assets = page.locator('script[src*="/app/_next"], link[href*="/app/_next"]');
    await expect(assets.first()).toBeAttached();
    const root = await page.request.get('/');
    expect(root.status()).not.toBe(200);
  });

  test('gate 3: created twin name survives reload', async ({ page }) => {
    const name = `Playwright Harbor ${Date.now()}`;
    await page.goto('/app/');
    await expect(page.getByRole('button', { name: 'Create twin' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Create twin' }).first().click();
    await page.locator('#create-name').fill(name);
    await page.getByRole('button', { name: 'Create twin' }).last().click();
    await expect(page.getByRole('heading', { name })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name })).toBeVisible();
    await page.getByRole('button', { name }).click();
    await expect(page.getByRole('heading', { name })).toBeVisible();
  });

  test('gates 6 and 7: OBSERVED ingest and SIMULATED tick stay distinct', async ({ page }) => {
    await page.goto('/app/');
    await expect(page.getByRole('button', { name: /Factory Alpha/ })).toBeVisible();
    await page.getByRole('button', { name: /Factory Alpha/ }).click();
    await page.getByRole('tab', { name: 'Live state' }).click();
    await page.locator('#ingest-source').fill('playwright-line-sensor');
    await page.locator('#ingest-state').fill('{"vibration":4.2}');
    await page.getByRole('button', { name: 'Ingest observed state' }).click();
    await expect(page.getByRole('status')).toContainText(/OBSERVED/);
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.locator('.timeline strong', { hasText: 'OBSERVED' }).first()).toBeVisible();
    await page.getByRole('tab', { name: 'Overview' }).click();
    await page.getByRole('button', { name: 'Advance simulated tick' }).click();
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.locator('.timeline strong', { hasText: 'OBSERVED' }).first()).toBeVisible();
    await expect(page.locator('.timeline strong', { hasText: 'SIMULATED' }).first()).toBeVisible();
  });

  test('gate 10: error banner uses API code and message', async ({ page }) => {
    await page.goto('/app/');
    await expect(page.getByRole('button', { name: /Factory Alpha/ })).toBeVisible();
    await page.getByRole('button', { name: /Factory Alpha/ }).click();
    await page.getByRole('tab', { name: 'Live state' }).click();
    await page.locator('#ingest-source').fill('bad-json');
    await page.locator('#ingest-state').fill('{not json');
    await page.getByRole('button', { name: 'Ingest observed state' }).click();
    await expect(page.locator('.banner.error')).toContainText('VALIDATION_ERROR');

    await page.getByRole('tab', { name: 'Ask twin' }).click();
    await page.getByRole('button', { name: 'Ask' }).click();
    await expect(page.locator('.banner.error')).toContainText('LLM_UNAVAILABLE');

    await page.getByRole('button', { name: 'Create twin' }).first().click();
    await page.locator('#create-name').fill('  ');
    await page.getByRole('button', { name: 'Create twin' }).last().click();
    await expect(page.locator('.banner.error')).toContainText('VALIDATION_ERROR');
  });
});
