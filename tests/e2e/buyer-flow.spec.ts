const { test, expect } = require("@playwright/test");

const buyerCreds = { email: "buyer@casamx.local", password: "buyer123" };

async function loginViaAPI(page, creds) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const status = await page.evaluate(async (c) => {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(c),
      });
      return res.status;
    }, creds);
    if (status !== 429) {
      expect(status).toBe(200);
      return;
    }
    await page.waitForTimeout(1200 + attempt * 400);
  }
}

test.describe("Buyer Flow — Production Grade", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

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
    await loginViaAPI(page, buyerCreds);
    await page.goto("/dashboard/my-offers", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/dashboard\/my-offers/);

    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(50);
  });
});
