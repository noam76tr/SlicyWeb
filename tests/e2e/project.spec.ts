/**
 * SlicyWeb
 * Project End-To-End Tests
 *
 * Phase 13 (lot 111, ADR-038; decision 119 of Noam, Q1 to Q22 A):
 * - Save As, New, Open: the object comes back value by value, with its
 *   name; title "• name — SlicyWeb" while modified; status bar; recent
 *   projects;
 * - "Save the changes?": Cancel, Don't Save; the close button of the
 *   window;
 * - a file refused (PROJ_002) changes nothing;
 * - automatic save, forced close (process killed), recovery at the next
 *   start, copy removed at a normal close;
 * - Hebrew: texts and buttons from right to left.
 *
 * The Windows dialogs of the main process are replaced by test functions
 * (they return the file of the test).
 *
 * Based on:
 * - GUI_SPEC.md (File Menu, Unsaved Changes Dialog, Recovery Dialog,
 *   Status Bar)
 * - IMPORT_EXPORT_SPEC.md 3.2.0
 * - TEST_PLAN.md (End-To-End Testing, Project Persistence)
 */

import fs from "node:fs";
import path from "node:path";

import type { ElectronApplication, Page } from "@playwright/test";

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

const UNTITLED = en["project.untitled"];

/** The next Save As dialog answers this file */
async function answerSave(app: ElectronApplication, file: string): Promise<void> {
  await app.evaluate(({ dialog }, filePath) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath });
  }, file);
}

/** The next Open dialog answers this file */
async function answerOpen(app: ElectronApplication, file: string): Promise<void> {
  await app.evaluate(({ dialog }, filePath) => {
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [filePath],
    });
  }, file);
}

/** Clicks an item of the File menu */
async function fileMenu(window: Page, key: string): Promise<void> {
  await window.getByRole("menuitem", { name: en["menu.file"] }).click();
  await window.getByRole("menuitem", { name: en[key as keyof typeof en] }).click();
  // The menu is closed (a shortcut is not read inside an open menu)
  await expect(window.getByRole("menu")).toHaveCount(0);
}

function projectStatus(window: Page) {
  return window.locator('[data-status-field="project-status"]');
}

/** Moves the selected object: Position X */
async function moveX(window: Page, value: string): Promise<void> {
  await openTab(window, "object");
  const field = transformField(window, "position", "x");
  await field.fill(value);
  await field.press("Enter");
  await expect(field).toHaveValue(value);
}

test("saves a project, starts a new one, then opens it again", async ({
  started,
  files,
}) => {
  const { app, window, errors } = started;
  const projectFile = files("projets/Mon cube.wyproj", "");
  fs.rmSync(projectFile);

  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expectObjectCount(window, 1);
  await moveX(window, "12.5");

  // Modified: "•" in the title, "modified" on the Project line
  await expect(window).toHaveTitle(`• ${UNTITLED} — SlicyWeb`);
  await expect(window.locator("[data-properties-project]")).toContainText(
    en["project.modified"],
  );
  await expect(projectStatus(window)).toContainText(
    en["project.status.modified"],
  );

  await answerSave(app, projectFile);
  await fileMenu(window, "project.saveAs");

  await expect(window).toHaveTitle("Mon cube — SlicyWeb");
  await expect(window.locator("[data-properties-project]")).toContainText(
    "Mon cube",
  );
  await expect(projectStatus(window)).toContainText(
    /Project saved|Saved at/,
  );
  expect(fs.existsSync(projectFile)).toBe(true);

  // New: not modified, no question
  await fileMenu(window, "project.new");
  await expectObjectCount(window, 0);
  await expect(window).toHaveTitle(`${UNTITLED} — SlicyWeb`);

  // Open: the object comes back with its position
  await answerOpen(app, projectFile);
  await window.keyboard.press("Control+o");
  await expectObjectCount(window, 1);
  await expect(objectRows(window)).toHaveText(["cube.stl"]);
  await expect(window).toHaveTitle("Mon cube — SlicyWeb");
  await objectRows(window).first().click();
  await openTab(window, "object");
  await expect(transformField(window, "position", "x")).toHaveValue("12.5");
  await expect(transformField(window, "position", "z")).toHaveValue("10");

  // Recent projects: the project, its full path on hover
  await window.getByRole("menuitem", { name: en["menu.file"] }).click();
  await window.locator("[data-recent-projects]").click();
  await expect(
    window.getByRole("menuitem", { name: "Mon cube", exact: true }),
  ).toHaveAttribute("title", projectFile);
  await window.keyboard.press("Escape");

  expect(errors).toEqual([]);
});

test("asks to save the changes: Cancel keeps the scene, Don't Save empties it", async ({
  window,
  files,
}) => {
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expectObjectCount(window, 1);

  const dialog = window.locator("[data-unsaved-changes]");

  await fileMenu(window, "project.new");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(`“${UNTITLED}”`);
  // Save has the focus
  await expect(
    dialog.getByRole("button", { name: en["action.save"], exact: true }),
  ).toBeFocused();

  await dialog.getByRole("button", { name: en["action.cancel"] }).click();
  await expect(dialog).toBeHidden();
  await expectObjectCount(window, 1);

  // Escape is Cancel
  await fileMenu(window, "project.close");
  await expect(dialog).toBeVisible();
  await window.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expectObjectCount(window, 1);

  await window.keyboard.press("Control+n");
  await dialog
    .getByRole("button", { name: en["project.unsaved.discard"] })
    .click();
  await expectObjectCount(window, 0);
  await expect(window).toHaveTitle(`${UNTITLED} — SlicyWeb`);
});

