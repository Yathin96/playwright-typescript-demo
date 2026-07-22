import { defineConfig, devices } from '@playwright/test';
import { env } from './src/utils/env';

/**
 * Playwright configuration.
 *
 * Projects give us cross-browser coverage (Chromium, Firefox, WebKit) plus a
 * headless-only `api` project that never launches a browser — API specs run in
 * seconds without paying browser start-up cost.
 *
 * Worker count is environment-aware: CI boxes are usually CPU-constrained and
 * flake under heavy parallelism, so we pin workers there and let local runs use
 * all available cores.
 */
export default defineConfig({
  testDir: './tests',
  // Fail the build if someone accidentally commits `test.only`.
  forbidOnly: !!process.env.CI,
  // Full isolation: every spec file gets its own worker process.
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { resultsDir: 'allure-results', detail: true }],
  ],

  use: {
    baseURL: env.baseUrl,
    // Trace on first retry keeps artefacts small but still gives a full
    // timeline (DOM snapshots, network, console) for anything that failed.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.apiBaseUrl },
    },
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/ui',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
