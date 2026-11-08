/**
 * SlicyWeb
 * Analysis End-To-End Tests
 *
 * Analysis of the objects in the built application (Phase 9 lot 80;
 * ADR-034 D6, D7, D8): started by itself after the import and after a
 * change of scale, shown in the Analysis section and the status bar; a
 * mesh not closed gives the warning ANA_002; several selected objects:
 * "Select a single object"; Tools menu and Analyze button of the toolbar;
 * Overhang Display (lot 82): faces beyond 45 degrees of all the objects
 * in red, selected or not, button Overhangs and View > Show Overhangs.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing; Object Imported → Analysis
 *   Triggered → Analysis Stored)
 * - GUI_SPEC.md (Analysis Section, Tools Menu, Status Bar, Overhang Display)
 */

import type { Page } from "@playwright/test";

import en from "../../public/locales/en.json";

import { cubeStl, expect, importFiles, test, transformField } from "./fixtures";

/** Analysis section of the Properties Panel (inside the panel section) */
function analysisSection(window: Page) {
  return window
    .locator("section")
    .filter({
      has: window.getByRole("heading", { name: en["analysis.title"] }),
    })
    .last();
}

/** Row "label value" of the Analysis section */
function row(window: Page, label: string) {
  return analysisSection(window)
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

test("analyzes an imported object by itself and shows its analysis", async ({
  window,
  files,
  started,
}) => {
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);

  await expect(row(window, en["analysis.status"])).toHaveText(
    en["result.generated"],
  );
  await expect(row(window, en["analysis.dimensions"])).toHaveText(
    dimensions(20, 20, 20),
  );
  await expect(row(window, en["analysis.volume"])).toHaveText("8 cm³");
  await expect(row(window, en["analysis.surfaceArea"])).toHaveText("24 cm²");
  await expect(row(window, en["analysis.overhangs"])).toHaveText(
    en["analysis.noneDetected"],
  );
  await expect(row(window, en["analysis.bridges"])).toHaveText(
    en["analysis.noneDetected"],
  );
  await expect(row(window, en["analysis.contactArea"])).toHaveText("4 cm²");
  await expect(row(window, en["analysis.tipRisk"])).toHaveText(
    `0/100 (${en["analysis.risk.veryLow"]})`,
  );

  // Status bar: "Analysis: Up to date"
  await expect(window.getByRole("contentinfo")).toContainText(
    `${en["statusBar.analysisStatus"]}:${en["result.generated"]}`,
  );

  expect(started.errors).toEqual([]);
});

test("analyzes again after a change of scale", async ({ window, files }) => {
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expect(row(window, en["analysis.volume"])).toHaveText("8 cm³");

  const scaleX = transformField(window, "scale", "x");
  await scaleX.fill("50");
  await scaleX.press("Enter");

  await expect(row(window, en["analysis.dimensions"])).toHaveText(
    dimensions(10, 10, 10),
  );
  await expect(row(window, en["analysis.volume"])).toHaveText("1 cm³");
  await expect(row(window, en["analysis.status"])).toHaveText(
    en["result.generated"],
  );
});

test("a mesh not closed is analyzed with the warning ANA_002", async ({
  window,
  files,
}) => {
  // The cube without its two top triangles
  const open = cubeStl("open", 20)
    .split("facet normal 0 0 1")
    .map((part, index) =>
      index === 0 ? part : part.slice(part.indexOf("endfacet") + 9),
    )
    .join("");
  await importFiles(window, [files("open.stl", open)]);

  const message = window.getByRole("status").filter({
    hasText: en["analysis.error.ANA_002"].replace("{name}", "open.stl"),
  });
  await expect(message).toBeVisible();
  await expect(row(window, en["analysis.status"])).toHaveText(
    en["result.generated"],
  );
  await expect(analysisSection(window).getByRole("note")).toHaveText(
    en["analysis.meshNotClosed"],
  );

  await message.getByRole("button", { name: en["import.dismiss"] }).click();
  await expect(message).toHaveCount(0);
});

