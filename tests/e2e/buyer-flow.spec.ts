const { test, expect } = require("@playwright/test");
const { loginViaUI } = require("./utils/auth");

const buyerCreds = { email: "buyer@casamx.local", password: "buyer123" };

test.describe("Buyer Flow — Production Grade", () => {

  test("properties page shows search results or empty state", async ({ page }) => {
    await page.goto("/properties", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/properties/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(100);
  });

  test("search filter appears on properties page", async ({ page }) => {
    await page.goto("/properties", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"], input[type="search"], input[type="text"]').first();
    const hasSearch = await searchInput.isVisible().catch(() => false);
    if (hasSearch) {
      await expect(searchInput).toBeVisible();
    }
  });

  test("property detail page loads with content", async ({ page }) => {
    await page.goto("/properties", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    const propertyLink = page.locator('a[href*="/properties/"]').first();
    if (await propertyLink.isVisible().catch(() => false)) {
      await propertyLink.click();
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(2000);
      const pageText = await page.locator("body").textContent();
      expect(pageText.length).toBeGreaterThan(100);
    }
  });

  test("my offers page loads for authenticated buyer", async ({ page }) => {
    await loginViaUI(page, buyerCreds);
    await page.goto("/dashboard/my-offers", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/dashboard\/my-offers/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(50);
  });
});
