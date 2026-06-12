const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');
const v8toIstanbul = require('v8-to-istanbul');

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const COVERAGE_DIR = path.resolve(__dirname, '..', '.nyc_output');
const SOURCE_ROOT = path.resolve(__dirname, '..');

const STATIC_PAGES = [
  '/', '/login', '/register', '/forgot-password',
  '/reset-password?token=test', '/verify-email',
  '/aviso-legal', '/terminos', '/cookie',
  '/properties', '/properties/map',
];

const AUTH_PAGES = [
  { url: '/dashboard', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/dashboard/my-properties', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/dashboard/my-offers', email: 'buyer@casamx.local', password: 'buyer123' },
  { url: '/dashboard/offers', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/dashboard/contact-requests', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/dashboard/notifications', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/dashboard/account', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/dashboard/crm', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/dashboard/agency', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/dashboard/applications', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/dashboard/rental-applications', email: 'buyer@casamx.local', password: 'buyer123' },
  { url: '/settings', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/credits', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/reviews', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/publish-property', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/requested', email: 'seller@casamx.local', password: 'seller123' },
  { url: '/admin/approvals', email: 'admin@casamx.local', password: 'admin123' },
  { url: '/admin/analytics', email: 'admin@casamx.local', password: 'admin123' },
  { url: '/admin/analytics/market', email: 'admin@casamx.local', password: 'admin123' },
  { url: '/admin/properties', email: 'admin@casamx.local', password: 'admin123' },
  { url: '/admin/carousel', email: 'admin@casamx.local', password: 'admin123' },
  { url: '/admin/agencies', email: 'admin@casamx.local', password: 'admin123' },
  { url: '/admin/maps', email: 'admin@casamx.local', password: 'admin123' },
  { url: '/admin/debug', email: 'admin@casamx.local', password: 'admin123' },
];

async function loginViaAPI(context, email, password) {
  const page = await context.newPage();
  try {
    const status = await page.evaluate(async (creds) => {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(creds),
      });
      return res.status;
    }, { email, password });
    return status === 200;
  } finally {
    await page.close();
  }
}

async function collectPageCoverage(page, url) {
  try {
    await page.coverage.startJSCoverage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});

    const jsCoverage = await page.coverage.stopJSCoverage();
    return jsCoverage;
  } catch (err) {
    console.error(`  Failed: ${url} - ${err.message}`);
    try { await page.coverage.stopJSCoverage(); } catch {}
    return [];
  }
}

function findSourceFile(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const parsed = new URL(url);
    const relativePath = parsed.pathname.replace(/^\/_next\/static\/chunks\//, '');
    return null;
  }
  return null;
}

async function convertToIstanbul(v8Coverage, pagesCovered) {
  const istanbulMap = {};

  for (const entry of v8Coverage) {
    if (!entry.url) continue;

    let sourcePath = null;

    const resolvedUrl = entry.url;
    if (resolvedUrl.includes('/_next/')) {
      continue;
    }

    const urlParts = resolvedUrl.replace(/^https?:\/\/[^\/]+/, '');
    const staticMatch = urlParts.match(/\/_next\/static\/chunks\/(app|pages)\/(.+)\.js$/);

    if (staticMatch) {
      const appPath = staticMatch[2].replace(/\.js$/, '');
      const candidatePaths = [
        path.join(SOURCE_ROOT, `${appPath}.jsx`),
        path.join(SOURCE_ROOT, `${appPath}.js`),
        path.join(SOURCE_ROOT, appPath.replace(/\/page$/, '/page.jsx')),
      ];
      for (const cp of candidatePaths) {
        if (fs.existsSync(cp)) {
          sourcePath = cp;
          break;
        }
      }
    }

    if (entry.url.includes('/_next/static/chunks/')) {
      for (const chunkFileName of ['webpack', 'main', 'framework', 'lib']) {
        if (entry.url.includes(chunkFileName)) {
          sourcePath = null;
          break;
        }
      }
    }

    if (!sourcePath && !entry.url.includes('/_next/')) {
      for (const [pageName] of pagesCovered) {
        if (resolvedUrl.includes(pageName)) {
          break;
        }
      }
      continue;
    }

    if (!sourcePath) continue;

    try {
      const converter = v8toIstanbul(sourcePath);
      await converter.load();
      converter.applyCoverage(entry.functions);
      const istanbulData = converter.toIstanbul();

      for (const [file, data] of Object.entries(istanbulData)) {
        if (!istanbulMap[file]) {
          istanbulMap[file] = data;
        } else {
          istanbulMap[file] = mergeCoverageObjects(istanbulMap[file], data);
        }
      }
    } catch {}
  }

  return istanbulMap;
}

function mergeCoverageObjects(a, b) {
  const result = { ...a };
  for (const [key, val] of Object.entries(b.s || {})) {
    result.s[key] = (result.s[key] || 0) + val;
  }
  for (const [key, val] of Object.entries(b.b || {})) {
    if (!result.b[key]) {
      result.b[key] = [...val];
    } else {
      for (let i = 0; i < val.length; i++) {
        result.b[key][i] = (result.b[key][i] || 0) + val[i];
      }
    }
  }
  for (const [key, val] of Object.entries(b.f || {})) {
    result.f[key] = (result.f[key] || 0) + val;
  }
  return result;
}

async function main() {
  console.log('E2E Coverage Collection (V8 CDP)\n');

  if (!fs.existsSync(COVERAGE_DIR)) {
    fs.mkdirSync(COVERAGE_DIR, { recursive: true });
  }

  const allV8Coverage = [];
  const pagesCovered = new Map();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

  console.log('Static pages:');
  for (const pageUrl of STATIC_PAGES) {
    const page = await context.newPage();
    const v8 = await collectPageCoverage(page, pageUrl);
    allV8Coverage.push(...v8);
    pagesCovered.set(pageUrl, v8.length);
    console.log(`  ${pageUrl} — ${v8.length} scripts`);
    await page.close();
  }

  console.log('\nAuthenticated pages:');
  const authCache = {};

  for (const { url, email, password } of AUTH_PAGES) {
    const cacheKey = `${email}:${password}`;
    if (!authCache[cacheKey]) {
      authCache[cacheKey] = await loginViaAPI(context, email, password);
    }

    const page = await context.newPage();
    const v8 = await collectPageCoverage(page, url);
    allV8Coverage.push(...v8);
    pagesCovered.set(url, v8.length);
    console.log(`  ${url} — ${v8.length} scripts`);
    await page.close();
  }

  await context.close();
  await browser.close();

  console.log(`\nTotal V8 scripts: ${allV8Coverage.length}`);

  console.log('Converting to Istanbul format...');
  const istanbulCoverage = await convertToIstanbul(allV8Coverage, pagesCovered);
  console.log(`  Istanbul files: ${Object.keys(istanbulCoverage).length}`);

  const outputPath = path.join(COVERAGE_DIR, 'e2e.json');
  fs.writeFileSync(outputPath, JSON.stringify(istanbulCoverage));
  console.log(`\nSaved: ${outputPath}`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
