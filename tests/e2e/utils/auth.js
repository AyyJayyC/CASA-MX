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

  await page.getByRole("button", { name: /Iniciar Sesión/i }).click();

  // Wait for redirect away from login
  await page.waitForTimeout(5000);

  // Verify we're authenticated
  const url = page.url();
  if (url.includes("/login") && !url.includes("/login?reset")) {
    throw new Error(`Login failed — still on /login after submit. URL: ${url}`);
  }
}

module.exports = { loginViaUI };
