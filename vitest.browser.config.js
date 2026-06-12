import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    include: /\.(jsx?|tsx?)$/,
    exclude: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    }
  },
  test: {
    name: 'browser',
    include: ['tests/browser/**/*.test.{js,jsx,ts,tsx}'],
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true,
      screenshotFailures: true,
    },
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage/browser',
      include: ['components/**/*.jsx', 'app/**/*.jsx'],
    },
  }
});
