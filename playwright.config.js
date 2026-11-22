// @ts-check
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  timeout: 30 * 1000,
  retries: process.env.CI ? 1 : 0,
  testDir: './tests/e2e',
  // The suite shares one backend, one database and a handful of seeded users.
  // Parallel workers race on login/refresh-token rotation, so run serially
  // everywhere. CI already did.
  workers: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
};

module.exports = config;
