#!/usr/bin/env node
/**
 * Beemaps → CASA MX Migration Tool
 *
 * Uses the PUBLIC Beemaps API (no login, no browser):
 *   https://www.beemaps.com.mx/api/inmobiliaria/<username>/propiedades?pagina=N
 *
 * Usage:
 *   node migrate.mjs --dry        # fetch + transform only (no API calls)
 *   node migrate.mjs              # fetch + transform + migrate
 *   node migrate.mjs --skip-fetch # reuse cached JSON, migrate only
 *
 * .env file in same directory for CASA MX credentials.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env ────────────────────────────────────────────────────────
try {
  const envContent = await readFile(resolve(__dirname, ".env"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* .env is optional */ }

const CFG = {
  beemaps: {
    inmobiliaria: process.env.BEEMAPS_INMOBILIARIA || "mrcesar",
    baseUrl: process.env.BEEMAPS_BASE_URL || "https://www.beemaps.com.mx",
  },
  casamx: {
    apiUrl: process.env.CASA_MX_API_URL || "http://localhost:3001",
    email: process.env.CASA_MX_EMAIL,
    password: process.env.CASA_MX_PASSWORD,
  },
  requestDelay: parseInt(process.env.REQUEST_DELAY || "9000", 10),
  maxProperties: parseInt(process.env.MAX_PROPERTIES || "0", 10),
  dryRun: process.env.DRY_RUN === "true",
  skipFetch: process.env.SKIP_FETCH === "true",
};

const DATA_DIR = resolve(__dirname, "data");
const BEEMAPS_FILE = resolve(DATA_DIR, "beemaps-properties.json");
const TRANSFORMED_FILE = resolve(DATA_DIR, "transformed-properties.json");
const REPORT_FILE = resolve(DATA_DIR, `migration-report-${Date.now()}.json`);
const PROFILE_DIR = resolve(DATA_DIR, "chrome-profile");
const AGENT_MAP_FILE = resolve(__dirname, "agent-mappings.json");

// ─── Logger ───────────────────────────────────────────────────────────
function log(tag, msg, data) {
  const ts = new Date().toISOString().slice(11, 19);
  const extra = data !== undefined ? ` ${JSON.stringify(data)}` : "";
  console.log(`[${ts}] [${tag.padEnd(7)}] ${msg}${extra}`);
}

// ─── Helpers ──────────────────────────────────────────────────────────
function parseNumber(raw) {
  if (raw === null || raw === undefined) return undefined;
  const n = Number(raw);
  return isNaN(n) || n <= 0 ? undefined : Math.round(n);
}

