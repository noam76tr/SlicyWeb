/**
 * SlicyWeb
 * Printer Profiles Tests
 *
 * The printer profiles shipped in data/printers/ (ADR-032, D7): each file
 * passes PrinterProfileFileSchema, is named after the id of its printer,
 * has the source Official and is listed in data/printers/SOURCES.md
 * (page of the manufacturer, date of verification; 10 printers in
 * v1.0.0, 79 in v1.0.1); the loader of the
 * main process loads them all, without refused file. index.json (index
 * of the profile repository, Phase 7 lot 62) lists each profile with
 * the SHA-256 of its file.
 *
 * Based on:
 * - DATA_SCHEMA.md (Printer Schema 3.5.0, Repository Data Schema,
 *   Profile Repository Index Schema)
 * - DECISIONS.md (ADR-032)
 * - TEST_PLAN.md
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PrinterManager } from "../../../src/printer_database/PrinterManager";
import { PrinterProfileFileSchema } from "../../../src/schemas/PrinterSchema";
import { ProfileIndexSchema } from "../../../src/schemas/ProfileRepositorySchema";

const FOLDER = path.resolve(__dirname, "../../../data/printers");

/** The 10 first printers (v1.0.0), always shipped */
const FIRST_PRINTERS = [
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
  .filter((name) => name.endsWith(".json") && name !== "index.json")
  .sort();

describe("Printer profiles of data/printers", () => {
  it("contains the 79 printers of v1.0.1, with the 10 first printers", () => {
    expect(files).toHaveLength(79);
    expect(files).toEqual(
      expect.arrayContaining(FIRST_PRINTERS.map((id) => `${id}.json`)),
    );
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

  it("lists each profile in index.json with its SHA-256", () => {
    const index = ProfileIndexSchema.parse(
      JSON.parse(fs.readFileSync(path.join(FOLDER, "index.json"), "utf8")),
    );

    expect(index.profiles.map(({ file }) => file)).toEqual(files);
    for (const { file, id, sha256 } of index.profiles) {
      expect(`${id}.json`).toBe(file);
      expect(
        createHash("sha256")
          .update(fs.readFileSync(path.join(FOLDER, file)))
          .digest("hex"),
      ).toBe(sha256);
    }
  });

  it("lists each profile in SOURCES.md with the date of verification", () => {
    const sources = fs.readFileSync(path.join(FOLDER, "SOURCES.md"), "utf8");

    expect(sources).toContain("read on 2026-10-26");
    expect(sources).toContain("read on 2026-10-28");
    for (const name of files) {
      expect(sources).toContain(`(${name})`);
    }
  });

  it("loads all the profiles in the main process, none refused", () => {
    const manager = new PrinterManager();
    const result = manager.loadProfiles([
      { folder: FOLDER, source: "Official" },
    ]);

    expect(result).toEqual({ loaded: files.length, rejected: [] });
    expect(manager.getPrinter("bambu_x1c")?.buildVolume).toEqual({
      x: 256,
      y: 256,
      z: 256,
    });
  });
});
