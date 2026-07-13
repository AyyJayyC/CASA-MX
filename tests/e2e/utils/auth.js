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

  // Wait for redirect away from login (Next.js uses client-side routing so waitForURL may not fire)
  await page.waitForTimeout(5000);

  // Verify we're authenticated by checking the URL is no longer /login
  const url = page.url();
  if (url.includes("/login")) {
    throw new Error(`Login failed — still on /login after submit. URL: ${url}`);
  }
}

module.exports = { loginViaUI };
