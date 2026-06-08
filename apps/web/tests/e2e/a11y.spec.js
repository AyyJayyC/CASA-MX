const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

// Accessibility test using axe-core
// Checks key pages for common a11y violations

test("map page has no accessibility violations", async ({ page }) => {
  test.setTimeout(60000);

  await page.goto("/properties/map", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(500);

  if (page.url().includes("/properties/map")) {
    await page.waitForURL("**/login", { timeout: 5000 }).catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
  }

  // Page may redirect to login if not authenticated - verify page content is rendered
  const bodyText = await page.textContent("body");
  expect(Boolean(bodyText && bodyText.trim().length > 0)).toBeTruthy();

  const accessibilityScanResults = await new AxeBuilder({ page })
    .exclude("[data-nextjs-toast]")
    .analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test("home page has no accessibility violations", async ({ page }) => {
  await page.goto("/");

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("login page has no accessibility violations", async ({ page }) => {
  await page.goto("/login");

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
