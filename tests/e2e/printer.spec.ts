/**
 * SlicyWeb
 * Printer Database End-To-End Tests
 *
 * Printer profiles loaded by the main process (ADR-032, D4), read by the
 * window through the printer:* channels only: the 10 printers of
 * data/printers/ and the printers of the user; a damaged profile file is
 * refused without stopping the application; a settings.json written
 * before the printer settings (DATA_SCHEMA.md 3.5.0) keeps the language
 * of the user. The Printer section (Phase 7): a printer chosen in the
 * selector shows its limits ("Not published" for null), the size of the
 * plate in the viewport and in the status bar; it is chosen again at the
 * next start; "No printer" clears it; Printer > Select Printer moves the
 * focus to the selector.
 *
 * The printer of these tests is test data, not a real printer.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing: Printer Loads, Plate Updates)
 * - GUI_SPEC.md (Printer Section, Printer Selector, Plate Display)
 * - API_SPEC.md (PrinterIPC Channels)
 * - USER_SETTINGS_SPEC.md (Backward Compatibility)
 */

import fs from "node:fs";
import path from "node:path";

import en from "../../public/locales/en.json";
import fr from "../../public/locales/fr.json";

import { expect, test } from "./fixtures";

const printer = {
  id: "e2e-test-printer",
  brand: "Test",
  model: "E2E",
  series: "",
  manufacturer: "Test",
  firmware: "",
  releaseDate: "",
  supported: true,
  buildVolume: { x: 220, y: 210, z: 200 },
  defaultNozzle: 0.4,
  supportedNozzles: [0.4],
  motion: {
    maxPrintSpeed: null,
    maxTravelSpeed: null,
    maxAcceleration: null,
    maxJerk: null,
  },
  thermal: { maxNozzleTemp: 280, maxBedTemp: 100, maxChamberTemp: null },
  cooling: { partFan: true, auxFan: false, chamberFan: false },
  extruder: { type: "direct_drive", count: 1 },
  supportedMaterials: [],
  supportedFilaments: [],
};

interface Response {
  success: boolean;
  data: Record<string, unknown>;
  errors: string[];
}

test("serves the printers of the user and refuses a damaged file", async ({
  userDataDir,
  launch,
}) => {
  const folder = path.join(userDataDir, "printers");
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(
    path.join(folder, "e2e.json"),
    JSON.stringify({
      id: printer.id,
      type: "printer",
      version: "1.0.0",
      source: "Local Custom",
      data: printer,
      validated: false,
    }),
  );
  fs.writeFileSync(path.join(folder, "broken.json"), '{ "id": ');

  const { window: page, errors } = await launch();

  const all = (await page.evaluate(() =>
    window.slicyWeb.invoke("printer:getAll"),
  )) as Response;
  const ids = (all.data.printers as { id: string }[]).map(({ id }) => id);
  expect(all.success).toBe(true);
  // The 10 printers of data/printers/, then the printer of the user
  expect(ids).toHaveLength(11);
  expect(ids).toContain("bambu_x1c");
  expect(ids).toContain(printer.id);

  const one = (await page.evaluate(
    (printerId) => window.slicyWeb.invoke("printer:get", { printerId }),
    printer.id,
  )) as Response;
  expect(one.data.printer).toEqual(printer);

  const missing = (await page.evaluate(() =>
    window.slicyWeb.invoke("printer:get", { printerId: "broken" }),
  )) as Response;
  expect(missing).toMatchObject({
    success: false,
    errors: ["PRN_001 Printer Not Found"],
  });
  expect(errors).toEqual([]);
});

test("keeps the language of a settings.json without printer", async ({
  userDataDir,
  launch,
}) => {
  fs.writeFileSync(
    path.join(userDataDir, "settings.json"),
    JSON.stringify({
      preferences: { theme: "dark", language: "fr", units: "metric" },
    }),
  );

  const { window: page, errors } = await launch();

  await expect(
    page.getByRole("menubar").getByRole("menuitem").first(),
  ).toHaveText(fr["menu.file"]);
  const settings = (await page.evaluate(() =>
    window.slicyWeb.invoke("settings:get"),
  )) as Response;
  expect(settings.data.settings).toEqual({
    theme: "dark",
    language: "fr",
    units: "metric",
    printer: { defaultPrinter: null, autoloadLastPrinter: true },
  });
  expect(errors).toEqual([]);
});

test("chooses a printer, shows its plate and keeps it", async ({ launch }) => {
  const first = await launch();
  const page = first.window;
  const selector = page.getByLabel(en["printer.selector"]);

  await expect(selector).toHaveValue("");
  await expect(page.getByText(en["printer.noSelection"])).toBeVisible();

  await selector.selectOption({ label: "X1 Carbon" });

  const section = page.locator("dl").filter({ hasText: en["printer.brand"] });
  await expect(section).toContainText("Bambu Lab");
  await expect(section).toContainText("256 × 256 × 256 mm");
  await expect(
    page.locator("div").filter({ hasText: en["printer.maxJerk"] }).last(),
  ).toContainText(en["printer.notPublished"]);
  await expect(
    page.getByText(
      en["viewport.plate"].replace("{x}", "256").replace("{y}", "256"),
    ),
  ).toBeVisible();
  await expect(page.locator("footer")).toContainText("Bambu Lab X1 Carbon");

  // Printer > Select Printer moves the focus to the selector
  await page
    .getByRole("menubar")
    .getByRole("menuitem", { name: en["menu.printer"] })
    .click();
  await page.getByRole("menuitem", { name: en["printer.select"] }).click();
  await expect(selector).toBeFocused();
  expect(first.errors).toEqual([]);
  await first.app.close();

  // Next start: the last printer is chosen again
  const second = await launch();
  const again = second.window.getByLabel(en["printer.selector"]);
  await expect(again).toHaveValue("bambu_x1c");
  await expect(second.window.locator("footer")).toContainText(
    "Bambu Lab X1 Carbon",
  );

  await again.selectOption("");
  await expect(
    second.window.getByText(en["printer.noSelection"]),
  ).toBeVisible();
  await expect(second.window.getByText(/^Plate:/)).toHaveCount(0);
  const settings = (await second.window.evaluate(() =>
    window.slicyWeb.invoke("settings:get"),
  )) as Response;
  expect(settings.data.settings).toMatchObject({
    printer: { defaultPrinter: null, autoloadLastPrinter: true },
  });
  expect(second.errors).toEqual([]);
});
