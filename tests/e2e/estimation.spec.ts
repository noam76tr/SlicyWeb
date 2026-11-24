/**
 * SlicyWeb
 * Estimation End-To-End Tests
 *
 * Estimation of Phase 12 in the built application (lot 108, ADR-037;
 * answers of Noam to lot 107, Q6 to Q13 A): the Estimation section of the
 * Settings tab comes by itself after the recommendation; without prices,
 * no cost; the Costs section of the Printer tab keeps the currency, the
 * price of a kWh, the power of the printer and the price of a shipped
 * filament, saved in settings.json for the next start; a value refused
 * shows its error; the plate in the status bar counts the visible objects
 * only; amounts in French and in Hebrew.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing; lot 108)
 * - GUI_SPEC.md (Cost Section, Estimation Section, Status Bar)
 */

import type { Page } from "@playwright/test";

import en from "../../public/locales/en.json";
import fr from "../../public/locales/fr.json";

import { cubeStl, expect, importFiles, openTab, test } from "./fixtures";

/** Section of the Properties Panel with this title */
function section(window: Page, title: string) {
  return window
    .locator("section")
    .filter({ has: window.getByRole("heading", { name: title }) })
    .last();
}

/** Row "label value" of the Estimation section */
function row(window: Page, title: string, label: string) {
  return section(window, title)
    .locator("dl > div")
    .filter({ has: window.locator("dt").getByText(label, { exact: true }) })
    .locator("dd");
}

function plate(window: Page) {
  return window.locator('[data-status-field="plate-estimation"]');
}

/** Types a value in a field of the Costs section, then leaves it */
async function type(window: Page, label: string, value: string): Promise<void> {
  const field = window.getByLabel(label);

  await field.fill(value);
  await field.press("Enter");
}

test("estimates the cube by itself, then counts the costs given", async ({
  window,
  files,
  started,
  launch,
}) => {
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await openTab(window, "settings");

  // No recommendation yet: no estimation
  await expect(section(window, en["estimation.title"])).toContainText(
    en["estimation.waiting"],
  );
  await expect(plate(window)).toContainText("—");

  await openTab(window, "printer");
  await window.getByLabel(en["printer.selector"]).selectOption("prusa_mk4s");
  await window
    .getByLabel(en["filament.selector"])
    .selectOption("prusament_pla");
  await openTab(window, "settings");

  const title = en["estimation.title"];
  // 20 mm in layers of 0.2 mm (Balanced)
  await expect(row(window, title, en["estimation.layers"])).toHaveText("100");
  await expect(row(window, title, en["estimation.printTime"])).toHaveText(
    /^≈ (\d+ h )?\d+ min$/,
  );
  await expect(row(window, title, en["estimation.filament"])).toHaveText(
    /^≈ \d+\.\d\d m · ≈ \d+(\.\d)? g$/,
  );
  // No price of a shipped filament, no power: no cost
  await expect(row(window, title, en["estimation.total"])).toHaveText("—");
  await expect(plate(window)).toContainText(/≈ .* min · ≈ .* g/);

  // Costs section: English gives US dollars at the first start
  await openTab(window, "printer");
  const costs = section(window, en["cost.title"]);
  await expect(costs.getByLabel(en["cost.currency"])).toHaveValue("USD");

  // A power of 0 is refused, its error is shown
  await type(window, en["cost.printerPower"], "0");
  await expect(costs.getByRole("alert")).toHaveText(
    en["cost.error.power"].replace("{limit}", "10,000 W"),
  );

  await type(window, en["cost.printerPower"], "120");
  await expect(costs.getByRole("alert")).toHaveCount(0);
  await type(window, en["cost.electricityPrice"], "0.25");
  await type(window, en["cost.filamentPrice"], "25");
  // The price of the shipped filament is shown in its section too
  await expect(section(window, en["filament.title"])).toContainText("$25.00");

  await openTab(window, "settings");
  await expect(row(window, title, en["estimation.filamentCost"])).toHaveText(
    /^≈ \$\d+\.\d\d$/,
  );
  await expect(row(window, title, en["estimation.electricity"])).toHaveText(
    /^≈ \$\d+\.\d\d$/,
  );
  await expect(row(window, title, en["estimation.total"])).toHaveText(
    /^≈ \$\d+\.\d\d$/,
  );
  await expect(plate(window)).toContainText(/ · ≈ \$\d+\.\d\d/);

  // A hidden object is not counted on the plate
  await window
    .locator("canvas")
    .first()
    .click({ position: { x: 5, y: 5 } });
  await window
    .getByRole("list", { name: en["objects.title"] })
    .getByRole("listitem")
    .first()
    .click();
  await window.keyboard.press("h");
  await expect(plate(window)).toContainText("—");
  await window.keyboard.press("h");
  await expect(plate(window)).toContainText(/≈ .* min/);

  expect(started.errors).toEqual([]);

  // The cost settings are kept for the next start
  await started.app.close();
  const again = await launch();
  await openTab(again.window, "printer");
  await again.window
    .getByLabel(en["printer.selector"])
    .selectOption("prusa_mk4s");
  await expect(
    again.window.getByLabel(en["cost.electricityPrice"]),
  ).toHaveValue("0.25");
  await expect(again.window.getByLabel(en["cost.printerPower"])).toHaveValue(
    "120",
  );
  expect(again.errors).toEqual([]);
});

test("shows the amounts in the format of the language", async ({
  window,
  files,
  started,
}) => {
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await window.getByLabel(en["printer.selector"]).selectOption("prusa_mk4s");
  await window
    .getByLabel(en["filament.selector"])
    .selectOption("prusament_pla");

  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.french"] })
    .click();

  // The currency chosen stays: a change of language never changes it
  const costs = section(window, fr["cost.title"]);
  await costs.getByLabel(fr["cost.currency"]).selectOption("EUR");
  await type(window, fr["cost.filamentPrice"], "25,5");
  await expect(window.getByLabel(fr["cost.filamentPrice"])).toHaveValue("25,5");

  await openTab(window, "settings");
  await expect(
    row(window, fr["estimation.title"], fr["estimation.filamentCost"]),
  ).toHaveText(/^≈ \d+,\d\d\s€$/);
  await expect(
    row(window, fr["estimation.title"], fr["estimation.filament"]),
  ).toHaveText(/^≈ \d+,\d\d m · ≈ \d+(,\d)? g$/);
  await expect(section(window, fr["estimation.title"])).toContainText(
    fr["estimation.electricityNotCounted"],
  );

  expect(started.errors).toEqual([]);
});
