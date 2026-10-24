/**
 * SlicyWeb
 * Transform End-To-End Tests
 *
 * Transform System of Phase 6 in the built application (GUI_SPEC.md,
 * Transform Section, Multi Selection, Keyboard Shortcuts;
 * UNDO_REDO_SPEC.md):
 * - fields of the Transform section, object kept on the plate;
 * - undo and redo: toolbar, Ctrl+Z and Ctrl+Y in a field (control 16 of
 *   lot 51: typing not applied yet is undone first, no extra action when
 *   the field is left);
 * - modes G, R, S and Escape;
 * - several objects: Ctrl+A, Shift+click in the Object Panel, selection
 *   rectangle in the 3D viewport, click in the empty space.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing)
 * - GUI_SPEC.md
 * - UNDO_REDO_SPEC.md
 */

import en from "../../public/locales/en.json";

import {
  cubeStl,
  expect,
  importFiles,
  objectRows,
  test,
  transformField,
} from "./fixtures";

import type { Page } from "@playwright/test";

function toolbarButton(window: Page, key: "toolbar.undo" | "toolbar.redo") {
  return window
    .getByRole("toolbar", { name: en["toolbar.title"] })
    .getByRole("button", { name: en[key] });
}

function modeButton(
  window: Page,
  key: "transform.move" | "transform.rotate" | "transform.scale",
) {
  return window
    .getByRole("toolbar", { name: en["transform.title"] })
    .getByRole("button", { name: en[key] });
}

/** Clicks a place without focus: the next keys go to the window */
async function leaveField(window: Page): Promise<void> {
  await window.getByRole("heading", { name: en["transform.title"] }).click();
}

