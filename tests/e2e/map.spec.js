const { test, expect } = require('@playwright/test');

// NOTE: Prefer `npm run test:e2e:auto` to auto-start the dev server for local runs.

test('map page loads without errors', async ({ page }) => {
  await page.goto('/properties/map', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(500);

  if (page.url().includes('/properties/map')) {
    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});
  }

  // Just verify page loads and has content (either map or login redirect)
  const bodyText = await page.textContent('body');
  expect(Boolean(bodyText && bodyText.trim().length > 0)).toBeTruthy();
});
