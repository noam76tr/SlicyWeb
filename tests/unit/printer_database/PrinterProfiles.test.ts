/**
 * SlicyWeb
 * Printer Profiles Tests
 *
 * The printer profiles shipped in data/printers/ (ADR-032, D7): each file
 * passes PrinterProfileFileSchema, is named after the id of its printer,
 * has the source Official and is listed in data/printers/SOURCES.md
 * (page of the manufacturer, date of verification); the loader of the
 * main process loads them all, without refused file.
 *
 * Based on:
 * - DATA_SCHEMA.md (Printer Schema 3.5.0, Repository Data Schema)
 * - DECISIONS.md (ADR-032)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PrinterManager } from "../../../src/printer_database/PrinterManager";
import { PrinterProfileFileSchema } from "../../../src/schemas/PrinterSchema";

const FOLDER = path.resolve(__dirname, "../../../data/printers");

const PRINTERS = [
  "bambu_a1",
  "bambu_a1_mini",
  "bambu_p1s",
  "bambu_x1c",
  "creality_ender3_v3_se",
  "creality_k1c",
  "elegoo_neptune4_pro",
  "prusa_core_one_plus",
  "prusa_mini_plus",
  "prusa_mk4s",
];

const files = fs
  .readdirSync(FOLDER)
  .filter((name) => name.endsWith(".json"))
  .sort();

describe("Printer profiles of data/printers", () => {
  it("contains the 10 first printers", () => {
    expect(files).toEqual(PRINTERS.map((id) => `${id}.json`));
  });

  it.each(files)("%s passes the schema, with its id and source", (name) => {
    const content: unknown = JSON.parse(
      fs.readFileSync(path.join(FOLDER, name), "utf8"),
    );
    const profile = PrinterProfileFileSchema.parse(content);

    expect(`${profile.id}.json`).toBe(name);
    expect(profile.source).toBe("Official");
    expect(profile.validated).toBe(false);
  });

  it("lists each profile in SOURCES.md with the date of verification", () => {
    const sources = fs.readFileSync(path.join(FOLDER, "SOURCES.md"), "utf8");

    expect(sources).toContain("read on 2026-10-26");
    for (const name of files) {
      expect(sources).toContain(`(${name})`);
    }
  });

  it("loads all the profiles in the main process, none refused", () => {
    const manager = new PrinterManager();
    const result = manager.loadProfiles([
      { folder: FOLDER, source: "Official" },
    ]);

    expect(result).toEqual({ loaded: PRINTERS.length, rejected: [] });
    expect(manager.getPrinter("bambu_x1c")?.buildVolume).toEqual({
      x: 256,
      y: 256,
      z: 256,
    });
  });
});
