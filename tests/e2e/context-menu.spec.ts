/**
 * SlicyWeb
 * Context Menu End-To-End Tests
 *
 * Menu of the right click in the built application (lot 105, decisions of
 * Noam Q1 to Q11 A; GUI_SPEC.md, Object Context Menu):
 * - right click on an object not selected: selected first, its menu, and
 *   Duplicate makes a copy;
 * - right drag that starts on the object: the view turns, no menu;
 * - right click in the empty space: menu of the scene, Select All; Escape
 *   closes a menu and keeps the selection;
 * - Properties opens the Object tab; Reset Rotation And Scale, one Ctrl+Z;
 * - Object Panel: right click on a row, Delete; Shift+F10 on a row opens
 *   the menu under it, and Escape gives the focus back to the row;
 * - Shift+F10 in the viewport: menu of the selection at its center;
 * - Hebrew: the menu opens to the left of the pointer.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing)
 * - GUI_SPEC.md (Object Context Menu, Keyboard Shortcuts)
 */

import en from "../../public/locales/en.json";
import he from "../../public/locales/he.json";

import {
  cubeStl,
  expect,
  expectObjectCount,
  importFiles,
  objectRows,
  openTab,
  test,
  transformField,
} from "./fixtures";

import type { Page } from "@playwright/test";

type Point = [number, number];

function viewport(window: Page) {
  return window.locator("#renderer-container");
}

function objectMenu(window: Page, dictionary: Record<string, string> = en) {
  return window.getByRole("menu", {
    name: dictionary["contextMenu.objectTitle"],
  });
}

function sceneMenu(window: Page) {
  return window.getByRole("menu", { name: en["contextMenu.sceneTitle"] });
}

function menuItem(window: Page, key: keyof typeof en) {
  return window.getByRole("menuitem", { name: new RegExp(`^${en[key]}`) });
}

/** Arrows of the Move gizmo on the screen (center of the object, tip X) */
async function moveHandles(window: Page): Promise<{ origin: Point; X: Point }> {
  await expect(viewport(window)).toHaveAttribute("data-move-handles", /X/);
  const box = await viewport(window).locator("canvas").boundingBox();
  const text = await viewport(window).getAttribute("data-move-handles");

  if (!box || !text) {
    throw new Error("Move arrows not shown");
  }

  const { origin, X } = JSON.parse(text) as { origin: Point; X: Point };
  return {
    origin: [box.x + origin[0], box.y + origin[1]],
    X: [box.x + X[0], box.y + X[1]],
  };
}

/** Center of the selected object on the screen (origin of the Move arrows) */
async function objectCenter(window: Page): Promise<Point> {
  return (await moveHandles(window)).origin;
}

/** A corner of the view, far from the objects */
async function emptySpace(window: Page): Promise<Point> {
  const box = await viewport(window).locator("canvas").boundingBox();

  if (!box) {
    throw new Error("No canvas");
  }

  return [box.x + box.width * 0.85, box.y + box.height * 0.2];
}

async function selectedName(window: Page): Promise<string> {
  return (await window.getByRole("contentinfo").textContent()) ?? "";
}

test.beforeEach(async ({ window, files }) => {
  await openTab(window, "object");
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expect(transformField(window, "position", "z")).toHaveValue("10");
});

test("right click on an object not selected: selected, its menu, Duplicate", async ({
  window,
}) => {
  const center = await objectCenter(window);

  await window.keyboard.press("Escape");
  expect(await selectedName(window)).toContain(
    `${en["statusBar.selectedObject"]}:${en["statusBar.none"]}`,
  );

  await window.mouse.click(center[0], center[1], { button: "right" });
  await expect(objectMenu(window)).toBeVisible();
  expect(await selectedName(window)).toContain(
    `${en["statusBar.selectedObject"]}:cube.stl`,
  );

  // The groups of Q2 A, in their order
  await expect(objectMenu(window).getByRole("menuitem")).toHaveText([
    en["contextMenu.properties"],
    `${en["transform.move"]}G`,
    `${en["transform.rotate"]}R`,
    `${en["transform.scale"]}S`,
    `${en["edit.duplicate"]}Ctrl+D`,
    `${en["edit.delete"]}Del`,
    en["tools.optimizeOrientation"],
    en["transform.centerOnBed"],
    en["contextMenu.resetRotationScale"],
    en["tools.recomputeAnalysis"],
  ]);

  await menuItem(window, "edit.duplicate").click();
  await expect(objectMenu(window)).toHaveCount(0);
  await expectObjectCount(window, 2);
});

