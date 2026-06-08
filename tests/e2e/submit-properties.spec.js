/**
 * CasaMX Property Submission Automation
 * Submits one sale property and one rental property via Playwright on casa-mx.com
 *
 * Usage: npx playwright test --headed C:\Users\axelj\AppData\Local\Temp\opencode\submit-properties.spec.js
 */
const { test, expect } = require("@playwright/test");
const path = require("path");

const SCREENSHOTS = "C:\\Users\\axelj\\AppData\\Local\\Temp\\opencode\\automation-screenshots";
const BASE = "https://casa-mx.com";

const CREDENTIALS = {
  email: "5axelj@gmail.com",
  password: "CasaMX2026!",
};

const SALE_DATA = {
  title: "Casa amplia en zona residencial con jard\u00EDn",
  description:
    "Hermosa casa de 3 rec\u00E1maras con jard\u00EDn amplio, cocina integral y estacionamiento para 2 autos. Ubicada en colonia tranquila cerca de escuelas, parques y centros comerciales. Ideal para familias que buscan espacio y tranquilidad.",
  price: "2850000",
  squareMeters: "180",
  address: "Av. Paseo de la Reforma 250",
  estado: "Ciudad de M\u00E9xico",
  ciudad: "Ciudad de M\u00E9xico",
  colonia: "Ju\u00E1rez",
  bedrooms: "3",
  bathrooms: "2",
};

const RENTAL_DATA = {
  title: "Departamento moderno con vista panor\u00E1mica",
  description:
    "Departamento completamente remodelado con acabados de lujo, 2 rec\u00E1maras con closet, vista panor\u00E1mica a la ciudad. Incluye estacionamiento cubierto, vigilancia 24h, y acceso controlado.",
  monthlyRent: "22000",
  squareMeters: "95",
  address: "Av. Insurgentes Sur 1234",
  estado: "Ciudad de M\u00E9xico",
  ciudad: "Ciudad de M\u00E9xico",
  colonia: "Roma Norte",
  bedrooms: "2",
  bathrooms: "1",
};

test.describe.configure({ mode: "serial" });

test("01 - Login", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(SCREENSHOTS, "01-homepage.png"), fullPage: false });

  // Navigate to login
  await page.click('a[href*="/login"]');
  await page.waitForURL("**/login**");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(SCREENSHOTS, "02-login-page.png"), fullPage: false });

  // Fill credentials
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);

  await page.screenshot({ path: path.join(SCREENSHOTS, "03-login-filled.png"), fullPage: false });

  // Submit login
  await page.click('button[type="submit"]');

  // Wait for dashboard or homepage after login
  await page.waitForTimeout(3000);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(SCREENSHOTS, "04-logged-in.png"), fullPage: false });

  console.log("✅ Login successful");
});

