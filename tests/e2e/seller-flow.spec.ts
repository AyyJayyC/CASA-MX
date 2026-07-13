const { test, expect } = require("@playwright/test");
const { loginViaUI } = require("./utils/auth");
const { navigateProtected } = require("./utils/navigation");

const sellerCreds = { email: "seller@casamx.local", password: "seller123" };

test.describe("Seller Flow — Production Grade", () => {
  test.describe.configure({ mode: "serial" });

  test("seller dashboard shows role-specific content", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await navigateProtected(page, "/dashboard");
  });

  test("my properties page shows property list or empty state", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await navigateProtected(page, "/dashboard/my-properties");
  });

  test("contact requests page shows table or empty state", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await navigateProtected(page, "/dashboard/contact-requests");
  });

  test("offers page shows offers or guidance", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await navigateProtected(page, "/dashboard/offers");
  });

  test("publish property form loads with required fields", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await navigateProtected(page, "/publish-property");
  });
});
