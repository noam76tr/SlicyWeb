/**
 * SlicyWeb
 * Material Database End-To-End Tests
 *
 * Material and filament profiles loaded by the main process (ADR-033,
 * D6), read by the window through material:getAll and filament:getAll
 * only: the 5 materials of data/materials/, the 11 filaments of
 * data/filaments/ (lot 69) and the filaments of the user (filaments/ of
 * the user data folder), served with their ids; a damaged file is
 * refused without stopping the application. Material and Filament
 * sections (lot 70): a filament chosen selects its family and shows its
 * values ("Not published" for null); a family not listed by the printer
 * shows the warning, without blocking; Material > Select Material moves
 * the focus to its selector; the last choice is kept at the next start.
 *
 * The filament of this test is test data, not a real product.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing: Material Loads)
 * - API_SPEC.md (MaterialIPC Channels, FilamentIPC Channels)
 * - GUI_SPEC.md (Material Section, Filament Section)
 * - USER_SETTINGS_SPEC.md (Material Settings)
 */

import fs from "node:fs";
import path from "node:path";

import en from "../../public/locales/en.json";

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
  expect(
    (materials.data.materials as { id: string }[]).map(({ id }) => id).sort(),
  ).toEqual(["abs", "asa", "petg", "pla", "tpu"]);

  const filaments = (await page.evaluate(() =>
    window.slicyWeb.invoke("filament:getAll"),
  )) as Response;
  expect(filaments.success).toBe(true);
  // The 11 filaments of data/filaments/, then the filament of the user
  expect(filaments.data.filaments).toHaveLength(12);
  expect(filaments.data.filaments).toContainEqual(filament);
  expect(filaments.data.userFilamentIds).toEqual([filament.id]);
  expect(errors).toEqual([]);
});

test("chooses a filament and its family, warns and keeps the choice", async ({
  launch,
}) => {
  const first = await launch();
  const page = first.window;
  const material = page.getByLabel(en["material.selector"]);
  const filament = page.getByLabel(en["filament.selector"]);

  await expect(material).toHaveValue("");
  await expect(page.getByText(en["material.noSelection"])).toBeVisible();

  // A filament selects its family
  await filament.selectOption("prusament_petg");
  await expect(material).toHaveValue("petg");
  const values = page.locator("dl").filter({ hasText: en["filament.brand"] });
  await expect(values).toContainText("Prusament");
  await expect(values).toContainText("240 – 260 °C");
  await expect(values).toContainText(en["filament.colorNotSpecified"]);
  await expect(
    page
      .locator("div")
      .filter({ hasText: en["filament.retractionSpeed"] })
      .last(),
  ).toContainText(en["printer.notPublished"]);
  await expect(page.locator("footer")).toContainText("Prusament PETG");

  // The Bambu Lab A1 does not list ASA: warning, the choice is kept
  await page.getByLabel(en["printer.selector"]).selectOption("bambu_a1");
  await expect(page.getByText(en["material.notListed"])).toHaveCount(0);
  await material.selectOption("asa");
  await expect(filament).toHaveValue("");
  await expect(page.getByText(en["material.notListed"])).toBeVisible();
  await expect(material).toHaveValue("asa");

  // Only the filaments of the family are listed
  await expect(filament.locator("option")).toHaveCount(2);
  await filament.selectOption("prusament_asa");

  // Material > Select Material moves the focus to the selector
  await page
    .getByRole("menubar")
    .getByRole("menuitem", { name: en["menu.material"] })
    .click();
  await page.getByRole("menuitem", { name: en["material.select"] }).click();
  await expect(material).toBeFocused();
  expect(first.errors).toEqual([]);
  await first.app.close();

  // Next start: the last material and filament are chosen again
  const second = await launch();
  await expect(second.window.getByLabel(en["material.selector"])).toHaveValue(
    "asa",
  );
  await expect(second.window.getByLabel(en["filament.selector"])).toHaveValue(
    "prusament_asa",
  );
  const settings = (await second.window.evaluate(() =>
    window.slicyWeb.invoke("settings:get"),
  )) as Response;
  expect(settings.data.settings).toMatchObject({
    material: {
      defaultMaterial: "asa",
      defaultFilament: "prusament_asa",
      autoloadLastMaterial: true,
    },
  });
  expect(second.errors).toEqual([]);
});