test("the close button of the window asks to save the changes", async ({
  started,
  files,
}) => {
  const { app, window } = started;

  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expectObjectCount(window, 1);

  // As the close button of the window
  await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].close();
  });

  const dialog = window.locator("[data-unsaved-changes]");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: en["action.cancel"] }).click();
  await expectObjectCount(window, 1);

  const closed = app.waitForEvent("close");
  await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].close();
  });
  await dialog
    .getByRole("button", { name: en["project.unsaved.discard"] })
    .click();
  await closed;
});

test("a damaged project is refused and changes nothing (PROJ_002)", async ({
  started,
  files,
}) => {
  const { app, window } = started;

  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expectObjectCount(window, 1);

  const damaged = files("damaged.wyproj", '{ "format": "WYPROJ", ');
  await answerOpen(app, damaged);

  await fileMenu(window, "project.open");
  await window
    .locator("[data-unsaved-changes]")
    .getByRole("button", { name: en["project.unsaved.discard"] })
    .click();

  await expect(
    window.locator('[data-project-message="project.error.PROJ_002"]'),
  ).toContainText("PROJ_002");
  await expectObjectCount(window, 1);
  await expect(window).toHaveTitle(`• ${UNTITLED} — SlicyWeb`);
});

test("recovers the project after a forced close; the copy is removed at a normal close", async ({
  userDataDir,
  launch,
  files,
}) => {
  // Automatic save every 5 seconds (the shortest interval)
  fs.writeFileSync(
    path.join(userDataDir, "settings.json"),
    JSON.stringify({
      preferences: {
        theme: "dark",
        language: "en",
        units: "metric",
        project: { autoSave: true, autoSaveInterval: 5 },
      },
    }),
  );

  const recovery = path.join(userDataDir, "recovery");
  const first = await launch();

  await importFiles(first.window, [files("cube.stl", cubeStl("cube", 20))]);
  await expectObjectCount(first.window, 1);
  await moveX(first.window, "7");

  // The copy is written within the interval
  await expect
    .poll(() => fs.existsSync(path.join(recovery, "autosave.json")), {
      timeout: 20_000,
    })
    .toBe(true);

  // Forced close (as "End task" in the Windows Task Manager)
  first.app.process().kill("SIGKILL");
  await first.app.waitForEvent("close").catch(() => undefined);

  const second = await launch();
  const dialog = second.window.locator("[data-recovery]");

  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(en["project.recovery.title"]);
  await expect(dialog).toContainText(`“${UNTITLED}”`);
  await dialog
    .getByRole("button", { name: en["project.recovery.restore"] })
    .click();

  await expectObjectCount(second.window, 1);
  await expect(second.window).toHaveTitle(`• ${UNTITLED} — SlicyWeb`);
  await objectRows(second.window).first().click();
  await openTab(second.window, "object");
  await expect(transformField(second.window, "position", "x")).toHaveValue(
    "7",
  );

  // Exit, Don't Save: the copy is removed
  const closed = second.app.waitForEvent("close");
  await fileMenu(second.window, "app.exit");
  await second.window
    .locator("[data-unsaved-changes]")
    .getByRole("button", { name: en["project.unsaved.discard"] })
    .click();
  await closed;

  expect(
    fs.readdirSync(recovery).filter((name) => name !== "quarantine"),
  ).toEqual([]);

  // Next start: nothing to recover
  const third = await launch();
  await expect(third.window.getByRole("menubar")).toBeVisible();
  await expect(third.window.locator("[data-recovery]")).toHaveCount(0);
  expect(third.errors).toEqual([]);
});

test("Hebrew: the question and the project from right to left", async ({
  launch,
  files,
}) => {
  const { window } = await launch();

  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expectObjectCount(window, 1);

  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.hebrew"] })
    .click();
  await expect(window.getByRole("menu")).toHaveCount(0);
  await expect(window).toHaveTitle(`• ${he["project.untitled"]} — SlicyWeb`);
  await expect(window.locator("[data-properties-project]")).toContainText(
    he["project.modified"],
  );

  await window.keyboard.press("Control+n");

  const dialog = window.locator("[data-unsaved-changes]");
  await expect(dialog).toContainText(
    he["project.unsaved.title"].replace("{name}", he["project.untitled"]),
  );

  // From right to left: Save (first to read) is at the left end
  const save = await dialog
    .getByRole("button", { name: he["action.save"], exact: true })
    .boundingBox();
  const cancel = await dialog
    .getByRole("button", { name: he["action.cancel"] })
    .boundingBox();
  expect(save!.x).toBeLessThan(cancel!.x);

  await dialog.getByRole("button", { name: he["action.cancel"] }).click();
  await expect(dialog).toBeHidden();
});
