/**
 * SlicyWeb
 * Rename, Hide and Lock End-To-End Tests
 *
 * Lot 106 (decision 112 of Noam, Q1 to Q18 A; GUI_SPEC.md, Object Panel,
 * Object Context Menu, Keyboard Shortcuts):
 * - rename by a double-click on the row (Enter), by F2 in the viewport,
 *   by the context menu; Escape cancels; the status bar shows the name;
 * - the eye hides the object of its row; H hides the selection; Alt+H
 *   shows all the objects, in English, French and Hebrew, and opens no
 *   menu of the Menu Bar (Help);
 * - the padlock locks: a drag on the object moves nothing, the Transform
 *   fields are read only.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing)
 * - GUI_SPEC.md (Object Panel, Keyboard Shortcuts)
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

import type { Page } from "@playwright/test";

type Point = [number, number];

function viewport(window: Page) {
  return window.locator("#renderer-container");
}

async function objectCenter(window: Page): Promise<Point> {
  await expect(viewport(window)).toHaveAttribute("data-move-handles", /X/);
  const box = await viewport(window).locator("canvas").boundingBox();
  const text = await viewport(window).getAttribute("data-move-handles");
  const { origin } = JSON.parse(text!) as { origin: Point };

  return [box!.x + origin[0], box!.y + origin[1]];
}

/** No element keeps the focus (the keys go to the window) */
async function blur(window: Page): Promise<void> {
  await window.evaluate(() => (document.activeElement as HTMLElement)?.blur());
}

/** Rows of the Object Panel, in every language */
function rows(window: Page) {
  return window.locator("li:has([data-visibility-toggle])");
}

function hiddenRows(window: Page) {
  return window.locator("li[data-hidden]");
}

function row(window: Page, index: number) {
  return rows(window).nth(index);
}

function nameField(window: Page) {
  return window.getByRole("textbox", { name: en["objects.nameField"] });
}

async function statusName(window: Page): Promise<string> {
  return (await window.getByRole("contentinfo").textContent()) ?? "";
}

test.beforeEach(async ({ window, files }) => {
  await openTab(window, "object");
  await importFiles(window, [
    files("cube.stl", cubeStl("cube", 20)),
    files("base.stl", cubeStl("base", 10)),
  ]);
  await expect(objectRows(window)).toHaveCount(2);
});

test("rename: double-click and Enter, F2 and Escape, empty name", async ({
  window,
}) => {
  await row(window, 0).locator("[data-object-row]").dblclick();
  await expect(nameField(window)).toBeFocused();
  await expect(nameField(window)).toHaveValue("cube.stl");
  // The double-click keeps the object selected
  expect(await statusName(window)).toContain("cube.stl");

  await nameField(window).fill("Boîtier");
  await window.keyboard.press("Enter");
  await expect(nameField(window)).toHaveCount(0);
  await expect(row(window, 0)).toContainText("Boîtier");
  expect(await statusName(window)).toContain("Boîtier");

  // F2 with the object selected in the viewport, Escape cancels
  await blur(window);
  await window.keyboard.press("F2");
  await expect(nameField(window)).toBeFocused();
  await nameField(window).fill("Autre");
  await window.keyboard.press("Escape");
  await expect(row(window, 0)).toContainText("Boîtier");
  // Escape in the field does not clear the selection
  expect(await statusName(window)).toContain("Boîtier");

  // Undo gives the file name back
  await window.keyboard.press("Control+z");
  await expect(row(window, 0)).toContainText("cube.stl");

  // Rename of the context menu, then an empty name: the file name
  await row(window, 0).locator("[data-object-row]").click({
    button: "right",
  });
  await window
    .getByRole("menuitem", { name: new RegExp(`^${en["contextMenu.rename"]}`) })
    .click();
  await expect(nameField(window)).toBeFocused();
  await nameField(window).fill("   ");
  await window.keyboard.press("Enter");
  await expect(row(window, 0)).toContainText("cube.stl");
});

test("rename: two objects with the same name are numbered", async ({
  window,
}) => {
  for (const index of [0, 1]) {
    await row(window, index).locator("[data-object-row]").dblclick();
    await nameField(window).fill("Support");
    await window.keyboard.press("Enter");
  }

  await expect(row(window, 0)).toContainText("Support (1)");
  await expect(row(window, 1)).toContainText("Support (2)");
});

test("hide with the eye and H, show all with Alt+H in three languages", async ({
  window,
}) => {
  // Eye of the first row: hidden, row in gray, not selected
  await row(window, 0).locator("[data-visibility-toggle]").click();
  await expect(row(window, 0)).toHaveAttribute("data-hidden", "");
  await expect(row(window, 0).locator("[data-object-row]")).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  // Ctrl+A selects the other only; H hides it
  await blur(window);
  await window.keyboard.press("Control+a");
  await expect(row(window, 1).locator("[data-object-row]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await window.keyboard.press("h");
  await expect(row(window, 1)).toHaveAttribute("data-hidden", "");

  const dictionaries = [
    { dictionary: en, key: "language.english" },
    { dictionary: fr, key: "language.french" },
    { dictionary: he, key: "language.hebrew" },
  ];
  let current: Record<string, string> = en;

  for (const { dictionary, key } of dictionaries) {
    if (dictionary !== en) {
      await window
        .getByRole("menuitem", { name: current["menu.language"] })
        .click();
      await window.getByRole("menuitemradio", { name: current[key] }).click();
      current = dictionary;
    }

    // Both hidden, then Alt+H shows them, and no menu opens
    await expect(hiddenRows(window)).toHaveCount(2);

    await blur(window);
    await window.keyboard.press("Alt+h");

    await expect(hiddenRows(window)).toHaveCount(0);
    await expect(window.getByRole("menu")).toHaveCount(0);
    await expect(
      window.getByRole("menuitem", { name: dictionary["help.about"] }),
    ).toHaveCount(0);

    // Hidden again for the next language
    await row(window, 0).locator("[data-visibility-toggle]").click();
    await row(window, 1).locator("[data-visibility-toggle]").click();
  }
});

test("lock: a drag moves nothing, the Transform fields are read only", async ({
  window,
}) => {
  await row(window, 0).locator("[data-object-row]").click();
  const center = await objectCenter(window);
  const x = await transformField(window, "position", "x").inputValue();

  await row(window, 0).locator("[data-lock-toggle]").click();
  await expect(row(window, 0)).toHaveAttribute("data-locked", "");
  await expect(transformField(window, "position", "x")).toHaveAttribute(
    "readonly",
    "",
  );
  await expect(window.locator("[data-transform-blocked]")).toHaveText(
    en["transform.locked"],
  );
  // No handles on a locked object
  await expect(viewport(window)).not.toHaveAttribute("data-move-handles", /X/);

  await window.mouse.move(center[0], center[1]);
  await window.mouse.down();
  await window.mouse.move(center[0] + 80, center[1] + 30, { steps: 10 });
  await window.mouse.up();

  await expect(transformField(window, "position", "x")).toHaveValue(x);

  // Unlocked: the drag moves it again
  await row(window, 0).locator("[data-lock-toggle]").click();
  await window.mouse.move(center[0], center[1]);
  await window.mouse.down();
  await window.mouse.move(center[0] + 80, center[1] + 30, { steps: 10 });
  await window.mouse.up();
  await expect(transformField(window, "position", "x")).not.toHaveValue(x);
});
