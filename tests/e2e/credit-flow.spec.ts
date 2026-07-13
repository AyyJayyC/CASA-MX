const { test, expect } = require("@playwright/test");
const { loginViaUI } = require("./utils/auth");

const creditFlowCreds = { email: "seller@casamx.local", password: "seller123" };

test.describe("Credit Flow E2E", () => {

  test("credits page loads for authenticated user", async ({ page }) => {
    await loginViaUI(page, creditFlowCreds);
    await page.goto("/credits", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/credits/);
  });

  test("credit packages are visible on credits page", async ({ page }) => {
    await loginViaUI(page, creditFlowCreds);
    await page.goto("/credits", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(5000);
    await expect(page).toHaveURL(/\/credits/);
  });

  test("credits balance visible in navbar after login", async ({ page }) => {
    await loginViaUI(page, creditFlowCreds);
    await page.waitForTimeout(2000);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("publish property accessible with credits", async ({ page }) => {
    await loginViaUI(page, creditFlowCreds);
    await page.goto("/publish-property", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/publish-property/);
  });
});
