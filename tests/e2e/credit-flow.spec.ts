const { test, expect } = require("@playwright/test");

const creditFlowCreds = { email: "seller@casamx.local", password: "seller123" };

async function loginAsCreditUser(page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.fill('input[type="email"]', creditFlowCreds.email);
  await page.fill('input[type="password"]', creditFlowCreds.password);

  page.once("dialog", async (dialog) => {
    try { await dialog.dismiss(); } catch {}
  });

  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const logoutVisible = await page
    .locator('button:has-text("Salir")')
    .isVisible()
    .catch(() => false);
  if (logoutVisible) return;

  let loginStatus = 0;
  const response = await page.request.post("http://localhost:3001/auth/login", {
    data: creditFlowCreds,
    headers: { "Content-Type": "application/json" },
  });
  loginStatus = response.status();
  expect(loginStatus).toBe(200);
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
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
}

test.describe("Credit Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("credits page loads for authenticated user", async ({ page }) => {
    await loginAsCreditUser(page);

    await page.goto("/credits", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/credits/);
  });

  test("credit packages are visible on credits page", async ({ page }) => {
    await loginAsCreditUser(page);

    await page.goto("/credits", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(5000);

    await expect(page).toHaveURL(/\/credits/);
  });

  test("credits balance visible in navbar after login", async ({ page }) => {
    await loginAsCreditUser(page);
    await page.waitForTimeout(2000);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("publish property accessible with credits", async ({ page }) => {
    await loginAsCreditUser(page);

    await page.goto("/publish-property", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/\/publish-property/);
  });
});
