/**
 * SlicyWeb
 * Plate Check and Arrange End-To-End Tests
 *
 * Lot 101 (decision 103 of Noam, Q1 to Q10: A; GUI_SPEC.md, Plate Check,
 * Arrange; UNDO_REDO_SPEC.md 2.5.0):
 * - an object moved out of the plate is drawn in orange, shows the
 *   warning icon in the Object Panel and the message over the viewport;
 *   none of them without a printer;
 * - the key A and the button Arrange place the objects on the plate: the
 *   warning goes away; Ctrl+Z brings it back;
 * - Ctrl+D on an object against the right edge of the plate puts the copy
 *   inside the plate.
 *
 * Lot 104 (decision of Noam, Q1 A): in a window of 1280 px (its minimum
 * width), in French and in Hebrew, the message over the viewport never
 * touches the buttons Move, Rotate, Scale and Overhangs.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing)
 * - GUI_SPEC.md
 */

import en from "../../public/locales/en.json";
import fr from "../../public/locales/fr.json";
import he from "../../public/locales/he.json";

import {
  cubeStl,
  expect,
  importFiles,
  objectRows,
  openTab,
  test,
  transformField,
} from "./fixtures";

import type { Locator, Page } from "@playwright/test";

type Texts = Record<string, string>;

/** The message does not touch the buttons over the viewport */
async function expectApart(
  window: Page,
  texts: Texts,
  locator: Locator,
): Promise<void> {
  const message = await locator.boundingBox();
  expect(message).not.toBeNull();

  for (const name of [texts["transform.title"], texts["view.showOverhangs"]]) {
    const bar = await window.getByRole("toolbar", { name }).boundingBox();
    expect(bar).not.toBeNull();

    const apart =
      message!.x >= bar!.x + bar!.width ||
      bar!.x >= message!.x + message!.width ||
      message!.y >= bar!.y + bar!.height ||
      bar!.y >= message!.y + message!.height;
    expect(apart, `message over "${name}"`).toBe(true);
  }
}

