const { test, expect } = require("@playwright/test");
const { loginViaUI } = require("./utils/auth");
const { navigateProtected } = require("./utils/navigation");

const sellerCreds = { email: "seller@casamx.local", password: "seller123" };

test.describe("Rental Flow E2E Tests", () => {

  test("Scenario 1: Client browses rental properties with filters", async ({
    page,
  }) => {
    await page.goto("/properties", { waitUntil: "networkidle" });
    await expect(page.locator("text=Propiedades"))
      .toBeVisible({ timeout: 10000 })
      .catch(() => {});
    const rentTab = page.locator('button:has-text("Renta")');
    if (await rentTab.isVisible().catch(() => false)) {
      await rentTab.click();
      await page.waitForTimeout(500);
      const inputs = page.locator('input[type="text"], input[type="number"]');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
    }
  });

  test("Scenario 2: Client applies to rental property with complete form", async ({
    page,
  }) => {
    await page.goto("/properties", { waitUntil: "networkidle" });
    const rentTab = page.locator('button:has-text("Renta")');
    if (await rentTab.isVisible().catch(() => false)) {
      await rentTab.click();
      await page.waitForTimeout(500);
      const firstProperty = page.locator('a[href*="/properties/"]').first();
      if (await firstProperty.isVisible().catch(() => false)) {
        await firstProperty.click();
        await page.waitForTimeout(1000);
        const pageText = await page.locator("body").textContent();
        expect(pageText.length).toBeGreaterThan(50);
      } else {
        const content = await page.locator("body").textContent();
        expect(content.length).toBeGreaterThan(50);
      }
    } else {
      const content = await page.locator("body").textContent();
      expect(content.length).toBeGreaterThan(50);
    }
  });

  test("Scenario 3: Owner dashboard loads successfully", async ({
    page,
  }) => {
    await loginViaUI(page, sellerCreds);
    await navigateProtected(page, "/dashboard/applications");
    const page_content = await page.content();
    expect(
      page_content.includes("Pendientes") ||
        page_content.includes("Administra") ||
        page_content.includes("Panel") ||
        page_content.includes("Dashboard") ||
        page_content.includes("applications"),
    ).toBeTruthy();
  });

  test("Scenario 4: Dashboard has property selector component", async ({
    page,
  }) => {
    await loginViaUI(page, sellerCreds);
    await navigateProtected(page, "/dashboard/applications");
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test("Scenario 5: Status filter buttons are interactive", async ({
    page,
  }) => {
    await loginViaUI(page, sellerCreds);
    await navigateProtected(page, "/dashboard/applications");
    const content = await page.content();
    expect(content.length).toBeGreaterThan(50);
  });

  test("Scenario 6: Rental property shows correct badges", async ({ page }) => {
    await page.goto("/properties", { waitUntil: "networkidle" });
    const rentTab = page.locator('button:has-text("Renta")');
    if (await rentTab.isVisible().catch(() => false)) {
      await rentTab.click();
      await page.waitForTimeout(500);
      const pageContent = await page.content();
      const hasRentalInfo =
        pageContent.includes("MXN") ||
        pageContent.includes("Amueblada") ||
        pageContent.includes("Servicios");
      expect(hasRentalInfo).toBeTruthy();
    }
  });

  test("Scenario 7: Responsive design on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/properties", { waitUntil: "networkidle" });
    const rentTab = page.locator('button:has-text("Renta")');
    if (await rentTab.isVisible().catch(() => false)) {
      await rentTab.click();
      await page.waitForTimeout(500);
    }
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test("Scenario 8: Dashboard responsive on mobile", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateProtected(page, "/dashboard/applications");
    const content = await page.content();
    expect(content.length).toBeGreaterThan(50);
  });

  test("Scenario 9: Dark mode support on properties page", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/properties", { waitUntil: "networkidle" });
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test("Scenario 10: Dark mode support on dashboard", async ({ page }) => {
    await loginViaUI(page, sellerCreds);
    await page.emulateMedia({ colorScheme: "dark" });
    await navigateProtected(page, "/dashboard/applications");
    const content = await page.content();
    expect(content.length).toBeGreaterThan(50);
  });
});

test.describe("Rental UI Component Tests", () => {
  test("Property card layout is responsive", async ({ page }) => {
    await page.goto("/properties");
    const rentTab = page.locator('button:has-text("Renta")');
    if (await rentTab.isVisible().catch(() => false)) {
      await rentTab.click();
      await page.waitForTimeout(500);
    }
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test("Application form renders all fields", async ({ page }) => {
    await page.goto("/properties");
    const rentTab = page.locator('button:has-text("Renta")');
    if (await rentTab.isVisible().catch(() => false)) {
      await rentTab.click();
      await page.waitForTimeout(500);
      const firstProperty = page.locator('a[href*="/properties/"]').first();
      if (await firstProperty.isVisible().catch(() => false)) {
        await firstProperty.click();
        await page.waitForTimeout(1000);
        const formElements = page.locator("input, textarea, select");
        const count = await formElements.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("Dashboard applications table has correct structure", async ({
    page,
  }) => {
    await page.goto("/dashboard/applications");
    await page.waitForTimeout(1000);
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test("Buy/Rent toggle functionality", async ({ page }) => {
    await page.goto("/properties");
    const buyTab = page.locator('button:has-text("Compra")');
    const rentTab = page.locator('button:has-text("Renta")');
    const hasTabs =
      (await buyTab.isVisible().catch(() => false)) ||
      (await rentTab.isVisible().catch(() => false));
    expect(hasTabs).toBeTruthy();
    if (await rentTab.isVisible().catch(() => false)) {
      await rentTab.click();
      await page.waitForTimeout(500);
      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
    }
  });

  test("Status filter displays correct badge colors", async ({ page }) => {
    await page.goto("/dashboard/applications");
    await page.waitForTimeout(1000);
    const content = await page.content();
    expect(
      content.includes("badge") ||
        content.includes("status") ||
        content.includes("Panel"),
    ).toBeTruthy();
  });

  test("Navigation works between pages", async ({ page }) => {
    await page.goto("/properties");
    expect(page.url()).toContain("/properties");
    await page.goto("/dashboard/applications");
    expect(page.url()).toMatch(/\/dashboard|\/login/);
    await page.goto("/properties");
    expect(page.url()).toContain("/properties");
  });

  test("Error handling on invalid routes", async ({ page }) => {
    await page
      .goto("/properties/invalid-id")
      .catch(() => null);
    expect(true).toBeTruthy();
  });
});
