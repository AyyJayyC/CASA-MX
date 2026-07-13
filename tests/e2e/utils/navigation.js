const { expect } = require("@playwright/test");

async function navigateProtected(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });

  try {
    await page.waitForURL(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 15000 });
  } catch {
    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      const cookies = await page.context().cookies();
      const accessToken = cookies.find((c) => c.name === "accessToken");
      throw new Error(
        `Auth failed — redirected to /login from ${url}. ` +
        `accessToken cookie: ${accessToken ? "present" : "missing"}`
      );
    }
    await page.waitForTimeout(3000);
  }

  await expect(page).toHaveURL(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 5000 });
  const pageText = await page.locator("body").textContent();
  expect(pageText.length).toBeGreaterThan(30);
}

module.exports = { navigateProtected };
