/**
 * SlicyWeb
 * Properties Tabs End-To-End Tests
 *
 * Tabs of the Properties Panel (lot 93; GUI_SPEC.md, Properties Tabs;
 * PASSATION.md decision 90, Q1 to Q6 A): the Project line above three
 * tabs; Printer at the first start; the tab never changes by itself (an
 * import or a selection keeps it); the last tab is opened again after a
 * restart; Printer > Select Printer opens the Printer tab (choice of the
 * user, decision of Noam 2026-11-08); a red dot on Settings when the
 * single selected object has a critical warning, kept when Settings is
 * open and said to a screen reader; each tab keeps its scroll position;
 * in Hebrew, Printer is on the right.
 *
 * Based on:
 * - GUI_SPEC.md (Properties Tabs)
 * - DATA_SCHEMA.md (User Preferences Schema 3.11.0)
 * - TEST_PLAN.md (End-To-End Testing)
 */

import type { Page } from "@playwright/test";

import en from "../../public/locales/en.json";
import he from "../../public/locales/he.json";

import { cubeStl, expect, importFiles, openTab, test } from "./fixtures";

type Tab = "printer" | "object" | "settings";

function trigger(window: Page, tab: Tab) {
  return window.locator(`[data-properties-trigger="${tab}"]`);
}

function panel(window: Page, tab: Tab) {
  return window.locator(`[data-properties-tab="${tab}"]`);
}

async function expectOpen(window: Page, tab: Tab): Promise<void> {
  await expect(trigger(window, tab)).toHaveAttribute("aria-selected", "true");
  await expect(panel(window, tab)).toBeVisible();
}

test("opens the last tab again, and never changes it by itself", async ({
  launch,
  files,
}) => {
  const first = await launch();
  const page = first.window;

  // First start: Project above the tabs, Printer open
  await expect(page.locator("[data-properties-project]")).toContainText(
    en["project.none"],
  );
  await expect(page.getByRole("tablist")).toHaveAccessibleName(
    en["properties.tabs"],
  );
  await expect(trigger(page, "printer")).toHaveText(
    en["properties.tab.printer"],
  );
  await expect(trigger(page, "object")).toHaveText(en["properties.tab.object"]);
  await expect(trigger(page, "settings")).toHaveText(
    en["properties.tab.settings"],
  );
  await expectOpen(page, "printer");
  await expect(panel(page, "object")).toBeHidden();

  // An import and a selection keep the open tab
  await importFiles(page, [files("cube.stl", cubeStl("cube", 20))]);
  await expectOpen(page, "printer");

  // Arrow keys move along the tabs, Enter opens one
  await trigger(page, "printer").focus();
  await page.keyboard.press("ArrowRight");
  await expect(trigger(page, "object")).toBeFocused();
  await page.keyboard.press("Enter");
  await expectOpen(page, "object");
  await expect(
    panel(page, "object").getByRole("heading", { name: en["analysis.title"] }),
  ).toBeVisible();
  expect(first.errors).toEqual([]);
  await first.app.close();

  // Next start: the Object tab again
  const second = await launch();
  await expectOpen(second.window, "object");

  // Printer > Select Printer: opens the Printer tab, focus on the selector
  await second.window
    .getByRole("menubar")
    .getByRole("menuitem", { name: en["menu.printer"] })
    .click();
  await second.window
    .getByRole("menuitem", { name: en["printer.select"] })
    .click();
  await expectOpen(second.window, "printer");
  await expect(second.window.getByLabel(en["printer.selector"])).toBeFocused();
  expect(second.errors).toEqual([]);
});

test("red dot on Settings for a critical warning of the selected object", async ({
  window,
  files,
  started,
}) => {
  const dot = trigger(window, "settings").locator("[data-critical-dot]");

  await window.getByLabel(en["printer.selector"]).selectOption("prusa_mk4s");
  await window.getByLabel(en["material.selector"]).selectOption("pla");

  // 260 mm: larger than the plate of the MK4S (OBJECT_TOO_LARGE, critical)
  await importFiles(window, [files("big.stl", cubeStl("big", 260))]);

  await expect(dot).toBeVisible();
  await expect(trigger(window, "settings")).toHaveAccessibleName(
    en["properties.criticalWarning"].replace(
      "{tab}",
      en["properties.tab.settings"],
    ),
  );
  // The dot never opens the tab
  await expectOpen(window, "printer");

  // It stays when Settings is open, next to the warning in red
  await openTab(window, "settings");
  await expect(dot).toBeVisible();
  await expect(
    panel(window, "settings").locator('[data-severity="critical"]'),
  ).toHaveText(en["warning.OBJECT_TOO_LARGE"]);

  // No object selected: no dot
  await window.keyboard.press("Escape");
  await expect(dot).toHaveCount(0);
  await expect(trigger(window, "settings")).toHaveAccessibleName(
    en["properties.tab.settings"],
  );
  expect(started.errors).toEqual([]);
});

test("each tab keeps its scroll; in Hebrew, Printer is on the right", async ({
  window,
}) => {
  await window.getByLabel(en["printer.selector"]).selectOption("bambu_x1c");
  await window.getByLabel(en["material.selector"]).selectOption("pla");

  const printerPanel = panel(window, "printer");
  await printerPanel.evaluate((element) => {
    element.scrollTop = 200;
  });
  const scrolled = await printerPanel.evaluate((element) => element.scrollTop);
  expect(scrolled).toBeGreaterThan(0);

  await openTab(window, "object");
  await openTab(window, "printer");
  await expect
    .poll(() => printerPanel.evaluate((element) => element.scrollTop))
    .toBe(scrolled);

  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.hebrew"] })
    .click();
  await expect(window.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(trigger(window, "printer")).toHaveText(
    he["properties.tab.printer"],
  );

  const printerBox = await trigger(window, "printer").boundingBox();
  const settingsBox = await trigger(window, "settings").boundingBox();
  expect(printerBox!.x).toBeGreaterThan(settingsBox!.x);
});
