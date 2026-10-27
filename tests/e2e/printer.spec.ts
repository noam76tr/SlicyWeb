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
 * focus to the selector. Printers of the user (Phase 7 lot 61): Printer >
 * Manage Printers opens the Printer Manager; a printer entered there is
 * saved in printers/ of the user data folder, listed in "My printers",
 * kept at the next start, and deleted after a confirmation.
 *
 * The printer of these tests is test data, not a real printer.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing: Printer Loads, Plate Updates)
 * - GUI_SPEC.md (Printer Section, Printer Selector, Plate Display,
 *   Printer Manager)
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

test("enters a printer of the user, uses it and deletes it", async ({
  userDataDir,
  launch,
}) => {
  const first = await launch();
  const page = first.window;

  await page
    .getByRole("menubar")
    .getByRole("menuitem", { name: en["menu.printer"] })
    .click();
  await page.getByRole("menuitem", { name: en["printer.manage"] }).click();

  const dialog = page.getByRole("dialog", { name: en["printer.manage"] });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(en["printerManager.empty"])).toBeVisible();

  await dialog.getByRole("button", { name: en["printerManager.new"] }).click();

  // Required fields are checked before anything is sent
  await dialog.getByRole("button", { name: en["action.save"] }).click();
  await expect(dialog.getByRole("alert")).toHaveText(
    en["printerManager.error.form"],
  );

  const box = (name: string) =>
    dialog.getByRole("textbox", { name, exact: true });

  await box(en["printer.brand"]).fill("Test");
  await box(en["printer.model"]).fill("Home");
  await box("X (mm)").fill("180");
  await box("Y (mm)").fill("170,5");
  await box("Z (mm)").fill("160");
  await box(`${en["printer.defaultNozzle"]} (mm)`).fill("0.4");
  await box(`${en["printer.supportedNozzles"]} (mm)`).fill("0.4; 0.6");
  await box(`${en["printer.maxPrintSpeed"]} (mm/s)`).fill("250");
  await dialog.getByRole("button", { name: en["action.save"] }).click();

  await expect(dialog.getByRole("status")).toHaveText(
    en["printerManager.saved"],
  );
  await expect(dialog.getByRole("button", { name: "Test Home" })).toBeVisible();

  const files = fs.readdirSync(path.join(userDataDir, "printers"));
  expect(files).toHaveLength(1);
  const saved = JSON.parse(
    fs.readFileSync(path.join(userDataDir, "printers", files[0]), "utf8"),
  ) as { source: string; data: typeof printer };
  expect(saved.source).toBe("Local Custom");
  expect(saved.data).toMatchObject({
    brand: "Test",
    model: "Home",
    buildVolume: { x: 180, y: 170.5, z: 160 },
    supportedNozzles: [0.4, 0.6],
    motion: { maxPrintSpeed: 250, maxJerk: null },
  });

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  // The printer is in "My printers" and gives its plate
  const selector = page.getByLabel(en["printer.selector"]);
  await expect(
    selector.locator(`optgroup[label="${en["printer.myPrinters"]}"] option`),
  ).toHaveText(["Test Home"]);
  await selector.selectOption({ label: "Test Home" });
  await expect(
    page.getByText(
      en["viewport.plate"].replace("{x}", "180").replace("{y}", "170.5"),
    ),
  ).toBeVisible();
  expect(first.errors).toEqual([]);
  await first.app.close();

  // Next start: the printer is loaded again, and is still chosen
  const second = await launch();
  const again = second.window;
  await expect(again.getByLabel(en["printer.selector"])).toHaveValue(
    saved.data.id,
  );

  await again.getByRole("button", { name: en["printer.manageButton"] }).click();
  const manager = again.getByRole("dialog", { name: en["printer.manage"] });
  await manager.getByRole("button", { name: "Test Home" }).click();
  await manager.getByRole("button", { name: en["action.delete"] }).click();
  await expect(
    manager.getByText(
      en["printerManager.deleteConfirm"].replace("{name}", "Test Home"),
    ),
  ).toBeVisible();
  await manager.getByRole("button", { name: en["action.delete"] }).click();

  await expect(manager.getByRole("status")).toHaveText(
    en["printerManager.deleted"],
  );
  await expect(manager.getByText(en["printerManager.empty"])).toBeVisible();
  expect(fs.readdirSync(path.join(userDataDir, "printers"))).toEqual([]);
  await expect(again.getByLabel(en["printer.selector"])).toHaveValue("");
  await expect(again.getByText(/^Plate:/)).toHaveCount(0);
  expect(second.errors).toEqual([]);
});
