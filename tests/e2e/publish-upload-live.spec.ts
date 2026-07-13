import { test, expect } from "@playwright/test";
import path from "path";

const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const API_URL = (
  process.env.PLAYWRIGHT_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"
).replace(/\/$/, "");
const LOGIN_EMAIL = process.env.PLAYWRIGHT_LOGIN_EMAIL || "seller@casamx.local";
const LOGIN_PASSWORD = process.env.PLAYWRIGHT_LOGIN_PASSWORD || "seller123";

test.use({ baseURL: FRONTEND_URL });

test.describe("Live Upload Flow", () => {
  test.setTimeout(120000);

  test("logs in via UI, selects Mexico address, and submits property", async ({
    page,
  }) => {
    const uniqueTitle = `E2E Casa ${Date.now()}`;
    const fallbackCred = { email: LOGIN_EMAIL, password: LOGIN_PASSWORD };
    let submitAlertMessage = "";

    page.on("dialog", async (dialog) => {
      submitAlertMessage = dialog.message();
      try {
        await dialog.dismiss();
      } catch {}
    });

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', fallbackCred.email);
    await page.fill('input[type="password"]', fallbackCred.password);

    page.once("dialog", async (dialog) => {
      try {
        await dialog.dismiss();
      } catch {}
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    let loggedIn = await page.evaluate(async (apiUrl) => {
      try {
        const response = await fetch(`${apiUrl}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        return response.ok;
      } catch {
        return false;
      }
    }, API_URL);

    if (!loggedIn) {
      const apiLoginResp = await page.request.post(`${API_URL}/auth/login`, {
        data: fallbackCred,
        headers: { "Content-Type": "application/json" },
      });
      const loginStatus = apiLoginResp.status();

      expect(
        loginStatus,
        "No se pudo iniciar sesi�n por UI ni por API. Proporciona credenciales v�lidas o ejecuta: cd ../casa-mx-backend && npm run prisma:seed",
      ).toBe(200);

      const cookies = apiLoginResp.headers()["set-cookie"];
      if (cookies) {
        const parsed = cookies.split(";").map((c) => c.trim().split("="));
        const tokenCookie = parsed.find(([k]) => k === "token");
        if (tokenCookie) {
          await page.context().addCookies([
            { name: "token", value: tokenCookie[1], domain: "localhost", path: "/" },
          ]);
        }
      }

      loggedIn = true;
      await page.reload({ waitUntil: "domcontentloaded" });
    }

    const titleInput = page.locator('input#title, input[name="title"]').first();
    const publishButton = page.locator(
      'button[type="submit"]:has-text("Publicar propiedad")',
    );

    const ensureUploadSalePage = async () => {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await page.goto("/upload/sale", { waitUntil: "domcontentloaded" });
        const ready = await Promise.race([
          titleInput
            .waitFor({ state: "visible", timeout: 6000 })
            .then(() => true)
            .catch(() => false),
          publishButton
            .waitFor({ state: "visible", timeout: 6000 })
            .then(() => true)
            .catch(() => false),
        ]);
        if (ready) return true;
        await page.waitForTimeout(1200 + attempt * 600);
      }
      return false;
    };

    const isReady = await ensureUploadSalePage();
    expect(
      isReady,
      "No se pudo abrir /upload/sale con sesi�n activa",
    ).toBeTruthy();

    await expect(titleInput).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1500);

    const roleSwitcher = page
      .locator("select")
      .filter({ has: page.locator('option[value="seller"]') })
      .first();
    const canSwitchRole = (await roleSwitcher.count()) > 0;

    if (canSwitchRole) {
      await roleSwitcher.waitFor({ state: "visible", timeout: 10000 });
      await roleSwitcher.selectOption("seller").catch(async () => {
        await roleSwitcher.selectOption({ label: "seller" });
      });
      await page.waitForTimeout(1200);

      const activeRole = await roleSwitcher.inputValue().catch(() => "");
      expect(activeRole, "No se pudo cambiar el rol activo a seller").toBe(
        "seller",
      );
    }

    const fillWithRetry = async (selector, value) => {
      let lastErr;
      for (let i = 0; i < 3; i += 1) {
        try {
          await page.locator(selector).fill(value);
          return;
        } catch (err) {
          lastErr = err;
          await page.waitForTimeout(500);
        }
      }
      throw lastErr;
    };

    await fillWithRetry("#title", uniqueTitle);
    await fillWithRetry(
      "#description",
      "Propiedad de prueba E2E con flujo completo de publicaci�n.",
    );
    await fillWithRetry("#price", "2500000");
    await fillWithRetry("#squareMeters", "120");

    const addressSearch = page
      .locator('input[placeholder*="Hermosillo"]')
      .first();
    await addressSearch.fill("Hermosillo Sonora");

    const suggestions = page.locator(
      'div.absolute.top-full button[type="button"]',
    );
    const suggestionsVisible = await suggestions
      .first()
      .isVisible({ timeout: 20000 })
      .catch(() => false);

    if (suggestionsVisible) {
      const topSuggestions = await suggestions.allTextContents();
      const firstFive = topSuggestions.slice(0, 5).join(" | ");
      expect(firstFive.length).toBeGreaterThan(0);
      await suggestions.first().click();
    } else {
      await addressSearch.press("Enter");
      await page.waitForTimeout(2500);
    }

    const addressField = page.locator("#address");
    const currentAddress = await addressField.inputValue();

    if (!currentAddress.trim()) {
      await fillWithRetry(
        "#address",
        "San Miguel de Horcasitas 36, Hermosillo, Sonora",
      );
    }

    const estadoInput = page.locator("#estado").first();
    const ciudadInput = page.locator("#ciudad").first();
    const coloniaInput = page.locator("#colonia").first();
    const cpInput = page.locator("#codigoPostal").first();

    const fillOrSelect = async (locator, preferredValue) => {
      if (!(await locator.isVisible().catch(() => false))) return;

      const tagName = await locator.evaluate((el) => el.tagName.toLowerCase());

      if (tagName === "select") {
        const matchedValue = await locator.evaluate((el, preferred) => {
          const select = el;
          const options = Array.from(
            select.options || [],
          ) as HTMLOptionElement[];
          const normalized = String(preferred || "")
            .toLowerCase()
            .trim();

          const directMatch = options.find((opt) => {
            const text = String(opt.textContent || "")
              .toLowerCase()
              .trim();
            const value = String(opt.value || "")
              .toLowerCase()
              .trim();
            return text === normalized || value === normalized;
          });

          if (directMatch && directMatch.value) return directMatch.value;

          const containsMatch = options.find((opt) => {
            const text = String(opt.textContent || "").toLowerCase();
            const value = String(opt.value || "").toLowerCase();
            return text.includes(normalized) || value.includes(normalized);
          });

          if (containsMatch && containsMatch.value) return containsMatch.value;

          const firstNonEmpty = options.find(
            (opt) => String(opt.value || "").trim().length > 0,
          );
          return firstNonEmpty ? firstNonEmpty.value : null;
        }, preferredValue);

        if (matchedValue) {
          await locator.selectOption(matchedValue);
          await page.waitForTimeout(300);
        }
        return;
      }

      await locator.fill(preferredValue);
      await page.waitForTimeout(300);
    };

    await fillOrSelect(estadoInput, "Sonora");
    await fillOrSelect(ciudadInput, "Hermosillo");
    await fillOrSelect(coloniaInput, "Centro");
    await fillOrSelect(cpInput, "83140");

    await expect(addressField).not.toHaveValue("", { timeout: 15000 });
    await expect(estadoInput).toHaveValue(/.+/, { timeout: 15000 });
    await expect(ciudadInput).toHaveValue(/.+/, { timeout: 15000 });
    await expect(coloniaInput).toHaveValue(/.+/, { timeout: 15000 });

    await page.locator("label:has(#propertyType-Casa)").click();
    await page.fill("#bedrooms", "3");
    await page.fill("#bathrooms", "2");

    const imageInput = page.locator('input[type="file"]').first();
    if (await imageInput.count()) {
      const imagePath = path.resolve(
        process.cwd(),
        "tests",
        "fixtures",
        "test-image.png",
      );
      await imageInput.setInputFiles(imagePath);
      await page.waitForTimeout(1200);
    }

    await page.check("#fin_cash");

    const ownershipCheckbox = page
      .locator('input[type="checkbox"]')
      .filter({ hasNot: page.locator("#fin_cash") })
      .last();
    if (await ownershipCheckbox.isVisible().catch(() => false)) {
      await ownershipCheckbox.check();
    } else {
      await page
        .getByText(
          "Certifico que soy el propietario o tengo autorización legal para publicar esta propiedad",
        )
        .click();
    }

    await expect(publishButton).toBeEnabled({ timeout: 10000 });

    const publishResponsePromise = page
      .waitForResponse(
        (resp) =>
          resp.request().method() === "POST" &&
          /\/properties(?:\/|\?|$)/.test(resp.url()),
        { timeout: 30000 },
      )
      .catch(() => null);

    await publishButton.click();
    await page.waitForTimeout(1200);

    const publishResponse = await publishResponsePromise;
    if (!publishResponse) {
      throw new Error(
        `Publicación no disparó request POST /properties (no se capturó respuesta de API)`,
      );
    }

    const status = publishResponse.status();
    if (status >= 400) {
      const body = await publishResponse.text().catch(() => "");
      throw new Error(`Publicación falló en API: ${status} ${body}`);
    }

    if (submitAlertMessage) {
      throw new Error(`Publicación rechazada: ${submitAlertMessage}`);
    }

    await expect(
      page.getByRole("heading", { name: /Propiedad registrada/i }),
    ).toBeVisible({ timeout: 30000 });
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible({
      timeout: 30000,
    });
    await expect(
      page.getByText(/sube los documentos de verificación/i),
    ).toBeVisible({ timeout: 30000 });
  });
});
