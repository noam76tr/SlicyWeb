/**
 * SlicyWeb
 * Viewport End-To-End Tests
 *
 * Navigation cube (lot 74, decisions of Noam, 2026-11-01; GUI_SPEC.md,
 * Navigation Cube): in the bottom corner on the end side of the 3D
 * viewport (bottom left in Hebrew), translated faces; a click on a face
 * changes the view, and the cube turns with the camera.
 *
 * data-camera-face (set by the cube at each frame): the face the camera
 * looks straight at, absent otherwise.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing)
 * - GUI_SPEC.md (Navigation Cube, Camera Views)
 */

import en from "../../public/locales/en.json";
import he from "../../public/locales/he.json";

import { expect, test } from "./fixtures";

test("a click on a face of the navigation cube changes the view", async ({
  started,
}) => {
  const { window, errors } = started;
  const cube = window.locator("[data-navigation-cube]");

  // Isometric view at the start: Top, Front and Right are shown
  await expect(cube).toBeVisible();
  await expect(cube).not.toHaveAttribute("data-camera-face");
  await expect(
    cube.getByRole("button", { name: en["viewCube.top"] }),
  ).toBeVisible();
  await expect(
    cube.getByRole("button", { name: en["viewCube.front"] }),
  ).toBeVisible();
  await expect(
    cube.getByRole("button", { name: en["viewCube.right"] }),
  ).toBeVisible();
  await expect(
    cube.getByRole("button", { name: en["viewCube.bottom"] }),
  ).toBeHidden();
  const isometric = await cube
    .locator('[data-cube-face="top"]')
    .evaluate((element) => (element as HTMLElement).style.transform);

  // Top: the camera looks down, the cube turns with it
  await cube.getByRole("button", { name: en["viewCube.top"] }).click();
  await expect(cube).toHaveAttribute("data-camera-face", "top");
  const top = await cube
    .locator('[data-cube-face="top"]')
    .evaluate((element) => (element as HTMLElement).style.transform);
  expect(top).not.toBe(isometric);
  await expect(
    cube.getByRole("button", { name: en["viewCube.front"] }),
  ).toBeHidden();

  // Same view as the View menu: Home gives the isometric view again
  await window.keyboard.press("Home");
  await expect(cube).not.toHaveAttribute("data-camera-face");

  // Front: the side of the tab of the build plate (-Y)
  await cube.getByRole("button", { name: en["viewCube.front"] }).click();
  await expect(cube).toHaveAttribute("data-camera-face", "front");

  expect(errors).toEqual([]);
});

test("the navigation cube is at the bottom right, bottom left in Hebrew", async ({
  window,
}) => {
  // The name of the viewport is translated: found by its id
  const viewport = window.locator("#renderer-container");
  const cube = window.locator("[data-navigation-cube]");

  const side = async () => {
    const view = await viewport.boundingBox();
    const box = await cube.boundingBox();
    expect(view).not.toBeNull();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeGreaterThan(view!.y + view!.height / 2);
    return box!.x + box!.width / 2 > view!.x + view!.width / 2
      ? "right"
      : "left";
  };

  expect(await side()).toBe("right");

  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.hebrew"] })
    .click();

  await expect(
    cube.getByRole("button", { name: he["viewCube.top"] }),
  ).toBeVisible();
  expect(await side()).toBe("left");
});
