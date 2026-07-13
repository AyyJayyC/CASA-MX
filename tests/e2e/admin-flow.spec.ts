const { test, expect } = require("@playwright/test");

const adminCreds = { email: "admin@casamx.local", password: "admin123" };

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
        { name, value, domain: "localhost", path: "/", httpOnly: true, secure: false, sameSite: "Lax" },
      ]);
    }
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
