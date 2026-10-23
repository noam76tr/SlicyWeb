/**
 * SlicyWeb
 * End-To-End Test Fixtures
 *
 * Starts the built application (npm run build: dist/electron/main.js)
 * with Playwright, in a new user data folder for each test: the settings
 * of the user (language, settings.json) are never read or changed.
 *
 * Fixtures:
 * - userDataDir: user data folder of the test (kept for a restart);
 * - launch(): starts the application, returns it with its window;
 * - app, window: the application started once for the test;
 * - files: writes test files (STL cube, text file) in a folder of the
 *   test.
 *
 * On Linux, the application is started without the Chromium sandbox and
 * with the software renderer (SwiftShader), for machines without a
 * graphics card (Windows: no extra option).
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing)
 * - TECH_STACK.md (Playwright)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  _electron as electron,
  expect,
  test as base,
  type ElectronApplication,
  type Page,
} from "@playwright/test";

import en from "../../public/locales/en.json";

const MAIN = path.resolve(__dirname, "../../dist/electron/main.js");

const LINUX_ARGS =
  process.platform === "linux"
    ? ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
    : [];

export interface Started {
  app: ElectronApplication;
  window: Page;
  /** Errors written to the console of the window */
  errors: string[];
}

/** ASCII STL of a cube, size in mm, centered on the origin */
export function cubeStl(name: string, size: number): string {
  const h = size / 2;
  const v = (x: number, y: number, z: number): string =>
    `vertex ${x * h} ${y * h} ${z * h}`;
  // Two triangles per face: [normal, corners]
  const faces: [string, number[][]][] = [
    [
      "0 0 -1",
      [
        [-1, -1, -1],
        [-1, 1, -1],
        [1, 1, -1],
        [1, -1, -1],
      ],
    ],
    [
      "0 0 1",
      [
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
      ],
    ],
    [
      "0 -1 0",
      [
        [-1, -1, -1],
        [1, -1, -1],
        [1, -1, 1],
        [-1, -1, 1],
      ],
    ],
    [
      "0 1 0",
      [
        [-1, 1, -1],
        [-1, 1, 1],
        [1, 1, 1],
        [1, 1, -1],
      ],
    ],
    [
      "-1 0 0",
      [
        [-1, -1, -1],
        [-1, -1, 1],
        [-1, 1, 1],
        [-1, 1, -1],
      ],
    ],
    [
      "1 0 0",
      [
        [1, -1, -1],
        [1, 1, -1],
        [1, 1, 1],
        [1, -1, 1],
      ],
    ],
  ];
  const lines = [`solid ${name}`];

  for (const [normal, [a, b, c, d]] of faces) {
    for (const triangle of [
      [a, b, c],
      [a, c, d],
    ]) {
      lines.push(`facet normal ${normal}`, "outer loop");
      for (const [x, y, z] of triangle) {
        lines.push(v(x, y, z));
      }
      lines.push("endloop", "endfacet");
    }
  }

  lines.push(`endsolid ${name}`);
  return lines.join("\n");
}

export const test = base.extend<{
  userDataDir: string;
  launch: () => Promise<Started>;
  started: Started;
  window: Page;
  files: (name: string, content: string | Uint8Array) => string;
}>({
  // Playwright reads the fixtures used from the first parameter: {} = none
  // eslint-disable-next-line no-empty-pattern
  userDataDir: async ({}, use) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-e2e-"));
    await use(dir);
    fs.rmSync(dir, { recursive: true, force: true });
  },

  launch: async ({ userDataDir }, use) => {
    const running: ElectronApplication[] = [];

    await use(async () => {
      const app = await electron.launch({
        args: [MAIN, `--user-data-dir=${userDataDir}`, ...LINUX_ARGS],
      });
      running.push(app);

      const window = await app.firstWindow();
      const errors: string[] = [];
      window.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(message.text());
        }
      });
      window.on("pageerror", (error) => errors.push(error.message));
      await window.getByRole("menubar").waitFor();

      return { app, window, errors };
    });

    for (const app of running) {
      await app.close().catch(() => undefined);
    }
  },

  started: async ({ launch }, use) => {
    await use(await launch());
  },

  window: async ({ started }, use) => {
    await use(started.window);
  },

  // eslint-disable-next-line no-empty-pattern
  files: async ({}, use, testInfo) => {
    await use((name, content) => {
      const file = testInfo.outputPath(name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
      return file;
    });
  },
});

export { expect };

/** Imports files with the Import button of the toolbar (file dialog) */
export async function importFiles(
  window: Page,
  files: string[],
): Promise<void> {
  const chooser = window.waitForEvent("filechooser");
  await window
    .getByRole("toolbar", { name: en["toolbar.title"] })
    .getByRole("button", { name: en["toolbar.import"] })
    .click();
  await (await chooser).setFiles(files);
}

/** Field of the Transform section, as "Position X" (row and axis) */
export function transformField(
  window: Page,
  row: "position" | "rotation" | "scale" | "size",
  axis: "x" | "y" | "z",
) {
  return window.getByRole("textbox", {
    name: `${en[`transform.${row}`]} ${axis.toUpperCase()}`,
    exact: true,
  });
}

/** Number of objects shown in the status bar */
export async function expectObjectCount(
  window: Page,
  count: number,
): Promise<void> {
  // The status bar shows "Objects: 2" (label and value in two elements)
  await expect(window.getByRole("contentinfo")).toContainText(
    new RegExp(`${en["statusBar.objectCount"]}:\\s*${count}(?!\\d)`),
  );
}

/** Rows of the Object Panel */
export function objectRows(window: Page) {
  return window
    .getByRole("list", { name: en["objects.title"] })
    .getByRole("listitem");
}
