/**
 * SlicyWeb
 * Playwright Configuration
 *
 * End-to-end tests of tests/e2e/ (TECH_STACK.md, Playwright; TEST_PLAN.md,
 * End-To-End Testing), run on the built Electron application.
 *
 * Command: npm run test:e2e (builds the application, then runs the tests)
 *
 * Based on:
 * - TECH_STACK.md (Playwright)
 * - TEST_PLAN.md (End-To-End Testing)
 */

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  // One Electron window at a time: the tests use the keyboard and the mouse
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: [["list"]],
  outputDir: "test-results",
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
