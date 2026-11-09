/**
 * SlicyWeb
 * Application End-To-End Tests
 *
 * Start of the built application and languages (GUI_SPEC.md, Menu Bar,
 * Language Menu; USER_SETTINGS_SPEC.md): the window opens with its menus
 * and toolbar, without console error; the language chosen changes the
 * texts and the direction, and is kept after a restart. Every number shown
 * follows the format of the language (lot 81): comma as decimal separator
 * in French in the Printer, Filament, Transform and Analysis sections.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing, Internationalization)
 * - GUI_SPEC.md (Menu Bar, Localization Support)
 */

import fs from "node:fs";
import path from "node:path";

import type { Page } from "@playwright/test";

import en from "../../public/locales/en.json";
import fr from "../../public/locales/fr.json";
import he from "../../public/locales/he.json";

import {
  cubeStl,
  expect,
  importFiles,
  openTab,
  test,
  transformField,
} from "./fixtures";

const MENUS = [
  "menu.file",
  "menu.edit",
  "menu.view",
  "menu.printer",
  "menu.material",
  "menu.filament",
  "menu.tools",
  "menu.language",
  "menu.help",
] as const;

test("opens the main window without error", async ({ started }) => {
  const { app, window, errors } = started;

  expect(await window.title()).toBe("SlicyWeb");
  const menus = window.getByRole("menubar").getByRole("menuitem");
  await expect(menus).toHaveText(MENUS.map((key) => en[key]));
  await expect(
    window
      .getByRole("toolbar", { name: en["toolbar.title"] })
      .getByRole("button"),
  ).toHaveCount(8);
  await expect(window.getByRole("img", { name: "3D Viewport" })).toBeVisible();

  // Secure window: no Node.js in the renderer
  expect(await window.evaluate(() => typeof require)).toBe("undefined");
  expect(
    await app.evaluate(
      ({ BrowserWindow }) => BrowserWindow.getAllWindows().length,
    ),
  ).toBe(1);
  expect(errors).toEqual([]);
});

test("changes the language and keeps it after a restart", async ({
  launch,
}) => {
  const first = await launch();
  const window = first.window;

  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.french"] })
    .click();
  await expect(
    window.getByRole("menubar").getByRole("menuitem").first(),
  ).toHaveText(fr["menu.file"]);
  expect(await window.evaluate(() => document.documentElement.lang)).toBe("fr");
  await first.app.close();

  // Same user data folder: the language is read from settings.json
  const second = await launch();
  await expect(
    second.window.getByRole("menubar").getByRole("menuitem").first(),
  ).toHaveText(fr["menu.file"]);
  expect(second.errors).toEqual([]);
});

test("shows Hebrew from right to left", async ({ window }) => {
  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.hebrew"] })
    .click();

  await expect(
    window.getByRole("menubar").getByRole("menuitem").first(),
  ).toHaveText(he["menu.file"]);
  expect(
    await window.evaluate(() => [
      document.documentElement.lang,
      document.documentElement.dir,
    ]),
  ).toEqual(["he", "rtl"]);
});

/** Value of the row "label" of a list of values (dt, dd) */
function rowValue(window: Page, label: string) {
  return window
    .locator("dl > div")
    .filter({ has: window.locator("dt").getByText(label, { exact: true }) })
    .locator("dd");
}

test("shows the numbers in the format of the language", async ({
  userDataDir,
  launch,
  files,
}) => {
  // A filament of the user with a price (test data, not a real product)
  const folder = path.join(userDataDir, "filaments");
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(
    path.join(folder, "e2e_numbers.json"),
    JSON.stringify({
      id: "e2e_numbers",
      type: "filament",
      version: "1.0.0",
      source: "Local Custom",
      data: {
        id: "e2e_numbers",
        brand: "Test",
        name: "Numbers PLA",
        material: "PLA",
        color: null,
        diameter: 1.75,
        density: 1.24,
        pricePerKg: 24.99,
        temperature: {
          minNozzle: 190,
          maxNozzle: 230,
          minBed: null,
          maxBed: null,
        },
        manufacturerSettings: {
          retractionDistance: 0.8,
          retractionSpeed: null,
          fanSpeed: null,
          nozzleTemperature: null,
          bedTemperature: null,
        },
        recommendedProfile: {},
      },
      validated: false,
    }),
  );

  const { window, errors } = await launch();
  await window
    .getByLabel(en["printer.selector"])
    .selectOption({ label: "X1 Carbon" });
  await window.getByLabel(en["filament.selector"]).selectOption("e2e_numbers");

  // A cube of 15 mm: 3.375 cm³ and 13.5 cm²
  await importFiles(window, [files("cube.stl", cubeStl("cube", 15))]);
  await openTab(window, "object");
  const positionX = transformField(window, "position", "x");
  await positionX.fill("12.5");
  await positionX.press("Enter");
  await expect(positionX).toHaveValue("12.5");
  await expect(rowValue(window, en["analysis.volume"])).toHaveText("3.38 cm³");

  await openTab(window, "printer");
  await expect(rowValue(window, en["printer.nozzle"])).toHaveText("0.4 mm");
  await expect(rowValue(window, en["filament.pricePerKg"])).toHaveText("24.99");
  await expect(rowValue(window, en["filament.retractionDistance"])).toHaveText(
    "0.8 mm",
  );

  // French: comma as decimal separator everywhere
  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.french"] })
    .click();

  await expect(rowValue(window, fr["printer.nozzle"])).toHaveText("0,4 mm");
  // Thousands: narrow no-break space (never cut at the end of a line)
  await expect(rowValue(window, fr["printer.maxAcceleration"])).toHaveText(
    "20\u202f000 mm/s²",
  );
  await expect(rowValue(window, fr["filament.pricePerKg"])).toHaveText("24,99");
  await expect(rowValue(window, fr["filament.retractionDistance"])).toHaveText(
    "0,8 mm",
  );
  await openTab(window, "object");
  await expect(positionX).toHaveValue("12,5");
  await expect(rowValue(window, fr["analysis.volume"])).toHaveText("3,38 cm³");
  await expect(rowValue(window, fr["analysis.surfaceArea"])).toHaveText(
    "13,5 cm²",
  );

  // A value typed with a comma is read in French too
  await positionX.fill("-7,25");
  await positionX.press("Enter");
  await expect(positionX).toHaveValue("-7,25");

  // Back to English: point as decimal separator
  await window.getByRole("menuitem", { name: fr["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: fr["language.english"] })
    .click();
  await expect(positionX).toHaveValue("-7.25");
  await openTab(window, "printer");
  await expect(rowValue(window, en["filament.pricePerKg"])).toHaveText("24.99");
  expect(errors).toEqual([]);
});
