/**
 * SlicyWeb
 * Move End-To-End Tests
 *
 * Free move of the objects (lot 102, decisions of Noam Q1 to Q5 A;
 * GUI_SPEC.md, Move Gizmo): a drag anywhere on the object moves it freely
 * on the plate, also where the line of an arrow passes over it; only the
 * tip of an arrow, placed beside the object, moves it along one axis; the
 * cursor shows what a drag does.
 *
 * data-move-handles (set by the viewport at each frame): middle of the
 * tips X and Y and start of the arrows, in pixels of the canvas; absent
 * when the Move arrows are hidden.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing)
 * - GUI_SPEC.md (Move Gizmo, Viewport Controls)
 */

import en from "../../public/locales/en.json";

import {
  cubeStl,
  expect,
  importFiles,
  openTab,
  test,
  transformField,
} from "./fixtures";

import type { Page } from "@playwright/test";

type Point = [number, number];

interface MoveHandles {
  origin: Point;
  X: Point;
  Y: Point;
}

function viewport(window: Page) {
  return window.getByRole("img", { name: en["viewport.title"] });
}

/** Arrows of the Move gizmo, in pixels of the window */
async function moveHandles(window: Page): Promise<MoveHandles> {
  const canvas = viewport(window).locator("canvas");
  await expect(viewport(window)).toHaveAttribute("data-move-handles", /X/);
  const box = await canvas.boundingBox();
  const text = await viewport(window).getAttribute("data-move-handles");

  if (!box || !text) {
    throw new Error("Move arrows not shown");
  }

  const handles = JSON.parse(text) as MoveHandles;
  const shift = (point: Point): Point => [box.x + point[0], box.y + point[1]];

  return {
    origin: shift(handles.origin),
    X: shift(handles.X),
    Y: shift(handles.Y),
  };
}

async function cursorAt(window: Page, point: Point): Promise<string> {
  await window.mouse.move(point[0], point[1], { steps: 3 });
  const canvas = viewport(window).locator("canvas");
  // The cursor is updated at the next frame
  await window.waitForTimeout(100);
  return canvas.evaluate((element) => (element as HTMLElement).style.cursor);
}

async function drag(window: Page, from: Point, to: Point): Promise<void> {
  await window.mouse.move(from[0], from[1]);
  await window.mouse.down();
  await window.mouse.move(to[0], to[1], { steps: 12 });
  await window.mouse.up();
}

test.beforeEach(async ({ window, files }) => {
  await openTab(window, "object");
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expect(transformField(window, "position", "z")).toHaveValue("10");
});

test("a drag on the line of an arrow, over the object, moves it freely", async ({
  window,
}) => {
  const handles = await moveHandles(window);

  // On the line of the arrow X, between the center and the edge of the cube
  const onLine: Point = [
    handles.origin[0] + (handles.X[0] - handles.origin[0]) * 0.3,
    handles.origin[1] + (handles.X[1] - handles.origin[1]) * 0.3,
  ];
  expect(await cursorAt(window, onLine)).toBe("move");

  await drag(window, onLine, [onLine[0] + 60, onLine[1] - 40]);

  // Moved in X and in Y
  await expect(transformField(window, "position", "x")).not.toHaveValue("0");
  await expect(transformField(window, "position", "y")).not.toHaveValue("0");
  await expect(transformField(window, "position", "z")).toHaveValue("10");
});

test("a drag of the tip X moves along X only, one action", async ({
  window,
}) => {
  const handles = await moveHandles(window);

  // The tip is beside the cube: a hand over it, the move cursor over the cube
  expect(await cursorAt(window, handles.X)).toBe("pointer");
  expect(await cursorAt(window, handles.origin)).toBe("move");

  const direction: Point = [
    handles.X[0] - handles.origin[0],
    handles.X[1] - handles.origin[1],
  ];
  const length = Math.hypot(direction[0], direction[1]);
  await drag(window, handles.X, [
    handles.X[0] + (direction[0] / length) * 80 + 10,
    handles.X[1] + (direction[1] / length) * 80 - 25,
  ]);

  const positionX = transformField(window, "position", "x");
  await expect(positionX).not.toHaveValue("0");
  expect(
    Number((await positionX.inputValue()).replace(",", ".")),
  ).toBeGreaterThan(0);
  await expect(transformField(window, "position", "y")).toHaveValue("0");

  await window.keyboard.press("ControlOrMeta+z");
  await expect(positionX).toHaveValue("0");
});

test("the arrows are shown in the Move mode only, the normal cursor in the empty space", async ({
  window,
}) => {
  const handles = await moveHandles(window);
  const box = await viewport(window).boundingBox();
  if (!box) {
    throw new Error("3D viewport not shown");
  }

  expect(
    await cursorAt(window, [box.x + box.width - 30, box.y + box.height / 2]),
  ).toBe("");

  await window.mouse.move(handles.origin[0], handles.origin[1]);
  await window.keyboard.press("r");
  await expect(viewport(window)).not.toHaveAttribute("data-move-handles");

  // The object is still moved by a drag in the Rotate mode
  expect(await cursorAt(window, handles.origin)).toBe("move");

  await window.keyboard.press("g");
  await expect(viewport(window)).toHaveAttribute("data-move-handles", /X/);
});
