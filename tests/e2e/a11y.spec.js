const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Accessibility test using axe-core
// Checks key pages for common a11y violations

test('map page has no accessibility violations', async ({ page }) => {
  await page.goto('/properties/map');
  await page.waitForLoadState('networkidle');

  // Page may redirect to login if not authenticated - just verify it loads
  const hasH1 = await page.locator('h1').count() > 0;
  expect(hasH1).toBeTruthy();

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('home page has no accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('login page has no accessibility violations', async ({ page }) => {
  await page.goto('/login');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
