/**
 * SlicyWeb
 * Vitest Configuration
 *
 * Unit tests of tests/unit/ (TECH_STACK.md, Testing Framework; TEST_PLAN.md).
 * Separate from vite.config.mts: the Electron plugin and the Content
 * Security Policy of the application are not needed to run the tests.
 *
 * Command: npm test
 *
 * Delays (lot 113, request of Noam, 2026-11-26): 30 s for each test and
 * each hook (Vitest: 5 s and 10 s by default). The PC of Noam is slower:
 * tests that read and write files or classify a mesh went over 5 s there
 * (5.6 s). What the tests check does not change.
 *
 * Based on:
 * - TECH_STACK.md (Testing Framework, Vitest)
 * - TEST_PLAN.md (Unit Testing)
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