test("parts touching along an edge: information ANA_005 in the section only", async ({
  window,
  files,
}) => {
  // Two cubes of 10 mm touching along one vertical edge: closed, not manifold
  const shifted = cubeStl("b", 10).replace(
    /vertex (\S+) (\S+) (\S+)/g,
    (_, x, y, z) => `vertex ${Number(x) + 10} ${Number(y) + 10} ${z}`,
  );
  const facets = (stl: string): string =>
    stl.split("\n").slice(1, -1).join("\n");
  const touching = [
    "solid touching",
    facets(cubeStl("a", 10)),
    facets(shifted),
    "endsolid touching",
  ].join("\n");
  await importFiles(window, [files("touching.stl", touching)]);

  await expect(row(window, en["analysis.status"])).toHaveText(
    en["result.generated"],
  );
  await expect(row(window, en["analysis.volume"])).toHaveText("2 cm³");
  await expect(analysisSection(window).getByRole("note")).toHaveText(
    en["analysis.meshNonManifold"],
  );
  // No message over the viewport (ANA_002 is not shown)
  await expect(
    window.getByRole("status").filter({ hasText: "touching.stl" }),
  ).toHaveCount(0);
});

test("Tools menu, Analyze button and several selected objects", async ({
  window,
  files,
}) => {
  const tools = window.getByRole("menuitem", { name: en["menu.tools"] });
  const item = (key: "tools.analyzeModels" | "tools.recomputeAnalysis") =>
    window.getByRole("menuitem", { name: en[key] });

  // No object: both disabled
  await tools.click();
  await expect(item("tools.analyzeModels")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(item("tools.recomputeAnalysis")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await window.keyboard.press("Escape");

  const analyze = window
    .getByRole("toolbar", { name: en["toolbar.title"] })
    .getByRole("button", { name: en["toolbar.analyze"] });
  await expect(analyze).toHaveAttribute("aria-disabled", "true");

  await importFiles(window, [
    files("a.stl", cubeStl("a", 10)),
    files("b.stl", cubeStl("b", 20)),
  ]);
  await expect(row(window, en["analysis.dimensions"])).toHaveText(
    dimensions(20, 20, 20),
  );

  await expect(analyze).not.toHaveAttribute("aria-disabled", "true");

  // Recompute Analysis on the selected object: up to date again
  await tools.click();
  await item("tools.recomputeAnalysis").click();
  await expect(row(window, en["analysis.status"])).toHaveText(
    en["result.generated"],
  );

  // Two objects selected
  await window.getByRole("heading", { name: en["analysis.title"] }).click();
  await window.keyboard.press("ControlOrMeta+a");
  await expect(analysisSection(window)).toContainText(
    en["analysis.selectSingle"],
  );
});

test("Overhang Display: faces beyond 45 degrees in red, button and View menu", async ({
  window,
  files,
  started,
}) => {
  const viewport = window.locator("#renderer-container");
  const button = window
    .getByRole("toolbar", { name: en["view.showOverhangs"] })
    .getByRole("button", { name: en["view.overhangs"] });

  // No object: grayed out
  await expect(button).toBeDisabled();

  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expect(row(window, en["analysis.status"])).toHaveText(
    en["result.generated"],
  );

  // Off at start; on: a cube on the plate has no face in red
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(viewport).toHaveAttribute("data-overhang-triangles", "0");

  // Turned 30 degrees around X: its bottom faces down at 60 degrees
  await window
    .getByRole("toolbar", { name: en["transform.title"] })
    .getByRole("button", { name: en["transform.rotate"] })
    .click();
  const rotationX = transformField(window, "rotation", "x");
  await rotationX.fill("30");
  await rotationX.press("Enter");
  await expect(row(window, en["analysis.overhangs"])).not.toHaveText(
    en["analysis.noneDetected"],
  );
  await expect(viewport).toHaveAttribute("data-overhang-triangles", "2");

  // Nothing selected: still in red (all the objects, decision of Noam Q1 B)
  await window.getByRole("heading", { name: en["analysis.title"] }).click();
  await window.keyboard.press("Escape");
  await expect(window.getByRole("contentinfo")).toContainText(
    `${en["statusBar.selectedObject"]}:${en["statusBar.none"]}`,
  );
  await expect(viewport).toHaveAttribute("data-overhang-triangles", "2");

  // View > Show Overhangs: checked, turns the display off
  await window.getByRole("menuitem", { name: en["menu.view"] }).click();
  const item = window.getByRole("menuitemcheckbox", {
    name: en["view.showOverhangs"],
  });
  await expect(item).toHaveAttribute("aria-checked", "true");
  await item.click();
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(viewport).toHaveAttribute("data-overhang-triangles", "0");

  expect(started.errors).toEqual([]);
});
