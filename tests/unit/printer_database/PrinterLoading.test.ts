/**
 * SlicyWeb
 * Printer Loading Tests
 *
 * Printer profile files read by the main process (ADR-032, D4): only the
 * *.json files of the two folders are read; a file over the size limit,
 * an invalid JSON file, a file that fails PrinterSchema or of another
 * source is refused with PRN_002, without stopping the other files; a
 * value of motion or thermal may be null (unknown), never read as 0.
 *
 * The printers of these tests are test data, not real printers.
 *
 * Based on:
 * - DATA_SCHEMA.md (Printer Schema 3.5.0, Repository Data Schema)
 * - ERROR_CODES_SPEC.md (PRN_002)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  PrinterManager,
  type PrinterProfileFolder,
} from "../../../src/printer_database/PrinterManager";
import { PrinterValidator } from "../../../src/printer_database/PrinterValidator";
import { PrinterSchema } from "../../../src/schemas/PrinterSchema";
import { MAX_PROFILE_FILE_SIZE } from "../../../src/storage/PrinterProfileStorage";

function testPrinter(id: string): Record<string, unknown> {
  return {
    id,
    brand: "Test",
    model: `Model ${id}`,
    series: "",
    manufacturer: "Test",
    firmware: "",
    releaseDate: "",
    supported: true,
    buildVolume: { x: 200, y: 200, z: 180 },
    defaultNozzle: 0.4,
    supportedNozzles: [0.4],
    motion: {
      maxPrintSpeed: 300,
      maxTravelSpeed: null,
      maxAcceleration: null,
      maxJerk: null,
    },
    thermal: { maxNozzleTemp: 300, maxBedTemp: 100, maxChamberTemp: null },
    cooling: { partFan: true, auxFan: false, chamberFan: false },
    extruder: { type: "direct_drive", count: 1 },
    supportedMaterials: [],
    supportedFilaments: [],
  };
}

function profileFile(
  id: string,
  source = "Official",
  data: Record<string, unknown> = testPrinter(id),
): Record<string, unknown> {
  return {
    id,
    type: "printer",
    version: "1.0.0",
    source,
    data,
    validated: false,
  };
}

let root: string;
let official: string;
let custom: string;
let folders: PrinterProfileFolder[];

function write(folder: string, name: string, content: unknown): void {
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(
    path.join(folder, name),
    typeof content === "string" ? content : JSON.stringify(content),
  );
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-printers-"));
  official = path.join(root, "data", "printers");
  custom = path.join(root, "user", "printers");
  folders = [
    { folder: official, source: "Official" },
    { folder: custom, source: "Local Custom" },
  ];
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("Printer Schema", () => {
  it("accepts null (unknown) and 0 for motion and thermal, keeps null", () => {
    const printer = testPrinter("a");
    const result = PrinterSchema.parse({
      ...printer,
      thermal: { maxNozzleTemp: 300, maxBedTemp: 0, maxChamberTemp: null },
    });

    expect(result.motion.maxTravelSpeed).toBeNull();
    expect(result.thermal.maxChamberTemp).toBeNull();
    expect(result.thermal.maxBedTemp).toBe(0);
  });

  it("refuses a missing field or an unknown field without throwing", () => {
    const missing = testPrinter("a");
    delete missing.id;
    delete missing.buildVolume;

    expect(PrinterValidator.validate(missing)).toBe(false);
    expect(
      PrinterValidator.validate({ ...testPrinter("a"), kinematics: "corexy" }),
    ).toBe(false);
    expect(PrinterValidator.validate(null)).toBe(false);
    expect(PrinterValidator.validate(testPrinter("a"))).toBe(true);
  });
});

describe("Printer profile loading", () => {
  it("loads the profiles of both folders, Official first", () => {
    write(official, "b.json", profileFile("b"));
    write(official, "a.json", profileFile("a"));
    write(custom, "mine.json", profileFile("mine", "Local Custom"));

    const manager = new PrinterManager();
    const result = manager.loadProfiles(folders);

    expect(result).toEqual({ loaded: 3, rejected: [] });
    expect(manager.getPrinters().map((printer) => printer.id)).toEqual([
      "a",
      "b",
      "mine",
    ]);
    expect(manager.getPrinter("a")?.motion.maxTravelSpeed).toBeNull();
  });

  it("reads nothing and reports nothing when a folder is missing", () => {
    const result = new PrinterManager().loadProfiles(folders);

    expect(result).toEqual({ loaded: 0, rejected: [] });
  });

  it("ignores the files that are not .json and the subfolders", () => {
    write(official, "SOURCES.md", "# Sources");
    write(official, "README.me", "");
    write(path.join(official, "old.json"), "a.json", profileFile("old"));

    const result = new PrinterManager().loadProfiles(folders);

    expect(result).toEqual({ loaded: 0, rejected: [] });
  });

  it("refuses a damaged or invalid file with PRN_002 and loads the others", () => {
    write(official, "1-broken.json", '{ "id": "broken", ');
    write(
      official,
      "2-invalid.json",
      profileFile("invalid", "Official", {
        ...testPrinter("invalid"),
        buildVolume: { x: 0, y: 200, z: 200 },
      }),
    );
    write(official, "3-not-a-printer.json", [1, 2, 3]);
    write(official, "4-ok.json", profileFile("ok"));

    const manager = new PrinterManager();
    const result = manager.loadProfiles(folders);

    expect(result.loaded).toBe(1);
    expect(manager.getPrinter("ok")).toBeDefined();
    expect(
      result.rejected.map(({ fileName, code }) => [fileName, code]),
    ).toEqual([
      ["1-broken.json", "PRN_002"],
      ["2-invalid.json", "PRN_002"],
      ["3-not-a-printer.json", "PRN_002"],
    ]);
    expect(result.rejected[0].reason).toBe("Invalid JSON");
    expect(result.rejected[1].reason).toContain("data.buildVolume.x");
  });

  it("refuses a file over the size limit without reading it", () => {
    const large = profileFile("large");
    large.padding = "x".repeat(MAX_PROFILE_FILE_SIZE);
    write(official, "large.json", large);

    const result = new PrinterManager().loadProfiles(folders);

    expect(result.loaded).toBe(0);
    expect(result.rejected).toEqual([
      {
        fileName: "large.json",
        source: "Official",
        code: "PRN_002",
        reason: "File too large",
      },
    ]);
  });

  it("refuses a profile of another source, an id that differs from its printer, and an id already loaded", () => {
    write(official, "a.json", profileFile("a"));
    write(custom, "1-official.json", profileFile("x"));
    write(custom, "2-same-id.json", profileFile("a", "Local Custom"));
    write(custom, "3-other-id.json", {
      ...profileFile("y", "Local Custom"),
      id: "z",
    });

    const manager = new PrinterManager();
    const result = manager.loadProfiles(folders);

    expect(result.loaded).toBe(1);
    expect(manager.getPrinter("a")?.brand).toBe("Test");
    expect(result.rejected.map(({ fileName }) => fileName)).toEqual([
      "1-official.json",
      "2-same-id.json",
      "3-other-id.json",
    ]);
    expect(result.rejected.every(({ code }) => code === "PRN_002")).toBe(true);
  });

  it("does not follow a link to a file outside the folders", (context) => {
    const outside = path.join(root, "outside.json");
    write(root, "outside.json", profileFile("outside"));
    fs.mkdirSync(official, { recursive: true });

    try {
      fs.symlinkSync(outside, path.join(official, "link.json"), "file");
    } catch {
      // Windows without the right to create links
      context.skip();
    }

    const manager = new PrinterManager();
    const result = manager.loadProfiles(folders);

    expect(result).toEqual({ loaded: 0, rejected: [] });
    expect(manager.getPrinter("outside")).toBeUndefined();
  });

  it("names a refused file by its name only, never by its path", () => {
    write(official, "broken.json", "not json");

    const [rejected] = new PrinterManager().loadProfiles(folders).rejected;

    expect(JSON.stringify(rejected)).not.toContain(root);
  });
});
