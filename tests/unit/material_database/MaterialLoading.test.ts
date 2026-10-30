/**
 * SlicyWeb
 * Material and Filament Loading Tests
 *
 * Material and filament profile files read by the main process (ADR-033,
 * D3, D4, D6): a value not published is null, never read as 0; an
 * unknown field, a family not in the reference list or an inverted range
 * is refused; a shipped (Official) profile needs its four temperatures,
 * and a shipped filament has no color and no price per kg; a refused
 * file (MAT_002, FIL_002) does not stop the other files; a filament of
 * the user never replaces an Official filament.
 *
 * The materials and filaments of these tests are test data, not real
 * products.
 *
 * Based on:
 * - DATA_SCHEMA.md (Complete Material Schema and Filament Schema 3.7.0,
 *   Repository Data Schema)
 * - MATERIAL_PROFILE_SPEC.md (Material Families)
 * - ERROR_CODES_SPEC.md (MAT_002, FIL_002)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FilamentImporter } from "../../../src/filament_database/FilamentImporter";
import { FilamentManager } from "../../../src/filament_database/FilamentManager";
import { MaterialImporter } from "../../../src/material_database/MaterialImporter";
import { MaterialManager } from "../../../src/material_database/MaterialManager";
import { FilamentSchema } from "../../../src/schemas/FilamentSchema";
import { MaterialSchema } from "../../../src/schemas/MaterialSchema";
import { MAX_PROFILE_FILE_SIZE } from "../../../src/storage/PrinterProfileStorage";

function testMaterial(id = "test_pla"): Record<string, unknown> {
  return {
    id,
    name: "PLA",
    category: "PLA",
    temperature: { minNozzle: 190, maxNozzle: 230, minBed: 35, maxBed: 65 },
    cooling: { fanMin: null, fanMax: null },
    physical: { density: 1.24, shrinkage: null, warpingRisk: null },
    recommended: {
      printSpeed: null,
      travelSpeed: null,
      retractionDistance: null,
      retractionSpeed: null,
    },
  };
}

function testFilament(id = "test_pla_basic"): Record<string, unknown> {
  return {
    id,
    brand: "Test",
    name: "PLA Basic",
    material: "PLA",
    color: null,
    diameter: 1.75,
    density: 1.24,
    pricePerKg: null,
    temperature: { minNozzle: 190, maxNozzle: 230, minBed: 35, maxBed: 45 },
    manufacturerSettings: {
      retractionDistance: null,
      retractionSpeed: null,
      fanSpeed: null,
      nozzleTemperature: 220,
      bedTemperature: null,
    },
    recommendedProfile: {},
  };
}

function profileFile(
  type: "material" | "filament",
  data: Record<string, unknown>,
  source = "Official",
): Record<string, unknown> {
  return { id: data.id, type, version: "1.0.0", source, data, validated: false };
}

let root: string;
let materials: string;
let filaments: string;
let userFilaments: string;

function write(folder: string, name: string, content: unknown): void {
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(
    path.join(folder, name),
    typeof content === "string" ? content : JSON.stringify(content),
  );
}

function loadFilaments(manager: FilamentManager) {
  return manager.loadProfiles([
    { folder: filaments, source: "Official" },
    { folder: userFilaments, source: "Local Custom" },
  ]);
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-materials-"));
  materials = path.join(root, "data", "materials");
  filaments = path.join(root, "data", "filaments");
  userFilaments = path.join(root, "user", "filaments");
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("Material Schema", () => {
  it("keeps null (not published) and 0 as different values", () => {
    const material = MaterialSchema.parse({
      ...testMaterial(),
      cooling: { fanMin: 0, fanMax: null },
    });

    expect(material.cooling.fanMin).toBe(0);
    expect(material.cooling.fanMax).toBeNull();
    expect(material.physical.warpingRisk).toBeNull();
  });

  it("refuses an unknown field, a missing field, a family not listed and an inverted range", () => {
    const missing = testMaterial();
    delete missing.cooling;

    for (const material of [
      { ...testMaterial(), color: "red" },
      missing,
      { ...testMaterial(), category: "WOOD" },
      { ...testMaterial(), id: "Test-PLA" },
      {
        ...testMaterial(),
        temperature: { minNozzle: 240, maxNozzle: 230, minBed: 35, maxBed: 65 },
      },
      {
        ...testMaterial(),
        physical: { density: 1.24, shrinkage: null, warpingRisk: null, extra: 1 },
      },
    ]) {
      expect(MaterialSchema.safeParse(material).success).toBe(false);
    }
  });

  it("imports a material through the schema (Import Material)", () => {
    const importer = new MaterialImporter();

    expect(importer.importFromJson(JSON.stringify(testMaterial()))?.id).toBe(
      "test_pla",
    );
    expect(importer.importFromJson('{ "id": ')).toBeNull();
    expect(
      importer.importMany(
        JSON.stringify([testMaterial(), { ...testMaterial("b"), category: "?" }]),
      ),
    ).toHaveLength(1);
  });
});

describe("Filament Schema", () => {
  it("accepts a filament of the user with a color and a price", () => {
    const filament = FilamentSchema.parse({
      ...testFilament(),
      color: "Red",
      pricePerKg: 24.9,
    });

    expect(filament.color).toBe("Red");
    expect(filament.manufacturerSettings.fanSpeed).toBeNull();
  });

  it("refuses a sixth manufacturer setting, another diameter, a recommended profile and a family not listed", () => {
    for (const filament of [
      {
        ...testFilament(),
        manufacturerSettings: {
          ...(testFilament().manufacturerSettings as object),
          flowRatio: 0.98,
        },
      },
      { ...testFilament(), diameter: 3 },
      { ...testFilament(), recommendedProfile: { layerHeight: 0.2 } },
      { ...testFilament(), material: "PLA+" },
      { ...testFilament(), density: 0 },
    ]) {
      expect(FilamentSchema.safeParse(filament).success).toBe(false);
    }

    expect(() => new FilamentImporter().import({ id: "x" })).toThrow();
  });
});

describe("Material loading", () => {
  it("loads the valid files and refuses the others with MAT_002", () => {
    write(materials, "pla.json", profileFile("material", testMaterial("pla")));
    write(materials, "broken.json", '{ "id": ');
    write(
      materials,
      "no_temperature.json",
      profileFile("material", {
        ...testMaterial("petg"),
        category: "PETG",
        temperature: { minNozzle: 220, maxNozzle: 250, minBed: null, maxBed: null },
      }),
    );
    write(
      materials,
      "user.json",
      profileFile("material", testMaterial("abs"), "Local Custom"),
    );
    write(materials, "pla_copy.json", profileFile("material", testMaterial("pla")));
    write(materials, "big.json", "x".repeat(MAX_PROFILE_FILE_SIZE + 1));
    write(materials, "README.me", "not a profile");

    const manager = new MaterialManager();
    const result = manager.loadProfiles([
      { folder: materials, source: "Official" },
    ]);

    expect(manager.getMaterials().map(({ id }) => id)).toEqual(["pla"]);
    expect(result.loaded).toBe(1);
    expect(
      result.rejected.map(({ fileName, code }) => `${code} ${fileName}`).sort(),
    ).toEqual([
      "MAT_002 big.json",
      "MAT_002 broken.json",
      "MAT_002 no_temperature.json",
      "MAT_002 pla_copy.json",
      "MAT_002 user.json",
    ]);
    expect(
      result.rejected.find(({ fileName }) => fileName === "no_temperature.json")
        ?.reason,
    ).toContain("data.temperature");
  });

  it("loads nothing, without an error, when the folder is missing", () => {
    const result = new MaterialManager().loadProfiles([
      { folder: materials, source: "Official" },
    ]);

    expect(result).toEqual({ loaded: 0, rejected: [] });
  });
});

describe("Filament loading", () => {
  it("loads Official and user filaments, never a user filament over an Official one", () => {
    write(filaments, "a.json", profileFile("filament", testFilament("a")));
    write(
      userFilaments,
      "mine.json",
      profileFile(
        "filament",
        { ...testFilament("mine"), color: "Blue", pricePerKg: 20, density: null },
        "Local Custom",
      ),
    );
    write(
      userFilaments,
      "same_id.json",
      profileFile("filament", testFilament("a"), "Local Custom"),
    );

    const manager = new FilamentManager();
    const result = loadFilaments(manager);

    expect(manager.getFilaments().map(({ id }) => id)).toEqual(["a", "mine"]);
    expect(manager.getUserFilamentIds()).toEqual(["mine"]);
    expect(manager.getFilament("mine")?.density).toBeNull();
    expect(result.rejected).toEqual([
      {
        fileName: "same_id.json",
        source: "Local Custom",
        code: "FIL_002",
        reason: "id: a is already loaded",
      },
    ]);
  });

  it("refuses a shipped filament with a color, a price or a missing temperature", () => {
    write(
      filaments,
      "color.json",
      profileFile("filament", { ...testFilament("color"), color: "White" }),
    );
    write(
      filaments,
      "price.json",
      profileFile("filament", { ...testFilament("price"), pricePerKg: 25 }),
    );
    write(
      filaments,
      "bed.json",
      profileFile("filament", {
        ...testFilament("bed"),
        temperature: { minNozzle: 190, maxNozzle: 230, minBed: null, maxBed: 45 },
      }),
    );
    write(
      filaments,
      "other_id.json",
      { ...profileFile("filament", testFilament("x")), id: "y" },
    );

    const result = loadFilaments(new FilamentManager());

    expect(result.loaded).toBe(0);
    expect(
      result.rejected.map(({ fileName, reason }) => `${fileName} ${reason}`),
    ).toEqual([
      "bed.json data.temperature: The nozzle and bed temperatures of a shipped filament are required",
      "color.json data.color: The color of a shipped filament is null",
      "other_id.json id: The id of the profile file is not the id of its filament",
      "price.json data.pricePerKg: The price per kg of a shipped filament is null",
    ]);
  });

  it("accepts a filament of the user with temperatures not published", () => {
    write(
      userFilaments,
      "mine.json",
      profileFile(
        "filament",
        {
          ...testFilament("mine"),
          temperature: {
            minNozzle: null,
            maxNozzle: null,
            minBed: null,
            maxBed: null,
          },
        },
        "Local Custom",
      ),
    );

    const manager = new FilamentManager();

    expect(loadFilaments(manager).loaded).toBe(1);
    expect(manager.getFilament("mine")?.temperature.minNozzle).toBeNull();
  });
});
