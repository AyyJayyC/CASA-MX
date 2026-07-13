const { expect } = require("@playwright/test");

async function validateToken(page) {
  const cookies = await page.context().cookies();
  const accessToken = cookies.find((c) => c.name === "accessToken");
  if (!accessToken) return { valid: false, reason: "missing cookie" };

  try {
    const resp = await page.request.get("http://localhost:3001/auth/me", {
      headers: { Cookie: `accessToken=${accessToken.value}` },
    });
    if (resp.status() === 200) return { valid: true, reason: "ok" };
    return { valid: false, reason: `server returned ${resp.status()}` };
  } catch (err) {
    return { valid: false, reason: `network error: ${err.message}` };
  }
}

async function navigateProtected(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });

  try {
    await page.waitForURL(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 15000 });
  } catch {
    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      const cookies = await page.context().cookies();
      const accessToken = cookies.find((c) => c.name === "accessToken");
      const tokenVal = accessToken ? accessToken.value.substring(0, 20) + "..." : "missing";
      const domain = accessToken ? accessToken.domain : "n/a";
      const validation = await validateToken(page);
      throw new Error(
        `Auth failed — redirected to /login from ${url}. ` +
        `Token: ${tokenVal}, domain: ${domain}, ` +
        `server validation: ${validation.reason}`
      );
    }
    await page.waitForTimeout(3000);
  }

  await expect(page).toHaveURL(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 5000 });
  const pageText = await page.locator("body").textContent();
  expect(pageText.length).toBeGreaterThan(30);
}

module.exports = { navigateProtected, validateToken };
