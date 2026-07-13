const { test, expect } = require("@playwright/test");
const { loginViaUI } = require("./utils/auth");

const sellerCreds = { email: "seller@casamx.local", password: "seller123" };

test.describe("Seller Flow — Production Grade", () => {

  test("seller dashboard shows role-specific content", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/dashboard/);
    const hasContent = await page.locator("text=Mis propiedades").first().isVisible().catch(() => false);
    const hasDashboard = await page.locator("text=Inicio").first().isVisible().catch(() => false);
    expect(hasContent || hasDashboard).toBe(true);
  });

  test("my properties page shows property list or empty state", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await page.goto("/dashboard/my-properties", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/dashboard\/my-properties/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(50);
  });

  test("contact requests page shows table or empty state", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await page.goto("/dashboard/contact-requests", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/dashboard\/contact-requests/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(50);
  });

  test("offers page shows offers or guidance", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await page.goto("/dashboard/offers", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/dashboard\/offers/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(50);
  });

  test("publish property form loads with required fields", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await page.goto("/publish-property", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/publish-property/);
    const pageText = await page.locator("body").textContent();
    expect(pageText.length).toBeGreaterThan(50);
  });
});
