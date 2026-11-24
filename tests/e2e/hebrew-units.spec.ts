/**
 * SlicyWeb
 * Values with a unit in Hebrew
 *
 * In Hebrew, every number shown with a unit or a currency is drawn
 * before it, at its left, as in French: "25.00 €", "14 min", "4.5 g",
 * "200 mm/s", "0.25 €/kWh", "120 W" (request of Noam, 2026-11-24, lot
 * 109; GUI_SPEC.md, Localization Support, Number Format).
 *
 * The test goes through the screens of the application in Hebrew: the
 * three tabs of the Properties Panel and all their sections, the status
 * bar, the size of the plate, the Printer Manager and the Filament
 * Manager, the menus and the messages over the viewport. On each screen,
 * every text shown is read; for each number followed by a unit, the
 * place where the number and the unit are drawn is measured: the number
 * must be at the left of its unit, on the same line. A currency symbol
 * or a unit written before its number is refused.
 */

import type { Page } from "@playwright/test";

import en from "../../public/locales/en.json";
import he from "../../public/locales/he.json";

import { cubeStl, expect, importFiles, openTab, test } from "./fixtures";

/** Result of one screen: values checked and values drawn wrong */
interface Scan {
  checked: string[];
  wrong: string[];
}

/** ASCII STL of a box (size in mm), centered on the origin */
function boxStl(name: string, x: number, y: number, z: number): string {
  return cubeStl(name, 2).replace(
    /vertex (\S+) (\S+) (\S+)/g,
    (_, a: string, b: string, c: string) =>
      `vertex ${(Number(a) * x) / 2} ${(Number(b) * y) / 2} ${(Number(c) * z) / 2}`,
  );
}

type Point = [number, number, number];

/**
 * ASCII STL of a pyramid upside down (point at the bottom): every side is
 * an overhang, shown in the Analysis section
 */
function funnelStl(name: string): string {
  // Sides 56 degrees from the vertical: overhangs (beyond 45 degrees)
  const a = 15;
  const h = 5;
  const top: Point[] = [
    [-a, -a, h],
    [a, -a, h],
    [a, a, h],
    [-a, a, h],
  ];
  const point: Point = [0, 0, -h];
  const triangles: Point[][] = [
    [top[0], top[1], top[2]],
    [top[0], top[2], top[3]],
  ];

  for (let i = 0; i < 4; i += 1) {
    // Outward: seen from outside, the corners turn counterclockwise
    triangles.push([top[(i + 1) % 4], top[i], point]);
  }

  const lines = [`solid ${name}`];

  for (const triangle of triangles) {
    lines.push("facet normal 0 0 0", "outer loop");
    for (const [x, y, z] of triangle) {
      lines.push(`vertex ${x} ${y} ${z}`);
    }
    lines.push("endloop", "endfacet");
  }

  lines.push(`endsolid ${name}`);
  return lines.join("\n");
}

/**
 * Reads every text shown in the window and measures each number with its
 * unit. A text cut in several pieces (a number and its unit in two
 * elements of one line) is read as one text. Runs in the window.
 */
