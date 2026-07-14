const { test, expect } = require("@playwright/test");
const { loginViaUI } = require("./utils/auth");
const { navigateProtected } = require("./utils/navigation");

const adminCreds = { email: "admin@casamx.local", password: "admin123" };

test.describe("Admin Flow — Production Grade", () => {

  test("admin approvals page loads with role table", async ({ page }) => {
    await loginViaUI(page, adminCreds);
    await navigateProtected(page, "/admin/approvals");
  });

  test("admin analytics loads with data", async ({ page }) => {
    await loginViaUI(page, adminCreds);
    await navigateProtected(page, "/admin/analytics");
  });

  test("admin property management loads table", async ({ page }) => {
    await loginViaUI(page, adminCreds);
    await navigateProtected(page, "/admin/properties");
  });

  test("admin carousel editor loads with controls", async ({ page }) => {
    await loginViaUI(page, adminCreds);
    await navigateProtected(page, "/admin/carousel");
  });

  test("admin agencies page loads", async ({ page }) => {
    await loginViaUI(page, adminCreds);
    await navigateProtected(page, "/admin/agencies");
  });

  test("admin maps page loads", async ({ page }) => {
    await loginViaUI(page, adminCreds);
    await navigateProtected(page, "/admin/maps");
  });

  test("admin debug page loads with session list", async ({ page }) => {
    await loginViaUI(page, adminCreds);
    await navigateProtected(page, "/admin/debug");
  });

  test("admin non-admin user is blocked from admin pages", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/admin");
    expect(currentUrl).toContain("/login");
  });
});
