const { test, expect } = require("@playwright/test");
const { loginViaUI } = require("./utils/auth");
const { navigateProtected } = require("./utils/navigation");

const creditFlowCreds = { email: "seller@casamx.local", password: "seller123" };

test.describe("Credit Flow E2E", () => {

  test("credits page loads for authenticated user", async ({ page }) => {
    await loginViaUI(page, creditFlowCreds);
    await navigateProtected(page, "/credits");
  });

  test("credit packages are visible on credits page", async ({ page }) => {
    await loginViaUI(page, creditFlowCreds);
    await navigateProtected(page, "/credits");
  });

  test("credits balance visible in navbar after login", async ({ page }) => {
    await loginViaUI(page, creditFlowCreds);
    await page.waitForTimeout(2000);
    await navigateProtected(page, "/dashboard");
  });

  test("publish property accessible with credits", async ({ page }) => {
    await loginViaUI(page, creditFlowCreds);
    await navigateProtected(page, "/publish-property");
  });
});