async function scan(window: Page, screen: string): Promise<Scan> {
  return window.evaluate((name) => {
    const units = [
      "mm/s²",
      "mm/s",
      "mm³",
      "mm²",
      "mm",
      "cm³",
      "cm²",
      "g/cm³",
      "°C",
      "°",
      "%",
      "kWh",
      "W",
      "min",
      "h",
      "s",
      "m",
      "kg",
      "g",
      "GB",
      "MB",
      "KB",
      "מ״מ",
      'מ"מ',
      "CHF",
      "CA$",
      "A$",
      "US$",
      "€",
      "$",
      "₪",
      "£",
      "¥",
    ];
    const unit = units
      .map((item) => item.replace(/[$/]/g, (c) => `\\${c}`))
      .join("|");
    const number = "\\d(?:[\\d.,\\u202f\\u00a0]*\\d)?";
    // A number, at most one space (or an isolate), a unit ("/kWh" or "/kg" after a currency)
    const after = new RegExp(
      `(${number})([ \\u00a0\\u202f\\u2066-\\u2069]{0,3})((?:${unit})(?:\\/kWh|\\/kg)?)(?![A-Za-z\\u0590-\\u05ff])`,
      "g",
    );
    // A currency or a unit written before its number ("€0.12", "W 120")
    const before = new RegExp(
      `(?:^|[^A-Za-z\\u0590-\\u05ff])(CHF|CA\\$|A\\$|US\\$|[€$₪£¥]|W|kWh)[ \\u00a0\\u202f\\u2066-\\u2069]{0,3}\\d`,
      "g",
    );

    const result = { checked: [] as string[], wrong: [] as string[] };
    const inline = (element: Element): boolean =>
      getComputedStyle(element).display.startsWith("inline") &&
      !(element instanceof HTMLButtonElement);

    // Texts of one line: the text nodes of a block, with their inline pieces
    const blocks = new Map<Element, Text[]>();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      let block = node.parentElement;

      if (!block || block.closest("script, style")) {
        continue;
      }

      while (block.parentElement && inline(block)) {
        block = block.parentElement;
      }

      const nodes = blocks.get(block) ?? [];
      nodes.push(node as Text);
      blocks.set(block, nodes);
    }

    for (const nodes of blocks.values()) {
      const content = nodes.map((node) => node.data).join("");

      if (!/\d/.test(content)) {
        continue;
      }

      // Offset in content → text node and offset in it
      const at = (offset: number): [Text, number] => {
        let rest = offset;

        for (const node of nodes) {
          if (rest <= node.data.length) {
            return [node, rest];
          }
          rest -= node.data.length;
        }

        const last = nodes[nodes.length - 1];
        return [last, last.data.length];
      };

      const box = (start: number, end: number): DOMRect | null => {
        const range = document.createRange();
        range.setStart(...at(start));
        range.setEnd(...at(end));
        const rects = [...range.getClientRects()].filter(
          (rect) => rect.width > 0 && rect.height > 0,
        );

        if (rects.length === 0) {
          return null;
        }

        const left = Math.min(...rects.map((rect) => rect.left));
        const right = Math.max(...rects.map((rect) => rect.right));
        const top = Math.min(...rects.map((rect) => rect.top));
        const bottom = Math.max(...rects.map((rect) => rect.bottom));

        return new DOMRect(left, top, right - left, bottom - top);
      };

      const shown = box(0, content.length);

      // Not shown (closed menu, folded section): nothing to measure
      if (!shown) {
        continue;
      }

      const text = content.replace(/[⁦-⁩]/g, "").trim();

      for (const match of content.matchAll(before)) {
        result.wrong.push(
          `${name}: "${text}" ("${match[1]}" before its number)`,
        );
      }

      for (const match of content.matchAll(after)) {
        const start = match.index ?? 0;
        const numberEnd = start + match[1].length;
        const unitStart = numberEnd + match[2].length;
        const unitEnd = unitStart + match[3].length;
        const numberBox = box(start, numberEnd);
        const unitBox = box(unitStart, unitEnd);

        if (!numberBox || !unitBox) {
          continue;
        }

        const label = `${name}: "${match[1]} ${match[3]}" in "${text}"`;
        const middle = (rect: DOMRect): number => rect.top + rect.height / 2;

        // A value cut at the end of a line cannot be compared
        if (
          Math.abs(middle(numberBox) - middle(unitBox)) >
          numberBox.height / 2
        ) {
          continue;
        }

        result.checked.push(label);

        if (!(numberBox.right <= unitBox.left + 0.5)) {
          result.wrong.push(`${label} (unit at the left of the number)`);
        }
      }
    }

    return result;
  }, screen);
}

