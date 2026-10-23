/**
 * SlicyWeb
 * Application End-To-End Tests
 *
 * Start of the built application and languages (GUI_SPEC.md, Menu Bar,
 * Language Menu; USER_SETTINGS_SPEC.md): the window opens with its menus
 * and toolbar, without console error; the language chosen changes the
 * texts and the direction, and is kept after a restart.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing, Internationalization)
 * - GUI_SPEC.md (Menu Bar)
 */

import en from "../../public/locales/en.json";
import fr from "../../public/locales/fr.json";
import he from "../../public/locales/he.json";

import { expect, test } from "./fixtures";

const MENUS = [
  "menu.file",
  "menu.edit",
  "menu.view",
  "menu.printer",
  "menu.material",
  "menu.filament",
  "menu.tools",
  "menu.language",
  "menu.help",
] as const;

test("opens the main window without error", async ({ started }) => {
  const { app, window, errors } = started;

  expect(await window.title()).toBe("SlicyWeb");
  const menus = window.getByRole("menubar").getByRole("menuitem");
  await expect(menus).toHaveText(MENUS.map((key) => en[key]));
  await expect(
    window
      .getByRole("toolbar", { name: en["toolbar.title"] })
      .getByRole("button"),
  ).toHaveCount(8);
  await expect(window.getByRole("img", { name: "3D Viewport" })).toBeVisible();

  // Secure window: no Node.js in the renderer
  expect(await window.evaluate(() => typeof require)).toBe("undefined");
  expect(
    await app.evaluate(
      ({ BrowserWindow }) => BrowserWindow.getAllWindows().length,
    ),
  ).toBe(1);
  expect(errors).toEqual([]);
});

test("changes the language and keeps it after a restart", async ({
  launch,
}) => {
  const first = await launch();
  const window = first.window;

  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.french"] })
    .click();
  await expect(
    window.getByRole("menubar").getByRole("menuitem").first(),
  ).toHaveText(fr["menu.file"]);
  expect(await window.evaluate(() => document.documentElement.lang)).toBe("fr");
  await first.app.close();

  // Same user data folder: the language is read from settings.json
  const second = await launch();
  await expect(
    second.window.getByRole("menubar").getByRole("menuitem").first(),
  ).toHaveText(fr["menu.file"]);
  expect(second.errors).toEqual([]);
});

test("shows Hebrew from right to left", async ({ window }) => {
  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.hebrew"] })
    .click();

  await expect(
    window.getByRole("menubar").getByRole("menuitem").first(),
  ).toHaveText(he["menu.file"]);
  expect(
    await window.evaluate(() => [
      document.documentElement.lang,
      document.documentElement.dir,
    ]),
  ).toEqual(["he", "rtl"]);
});