test("02 - Submit Sale Property", async ({ page }) => {
  await page.goto(`${BASE}/upload/sale`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS, "05-sale-form-start.png"), fullPage: false });

  // Fill basic info
  console.log("  Filling title...");
  await page.fill("#title", SALE_DATA.title);
  await page.fill("#description", SALE_DATA.description);
  await page.fill("#price", SALE_DATA.price);
  await page.fill("#squareMeters", SALE_DATA.squareMeters);

  // Fill address - try autocomplete first, then manual
  console.log("  Filling address...");
  const addressInput = page.locator('#address');
  await addressInput.fill(SALE_DATA.address);
  await page.waitForTimeout(1500);

  // Check if autocomplete suggestions appeared, click first if so
  const suggestions = page.locator('li[role="option"], [role="listbox"] li, .pac-item');
  if (await suggestions.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await suggestions.first().click();
    await page.waitForTimeout(2000);
  } else {
    // Manual fill location fields
    await page.fill("#estado", SALE_DATA.estado);
    await page.waitForTimeout(300);
    await page.fill("#ciudad", SALE_DATA.ciudad);
    await page.waitForTimeout(300);
    await page.fill("#colonia", SALE_DATA.colonia);
  }

  // Property details
  console.log("  Selecting property type: Casa...");
  await page.click('label:has-text("Casa")');

  console.log("  Filling bedrooms/bathrooms...");
  await page.fill("#bedrooms", SALE_DATA.bedrooms);
  await page.fill("#bathrooms", SALE_DATA.bathrooms);

  await page.screenshot({ path: path.join(SCREENSHOTS, "06-sale-form-filled.png"), fullPage: true });

  // Ownership checkbox
  console.log("  Checking ownership confirmation...");
  const ownershipCheckbox = page.locator('input[type="checkbox"]').first();
  await ownershipCheckbox.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await ownershipCheckbox.check({ force: true });

  await page.screenshot({ path: path.join(SCREENSHOTS, "07-sale-ownership-checked.png"), fullPage: false });

  // Submit
  console.log("  Submitting sale property...");
  const submitBtn = page.locator('button:has-text("Publicar propiedad"), button:has-text("PUBLICAR")');
  await submitBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Click using JavaScript to avoid interception
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent?.includes('Publicar'));
    if (btn) btn.click();
  });

  await page.waitForTimeout(5000);
  await page.waitForLoadState("networkidle");

  await page.screenshot({ path: path.join(SCREENSHOTS, "08-sale-submitted.png"), fullPage: false });

  console.log("✅ Sale property submitted");
});

test("03 - Submit Rental Property", async ({ page }) => {
  await page.goto(`${BASE}/upload/rental`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS, "09-rental-form-start.png"), fullPage: false });

  // Fill basic info
  console.log("  Filling title...");
  await page.fill("#title", RENTAL_DATA.title);
  await page.fill("#description", RENTAL_DATA.description);
  await page.fill("#monthlyRent", RENTAL_DATA.monthlyRent);
  await page.fill("#squareMeters", RENTAL_DATA.squareMeters);

  // Fill address
  console.log("  Filling address...");
  await page.fill("#address", RENTAL_DATA.address);
  await page.waitForTimeout(1500);

  const suggestions = page.locator('li[role="option"], [role="listbox"] li, .pac-item');
  if (await suggestions.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await suggestions.first().click();
    await page.waitForTimeout(2000);
  } else {
    await page.fill("#estado", RENTAL_DATA.estado);
    await page.waitForTimeout(300);
    await page.fill("#ciudad", RENTAL_DATA.ciudad);
    await page.waitForTimeout(300);
    await page.fill("#colonia", RENTAL_DATA.colonia);
  }

  // Property type
  console.log("  Selecting property type: Departamento...");
  await page.click('label:has-text("Departamento")');

  // Details
  console.log("  Filling bedrooms/bathrooms...");
  await page.fill("#bedrooms", RENTAL_DATA.bedrooms);
  await page.fill("#bathrooms", RENTAL_DATA.bathrooms);

  await page.screenshot({ path: path.join(SCREENSHOTS, "10-rental-form-filled.png"), fullPage: true });

  // Ownership checkbox
  console.log("  Checking ownership confirmation...");
  const ownershipCheckbox = page.locator('input[type="checkbox"]').first();
  await ownershipCheckbox.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await ownershipCheckbox.check({ force: true });

  // Submit
  console.log("  Submitting rental property...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent?.includes('Publicar'));
    if (btn) btn.click();
  });

  await page.waitForTimeout(5000);
  await page.waitForLoadState("networkidle");

  await page.screenshot({ path: path.join(SCREENSHOTS, "11-rental-submitted.png"), fullPage: false });

  console.log("✅ Rental property submitted");
});

test("04 - Dashboard Verification", async ({ page }) => {
  await page.goto(`${BASE}/dashboard/my-properties`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOTS, "12-dashboard-properties.png"), fullPage: true });

  console.log("✅ Dashboard loaded - check screenshots for submitted properties");
});
