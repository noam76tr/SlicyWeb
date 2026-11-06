/**
 * SlicyWeb
 * Print Preset End-To-End Test
 *
 * The 11 presets of data/presets/ are loaded by the main process
 * (ADR-035 D4, Phase 10 lot 86) and read by the window through
 * preset:getAll only. Nothing is shown yet: the Print Preset section
 * shows the preset of the selected object from lot 88.
 *
 * Based on:
 * - TEST_PLAN.md (Classification and Recommendation Engine Unit Tests,
 *   lot 86)
 * - API_SPEC.md (PresetIPC Channels)
 * - PRINT_PRESETS_SPEC.md 1.3.0 (Shipped Presets)
 */

import { expect, test } from "./fixtures";

interface Response {
  success: boolean;
  data: Record<string, unknown>;
  errors: string[];
}

test("serves the 11 shipped presets", async ({ launch }) => {
  const { window: page, errors } = await launch();

  const response = (await page.evaluate(() =>
    window.slicyWeb.invoke("preset:getAll"),
  )) as Response;

  expect(response.success).toBe(true);
  expect(
    (response.data.presets as { category: string }[])
      .map(({ category }) => category)
      .sort(),
  ).toEqual([
    "balanced",
    "draft",
    "engineering",
    "fast_prototype",
    "flexible",
    "functional",
    "high_quality",
    "miniature",
    "structural",
    "ultra_quality",
    "vase",
  ]);
  expect(errors).toEqual([]);
});
