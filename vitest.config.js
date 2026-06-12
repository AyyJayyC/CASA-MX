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
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    testTimeout: 20000,
    hookTimeout: 20000,
    teardownTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: [
        'components/**/*.jsx',
        'lib/**/*.{js,jsx}',
        'middleware.js',
      ],
      exclude: [
        'node_modules/**',
        '.next/**',
        'test-results/**',
        'tests/**',
        'scripts/**',
        'public/**',
        '**/*.config.*',
        '**/*.d.ts',
        'lib/types/**',
      ],
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/e2e/**',
      'tests/browser/**'
    ],
  }
});
