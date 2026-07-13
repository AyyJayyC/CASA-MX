/**
 * E2E Auth Utilities
 * Browser-based UI login — cookies transfer natively, no hacks needed.
 */
const { expect } = require("@playwright/test");

async function loginViaUI(page, { email, password }) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  page.once("dialog", async (dialog) => {
    try { await dialog.dismiss(); } catch {}
  });

  await page.click('button[type="submit"]');

  // Wait for redirect away from login
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 10000,
  });
}

module.exports = { loginViaUI };
