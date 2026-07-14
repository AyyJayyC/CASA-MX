/**
 * E2E Auth Utilities
 * Browser-based UI login — cookies transfer natively, no hacks needed.
 */
const { expect } = require("@playwright/test");

async function loginViaUI(page, { email, password }) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.waitForTimeout(1000); // Ensure React hydration is complete
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  page.once("dialog", async (dialog) => {
    try { await dialog.dismiss(); } catch {}
  });

  await page.getByRole("button", { name: /Iniciar Sesión/i }).click({ timeout: 15000 });

  // Wait for navigation away from /login or for auth state to update
  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 });
  } catch {
    // If still on login, check for error messages
    const errorEl = page.locator('[role="alert"], .text-red-600, .text-red-400');
    const errorCount = await errorEl.count();
    if (errorCount > 0) {
      const errorText = await errorEl.first().textContent();
      throw new Error(`Login failed with error: ${errorText}`);
    }
    await page.waitForTimeout(2000);
  }

  // Verify we're authenticated by checking we're no longer on login
  const url = page.url();
  if (url.includes("/login") && !url.includes("/login?reset")) {
    throw new Error(`Login failed — still on /login after submit. URL: ${url}`);
  }

  // Extra wait for auth state to propagate to client-side providers
  await page.waitForTimeout(1500);
}

module.exports = { loginViaUI };
