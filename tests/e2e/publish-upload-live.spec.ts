import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Live Upload Flow', () => {
  test.setTimeout(120000);

  test('logs in via UI, selects Mexico address, and submits property', async ({ page }) => {
    const uniqueTitle = `E2E Casa ${Date.now()}`;
    const fallbackCred = { email: 'seller@casamx.local', password: 'seller123' };

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', fallbackCred.email);
    await page.fill('input[type="password"]', fallbackCred.password);

    page.once('dialog', async dialog => {
      try {
        await dialog.dismiss();
      } catch {}
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    let loggedIn = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        return response.ok;
      } catch {
        return false;
      }
    });

    if (!loggedIn) {
      let loginStatus = 0;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        loginStatus = await page.evaluate(async (creds) => {
          try {
            const response = await fetch('http://localhost:3001/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(creds),
            });
            return response.status;
          } catch {
            return 0;
          }
        }, fallbackCred);

        if (loginStatus !== 429) break;
        await page.waitForTimeout(1200 + attempt * 400);
      }

      expect(
        loginStatus,
        'No se pudo iniciar sesi�n por UI ni por API. Ejecuta: cd ../casa-mx-backend && npm run prisma:seed'
      ).toBe(200);

      loggedIn = true;
      await page.reload({ waitUntil: 'domcontentloaded' });
    }

    const titleInput = page.locator('input#title, input[name="title"]').first();
    const publishButton = page.locator('button[type="submit"]:has-text("Publicar propiedad")');

    const ensureUploadSalePage = async () => {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await page.goto('/upload/sale', { waitUntil: 'domcontentloaded' });
        const ready = await Promise.race([
          titleInput.waitFor({ state: 'visible', timeout: 6000 }).then(() => true).catch(() => false),
          publishButton.waitFor({ state: 'visible', timeout: 6000 }).then(() => true).catch(() => false),
        ]);
        if (ready) return true;
        await page.waitForTimeout(1200 + attempt * 600);
      }
      return false;
    };

    const isReady = await ensureUploadSalePage();
    expect(isReady, 'No se pudo abrir /upload/sale con sesi�n activa').toBeTruthy();

    await expect(titleInput).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1500);

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

    await fillWithRetry('#title', uniqueTitle);
    await fillWithRetry('#description', 'Propiedad de prueba E2E con flujo completo de publicaci�n.');
    await fillWithRetry('#price', '2500000');
    await fillWithRetry('#squareMeters', '120');

    const addressSearch = page.locator('input[placeholder*="Hermosillo"]').first();
    await addressSearch.fill('Hermosillo Sonora');

    const suggestions = page.locator('div.absolute.top-full button[type="button"]');
    const suggestionsVisible = await suggestions
      .first()
      .isVisible({ timeout: 20000 })
      .catch(() => false);

    if (suggestionsVisible) {
      const topSuggestions = await suggestions.allTextContents();
      const firstFive = topSuggestions.slice(0, 5).join(' | ');
      expect(firstFive.length).toBeGreaterThan(0);
      await suggestions.first().click();
    } else {
      await addressSearch.press('Enter');
      await page.waitForTimeout(2500);
    }

    const addressField = page.locator('#address');
    const currentAddress = await addressField.inputValue();

    if (!currentAddress.trim()) {
      await fillWithRetry('#address', 'San Miguel de Horcasitas 36, Hermosillo, Sonora');
    }

    const estadoInput = page.locator('#estado').first();
    const ciudadInput = page.locator('#ciudad').first();
    const coloniaInput = page.locator('#colonia').first();
    const cpInput = page.locator('#codigoPostal').first();

    const fillOrSelect = async (locator, preferredValue) => {
      if (!(await locator.isVisible().catch(() => false))) return;

      const tagName = await locator.evaluate((el) => el.tagName.toLowerCase());

      if (tagName === 'select') {
        const matchedValue = await locator.evaluate((el, preferred) => {
          const select = el;
          const options = Array.from(select.options || []) as HTMLOptionElement[];
          const normalized = String(preferred || '').toLowerCase().trim();

          const directMatch = options.find((opt) => {
            const text = String(opt.textContent || '').toLowerCase().trim();
            const value = String(opt.value || '').toLowerCase().trim();
            return text === normalized || value === normalized;
          });

          if (directMatch && directMatch.value) return directMatch.value;

          const containsMatch = options.find((opt) => {
            const text = String(opt.textContent || '').toLowerCase();
            const value = String(opt.value || '').toLowerCase();
            return text.includes(normalized) || value.includes(normalized);
          });

          if (containsMatch && containsMatch.value) return containsMatch.value;

          const firstNonEmpty = options.find((opt) => String(opt.value || '').trim().length > 0);
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

    await fillOrSelect(estadoInput, 'Sonora');
    await fillOrSelect(ciudadInput, 'Hermosillo');
    await fillOrSelect(coloniaInput, 'Centro');
    await fillOrSelect(cpInput, '83140');

    await expect(addressField).not.toHaveValue('', { timeout: 15000 });
    await expect(estadoInput).toHaveValue(/.+/, { timeout: 15000 });
    await expect(ciudadInput).toHaveValue(/.+/, { timeout: 15000 });
    await expect(coloniaInput).toHaveValue(/.+/, { timeout: 15000 });

    await page.fill('#propertyType', 'Casa');
    await page.fill('#bedrooms', '3');
    await page.fill('#bathrooms', '2');

    await page.check('#fin_cash');

    let publishResponse;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const publishResponsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes('localhost:3001/properties') &&
          resp.request().method() === 'POST',
        { timeout: 20000 }
      );

      await publishButton.click();
      publishResponse = await publishResponsePromise.catch(() => null);

      if (publishResponse && publishResponse.status() === 201) {
        break;
      }

      await page.waitForTimeout(1500 + attempt * 800);
    }

    expect(publishResponse, 'No se detect� respuesta de creaci�n de propiedad').toBeTruthy();
    expect(publishResponse.status(), 'La API de creaci�n no devolvi� 201').toBe(201);

    await expect(page.locator('text=Propiedad publicada exitosamente')).toBeVisible({ timeout: 20000 });
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible({ timeout: 20000 });
  });
});
