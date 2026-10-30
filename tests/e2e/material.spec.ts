/**
 * SlicyWeb
 * Material Database End-To-End Tests
 *
 * Material and filament profiles loaded by the main process (ADR-033,
 * D6), read by the window through material:getAll and filament:getAll
 * only: the filaments of the user (filaments/ of the user data folder)
 * are served with their ids; a damaged file is refused without stopping
 * the application. The materials and filaments of data/ come with lot 69.
 *
 * The filament of this test is test data, not a real product.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing: Material Loads)
 * - API_SPEC.md (MaterialIPC Channels, FilamentIPC Channels)
 */

import fs from "node:fs";
import path from "node:path";

import { expect, test } from "./fixtures";

const filament = {
  id: "e2e_test_filament",
  brand: "Test",
  name: "E2E PLA",
  material: "PLA",
  color: "Red",
  diameter: 1.75,
  density: null,
  pricePerKg: 20,
  temperature: { minNozzle: 190, maxNozzle: 230, minBed: null, maxBed: null },
  manufacturerSettings: {
    retractionDistance: null,
    retractionSpeed: null,
    fanSpeed: null,
    nozzleTemperature: 210,
    bedTemperature: null,
  },
  recommendedProfile: {},
};

interface Response {
  success: boolean;
  data: Record<string, unknown>;
  errors: string[];
}

test("serves the materials and the filaments of the user, refuses a damaged file", async ({
  userDataDir,
  launch,
}) => {
  const folder = path.join(userDataDir, "filaments");
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(
    path.join(folder, "e2e.json"),
    JSON.stringify({
      id: filament.id,
      type: "filament",
      version: "1.0.0",
      source: "Local Custom",
      data: filament,
      validated: false,
    }),
  );
  fs.writeFileSync(path.join(folder, "broken.json"), '{ "id": ');

  const { window: page, errors } = await launch();

  const materials = (await page.evaluate(() =>
    window.slicyWeb.invoke("material:getAll"),
  )) as Response;
  expect(materials.success).toBe(true);
  expect(Array.isArray(materials.data.materials)).toBe(true);

  const filaments = (await page.evaluate(() =>
    window.slicyWeb.invoke("filament:getAll"),
  )) as Response;
  expect(filaments.success).toBe(true);
  expect(filaments.data.filaments).toContainEqual(filament);
  expect(filaments.data.userFilamentIds).toEqual([filament.id]);
  expect(errors).toEqual([]);
});