test.describe("one object", () => {
  test.beforeEach(async ({ window, files }) => {
    await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
    await expect(transformField(window, "position", "z")).toHaveValue("10");
  });

  test("applies a field and keeps the object on the plate", async ({
    window,
  }) => {
    const scaleX = transformField(window, "scale", "x");
    await scaleX.fill("50");
    await scaleX.press("Enter");

    // Lock closed: uniform scale, cube of 10 mm, center at Z = 5
    await expect(transformField(window, "scale", "z")).toHaveValue("50");
    await expect(transformField(window, "position", "z")).toHaveValue("5");

    const positionX = transformField(window, "position", "x");
    await positionX.fill("12,5");
    await positionX.press("Enter");
    await expect(positionX).toHaveValue("12.5");
  });

  test("undoes and redoes with the toolbar", async ({ window }) => {
    const undo = toolbarButton(window, "toolbar.undo");
    const redo = toolbarButton(window, "toolbar.redo");
    await expect(undo).toBeDisabled();

    const positionX = transformField(window, "position", "x");
    await positionX.fill("30");
    await positionX.press("Enter");
    await expect(undo).toBeEnabled();

    await undo.click();
    await expect(positionX).toHaveValue("0");
    await expect(undo).toBeDisabled();

    await redo.click();
    await expect(positionX).toHaveValue("30");
    await expect(redo).toBeDisabled();
  });

  test("Ctrl+Z in a field with nothing pending undoes the object at once", async ({
    window,
  }) => {
    const undo = toolbarButton(window, "toolbar.undo");
    const redo = toolbarButton(window, "toolbar.redo");
    const scaleX = transformField(window, "scale", "x");

    await scaleX.fill("50");
    await scaleX.press("Enter");
    await expect(transformField(window, "position", "z")).toHaveValue("5");

    // The cursor back in the field, the value already applied
    await scaleX.click();
    await scaleX.press("ControlOrMeta+z");
    await expect(transformField(window, "position", "z")).toHaveValue("10");
    await expect(scaleX).toHaveValue("100");
    await expect(undo).toBeDisabled();
    await expect(redo).toBeEnabled();

    // Leaving the field adds no action
    await leaveField(window);
    await expect(undo).toBeDisabled();
    await expect(redo).toBeEnabled();

    await scaleX.click();
    await scaleX.press("ControlOrMeta+y");
    await expect(scaleX).toHaveValue("50");
    await expect(transformField(window, "position", "z")).toHaveValue("5");
  });

  test("Ctrl+Z in a field undoes the typing not applied yet", async ({
    window,
  }) => {
    const undo = toolbarButton(window, "toolbar.undo");
    const positionX = transformField(window, "position", "x");

    await positionX.fill("30");
    await positionX.press("Enter");
    await expect(undo).toBeEnabled();

    await positionX.fill("70");
    await positionX.press("ControlOrMeta+z");
    // Typing undone, the object stays at X = 30
    await expect(positionX).toHaveValue("30");
    await leaveField(window);
    await expect(positionX).toHaveValue("30");

    // One action only: undo goes back to X = 0, then nothing is left
    await undo.click();
    await expect(positionX).toHaveValue("0");
    await expect(undo).toBeDisabled();
  });

  test("chooses the mode with G, R, S and deselects with Escape", async ({
    window,
  }) => {
    await leaveField(window);

    await window.keyboard.press("r");
    await expect(modeButton(window, "transform.rotate")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(transformField(window, "rotation", "z")).toBeVisible();

    await window.keyboard.press("s");
    await expect(modeButton(window, "transform.scale")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(transformField(window, "size", "x")).toHaveValue("20");

    await window.keyboard.press("g");
    await expect(modeButton(window, "transform.move")).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await window.keyboard.press("Escape");
    await expect(
      objectRows(window).getByRole("button", { pressed: true }),
    ).toHaveCount(0);
    await expect(modeButton(window, "transform.move")).toBeDisabled();
  });
});

test.describe("several objects", () => {
  test.beforeEach(async ({ window, files }) => {
    await importFiles(window, [
      files("a.stl", cubeStl("a", 10)),
      files("b.stl", cubeStl("b", 10)),
      files("c.stl", cubeStl("c", 10)),
    ]);
    await expect(objectRows(window)).toHaveCount(3);
  });

  /** Names of the objects pressed (selected) in the Object Panel */
  async function selectedNames(window: Page): Promise<string[]> {
    return objectRows(window)
      .getByRole("button", { pressed: true })
      .allTextContents();
  }

  test("selects all with Ctrl+A and the range with Shift+click", async ({
    window,
  }) => {
    await leaveField(window);
    await window.keyboard.press("ControlOrMeta+a");
    await expect
      .poll(() => selectedNames(window))
      .toEqual(["a.stl", "b.stl", "c.stl"]);
    await expect(window.getByRole("contentinfo")).toContainText(
      en["object.multipleSelected"].replace("{count}", "3"),
    );

    const rows = objectRows(window);
    await rows.nth(0).getByRole("button", { name: "a.stl" }).click();
    await expect.poll(() => selectedNames(window)).toEqual(["a.stl"]);
    await rows
      .nth(1)
      .getByRole("button", { name: "b.stl" })
      .click({
        modifiers: ["Shift"],
      });
    await expect.poll(() => selectedNames(window)).toEqual(["a.stl", "b.stl"]);
  });

  for (const start of ["top", "bottom"] as const) {
    test(`selects with a rectangle from the ${start} corner and deselects with a click in the empty space`, async ({
      window,
    }) => {
      const viewport = window.getByRole("img", { name: en["viewport.title"] });
      const box = await viewport.boundingBox();
      if (!box) {
        throw new Error("3D viewport not shown");
      }

      // Top: under the import messages, shown at the top of the view
      // (lot 55: a message must not stop the clicks under it)
      const corner = {
        x: box.x + box.width - 20,
        y: start === "top" ? box.y + 20 : box.y + box.height - 20,
      };
      const end = {
        x: box.x + 20,
        y: start === "top" ? box.y + box.height - 20 : box.y + 80,
      };

      if (start === "top") {
        const message = await window
          .getByRole("status")
          .filter({ hasText: "a.stl" })
          .boundingBox();
        expect(message).not.toBeNull();
        expect(corner.x).toBeGreaterThan(message!.x);
        expect(corner.x).toBeLessThan(message!.x + message!.width);
        expect(corner.y).toBeGreaterThan(message!.y);
        expect(corner.y).toBeLessThan(message!.y + message!.height);
      }

      // A click in the empty space clears the selection
      await window.mouse.click(corner.x, corner.y);
      await expect.poll(() => selectedNames(window)).toEqual([]);

      // Rectangle over the whole view, from the empty corner
      await window.mouse.move(corner.x, corner.y);
      await window.mouse.down();
      await window.mouse.move(end.x, end.y, { steps: 10 });
      await window.mouse.up();
      await expect
        .poll(() => selectedNames(window))
        .toEqual(["a.stl", "b.stl", "c.stl"]);

      await window.mouse.click(corner.x, corner.y);
      await expect.poll(() => selectedNames(window)).toEqual([]);
    });
  }

  test("moves the group with the Transform section, one action", async ({
    window,
  }) => {
    await leaveField(window);
    await window.keyboard.press("ControlOrMeta+a");
    const positionX = transformField(window, "position", "x");
    await positionX.fill("40");
    await positionX.press("Enter");
    await expect(positionX).toHaveValue("40");

    // Each object moved by 40 mm: select one, read its position
    await objectRows(window)
      .nth(0)
      .getByRole("button", { name: "a.stl" })
      .click();
    await expect(positionX).toHaveValue("40");

    await toolbarButton(window, "toolbar.undo").click();
    await expect(positionX).toHaveValue("0");
    await expect(toolbarButton(window, "toolbar.undo")).toBeDisabled();
  });
});
