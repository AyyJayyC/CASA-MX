import { test, expect } from "@playwright/test";

const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const API_URL = (
  process.env.PLAYWRIGHT_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"
).replace(/\/$/, "");

test.use({ baseURL: FRONTEND_URL });

test.describe("Public Smoke Checks", () => {
  test("frontend home, auth pages, and backend health are reachable", async ({
    page,
    request,
  }) => {
    const healthResponse = await request.get(`${API_URL}/health`);
    expect(healthResponse.ok()).toBeTruthy();

    const healthJson = await healthResponse.json();
    expect(healthJson).toEqual(
      expect.objectContaining({ status: expect.any(String) }),
    );

    const versionResponse = await request.get(`${API_URL}/version`);
    expect(versionResponse.ok()).toBeTruthy();

    const versionJson = await versionResponse.json();
    expect(versionJson).toEqual(
      expect.objectContaining({
        app: "casa-mx-backend",
        version: expect.any(String),
        environment: expect.any(String),
      }),
    );

    if (API_URL.includes("api.casa-mx.com")) {
      expect(versionJson.environment).toBe("production");
    }

    await page.goto("/", { waitUntil: "load" });
    await expect(page).toHaveTitle(/CASA MX/i);
    await expect(
      page.locator("h1").first(),
    ).toBeAttached();
    await expect(
      page.getByRole("link", { name: /Explorar propiedades/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Publicar propiedad/i }).first(),
    ).toBeVisible();
    await expect(
      page.locator("header").getByRole("link", { name: /Iniciar Sesión/i }),
    ).toBeVisible();
    await expect(
      page.locator("header").getByRole("link", { name: /Registrarse/i }),
    ).toBeVisible();

    await page.goto("/login", { waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: /Iniciar sesión|Inicia sesión/i }),
    ).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Crear Cuenta/i }),
    ).toBeVisible();
    await expect(page.locator("input#name")).toBeVisible();
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: /Privacidad/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Términos/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Cookies/i })).toBeVisible();
  });
});