test("right drag that starts on the object turns the view, no menu", async ({
  window,
}) => {
  const { origin: center, X: before } = await moveHandles(window);

  await window.mouse.move(center[0], center[1]);
  await window.mouse.down({ button: "right" });
  await window.mouse.move(center[0] + 80, center[1] + 10, { steps: 10 });
  await window.mouse.up({ button: "right" });

  await expect(objectMenu(window)).toHaveCount(0);
  await expect(sceneMenu(window)).toHaveCount(0);

  // The view turned around the object: the tip of the arrow X is elsewhere
  // on the screen
  const after = (await moveHandles(window)).X;
  expect(
    Math.hypot(after[0] - before[0], after[1] - before[1]),
  ).toBeGreaterThan(5);
});

test("right click in the empty space: menu of the scene, Escape keeps the selection", async ({
  window,
}) => {
  const empty = await emptySpace(window);

  await window.mouse.click(empty[0], empty[1], { button: "right" });
  await expect(sceneMenu(window)).toBeVisible();
  await expect(sceneMenu(window).getByRole("menuitem")).toHaveText([
    en["contextMenu.import"],
    `${en["edit.selectAll"]}Ctrl+A`,
    `${en["edit.arrange"]}A`,
    `${en["view.resetView"]}Home`,
  ]);

  // The selection is kept (Q6 A), also when Escape closes the menu
  await window.keyboard.press("Escape");
  await expect(sceneMenu(window)).toHaveCount(0);
  expect(await selectedName(window)).toContain(
    `${en["statusBar.selectedObject"]}:cube.stl`,
  );

  await window.keyboard.press("Escape");
  await window.mouse.click(empty[0], empty[1], { button: "right" });
  await menuItem(window, "edit.selectAll").click();
  expect(await selectedName(window)).toContain(
    `${en["statusBar.selectedObject"]}:cube.stl`,
  );
});

test("Properties opens the Object tab; Reset Rotation And Scale, one Ctrl+Z", async ({
  window,
}) => {
  const scaleX = transformField(window, "scale", "x");
  await scaleX.fill("200");
  await scaleX.press("Enter");
  await expect(transformField(window, "position", "z")).toHaveValue("20");

  await openTab(window, "printer");
  const center = await objectCenter(window);
  await window.mouse.click(center[0], center[1], { button: "right" });
  await menuItem(window, "contextMenu.properties").click();
  await expect(
    window.locator('[data-properties-trigger="object"]'),
  ).toHaveAttribute("aria-selected", "true");

  const again = await objectCenter(window);
  await window.mouse.click(again[0], again[1], { button: "right" });
  await menuItem(window, "contextMenu.resetRotationScale").click();
  await expect(transformField(window, "scale", "x")).toHaveValue("100");
  await expect(transformField(window, "position", "z")).toHaveValue("10");

  await window.getByRole("heading", { name: en["transform.title"] }).click();
  await window.keyboard.press("ControlOrMeta+z");
  await expect(transformField(window, "scale", "x")).toHaveValue("200");
});

test("Object Panel: right click on a row, Delete; Shift+F10 opens the menu under the row", async ({
  window,
}) => {
  const row = objectRows(window).first();
  const button = row.getByRole("button", { name: "cube.stl" });

  await button.focus();
  await window.keyboard.press("Shift+F10");
  await expect(objectMenu(window)).toBeVisible();

  const rowBox = await row.boundingBox();
  const menuBox = await objectMenu(window).boundingBox();
  expect(menuBox!.y).toBeGreaterThanOrEqual(rowBox!.y + rowBox!.height - 1);

  await window.keyboard.press("Escape");
  await expect(objectMenu(window)).toHaveCount(0);
  await expect(button).toBeFocused();
  expect(await selectedName(window)).toContain(
    `${en["statusBar.selectedObject"]}:cube.stl`,
  );

  await button.click({ button: "right" });
  await menuItem(window, "edit.delete").click();
  await expectObjectCount(window, 0);
});

test("Shift+F10 in the viewport: menu of the selection at its center", async ({
  window,
}) => {
  const center = await objectCenter(window);

  await window.locator("body").click({ position: { x: 1, y: 1 } });
  await window.evaluate(() => (document.activeElement as HTMLElement).blur());
  await window.keyboard.press("Shift+F10");
  await expect(objectMenu(window)).toBeVisible();

  const box = await objectMenu(window).boundingBox();
  // Within a few pixels (opening animation)
  expect(Math.abs(box!.x - center[0])).toBeLessThan(12);
  expect(Math.abs(box!.y - center[1])).toBeLessThan(12);
});

test("Hebrew: the menu opens to the left of the pointer", async ({
  window,
}) => {
  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.hebrew"] })
    .click();
  await expect(window.locator("html")).toHaveAttribute("dir", "rtl");

  const center = await objectCenter(window);
  await window.mouse.click(center[0], center[1], { button: "right" });

  const menu = objectMenu(window, he);
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(center[0] + 1);
  await expect(menu.getByRole("menuitem").first()).toHaveText(
    he["contextMenu.properties"],
  );
});
