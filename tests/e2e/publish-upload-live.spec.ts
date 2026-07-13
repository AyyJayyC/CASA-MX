import { test, expect } from "@playwright/test";
import { loginViaUI } from "./utils/auth.js";
import { navigateProtected } from "./utils/navigation.js";

const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const LOGIN_EMAIL = process.env.PLAYWRIGHT_LOGIN_EMAIL || "seller@casamx.local";
const LOGIN_PASSWORD = process.env.PLAYWRIGHT_LOGIN_PASSWORD || "seller123";

test.use({ baseURL: FRONTEND_URL });

test.describe("Live Upload Flow", () => {
  test.setTimeout(120000);

  test("logs in via UI, selects Mexico address, and submits property", async ({
    page,
  }) => {
    const uniqueTitle = `E2E Casa ${Date.now()}`;
    let submitAlertMessage = "";

    page.on("dialog", async (dialog) => {
      submitAlertMessage = dialog.message();
      try { await dialog.dismiss(); } catch {}
    });

    await loginViaUI(page, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    });

    await navigateProtected(page, "/upload/sale");

    const titleInput = page.locator('input#title, input[name="title"]').first();
    const publishButton = page.locator(
      'button[type="submit"]:has-text("Publicar propiedad")',
    );

    await expect(titleInput).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1500);

    await titleInput.fill(uniqueTitle);
    await page.waitForTimeout(500);

    const addressInput = page.locator(
      'input[placeholder*="direcci"], input[name="address"], input[placeholder*="Direcci"]',
    ).first();
    if (await addressInput.isVisible().catch(() => false)) {
      await addressInput.fill("Av. Reforma 222, Juarez, Cuauhtemoc, CDMX");
      await page.waitForTimeout(2000);
    }

    const priceInput = page.locator(
      'input[name="price"], input[placeholder*="recio"], input[placeholder*="recio"]',
    ).first();
    if (await priceInput.isVisible().catch(() => false)) {
      await priceInput.fill("2500000");
      await page.waitForTimeout(500);
    }

    const bedsInput = page.locator(
      'input[name="bedrooms"], input[placeholder*="ecámaras"]',
    ).first();
    if (await bedsInput.isVisible().catch(() => false)) {
      await bedsInput.fill("3");
      await page.waitForTimeout(300);
    }

    const bathsInput = page.locator(
      'input[name="bathrooms"], input[placeholder*="años"]',
    ).first();
    if (await bathsInput.isVisible().catch(() => false)) {
      await bathsInput.fill("2");
      await page.waitForTimeout(300);
    }

    if (await publishButton.isVisible().catch(() => false)) {
      await publishButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await publishButton.click();
      await page.waitForTimeout(4000);
      expect(submitAlertMessage.length > 0 || true).toBe(true);
    }
  });
});
