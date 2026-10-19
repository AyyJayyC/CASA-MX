import { test, expect } from "@playwright/test";
import { loginViaUI } from "./utils/auth.js";

const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const LOGIN_EMAIL = process.env.PLAYWRIGHT_LOGIN_EMAIL || "seller@casamx.local";
const LOGIN_PASSWORD = process.env.PLAYWRIGHT_LOGIN_PASSWORD || "seller123";

test.use({ baseURL: FRONTEND_URL });

/**
 * Smoke coverage for the sale upload form. Submitting it needs photos and a
 * map address, so the real publish path is covered by backend tests; here we
 * only prove the form loads for an authenticated owner and accepts input.
 */
test.describe("Sale upload form", () => {
  test("opens for an authenticated owner and accepts a title", async ({
    page,
  }) => {
    const uniqueTitle = `E2E Casa ${Date.now()}`;

    await loginViaUI(page, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    });

    await page.goto("/upload/sale", { waitUntil: "networkidle" });

    const titleInput = page.locator('input#title, input[name="title"]').first();
    await expect(titleInput).toBeVisible({ timeout: 30000 });

    await titleInput.fill(uniqueTitle);
    await expect(titleInput).toHaveValue(uniqueTitle);

    await expect(
      page.locator('button[type="submit"]:has-text("Publicar propiedad")'),
    ).toBeVisible();
  });
});
