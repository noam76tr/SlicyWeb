/**
 * SlicyWeb
 * Values With Units End-To-End Test
 *
 * In Hebrew, a value with its unit is shown as in English and French
 * ("8 cm³", "210 °C", "150 mm/s"), not "cm³ 8" (lot 89, remark of Noam on
 * lot 88): NumberFormatter wraps it in a left-to-right isolate. The test
 * reads the text and checks on screen that the number is drawn left of its
 * unit, in the Printer, Filament, Analysis and Recommendation sections and
 * the plate size.
 *
 * Based on:
 * - GUI_SPEC.md (Localization Support, Number Format)
 * - TEST_PLAN.md (lot 89)
 */

import type { Locator, Page } from "@playwright/test";

import en from "../../public/locales/en.json";
import he from "../../public/locales/he.json";

import { cubeStl, expect, importFiles, test } from "./fixtures";

const LRI = "⁦";
const PDI = "⁩";

/** Value of the row with this label, in the section with this title */
function row(window: Page, title: string, label: string): Locator {
  return window
    .locator("section")
    .filter({ has: window.getByRole("heading", { name: title, exact: true }) })
    .last()
    .locator("dl > div")
    .filter({ has: window.locator("dt", { hasText: label }) })
    .first()
    .locator("dd");
}

/**
 * Left edge on screen of the first character of number and of unit,
 * inside the text of the element
 */
async function positions(
  element: Locator,
  number: string,
  unit: string,
): Promise<{ number: number; unit: number }> {
  return element.evaluate(
    (node, [numberText, unitText]) => {
      const text = node.firstChild as Text;
      const content = text.textContent ?? "";
      const left = (index: number): number => {
        const range = document.createRange();
        range.setStart(text, index);
        range.setEnd(text, index + 1);
        return range.getBoundingClientRect().left;
      };

      return {
        number: left(content.indexOf(numberText)),
        unit: left(content.indexOf(unitText)),
      };
    },
    [number, unit],
  );
}

/** The value is isolated, and its number is drawn left of its unit */
async function expectLeftToRight(
  element: Locator,
  value: string,
  number: string,
  unit: string,
): Promise<void> {
  await expect(element).toHaveText(`${LRI}${value}${PDI}`);

  const { number: numberLeft, unit: unitLeft } = await positions(
    element,
    number,
    unit,
  );
  expect(numberLeft).toBeLessThan(unitLeft);
}

test("values with their unit stay left to right in Hebrew", async ({
  window,
  files,
  started,
}) => {
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await window.getByLabel(en["printer.selector"]).selectOption("bambu_x1c");
  await window
    .getByLabel(en["filament.selector"])
    .selectOption("bambu_pla_basic");

  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.hebrew"] })
    .click();
  await expect(window.locator("html")).toHaveAttribute("dir", "rtl");

  await expectLeftToRight(
    row(window, he["printer.title"], he["printer.buildVolume"]),
    "256 × 256 × 256 mm",
    "256",
    "mm",
  );
  await expectLeftToRight(
    row(window, he["printer.title"], he["printer.maxPrintSpeed"]),
    "500 mm/s",
    "500",
    "mm/s",
  );
  // A range keeps its order: minimum first, on the left
  await expectLeftToRight(
    row(window, he["filament.title"], he["material.nozzleTemperature"]),
    "190 – 230 °C",
    "190",
    "230",
  );
  await expectLeftToRight(
    row(window, he["analysis.title"], he["analysis.volume"]),
    "8 cm³",
    "8",
    "cm³",
  );

  await window.getByText(he["recommendation.details"], { exact: true }).click();
  await expectLeftToRight(
    row(window, he["recommendation.title"], he["recommendation.speed.print"]),
    "150 mm/s",
    "150",
    "mm/s",
  );
  await expectLeftToRight(
    row(
      window,
      he["recommendation.title"],
      he["recommendation.nozzleTemperature"],
    ),
    "210 °C",
    "210",
    "°C",
  );

  // Plate size at the bottom of the viewport
  await expect(
    window.getByText(
      he["viewport.plate"].replace("{size}", `${LRI}256 × 256 mm${PDI}`),
    ),
  ).toBeVisible();

  expect(started.errors).toEqual([]);
});
