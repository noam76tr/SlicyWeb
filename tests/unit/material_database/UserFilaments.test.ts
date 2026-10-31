/**
 * SlicyWeb
 * User Filaments Tests
 *
 * Filaments entered by the user (Local Custom, Phase 8 lot 71):
 * - add writes <id>.json in the Local Custom folder (Repository Data
 *   Schema envelope, type filament, source Local Custom); the id is
 *   chosen by the main process and is a valid profile id; the filament
 *   is loaded again at the next start, with its color, its price per kg
 *   and its null values;
 * - update replaces the file, remove deletes it;
 * - an Official filament is never changed (FIL_003), an unknown id is
 *   FIL_001, the same brand, name and color is refused (FIL_004);
 * - a file not written changes nothing (FIL_005), and its reason never
 *   contains a path.
 *
 * The filaments of these tests are test data, not real products.
 *
 * Based on:
 * - DATA_SCHEMA.md (Filament Schema 3.7.0, Repository Data Schema)
 * - ERROR_CODES_SPEC.md (FIL_001, FIL_003, FIL_004, FIL_005)
 * - SECURITY_SPEC.md (Material and Filament Profile Files)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  FilamentManager,
  type FilamentProfileFolder,
} from "../../../src/filament_database/FilamentManager";
import { FilamentProfileFileSchema } from "../../../src/schemas/FilamentSchema";
import { PrinterProfileStorage } from "../../../src/storage/PrinterProfileStorage";
import type { Filament } from "../../../src/types/Filament";

function testFilament(
  id: string,
  brand: string,
  name: string,
  color: string | null,
): Filament {
  return {
    id,
    brand,
    name,
    material: "PLA",
    color,
    diameter: 1.75,
    density: 1.24,
    pricePerKg: color === null ? null : 20,
    temperature: { minNozzle: 190, maxNozzle: 230, minBed: null, maxBed: 60 },
    manufacturerSettings: {
      retractionDistance: null,
      retractionSpeed: null,
      fanSpeed: 100,
      nozzleTemperature: 210,
      bedTemperature: null,
    },
    recommendedProfile: {},
  };
}

// A shipped filament: its four temperatures are required
const officialFilament: Filament = {
  ...testFilament("test_official", "Test", "PLA", null),
  temperature: { minNozzle: 190, maxNozzle: 230, minBed: 35, maxBed: 60 },
};

let root: string;
let official: string;
let custom: string;
let folders: FilamentProfileFolder[];
let ids: number;

function newManager(storage = new PrinterProfileStorage()): FilamentManager {
  const manager = new FilamentManager(storage, () => `user_test_${++ids}`);
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
  root = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-user-filaments-"));
  official = path.join(root, "data", "filaments");
  custom = path.join(root, "user", "filaments");
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
      type: "filament",
      version: "1.0.0",
      source: "Official",
      data: officialFilament,
      validated: false,
    }),
  );
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("Filaments of the user", () => {
  it("adds a filament: id chosen by the main process, file in the user folder", () => {
    const manager = newManager();

    const result = manager.addUserFilament(
      testFilament("ignored", "Home", "Basic", "Red"),
    );

    expect(result).toMatchObject({
      ok: true,
      filament: { id: "user_test_1" },
    });
    expect(manager.getUserFilamentIds()).toEqual(["user_test_1"]);
    const file = readFile("user_test_1.json");
    expect(file).toEqual({
      id: "user_test_1",
      type: "filament",
      version: "1.0.0",
      source: "Local Custom",
      data: testFilament("user_test_1", "Home", "Basic", "Red"),
      validated: false,
    });
    expect(FilamentProfileFileSchema.safeParse(file).success).toBe(true);
    expect(fs.readdirSync(custom)).toEqual(["user_test_1.json"]);

    // Loaded again at the next start, with its values and its null values
    const next = newManager();
    expect(next.getFilament("user_test_1")).toMatchObject({
      color: "Red",
      pricePerKg: 20,
      temperature: { minBed: null },
    });
    expect(next.getUserFilamentIds()).toEqual(["user_test_1"]);
  });

  it("uses a random id that is a valid profile id", () => {
    const manager = new FilamentManager();
    manager.loadProfiles(folders);

    const result = manager.addUserFilament(
      testFilament("x", "Home", "Basic", "Red"),
    );

    expect(result.ok && result.filament.id).toMatch(/^user_[0-9a-f]{32}$/);
  });

  it("updates a filament of the user in its file", () => {
    const manager = newManager();
    manager.addUserFilament(testFilament("x", "Home", "Basic", "Red"));

    const changed = {
      ...testFilament("user_test_1", "Home", "Basic", "Blue"),
      pricePerKg: 25.5,
    };
    expect(manager.updateUserFilament(changed)).toEqual({
      ok: true,
      filament: changed,
    });
    expect(manager.getFilament("user_test_1")).toEqual(changed);
    expect((readFile("user_test_1.json").data as Filament).color).toBe("Blue");
  });

  it("removes a filament of the user and its file", () => {
    const manager = newManager();
    manager.addUserFilament(testFilament("x", "Home", "Basic", "Red"));

    expect(manager.removeUserFilament("user_test_1")).toMatchObject({
      ok: true,
    });
    expect(manager.hasFilament("user_test_1")).toBe(false);
    expect(manager.getUserFilamentIds()).toEqual([]);
    expect(fs.readdirSync(custom)).toEqual([]);
  });

  it("keeps the file name of a filament loaded from the user folder", () => {
    fs.mkdirSync(custom, { recursive: true });
    fs.writeFileSync(
      path.join(custom, "my-filament.json"),
      JSON.stringify({
        id: "mine",
        type: "filament",
        version: "1.0.0",
        source: "Local Custom",
        data: testFilament("mine", "Home", "Mine", "Red"),
        validated: false,
      }),
    );
    const manager = newManager();

    manager.updateUserFilament(testFilament("mine", "Home", "Mine 2", "Red"));
    expect(fs.readdirSync(custom)).toEqual(["my-filament.json"]);

    manager.removeUserFilament("mine");
    expect(fs.readdirSync(custom)).toEqual([]);
  });

  it("never changes an Official filament (FIL_003)", () => {
    const manager = newManager();

    expect(manager.updateUserFilament(officialFilament)).toMatchObject({
      ok: false,
      code: "FIL_003",
    });
    expect(manager.removeUserFilament("test_official")).toMatchObject({
      ok: false,
      code: "FIL_003",
    });
    expect(manager.getFilament("test_official")).toEqual(officialFilament);
    expect(fs.existsSync(custom)).toBe(false);
  });

  it("refuses an unknown filament (FIL_001)", () => {
    const manager = newManager();

    expect(
      manager.updateUserFilament(testFilament("unknown", "Home", "B", "Red")),
    ).toMatchObject({ ok: false, code: "FIL_001" });
    expect(manager.removeUserFilament("unknown")).toMatchObject({
      ok: false,
      code: "FIL_001",
    });
  });

  it("refuses the same brand, name and color, case ignored (FIL_004)", () => {
    const manager = newManager();
    manager.addUserFilament(testFilament("x", "Home", "Basic", "Red"));

    expect(
      manager.addUserFilament(testFilament("x", " test ", "pla", null)),
    ).toMatchObject({ ok: false, code: "FIL_004" });
    expect(
      manager.addUserFilament(testFilament("x", "home", "BASIC", " red ")),
    ).toMatchObject({ ok: false, code: "FIL_004" });

    // Another color is another filament
    expect(
      manager.addUserFilament(testFilament("x", "Home", "Basic", "Black")),
    ).toMatchObject({ ok: true });
    expect(
      manager.addUserFilament(testFilament("x", "Test", "PLA", "Black")),
    ).toMatchObject({ ok: true });

    // A filament keeps its own name when it is updated
    expect(
      manager.updateUserFilament(
        testFilament("user_test_1", "Home", "Basic", "Red"),
      ),
    ).toMatchObject({ ok: true });
    expect(manager.getFilamentCount()).toBe(4);
  });

  it("changes nothing when the file is not written (FIL_005)", () => {
    class FailingStorage extends PrinterProfileStorage {
      public override writeFile(): void {
        throw Object.assign(new Error(`EACCES ${custom}`), { code: "EACCES" });
      }

      public override deleteFile(): void {
        throw Object.assign(new Error(`EACCES ${custom}`), { code: "EACCES" });
      }
    }
    const manager = newManager(new FailingStorage());

    const result = manager.addUserFilament(
      testFilament("x", "Home", "Basic", "Red"),
    );

    expect(result).toEqual({ ok: false, code: "FIL_005", reason: "EACCES" });
    expect(manager.getFilamentCount()).toBe(1);
    expect(manager.getUserFilamentIds()).toEqual([]);
  });

  it("refuses a change without a folder for the user (FIL_005)", () => {
    const manager = new FilamentManager();
    manager.loadProfiles([{ folder: official, source: "Official" }]);

    expect(
      manager.addUserFilament(testFilament("x", "Home", "Basic", "Red")),
    ).toMatchObject({ ok: false, code: "FIL_005" });
  });
});