test("draws every number at the left of its unit in Hebrew", async ({
  window,
  files,
  started,
}) => {
  test.setTimeout(180_000);
  const all: Scan = { checked: [], wrong: [] };
  const look = async (screen: string) => {
    const result = await scan(window, screen);
    all.checked.push(...result.checked);
    all.wrong.push(...result.wrong);
  };
  const menu = async (key: keyof typeof he) => {
    await window
      .getByRole("menubar")
      .getByRole("menuitem", { name: he[key] })
      .click();
  };

  // A cube, a tower and an upside-down pyramid (overhangs); the Import
  // button is found by its English name
  await importFiles(window, [
    files("cube.stl", cubeStl("cube", 20)),
    files("tower.stl", boxStl("tower", 20, 20, 100)),
    files("funnel.stl", funnelStl("funnel")),
  ]);

  await window.getByRole("menuitem", { name: en["menu.language"] }).click();
  await window
    .getByRole("menuitemradio", { name: en["language.hebrew"] })
    .click();
  await expect(
    window.getByRole("menubar").getByRole("menuitem").first(),
  ).toHaveText(he["menu.file"]);

  // Printer tab: printer, material, filament, costs in euros
  await openTab(window, "printer");
  await window.getByLabel(he["printer.selector"]).selectOption("prusa_mk4s");
  await window
    .getByLabel(he["filament.selector"])
    .selectOption("prusament_pla");
  await window.getByLabel(he["cost.currency"]).selectOption("EUR");
  for (const [label, value] of [
    [he["cost.electricityPrice"], "0.25"],
    [he["cost.printerPower"], "120"],
    [he["cost.filamentPrice"], "25"],
  ]) {
    const field = window.getByLabel(label);
    await field.fill(value);
    await field.press("Enter");
  }
  await expect(
    window.locator('[data-status-field="plate-estimation"]'),
  ).toContainText("€", { timeout: 30_000 });
  await look("printer tab, plate and status bar");

  // The error of a power refused: "10,000 W"
  const power = window.getByLabel(he["cost.printerPower"]);
  await power.fill("0");
  await power.press("Enter");
  await expect(window.getByRole("alert")).toBeVisible();
  await look("costs, power refused");
  await power.press("Escape");

  // Object tab of each object (Analysis section)
  const rows = window
    .getByRole("list", { name: he["objects.title"] })
    .getByRole("listitem");
  await openTab(window, "object");
  for (const index of [0, 2]) {
    await rows.nth(index).click();
    await expect(
      window.getByText(he["analysis.dimensions"], { exact: true }),
    ).toBeVisible();
    await look(`object tab, object ${index + 1}`);
  }

  // Settings tab: recommendation with its details, estimation
  await rows.first().click();
  await openTab(window, "settings");
  await window
    .locator("summary", { hasText: he["recommendation.details"] })
    .click();
  await look("settings tab");

  // All the objects: the sum in the Estimation section
  await rows.first().click();
  await rows.last().click({ modifiers: ["Shift"] });
  await look("settings tab, three objects");

  // Message over the viewport: orientation of the objects
  await menu("menu.tools");
  await window
    .getByRole("menuitem", { name: he["tools.optimizeOrientation"] })
    .click();
  await expect(window.getByText(/\/100/).first()).toBeVisible({
    timeout: 30_000,
  });
  await look("messages over the viewport");

  // The menus, open one at a time
  for (const key of [
    "menu.file",
    "menu.edit",
    "menu.view",
    "menu.printer",
    "menu.tools",
  ] as const) {
    await menu(key);
    await expect(window.getByRole("menu")).toBeVisible();
    await look(key);
    await window.keyboard.press("Escape");
    await expect(window.getByRole("menu")).toHaveCount(0);
  }

  // Printer Manager: a copy of a printer shows its values
  await menu("menu.printer");
  await window.getByRole("menuitem", { name: he["printer.manage"] }).click();
  const printers = window.getByRole("dialog", { name: he["printer.manage"] });
  await expect(printers).toBeVisible();
  await printers
    .getByLabel(he["printerManager.copy"])
    .selectOption("prusa_mk4s");
  await look("printer manager");
  await printers
    .getByRole("button", { name: he["action.close"] })
    .first()
    .click();
  await expect(printers).toBeHidden();

  // Filament Manager: a copy of a filament shows its values
  await openTab(window, "printer");
  await window
    .getByRole("button", { name: he["filament.manage"], exact: true })
    .click();
  const filaments = window.getByRole("dialog", {
    name: he["filament.manage"],
  });
  await expect(filaments).toBeVisible();
  await filaments
    .getByLabel(he["filamentManager.copy"])
    .selectOption("prusament_pla");
  await look("filament manager");
  await filaments
    .getByRole("button", { name: he["action.close"] })
    .first()
    .click();
  await expect(filaments).toBeHidden();

  expect(all.wrong).toEqual([]);
  // Values of every kind were measured
  for (const sample of [
    ' mm"',
    ' mm/s"',
    ' °C"',
    ' %"',
    '°"',
    ' min"',
    ' h"',
    ' g"',
    ' m"',
    ' €"',
    ' W"',
    ' cm³"',
  ]) {
    expect(
      all.checked.some((label) => label.includes(sample)),
      `a value in${sample.slice(0, -1)}`,
    ).toBe(true);
  }
  expect(started.errors).toEqual([]);
});
