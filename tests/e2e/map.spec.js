const { test, expect } = require('@playwright/test');

// NOTE: Run `npm run dev` (Next dev server) before running this test locally.
// Example: in one terminal run `npm run dev`, in another run `npm run test:e2e`.

test('map page loads without errors', async ({ page }) => {
  await page.goto('/properties/map');
  await page.waitForLoadState('networkidle');

  // Just verify page loads and has content (either map or login redirect)
  const hasH1 = await page.locator('h1').count() > 0;
  expect(hasH1).toBeTruthy();
});