function stripHtml(s) {
  if (!s) return "";
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Beemaps API Fetch (via persistent Chrome profile — passes Cloudflare) ──
async function fetchBeemaps() {
  const { chromium } = await import("playwright");
  const headless = process.env.HEADLESS !== "false";
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless,
    channel: "chrome",
    viewport: { width: 1400, height: 900 },
    locale: "es-MX",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    // Hide automation fingerprint so Cloudflare stops re-challenging
    ignoreDefaultArgs: ["--enable-automation"],
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const page = await context.newPage();

    // Warm up: load the public inmobiliaria page to trigger+clear any Cloudflare challenge
    // in this browser session (page itself is public and serves HTML).
    log("FETCH", `Warming up: ${CFG.beemaps.baseUrl}/inmobiliaria/${CFG.beemaps.inmobiliaria}`);
    await page.goto(`${CFG.beemaps.baseUrl}/inmobiliaria/${CFG.beemaps.inmobiliaria}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    // Wait for Cloudflare challenge to clear (up to 2 min for manual "verify" click)
    await page.waitForFunction(
      () => !document.title.toLowerCase().includes("un momento") && !document.title.toLowerCase().includes("just a moment"),
      { timeout: 120000, polling: 2000 }
    ).catch(() => { /* may have auto-resolved */ });
    await page.waitForTimeout(8000);

    // Now fetch the API same-origin from the trusted page context
    const props = [];
    let pagina = 1;
    let totalPages = 1;

    while (pagina <= totalPages) {
      const url = `/api/inmobiliaria/${CFG.beemaps.inmobiliaria}/propiedades?pagina=${pagina}`;
      log("FETCH", `GET ${url}`);
      const data = await page.evaluate(async (u) => {
        const res = await fetch(u, { headers: { Accept: "application/json" }, credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }, url);

      props.push(...(data.propiedades || []));
      totalPages = data.pagination?.totalPages || 1;
      log("FETCH", `Page ${pagina}/${totalPages} — ${props.length} total so far`);
      pagina++;
    }

    const active = props.filter((p) => !p.deleted);
    log("FETCH", `Fetched ${props.length}, active ${active.length}`);
    return active;
  } finally {
    await context.close();
  }
}

// ─── Transformer ──────────────────────────────────────────────────────
const typeMap = {
  casa: "Casa", houses: "Casa", house: "Casa", hogar: "Casa",
  departamento: "Departamento", apartment: "Departamento", apt: "Departamento", depa: "Departamento",
  terreno: "Terreno", land: "Terreno", lot: "Terreno", solar: "Terreno", predio: "Terreno",
  comercial: "Comercial", commercial: "Comercial", local: "Comercial", localcomercial: "Comercial",
  oficina: "Oficina", office: "Oficina",
  bodega: "Bodega", warehouse: "Bodega",
  edificio: "Edificio", building: "Edificio",
  rancho: "Rancho", ranch: "Rancho", rancho: "Rancho",
  condominio: "Condominio", condo: "Condominio",
};

const statusMap = {
  INVENTARIO: "disponible",
  DISPONIBLE: "disponible",
  ACTIVA: "disponible",
  VENDIDA: "vendido",
  RENTADA: "rentado",
  EN_PROMESA: "preventa",
  PREVENTA: "preventa",
  ARCHIVADA: "incompleto",
};

function transformProperties(raw, agentMappings = {}) {
  log("TRANSFORM", `Processing ${raw.length} properties...`);

  const converted = raw.map((p) => {
    const price = parseNumber(p.precio);
    const listingType = /RENTA|ALQUILER/i.test(p.tipoOperacion || "") ? "for_rent" : "for_sale";

    let mappedType = "Casa";
    const cat = String(p.categoria || p.tipoPropiedad || "").toLowerCase();
    for (const [key, val] of Object.entries(typeMap)) {
      if (cat.includes(key)) { mappedType = val; break; }
    }

    const status = statusMap[(p.estatus || "").toUpperCase()] || "incompleto";

    const title = p.full_address || p.address || [p.categoria, p.tipoOperacion, p.colonia, p.place].filter(Boolean).join(" ");

    const payload = {
      title,
      description: stripHtml(p.descripcion),
      address: p.full_address || p.address || "",
      estado: p.region || "Sonora",
      ciudad: p.place || "",
      colonia: p.colonia || "",
      codigoPostal: p.postcode || undefined,
      lat: p.lat ? parseFloat(p.lat) : undefined,
      lng: p.lng ? parseFloat(p.lng) : undefined,
      propertyType: mappedType,
      listingType,
      status,
      visibility: "public",
      bedrooms: p.cuartos ?? 0,
      bathrooms: p.regaderas ?? p.wcs ?? 0,
      squareMeters: parseNumber(p.areaConstruccion) ?? 1,
      lotSize: parseNumber(p.areaTerreno) ?? undefined,
      petFriendly: !!p.mascotas,
      childrenWelcome: false,
      issuesInvoice: false,
      amenities: [],
      imageUrls: (p.images || []).slice().sort((a, b) => a.order - b.order).map((i) => i.url).slice(0, 10),
    };

    if (listingType === "for_sale") {
      payload.price = price ?? 0;
    } else {
      payload.monthlyRent = price ?? 0;
    }

    const agent = p.asesor || {};
    const agentKey = agentMappings[agent.email] || agentMappings[agent.fullName];
    if (agentKey) {
      payload._agentMapping = agentKey;
      log("TRANSFORM", `  Agent match: ${agent.fullName} → ${agentKey}`);
    }

    const warnings = [];
    if (!p.descripcion) warnings.push("Missing description");
    if (!p.address && !p.full_address) warnings.push("Missing address");
    if (!price) warnings.push("Missing price");
    if (!payload.imageUrls.length) warnings.push("No images");

    return {
      ...payload,
      _sourceId: p.id,
      _agentName: agent.fullName,
      _agentEmail: agent.email,
      _agentPhone: agent.phone,
      _warnings: warnings,
      _rawPrice: p.precio,
    };
  });

  const withErrors = converted.filter((c) => c._error);
  const withWarnings = converted.filter((c) => c._warnings?.length > 0);
  const clean = converted.filter((c) => !c._error && !c._warnings?.length);

  log("TRANSFORM", `Clean: ${clean.length}, Warnings: ${withWarnings.length}, Errors: ${withErrors.length}`);

  return converted;
}

// ─── CASA MX API Client ──────────────────────────────────────────────
async function casaMxAuth() {
  if (CFG.dryRun) {
    log("AUTH", "DRY RUN — skipping auth");
    return "dry-run-token";
  }

  const res = await fetch(`${CFG.casamx.apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: CFG.casamx.email, password: CFG.casamx.password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Auth failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const token = data?.data?.token || data?.token || data?.accessToken;
  if (!token) throw new Error("No token in auth response");

  log("AUTH", `Authenticated. Token: ${token.slice(0, 12)}...`);
  return token;
}

async function apiRequest(url, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(token && token !== "dry-run-token" ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}: ${typeof body === "object" ? body.error : text}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

// ─── Main Migrator ────────────────────────────────────────────────────
async function migrate() {
  await mkdir(DATA_DIR, { recursive: true });

  // ── Step 1: Fetch or load ──
  let rawProperties;

  if (CFG.skipFetch) {
    log("INIT", "Skipping fetch — loading from cache...");
    try {
      rawProperties = JSON.parse(await readFile(BEEMAPS_FILE, "utf-8"));
      log("INIT", `Loaded ${rawProperties.length} properties from cache`);
    } catch {
      log("FATAL", `Cache file not found at ${BEEMAPS_FILE}. Run without --skip-fetch first.`);
      process.exit(1);
    }
  } else {
    rawProperties = await fetchBeemaps();
    await writeFile(BEEMAPS_FILE, JSON.stringify(rawProperties, null, 2), "utf-8");
    log("SAVE", `Raw data saved to ${BEEMAPS_FILE}`);
  }

  // ── Step 2: Transform ──
  let agentMappings = {};
  try { agentMappings = JSON.parse(await readFile(AGENT_MAP_FILE, "utf-8")); } catch { /* no mapping file */ }
  const transformed = transformProperties(rawProperties, agentMappings);
  await writeFile(TRANSFORMED_FILE, JSON.stringify(transformed, null, 2), "utf-8");
  log("SAVE", `Transformed data saved to ${TRANSFORMED_FILE}`);

  // Print summary for review
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  TRANSFORMED PROPERTIES — Review before migration");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  transformed.forEach((t, i) => {
    const icon = t._error ? "✗" : t._warnings?.length ? "!" : "✓";
    console.log(`  ${icon} ${i + 1}. ${t.title?.slice(0, 60)} | ${t.listingType} | ${t.propertyType}`);
    if (t._warnings?.length) t._warnings.forEach((w) => console.log(`     ⚠ ${w}`));
    if (t._error) console.log(`     ✗ ${t._error}`);
  });

  // ── Step 3: Migrate ──
  if (CFG.dryRun) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  DRY RUN COMPLETE — No properties sent to API");
    console.log("  Set DRY_RUN=false in .env to migrate for real.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    return;
  }

  log("MIGRATE", "Starting migration to CASA MX...");
  const token = await casaMxAuth();

  const toMigrate = CFG.maxProperties > 0 ? transformed.filter((t) => !t._error).slice(0, CFG.maxProperties) : transformed.filter((t) => !t._error);

  if (toMigrate.length === 0) {
    log("MIGRATE", "No valid properties to migrate");
    return;
  }

  const report = { total: toMigrate.length, created: 0, published: 0, failed: 0, results: [] };

  for (let i = 0; i < toMigrate.length; i++) {
    const t = toMigrate[i];
    const num = `[${i + 1}/${toMigrate.length}]`;
    log("MIGRATE", `${num} ${t.title?.slice(0, 50)}`);

    // Remove internal fields from payload
    const { _sourceId, _agentName, _agentEmail, _agentPhone, _warnings, _rawPrice, _agentMapping, ...payload } = t;

    try {
      // 1. Create property (soft mode — handles incomplete data gracefully)
      const created = await apiRequest(`${CFG.casamx.apiUrl}/properties?soft=true`, {
        method: "POST",
        body: JSON.stringify(payload),
      }, token);

      if (!created?.data?.id) {
        throw new Error("No property ID in response");
      }

      const propId = created.data.id;
      const isIncomplete = created.data?.isIncomplete || created.data?.status === "incompleto";

      log("CREATE", `  id=${propId.slice(0, 8)}${isIncomplete ? " (incomplete)" : ""}`);

      // 2. Set images via PATCH (if there are image URLs)
      if (payload.imageUrls?.length > 0) {
        try {
          await apiRequest(`${CFG.casamx.apiUrl}/properties/${propId}`, {
            method: "PATCH",
            body: JSON.stringify({ imageUrls: payload.imageUrls }),
          }, token);
          log("IMAGES", `  ${payload.imageUrls.length} images set`);
        } catch (imgErr) {
          log("IMAGES", `  ✗ ${imgErr.message}`);
        }
      }

      // 3. Publish (if not incomplete and has images)
      if (!isIncomplete && payload.imageUrls?.length > 0) {
        try {
          await apiRequest(`${CFG.casamx.apiUrl}/properties/${propId}/publish`, {
            method: "POST",
          }, token);
          report.published++;
          log("PUBLISH", `  ✓ published`);
        } catch (pubErr) {
          log("PUBLISH", `  ✗ ${pubErr.message}`);
        }
      }

      report.created++;
      report.results.push({
        sourceId: _sourceId,
        title: t.title,
        casamxId: propId,
        status: isIncomplete ? "draft" : "published",
        images: payload.imageUrls?.length || 0,
        warnings: t._warnings || [],
      });
    } catch (err) {
      report.failed++;
      log("FAILED", `  ${err.message}`);
      report.results.push({
        sourceId: _sourceId,
        title: t.title,
        error: err.message,
        status: "failed",
      });

      // Handle rate limit: wait extra
      if (err.status === 429) {
        const wait = 60_000;
        log("RATE", `  Rate limited — waiting ${wait / 1000}s...`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }

    // Delay between properties
    if (i < toMigrate.length - 1) {
      await new Promise((r) => setTimeout(r, CFG.requestDelay));
    }
  }

  // ── Report ──
  await writeFile(REPORT_FILE, JSON.stringify(report, null, 2), "utf-8");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  MIGRATION COMPLETE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Created:   ${report.created}`);
  console.log(`  Published: ${report.published}`);
  console.log(`  Failed:    ${report.failed}`);
  console.log(`  Total:     ${report.total}`);
  console.log(`  Report:    ${REPORT_FILE}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (report.failed > 0) {
    process.exit(1);
  }
}

// ─── Entry ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes("--dry")) {
  CFG.dryRun = true;
}
if (args.includes("--skip-fetch")) {
  CFG.skipFetch = true;
}

migrate().catch((err) => {
  console.error("\nFATAL:", err.message);
  if (err.stack && !err.message.includes("FATAL")) console.error(err.stack);
  process.exit(1);
});