/** Chooses a language in the Language menu, from the texts shown */
async function chooseLanguage(
  window: Page,
  texts: Texts,
  language: "french" | "hebrew",
): Promise<void> {
  await window.getByRole("menuitem", { name: texts["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: texts[`language.${language}`] })
    .click();
}

function viewport(window: Page) {
  return window.getByRole("img", { name: en["viewport.title"] });
}

function plateWarning(window: Page) {
  return window.locator("[data-plate-warning]");
}

function arrangeButton(window: Page) {
  return window
    .getByRole("toolbar", { name: en["toolbar.title"] })
    .getByRole("button", { name: en["edit.arrange"] });
}

/** Prusa MK4S: plate of 250 × 210 mm */
async function selectPrinter(window: Page): Promise<void> {
  await openTab(window, "printer");
  await window
    .getByLabel(en["printer.selector"])
    .selectOption({ label: "MK4S" });
  await openTab(window, "object");
}

async function setPositionX(window: Page, value: string): Promise<void> {
  const field = transformField(window, "position", "x");
  await field.fill(value);
  await field.press("Enter");
  await expect(field).toHaveValue(value);
}

/** Clicks a place without focus: the next keys go to the window */
async function leaveField(window: Page): Promise<void> {
  await window.getByRole("heading", { name: en["transform.title"] }).click();
}

test("warns as soon as an object leaves the plate, Arrange brings it back", async ({
  window,
  files,
  started,
}) => {
  await expect(arrangeButton(window)).toHaveAttribute("aria-disabled", "true");

  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expect(objectRows(window)).toHaveText(["cube.stl"]);
  await openTab(window, "object");

  // No printer, no plate: no warning
  await setPositionX(window, "300");
  await expect(viewport(window)).toHaveAttribute("data-outside-objects", "0");
  await expect(plateWarning(window)).toHaveCount(0);

  await selectPrinter(window);
  await expect(viewport(window)).toHaveAttribute("data-outside-objects", "1");
  await expect(plateWarning(window)).toHaveText(
    en["plate.outsideOne"].replace("{name}", "cube.stl"),
  );
  await expect(
    objectRows(window).locator("[data-outside-icon]"),
  ).toHaveAttribute(
    "aria-label",
    en["plate.outsideOne"].replace("{name}", "cube.stl"),
  );

  // Against the right edge (125 mm): inside
  await setPositionX(window, "115");
  await expect(viewport(window)).toHaveAttribute("data-outside-objects", "0");
  await expect(plateWarning(window)).toHaveCount(0);
  await expect(objectRows(window).locator("[data-outside-icon]")).toHaveCount(
    0,
  );

  // Key A: arranged in the center of the plate
  await setPositionX(window, "140");
  await expect(plateWarning(window)).toBeVisible();
  await leaveField(window);
  await window.keyboard.press("a");
  await expect(transformField(window, "position", "x")).toHaveValue("0");
  await expect(plateWarning(window)).toHaveCount(0);

  // Ctrl+Z: one action, the object back outside
  await window.keyboard.press("ControlOrMeta+z");
  await expect(transformField(window, "position", "x")).toHaveValue("140");
  await expect(plateWarning(window)).toBeVisible();

  // The button of the toolbar does the same
  await arrangeButton(window).click();
  await expect(transformField(window, "position", "x")).toHaveValue("0");
  await expect(viewport(window)).toHaveAttribute("data-outside-objects", "0");

  expect(started.errors).toEqual([]);
});

test("Ctrl+D near the right edge puts the copy inside the plate", async ({
  window,
  files,
  started,
}) => {
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expect(objectRows(window)).toHaveText(["cube.stl"]);
  await selectPrinter(window);

  // Against the right edge: the place to the right is outside
  await setPositionX(window, "115");
  await leaveField(window);
  await window.keyboard.press("ControlOrMeta+d");

  await expect(objectRows(window)).toHaveText(["cube (1)", "cube (2)"]);
  await expect(transformField(window, "position", "x")).not.toHaveValue("140");
  await expect(viewport(window)).toHaveAttribute("data-outside-objects", "0");
  await expect(plateWarning(window)).toHaveCount(0);

  // Two objects out: the message counts them
  await setPositionX(window, "300");
  await expect(plateWarning(window)).toHaveText(
    en["plate.outsideOne"].replace("{name}", "cube (2)"),
  );
  await objectRows(window).getByRole("button", { name: "cube (1)" }).click();
  await setPositionX(window, "-300");
  await expect(plateWarning(window)).toHaveText(
    en["plate.outsideMany"].replace("{count}", "2"),
  );
  await expect(viewport(window)).toHaveAttribute("data-outside-objects", "2");

  expect(started.errors).toEqual([]);
});

test("the messages over the viewport never touch the buttons at 1280 px", async ({
  window,
  files,
  started,
}) => {
  // Minimum width of the window (main process: minWidth 1280)
  await started.app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].setContentSize(1280, 720);
  });
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);
  await expect(objectRows(window)).toHaveText(["cube.stl"]);
  await selectPrinter(window);
  await setPositionX(window, "300");
  await expect(plateWarning(window)).toBeVisible();
  // The message of the import goes away by itself (3 s): the warning is
  // then the first message, at the top of the viewport
  await expect(
    window.getByText(en["import.done"].replace("{name}", "cube.stl")),
  ).toHaveCount(0);

  for (const [texts, previous, language] of [
    [fr, en, "french"],
    [he, fr, "hebrew"],
  ] as const) {
    await chooseLanguage(window, previous, language);
    await expect(plateWarning(window)).toHaveText(
      texts["plate.outsideOne"].replace("{name}", "cube.stl"),
    );
    await expectApart(window, texts, plateWarning(window));

    // A new import: its message comes first, above the warning
    const chooser = window.waitForEvent("filechooser");
    await window
      .getByRole("toolbar", { name: texts["toolbar.title"] })
      .getByRole("button", { name: texts["toolbar.import"] })
      .click();
    await (
      await chooser
    ).setFiles([files(`${language}.stl`, cubeStl(language, 10))]);
    const imported = window.getByText(
      texts["import.done"].replace("{name}", `${language}.stl`),
    );
    await expect(imported).toBeVisible();
    await expectApart(window, texts, imported);
    await expectApart(window, texts, plateWarning(window));
  }

  expect(started.errors).toEqual([]);
});
