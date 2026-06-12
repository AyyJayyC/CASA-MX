const { test, expect } = require("@playwright/test");

test.describe("Static Pages Smoke E2E", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL("/");
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL("/login");

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL("/register");
  });

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL("/forgot-password");
  });

  test("reset password page loads", async ({ page }) => {
    await page.goto("/reset-password?token=test", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/reset-password/);
  });

  test("verify email page loads", async ({ page }) => {
    await page.goto("/verify-email", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/verify-email/);
  });

  test("properties page loads", async ({ page }) => {
    await page.goto("/properties", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/properties/);
  });

  test("aviso legal page loads", async ({ page }) => {
    await page.goto("/aviso-legal", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/aviso-legal/);
  });

  test("terminos page loads", async ({ page }) => {
    await page.goto("/terminos", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/terminos/);
  });

  test("cookie page loads", async ({ page }) => {
    await page.goto("/cookie", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/cookie/);
  });

  test("map page loads", async ({ page }) => {
    await page.goto("/properties/map", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/properties\/map|\/login/);
  });
});
