/**
 * SlicyWeb
 * Material and Filament Profiles Tests
 *
 * The profiles shipped in data/materials/ and data/filaments/ (ADR-033,
 * D2, D8): each file passes its profile file schema, is named after its
 * id, has the source Official and is listed in the SOURCES.md of its
 * folder; each filament belongs to a shipped family; the temperature
 * ranges of a family are the smallest minimum and the largest maximum of
 * its filaments, and its density is the density of its filaments when
 * they are all the same (null otherwise); the loaders of the main process
 * load them all, without refused file.
 *
 * Based on:
 * - DATA_SCHEMA.md (Complete Material Schema and Filament Schema 3.7.0,
 *   Repository Data Schema)
 * - DECISIONS.md (ADR-033)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { FilamentManager } from "../../../src/filament_database/FilamentManager";
import { MaterialManager } from "../../../src/material_database/MaterialManager";
import {
  FilamentProfileFileSchema,
  type FilamentSchemaType,
} from "../../../src/schemas/FilamentSchema";
import { MaterialProfileFileSchema } from "../../../src/schemas/MaterialSchema";

const MATERIALS = path.resolve(__dirname, "../../../data/materials");
const FILAMENTS = path.resolve(__dirname, "../../../data/filaments");

function jsonFiles(folder: string): string[] {
  return fs
    .readdirSync(folder)
    .filter((name) => name.endsWith(".json") && name !== "index.json")
    .sort();
}

function read(folder: string, name: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(folder, name), "utf8"));
}

const materialFiles = jsonFiles(MATERIALS);
const filamentFiles = jsonFiles(FILAMENTS);

const filaments: FilamentSchemaType[] = filamentFiles.map(
  (name) => FilamentProfileFileSchema.parse(read(FILAMENTS, name)).data,
);

describe("Material and filament profiles of data/", () => {
  it("contains the 5 families and the 11 product lines of the first list", () => {
    expect(materialFiles).toEqual([
      "abs.json",
      "asa.json",
      "petg.json",
      "pla.json",
      "tpu.json",
    ]);
    expect(filamentFiles).toHaveLength(11);
  });

  it.each(materialFiles)(
    "%s passes the schema, with its id and source",
    (name) => {
      const profile = MaterialProfileFileSchema.parse(read(MATERIALS, name));

      expect(`${profile.id}.json`).toBe(name);
      expect(profile.source).toBe("Official");
      expect(profile.validated).toBe(false);
    },
  );

  it.each(filamentFiles)(
    "%s passes the schema, with its id and source",
    (name) => {
      const profile = FilamentProfileFileSchema.parse(read(FILAMENTS, name));

      expect(`${profile.id}.json`).toBe(name);
      expect(profile.source).toBe("Official");
      expect(profile.validated).toBe(false);
      expect(profile.data.diameter).toBe(1.75);
    },
  );

  it.each(materialFiles)(
    "%s takes its ranges and density from its filaments",
    (name) => {
      const material = MaterialProfileFileSchema.parse(
        read(MATERIALS, name),
      ).data;
      const family = filaments.filter(
        ({ material: category }) => category === material.category,
      );
      const values = (pick: (filament: FilamentSchemaType) => number | null) =>
        family.map(pick).filter((value): value is number => value !== null);
      const densities = new Set(values(({ density }) => density));

      expect(family.length).toBeGreaterThan(0);
      expect(material.temperature).toEqual({
        minNozzle: Math.min(
          ...values(({ temperature }) => temperature.minNozzle),
        ),
        maxNozzle: Math.max(
          ...values(({ temperature }) => temperature.maxNozzle),
        ),
        minBed: Math.min(...values(({ temperature }) => temperature.minBed)),
        maxBed: Math.max(...values(({ temperature }) => temperature.maxBed)),
      });
      expect(material.physical.density).toBe(
        densities.size === 1 ? [...densities][0] : null,
      );
    },
  );

  it("gives each filament a shipped family", () => {
    const families = materialFiles.map(
      (name) =>
        MaterialProfileFileSchema.parse(read(MATERIALS, name)).data.category,
    );

    for (const filament of filaments) {
      expect(families).toContain(filament.material);
    }
  });

  it("lists each profile in its SOURCES.md", () => {
    const materialSources = fs.readFileSync(
      path.join(MATERIALS, "SOURCES.md"),
      "utf8",
    );
    const filamentSources = fs.readFileSync(
      path.join(FILAMENTS, "SOURCES.md"),
      "utf8",
    );

    expect(filamentSources).toContain("read on 2026-10-30");
    for (const name of materialFiles) {
      expect(materialSources).toContain(`(${name})`);
    }
    for (const name of filamentFiles) {
      expect(filamentSources).toContain(`(${name})`);
      expect(materialSources).toContain(name.replace(".json", ""));
    }
  });

  it("loads all the profiles in the main process, none refused", () => {
    const materials = new MaterialManager();
    const filamentManager = new FilamentManager();

    expect(
      materials.loadProfiles([{ folder: MATERIALS, source: "Official" }]),
    ).toEqual({ loaded: 5, rejected: [] });
    expect(
      filamentManager.loadProfiles([{ folder: FILAMENTS, source: "Official" }]),
    ).toEqual({ loaded: 11, rejected: [] });
    expect(materials.getMaterial("pla")?.temperature).toEqual({
      minNozzle: 190,
      maxNozzle: 230,
      minBed: 25,
      maxBed: 60,
    });
  });
});
