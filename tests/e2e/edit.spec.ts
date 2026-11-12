/**
 * SlicyWeb
 * Edit End-To-End Tests
 *
 * Edit > Delete and Edit > Duplicate in the built application (lot 100;
 * GUI_SPEC.md, Edit Menu, Keyboard Shortcuts, Delete Confirmation;
 * UNDO_REDO_SPEC.md 2.4.0):
 * - Delete key: one object deleted at once, Ctrl+Z puts it back with its
 *   analysis up to date, Ctrl+Y deletes it again;
 * - several objects: confirmation "Delete 2 objects?", Escape deletes
 *   nothing, Enter deletes (Delete has the focus);
 * - Edit > Duplicate and Ctrl+D: copy right of the original (size + 5 mm),
 *   named "cube (2)", selected, analyzed by itself; undo and redo;
 * - the confirmation in French.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing)
 * - GUI_SPEC.md
 * - UNDO_REDO_SPEC.md
 */

import en from "../../public/locales/en.json";
import fr from "../../public/locales/fr.json";

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

/** Clicks a place without focus: the next keys go to the window */
async function leaveField(window: Page): Promise<void> {
  await window.getByRole("heading", { name: en["transform.title"] }).click();
}

/** Status of the analysis of the selected object, in the status bar */
async function expectAnalysisUpToDate(window: Page): Promise<void> {
  await expect(window.getByRole("contentinfo")).toContainText(
    `${en["statusBar.analysisStatus"]}:${en["result.generated"]}`,
  );
}

function editItem(window: Page, key: "edit.duplicate" | "edit.delete") {
  return window.getByRole("menuitem", { name: new RegExp(`^${en[key]}`) });
}

async function openEditMenu(window: Page): Promise<void> {
  await window.getByRole("menuitem", { name: en["menu.edit"] }).click();
}

// The Object tab holds the Transform and Analysis sections (lot 93)
test.beforeEach(async ({ window }) => {
  await openTab(window, "object");
});

test("deletes one object with the Delete key, Ctrl+Z puts it back analyzed", async ({
  window,
  files,
  started,
}) => {
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expectAnalysisUpToDate(window);
  await expectObjectCount(window, 1);

  await leaveField(window);
  await window.keyboard.press("Delete");
  await expectObjectCount(window, 0);
  await expect(objectRows(window)).toHaveCount(0);

  await window.keyboard.press("ControlOrMeta+z");
  await expectObjectCount(window, 1);
  await expect(objectRows(window)).toHaveText(["cube.stl"]);
  // Put back selected, with its analysis: no new analysis
  await expect(transformField(window, "position", "z")).toHaveValue("10");
  await expectAnalysisUpToDate(window);

  await window.keyboard.press("ControlOrMeta+y");
  await expectObjectCount(window, 0);

  expect(started.errors).toEqual([]);
});

test("asks before deleting several objects", async ({ window, files }) => {
  await importFiles(window, [
    files("a.stl", cubeStl("a", 10)),
    files("b.stl", cubeStl("b", 10)),
  ]);
  await expectObjectCount(window, 2);

  await leaveField(window);
  await window.keyboard.press("ControlOrMeta+a");
  await window.keyboard.press("Delete");

  const dialog = window.getByRole("dialog");
  await expect(dialog).toContainText(
    en["edit.deleteConfirmTitle"].replace("{count}", "2"),
  );
  await expect(
    dialog.getByRole("button", { name: en["action.delete"] }),
  ).toBeFocused();

  // Escape: nothing deleted
  await window.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expectObjectCount(window, 2);

  // Edit > Delete, then Enter
  await openEditMenu(window);
  await editItem(window, "edit.delete").click();
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: en["action.delete"] }),
  ).toBeFocused();
  await window.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expectObjectCount(window, 0);

  // One action for both
  await window.keyboard.press("ControlOrMeta+z");
  await expectObjectCount(window, 2);
  await expect(objectRows(window)).toHaveText(["a.stl", "b.stl"]);
});

test("duplicates with the Edit menu and Ctrl+D, undo and redo", async ({
  window,
  files,
  started,
}) => {
  await openEditMenu(window);
  await expect(editItem(window, "edit.duplicate")).toBeDisabled();
  await expect(editItem(window, "edit.delete")).toBeDisabled();
  await window.keyboard.press("Escape");

  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expectAnalysisUpToDate(window);

  await openEditMenu(window);
  await editItem(window, "edit.duplicate").click();

  // Right of the original: 20 mm + 5 mm; the copy is selected
  await expect(objectRows(window)).toHaveText(["cube (1)", "cube (2)"]);
  await expect(
    objectRows(window).getByRole("button", { pressed: true }),
  ).toHaveText(["cube (2)"]);
  await expect(transformField(window, "position", "x")).toHaveValue("25");
  await expect(transformField(window, "position", "y")).toHaveValue("0");
  // Analyzed by itself, like an imported object
  await expectAnalysisUpToDate(window);

  await leaveField(window);
  await window.keyboard.press("ControlOrMeta+d");
  await expect(objectRows(window)).toHaveCount(3);
  await expect(transformField(window, "position", "x")).toHaveValue("50");

  await window.keyboard.press("ControlOrMeta+z");
  await expect(objectRows(window)).toHaveCount(2);
  await window.keyboard.press("ControlOrMeta+z");
  await expect(objectRows(window)).toHaveText(["cube.stl"]);
  await window.keyboard.press("ControlOrMeta+y");
  await expect(objectRows(window)).toHaveCount(2);
  await expect(transformField(window, "position", "x")).toHaveValue("25");

  expect(started.errors).toEqual([]);
});

test("asks in French", async ({ window, files }) => {
  await importFiles(window, [
    files("a.stl", cubeStl("a", 10)),
    files("b.stl", cubeStl("b", 10)),
  ]);
  await expect(objectRows(window)).toHaveCount(2);

  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.french"] })
    .click();
  await expect(
    window.getByRole("menuitem", { name: fr["menu.edit"] }),
  ).toBeVisible();

  await window.getByRole("menuitem", { name: fr["menu.edit"] }).click();
  await window
    .getByRole("menuitem", { name: new RegExp(`^${fr["edit.selectAll"]}`) })
    .click();
  await window.getByRole("menuitem", { name: fr["menu.edit"] }).click();
  await window
    .getByRole("menuitem", { name: new RegExp(`^${fr["edit.delete"]}`) })
    .click();

  const dialog = window.getByRole("dialog");
  await expect(dialog).toContainText(
    fr["edit.deleteConfirmTitle"].replace("{count}", "2"),
  );
  await expect(dialog).toContainText(fr["edit.deleteConfirmUndo"]);
  await dialog.getByRole("button", { name: fr["action.cancel"] }).click();
  await expect(dialog).toBeHidden();
  await expect(
    window
      .getByRole("list", { name: fr["objects.title"] })
      .getByRole("listitem"),
  ).toHaveCount(2);
});
