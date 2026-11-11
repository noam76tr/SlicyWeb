/**
 * SlicyWeb
 * Optimization End-To-End Tests
 *
 * Orientation optimization in the built application (Phase 11 lot 98;
 * ADR-036 D4): Tools > Optimize Orientation and the button Optimize,
 * disabled while the scene has no object; a tower of 20 x 20 x 100 mm
 * laid down, the message of the result, one history action (Undo gives
 * back the orientation), the analysis and the recommendation computed
 * again; a cube: "already the best".
 *
 * Based on:
 * - TEST_PLAN.md (Optimization Tests: Interface, lot 98)
 * - GUI_SPEC.md (Tools Menu, Toolbar Buttons, Error Handling UI:
 *   Optimization messages)
 * - UNDO_REDO_SPEC.md (Orientation Optimization)
 */

import type { Page } from "@playwright/test";

import en from "../../public/locales/en.json";

import { cubeStl, expect, importFiles, openTab, test } from "./fixtures";

/** ASCII STL of a box, sizes in mm, centered on the origin */
function boxStl(name: string, x: number, y: number, z: number): string {
  // The cube of 2 mm (corners at -1 and 1), stretched along each axis
  return cubeStl(name, 2).replace(
    /vertex (\S+) (\S+) (\S+)/g,
    (_, a: string, b: string, c: string) =>
      `vertex ${(Number(a) * x) / 2} ${(Number(b) * y) / 2} ${(Number(c) * z) / 2}`,
  );
}

/** Section of the Properties Panel with this title */
function section(window: Page, title: string) {
  return window
    .locator("section")
    .filter({ has: window.getByRole("heading", { name: title }) })
    .last();
}

/** Row "label value" of the Analysis section */
function analysisRow(window: Page, label: string) {
  return section(window, en["analysis.title"])
    .locator("dl > div")
    .filter({ has: window.locator("dt", { hasText: label }) })
    .locator("dd");
}

function dimensions(width: number, depth: number, height: number): string {
  return en["analysis.dimensionsValue"]
    .replace("{width}", String(width))
    .replace("{depth}", String(depth))
    .replace("{height}", String(height));
}

function toolbarButton(
  window: Page,
  key: "toolbar.optimize" | "toolbar.undo" | "toolbar.redo",
) {
  return window
    .getByRole("toolbar", { name: en["toolbar.title"] })
    .getByRole("button", { name: en[key] });
}

/** Message of the result of the optimization over the viewport */
function optimizationMessage(window: Page) {
  return window.locator("[data-optimization-message]");
}

test("tower laid down by the button Optimize, one action, analysis and recommendation again", async ({
  window,
  files,
  started,
}) => {
  const optimize = toolbarButton(window, "toolbar.optimize");

  // No object: disabled
  await expect(optimize).toHaveAttribute("aria-disabled", "true");

  await importFiles(window, [files("tower.stl", boxStl("tower", 20, 20, 100))]);

  // Printer and material: the recommendation of the tower standing warns
  // of the risk of tipping over
  await openTab(window, "printer");
  await window.getByLabel(en["printer.selector"]).selectOption("prusa_mk4s");
  await window.getByLabel(en["material.selector"]).selectOption("pla");
  await openTab(window, "settings");
  await expect(section(window, en["recommendation.title"])).toContainText(
    en["warning.LOW_STABILITY"],
  );

  await openTab(window, "object");
  await expect(analysisRow(window, en["analysis.dimensions"])).toHaveText(
    dimensions(20, 20, 100),
  );
  await expect(analysisRow(window, en["analysis.tipRisk"])).toContainText(
    "80/100",
  );

  await expect(optimize).not.toHaveAttribute("aria-disabled", "true");
  await optimize.click();

  // Message: score and tip risk before and after
  const message = optimizationMessage(window);
  await expect(message).toContainText(
    en["optimization.applied"]
      .replace("{name}", "tower.stl")
      .replace("{before}", "66")
      .replace("{after}", "98"),
  );
  await expect(message).toContainText(
    en["optimization.tipRiskChange"]
      .replace("{before}", "80")
      .replace("{after}", "0"),
  );
  await expect(message).not.toContainText(en["optimization.supportsRemoved"]);

  // Lying along X: the analysis is computed again
  await expect(analysisRow(window, en["analysis.dimensions"])).toHaveText(
    dimensions(100, 20, 20),
  );
  await expect(analysisRow(window, en["analysis.status"])).toHaveText(
    en["result.generated"],
  );
  await expect(analysisRow(window, en["analysis.tipRisk"])).toContainText(
    "0/100",
  );

  // The recommendation too: no more risk of tipping over
  await openTab(window, "settings");
  await expect(
    section(window, en["recommendation.title"]).getByText(
      en["result.generated"],
    ),
  ).toBeVisible();
  await expect(section(window, en["recommendation.title"])).not.toContainText(
    en["warning.LOW_STABILITY"],
  );

  // One history action: Undo gives back the tower standing
  await toolbarButton(window, "toolbar.undo").click();
  await expect(toolbarButton(window, "toolbar.undo")).toBeDisabled();
  await openTab(window, "object");
  await expect(analysisRow(window, en["analysis.dimensions"])).toHaveText(
    dimensions(20, 20, 100),
  );

  // Redo lays it down again
  await toolbarButton(window, "toolbar.redo").click();
  await expect(analysisRow(window, en["analysis.dimensions"])).toHaveText(
    dimensions(100, 20, 20),
  );

  // Close
  await message.getByRole("button", { name: en["import.dismiss"] }).click();
  await expect(message).toHaveCount(0);

  expect(started.errors).toEqual([]);
});

test("Tools > Optimize Orientation: a cube is already the best", async ({
  window,
  files,
}) => {
  const tools = window.getByRole("menuitem", { name: en["menu.tools"] });
  const item = window.getByRole("menuitem", {
    name: en["tools.optimizeOrientation"],
  });

  // No object: disabled
  await tools.click();
  await expect(item).toHaveAttribute("aria-disabled", "true");
  await window.keyboard.press("Escape");

  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);

  await tools.click();
  await expect(item).not.toHaveAttribute("aria-disabled", "true");
  await item.click();

  await expect(optimizationMessage(window)).toContainText(
    en["optimization.kept"]
      .replace("{name}", "cube.stl")
      .replace("{score}", "90"),
  );

  // Nothing turned: no history action
  await expect(toolbarButton(window, "toolbar.undo")).toBeDisabled();
});
