/**
 * SlicyWeb
 * User Printers Tests
 *
 * Printers entered by the user (Local Custom, Phase 7 lot 61):
 * - add writes <id>.json in the Local Custom folder (Repository Data
 *   Schema envelope, source Local Custom); the id is chosen by the main
 *   process; the printer is loaded again at the next start;
 * - update replaces the file, remove deletes it;
 * - an Official printer is never changed (PRN_005), an unknown id is
 *   PRN_001, the same brand and model is refused (PRN_006);
 * - a file not written changes nothing (PRN_007), and its reason never
 *   contains a path;
 * - only a file name is accepted for writing and deleting.
 *
 * The printers of these tests are test data, not real printers.
 *
 * Based on:
 * - DATA_SCHEMA.md (Printer Schema, Repository Data Schema)
 * - ERROR_CODES_SPEC.md (PRN_001, PRN_005, PRN_006, PRN_007)
 * - SECURITY_SPEC.md (Printer Profile Files)
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
import { PrinterProfileStorage } from "../../../src/storage/PrinterProfileStorage";
import type { Printer } from "../../../src/types/Printer";

function testPrinter(id: string, brand: string, model: string): Printer {
  return {
    id,
    brand,
    model,
    series: "",
    manufacturer: brand,
    firmware: "",
    releaseDate: "",
    supported: true,
    buildVolume: { x: 220, y: 220, z: 250 },
    defaultNozzle: 0.4,
    supportedNozzles: [0.4, 0.6],
    motion: {
      maxPrintSpeed: 200,
      maxTravelSpeed: null,
      maxAcceleration: null,
      maxJerk: null,
    },
    thermal: { maxNozzleTemp: 260, maxBedTemp: 100, maxChamberTemp: null },
    cooling: { partFan: true, auxFan: false, chamberFan: false },
    extruder: { type: "bowden", count: 1 },
    supportedMaterials: ["PLA"],
    supportedFilaments: [],
  };
}

const officialPrinter = testPrinter("test_official", "Test", "Official");

let root: string;
let official: string;
let custom: string;
let folders: PrinterProfileFolder[];
let ids: number;

function newManager(storage = new PrinterProfileStorage()): PrinterManager {
  const manager = new PrinterManager(storage, () => `user_test_${++ids}`);
  manager.loadProfiles(folders);
  return manager;
}

function readFile(name: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(custom, name), "utf8")) as Record<
    string,
    unknown
  >;
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-user-printers-"));
  official = path.join(root, "data", "printers");
  custom = path.join(root, "user", "printers");
  folders = [
    { folder: official, source: "Official" },
    { folder: custom, source: "Local Custom" },
  ];
  ids = 0;

  fs.mkdirSync(official, { recursive: true });
  fs.writeFileSync(
    path.join(official, "test_official.json"),
    JSON.stringify({
      id: "test_official",
      type: "printer",
      version: "1.0.0",
      source: "Official",
      data: officialPrinter,
      validated: false,
    }),
  );
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("Printers of the user", () => {
  it("adds a printer: id chosen by the main process, file in the user folder", () => {
    const manager = newManager();

    const result = manager.addUserPrinter(
      testPrinter("ignored", "Home", "Box"),
    );

    expect(result).toMatchObject({ ok: true, printer: { id: "user_test_1" } });
    expect(manager.getUserPrinterIds()).toEqual(["user_test_1"]);
    expect(readFile("user_test_1.json")).toEqual({
      id: "user_test_1",
      type: "printer",
      version: "1.0.0",
      source: "Local Custom",
      data: testPrinter("user_test_1", "Home", "Box"),
      validated: false,
    });
    expect(fs.readdirSync(custom)).toEqual(["user_test_1.json"]);

    // Loaded again at the next start, with its null values
    const next = newManager();
    expect(next.getPrinter("user_test_1")?.motion.maxJerk).toBeNull();
    expect(next.getUserPrinterIds()).toEqual(["user_test_1"]);
  });

  it("uses a random id by default", () => {
    const manager = new PrinterManager();
    manager.loadProfiles(folders);

    const result = manager.addUserPrinter(testPrinter("x", "Home", "Box"));

    expect(result.ok && result.printer.id).toMatch(
      /^user_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("updates a printer of the user in its file", () => {
    const manager = newManager();
    manager.addUserPrinter(testPrinter("x", "Home", "Box"));

    const changed = {
      ...testPrinter("user_test_1", "Home", "Box 2"),
      buildVolume: { x: 300, y: 300, z: 300 },
    };
    expect(manager.updateUserPrinter(changed)).toEqual({
      ok: true,
      printer: changed,
    });
    expect(manager.getPrinter("user_test_1")).toEqual(changed);
    expect((readFile("user_test_1.json").data as Printer).model).toBe("Box 2");
  });

  it("removes a printer of the user and its file", () => {
    const manager = newManager();
    manager.addUserPrinter(testPrinter("x", "Home", "Box"));

    expect(manager.removeUserPrinter("user_test_1")).toMatchObject({
      ok: true,
    });
    expect(manager.hasPrinter("user_test_1")).toBe(false);
    expect(manager.getUserPrinterIds()).toEqual([]);
    expect(fs.readdirSync(custom)).toEqual([]);
  });

  it("keeps the file name of a printer loaded from the user folder", () => {
    fs.mkdirSync(custom, { recursive: true });
    fs.writeFileSync(
      path.join(custom, "my-printer.json"),
      JSON.stringify({
        id: "mine",
        type: "printer",
        version: "1.0.0",
        source: "Local Custom",
        data: testPrinter("mine", "Home", "Mine"),
        validated: false,
      }),
    );
    const manager = newManager();

    manager.updateUserPrinter(testPrinter("mine", "Home", "Mine 2"));
    expect(fs.readdirSync(custom)).toEqual(["my-printer.json"]);

    manager.removeUserPrinter("mine");
    expect(fs.readdirSync(custom)).toEqual([]);
  });

  it("never changes an Official printer (PRN_005)", () => {
    const manager = newManager();

    expect(manager.updateUserPrinter(officialPrinter)).toMatchObject({
      ok: false,
      code: "PRN_005",
    });
    expect(manager.removeUserPrinter("test_official")).toMatchObject({
      ok: false,
      code: "PRN_005",
    });
    expect(manager.getPrinter("test_official")).toEqual(officialPrinter);
    expect(fs.existsSync(custom)).toBe(false);
  });

  it("refuses an unknown printer (PRN_001)", () => {
    const manager = newManager();

    expect(
      manager.updateUserPrinter(testPrinter("unknown", "Home", "Box")),
    ).toMatchObject({ ok: false, code: "PRN_001" });
    expect(manager.removeUserPrinter("unknown")).toMatchObject({
      ok: false,
      code: "PRN_001",
    });
  });

  it("refuses the same brand and model, case ignored (PRN_006)", () => {
    const manager = newManager();
    manager.addUserPrinter(testPrinter("x", "Home", "Box"));

    expect(
      manager.addUserPrinter(testPrinter("x", " test ", "OFFICIAL")),
    ).toMatchObject({ ok: false, code: "PRN_006" });
    expect(
      manager.addUserPrinter(testPrinter("x", "home", "box")),
    ).toMatchObject({ ok: false, code: "PRN_006" });

    // A printer keeps its own name when it is updated
    expect(
      manager.updateUserPrinter(testPrinter("user_test_1", "Home", "Box")),
    ).toMatchObject({ ok: true });
    expect(manager.getPrinterCount()).toBe(2);
  });

  it("changes nothing when the file is not written (PRN_007)", () => {
    class FailingStorage extends PrinterProfileStorage {
      public override writeFile(): void {
        throw Object.assign(new Error(`EACCES ${custom}`), { code: "EACCES" });
      }

      public override deleteFile(): void {
        throw Object.assign(new Error(`EACCES ${custom}`), { code: "EACCES" });
      }
    }
    const manager = newManager(new FailingStorage());

    const result = manager.addUserPrinter(testPrinter("x", "Home", "Box"));

    expect(result).toEqual({ ok: false, code: "PRN_007", reason: "EACCES" });
    expect(manager.getPrinterCount()).toBe(1);
    expect(manager.getUserPrinterIds()).toEqual([]);
  });

  it("refuses a change without a folder for the user (PRN_007)", () => {
    const manager = new PrinterManager();
    manager.loadProfiles([{ folder: official, source: "Official" }]);

    expect(
      manager.addUserPrinter(testPrinter("x", "Home", "Box")),
    ).toMatchObject({ ok: false, code: "PRN_007" });
  });
});

describe("PrinterProfileStorage writing", () => {
  it("accepts only a file name, never a path", () => {
    const storage = new PrinterProfileStorage();

    for (const name of ["../settings.json", "a/b.json", "x.txt", ".json"]) {
      expect(() => storage.writeFile(custom, name, {})).toThrow(
        "Invalid profile file name",
      );
      expect(() => storage.deleteFile(custom, name)).toThrow(
        "Invalid profile file name",
      );
    }
    expect(fs.existsSync(path.join(root, "user", "settings.json"))).toBe(false);
  });

  it("refuses a content over the size limit, without leaving a file", () => {
    const storage = new PrinterProfileStorage();

    expect(() =>
      storage.writeFile(custom, "big.json", { text: "x".repeat(1024 * 1024) }),
    ).toThrow("File too large");
    expect(fs.existsSync(path.join(custom, "big.json"))).toBe(false);
  });
});
