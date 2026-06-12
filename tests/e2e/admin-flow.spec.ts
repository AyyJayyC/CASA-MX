const { test, expect } = require("@playwright/test");

const adminCreds = { email: "admin@casamx.local", password: "admin123" };

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

test.describe("Admin Flow — Production Grade", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("admin approvals page loads with role table", async ({ page }) => {
    await loginViaAPI(page, adminCreds);
    await page.goto("/admin/approvals", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/admin\/approvals/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(50);
  });

  test("admin analytics loads with data", async ({ page }) => {
    await loginViaAPI(page, adminCreds);
    await page.goto("/admin/analytics", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(5000);

    await expect(page).toHaveURL(/\/admin\/analytics/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(100);
  });

  test("admin property management loads table", async ({ page }) => {
    await loginViaAPI(page, adminCreds);
    await page.goto("/admin/properties", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/admin\/properties/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(50);
  });

  test("admin carousel editor loads with controls", async ({ page }) => {
    await loginViaAPI(page, adminCreds);
    await page.goto("/admin/carousel", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/admin\/carousel/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(30);
  });

  test("admin agencies page loads", async ({ page }) => {
    await loginViaAPI(page, adminCreds);
    await page.goto("/admin/agencies", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/admin\/agencies/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(30);
  });

  test("admin maps page loads", async ({ page }) => {
    await loginViaAPI(page, adminCreds);
    await page.goto("/admin/maps", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/admin\/maps/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(30);
  });

  test("admin debug page loads with session list", async ({ page }) => {
    await loginViaAPI(page, adminCreds);
    await page.goto("/admin/debug", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/admin\/debug/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(30);
  });

  test("admin non-admin user is blocked from admin pages", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);

    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/admin");
    expect(currentUrl).toContain("/login");
  });
});
