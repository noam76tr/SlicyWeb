/**
 * SlicyWeb
 * Rotate And Scale Gizmo End-To-End Tests
 *
 * Rings of the Rotate mode and handles of the Scale mode (lot 103,
 * decisions of Noam Q1 to Q4 A, Q5 B; GUI_SPEC.md, Rotate Gizmo, Scale
 * Gizmo): the rings are around the object and are grabbed only outside
 * it; the handles of Scale are beside the object, to the right, the front
 * and the top of the plate, also when the object is turned; a drag
 * anywhere else on the object moves it freely.
 *
 * data-rotate-rings (set by the viewport at each frame): for each ring,
 * its point farthest from the center ("X") and nearest to it
 * ("X-inner"), and the center ("origin"), in pixels of the canvas;
 * data-scale-handles: middle of the handles X, Y, Z and the center.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing)
 * - GUI_SPEC.md (Rotate Gizmo, Scale Gizmo, Viewport Controls)
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

function viewport(window: Page) {
  return window.getByRole("img", { name: en["viewport.title"] });
}

function modeButton(
  window: Page,
  key: "transform.move" | "transform.rotate" | "transform.scale",
) {
  return window
    .getByRole("toolbar", { name: en["transform.title"] })
    .getByRole("button", { name: en[key] });
}

/** Handles of a gizmo, in pixels of the window */
async function gizmoPoints(
  window: Page,
  attribute: "data-rotate-rings" | "data-scale-handles",
): Promise<Record<string, Point>> {
  const canvas = viewport(window).locator("canvas");
  await expect(viewport(window)).toHaveAttribute(attribute, /origin/);
  // The handles follow the last change at the next frame
  await window.waitForTimeout(100);
  const box = await canvas.boundingBox();
  const text = await viewport(window).getAttribute(attribute);

  if (!box || !text) {
    throw new Error("Gizmo not shown");
  }

  const points = JSON.parse(text) as Record<string, Point>;

  return Object.fromEntries(
    Object.entries(points).map(([key, point]) => [
      key,
      [box.x + point[0], box.y + point[1]],
    ]),
  );
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

/**
 * The object was moved (Position X no longer 0) and stands on the plate;
 * the Position row is shown in the Move mode
 */
async function expectMoved(window: Page): Promise<void> {
  await modeButton(window, "transform.move").click();
  await expect(transformField(window, "position", "x")).not.toHaveValue("0");
}

async function typeValue(
  window: Page,
  row: "rotation" | "scale",
  axis: "x" | "y" | "z",
  value: string,
): Promise<void> {
  const field = transformField(window, row, axis);
  await field.fill(value);
  await field.press("Enter");
}

async function importCube(
  window: Page,
  files: (name: string, content: string) => string,
  size: number,
): Promise<void> {
  await openTab(window, "object");
  await importFiles(window, [files("cube.stl", cubeStl("cube", size))]);
  await expect(transformField(window, "position", "z")).toHaveValue(
    String(size / 2),
  );
}

test("the rings are around the object: a press on the object moves it, a press on a ring outside turns it", async ({
  window,
  files,
}) => {
  await importCube(window, files, 80);
  await modeButton(window, "transform.rotate").click();
  await expect(viewport(window)).not.toHaveAttribute("data-move-handles");
  const rings = await gizmoPoints(window, "data-rotate-rings");

  // Where the ring X passes over the cube, the cube is grabbed (Q3 A)
  expect(await cursorAt(window, rings["X-inner"])).toBe("move");
  expect(await cursorAt(window, rings.origin)).toBe("move");
  await drag(window, rings["X-inner"], [
    rings["X-inner"][0] + 60,
    rings["X-inner"][1] + 30,
  ]);
  await expect(transformField(window, "rotation", "x")).toHaveValue("0");
  await expect(transformField(window, "rotation", "z")).toHaveValue("0");
  await expectMoved(window);
  await modeButton(window, "transform.rotate").click();

  // Outside the cube, the ring Z is grabbed: it turns around Z only
  const moved = await gizmoPoints(window, "data-rotate-rings");
  expect(await cursorAt(window, moved.Z)).toBe("pointer");
  const radius: Point = [
    moved.Z[0] - moved.origin[0],
    moved.Z[1] - moved.origin[1],
  ];
  await drag(window, moved.Z, [
    moved.origin[0] - radius[1] * 0.8 + radius[0] * 0.5,
    moved.origin[1] + radius[0] * 0.8 + radius[1] * 0.5,
  ]);

  const rotationZ = transformField(window, "rotation", "z");
  await expect(rotationZ).not.toHaveValue("0");
  await expect(transformField(window, "rotation", "x")).toHaveValue("0");
  await expect(transformField(window, "rotation", "y")).toHaveValue("0");
  // One action of the history
  await window.keyboard.press("ControlOrMeta+z");
  await expect(rotationZ).toHaveValue("0");
});

test("the rings are shown in the Rotate mode only", async ({
  window,
  files,
}) => {
  await importCube(window, files, 20);
  await expect(viewport(window)).not.toHaveAttribute("data-rotate-rings");
  await modeButton(window, "transform.rotate").click();
  await gizmoPoints(window, "data-rotate-rings");
  await modeButton(window, "transform.scale").click();
  await expect(viewport(window)).not.toHaveAttribute("data-rotate-rings");
  await gizmoPoints(window, "data-scale-handles");
  await modeButton(window, "transform.move").click();
  await expect(viewport(window)).not.toHaveAttribute("data-scale-handles");
});

test("Scale: Z on top, X on the right, Y in front, also after a rotation of 180 degrees", async ({
  window,
  files,
}) => {
  await importCube(window, files, 20);

  for (const rotationX of ["0", "180"]) {
    await modeButton(window, "transform.rotate").click();
    await typeValue(window, "rotation", "x", rotationX);
    await modeButton(window, "transform.scale").click();

    const handles = await gizmoPoints(window, "data-scale-handles");

    // Isometric view: +X goes to the lower right, -Y (front) to the lower
    // left, +Z up
    expect(handles.Z[1]).toBeLessThan(handles.origin[1] - 10);
    expect(handles.X[0]).toBeGreaterThan(handles.origin[0] + 10);
    expect(handles.Y[0]).toBeLessThan(handles.origin[0] - 10);
    expect(handles.X[1]).toBeGreaterThan(handles.origin[1]);
    expect(handles.Y[1]).toBeGreaterThan(handles.origin[1]);
  }
});

test("Scale: the cube is grabbed outside the handles; a handle scales one axis with the lock open", async ({
  window,
  files,
}) => {
  await importCube(window, files, 20);
  await modeButton(window, "transform.scale").click();
  const handles = await gizmoPoints(window, "data-scale-handles");

  expect(await cursorAt(window, handles.origin)).toBe("move");
  expect(await cursorAt(window, handles.Z)).toBe("pointer");

  // Lock open: the handle Z changes Scale Z only
  await window
    .getByRole("button", { name: en["transform.keepProportions"] })
    .click();
  await drag(window, handles.Z, [handles.Z[0], handles.Z[1] - 40]);

  const scaleZ = transformField(window, "scale", "z");
  await expect(scaleZ).not.toHaveValue("100");
  expect(Number((await scaleZ.inputValue()).replace(",", "."))).toBeGreaterThan(
    100,
  );
  await expect(transformField(window, "scale", "x")).toHaveValue("100");
  await expect(transformField(window, "scale", "y")).toHaveValue("100");

  await window.keyboard.press("ControlOrMeta+z");
  await expect(scaleZ).toHaveValue("100");

  // A drag from the center of the cube moves it
  await drag(window, handles.origin, [
    handles.origin[0] + 50,
    handles.origin[1] + 20,
  ]);
  await expect(transformField(window, "scale", "z")).toHaveValue("100");
  await expectMoved(window);
});

test("Scale: after a rotation X = 90, the green handle is on top and changes Scale Y", async ({
  window,
  files,
}) => {
  await importCube(window, files, 20);
  await modeButton(window, "transform.rotate").click();
  await typeValue(window, "rotation", "x", "90");
  await modeButton(window, "transform.scale").click();
  const handles = await gizmoPoints(window, "data-scale-handles");

  expect(handles.Y[1]).toBeLessThan(handles.origin[1] - 10);

  await window
    .getByRole("button", { name: en["transform.keepProportions"] })
    .click();
  await drag(window, handles.Y, [handles.Y[0], handles.Y[1] - 40]);

  await expect(transformField(window, "scale", "y")).not.toHaveValue("100");
  await expect(transformField(window, "scale", "x")).toHaveValue("100");
  await expect(transformField(window, "scale", "z")).toHaveValue("100");
});
