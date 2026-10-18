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
 * Based on:
 * - TECH_STACK.md (Testing Framework, Vitest)
 * - TEST_PLAN.md (Unit Testing)
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
