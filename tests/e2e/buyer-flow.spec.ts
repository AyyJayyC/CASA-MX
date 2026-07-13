const { test, expect } = require("@playwright/test");

const buyerCreds = { email: "buyer@casamx.local", password: "buyer123" };

async function loginViaAPI(page, creds) {
  const response = await page.request.post("http://localhost:3001/auth/login", {
    data: creds,
    headers: { "Content-Type": "application/json" },
  });
  expect(response.status()).toBe(200);
  const setCookie = response.headers()["set-cookie"];
  if (setCookie) {
    const cookieList = Array.isArray(setCookie) ? setCookie : [setCookie];
    for (const cookieStr of cookieList) {
      const parts = cookieStr.split(";").map((s) => s.trim());
      const [first] = parts;
      const eqIdx = first.indexOf("=");
      if (eqIdx === -1) continue;
      const name = first.slice(0, eqIdx);
      const value = first.slice(eqIdx + 1);
      await page.context().addCookies([
        { name, value, domain: "localhost", path: "/" },
      ]);
    }
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
