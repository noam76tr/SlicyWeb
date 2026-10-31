/**
 * SlicyWeb
 * Material Selection Tests
 *
 * Materials and filaments of the window (Phase 8 lot 70): the materials
 * and filaments served by material:getAll and filament:getAll are
 * validated, the materials sorted in the order of the families and the
 * filaments by brand, then by name; the last material and filament are
 * selected again when autoloadLastMaterial is true and they are still
 * loaded; a filament selects its family; a material of another family
 * clears the filament; each choice is saved (settings:update,
 * material.defaultMaterial and defaultFilament); an invalid response is
 * refused; outside Electron nothing happens. The aliases of the
 * families (Flex = TPU, NYLON = PA) give the warning "Not listed by the
 * printer manufacturer" only when the printer lists materials. The
 * filaments of the user (Phase 8 lot 71) are changed through
 * filament:add, filament:update and filament:remove, then read again:
 * the selected filament follows its update and its family, and is
 * cleared (with the saved choice) when it is removed; a refused change
 * gives the errors of the main process.
 *
 * The bridge window.slicyWeb is replaced by a fake one: the tests run in
 * Node.js, without Electron. The materials and filaments are test data.
 *
 * Based on:
 * - DATA_SCHEMA.md (Complete Material Schema, Filament Schema, User
 *   Preferences Schema 3.7.0)
 * - MATERIAL_PROFILE_SPEC.md (Material Families, aliases)
 * - API_SPEC.md (MaterialIPC, FilamentIPC and SettingsIPC Channels)
 * - ERROR_CODES_SPEC.md (FIL_003)
 * - TEST_PLAN.md
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  familyOf,
  isFamilyNotListed,
} from "../../../src/material_database/MaterialFamilies";
import { MaterialSelectionService } from "../../../src/services/MaterialSelectionService";
import { useFilamentStore } from "../../../src/state/filamentStore";
import { useMaterialStore } from "../../../src/state/materialStore";
import type { Filament } from "../../../src/types/Filament";
import type { Material } from "../../../src/types/Material";
import type { MaterialPreferences } from "../../../src/types/UserPreferences";

const temperature = { minNozzle: 190, maxNozzle: 230, minBed: 35, maxBed: 60 };

function makeMaterial(family: string): Material {
  return {
    id: family.toLowerCase(),
    name: family,
    category: family,
    temperature,
    cooling: { fanMin: null, fanMax: null },
    physical: { density: null, shrinkage: null, warpingRisk: null },
    recommended: {
      printSpeed: null,
      travelSpeed: null,
      retractionDistance: null,
      retractionSpeed: null,
    },
  };
}

function makeFilament(id: string, brand: string, family: string): Filament {
  return {
    id,
    brand,
    name: `${family} ${id}`,
    material: family,
    color: null,
    diameter: 1.75,
    density: null,
    pricePerKg: null,
    temperature,
    manufacturerSettings: {
      retractionDistance: null,
      retractionSpeed: null,
      fanSpeed: null,
      nozzleTemperature: null,
      bedTemperature: null,
    },
    recommendedProfile: {},
  };
}

const pla = makeMaterial("PLA");
const petg = makeMaterial("PETG");
const zetaPla = makeFilament("zeta_pla", "Zeta", "PLA");
const alphaPla = makeFilament("alpha_pla", "Alpha", "PLA");
const alphaPetg = makeFilament("alpha_petg", "Alpha", "PETG");

let materials: unknown[];
let filaments: Filament[];
let preferences: MaterialPreferences;
let invoke: ReturnType<typeof vi.fn>;

function settingsResponse(): unknown {
  return {
    success: true,
    data: { settings: { material: preferences } },
    errors: [],
  };
}

beforeEach(() => {
  materials = [petg, pla];
  filaments = [zetaPla, alphaPetg, alphaPla];
  preferences = {
    defaultMaterial: null,
    defaultFilament: null,
    autoloadLastMaterial: true,
  };
  invoke = vi.fn((channel: string, payload?: unknown) => {
    switch (channel) {
      case "material:getAll":
        return Promise.resolve({
          success: true,
          data: { materials },
          errors: [],
        });
      case "filament:getAll":
        return Promise.resolve({
          success: true,
          data: {
            filaments,
            userFilamentIds: ["zeta_pla"],
          },
          errors: [],
        });
      case "settings:get":
        return Promise.resolve(settingsResponse());
      case "filament:update": {
        const filament = payload as Filament;
        if (filament.id !== "zeta_pla") {
          return Promise.resolve({
            success: false,
            errors: ["FIL_003 Filament Not Editable"],
          });
        }
        filaments = filaments.map((item) =>
          item.id === filament.id ? filament : item,
        );
        return Promise.resolve({
          success: true,
          data: { filament },
          errors: [],
        });
      }
      case "filament:remove": {
        const { filamentId } = payload as { filamentId: string };
        filaments = filaments.filter((item) => item.id !== filamentId);
        return Promise.resolve({
          success: true,
          data: { filamentId },
          errors: [],
        });
      }
      case "settings:update":
        preferences = (payload as { material: MaterialPreferences }).material;
        return Promise.resolve(settingsResponse());
      default:
        return Promise.reject(new Error(`Unexpected channel ${channel}`));
    }
  });
  vi.stubGlobal("window", { slicyWeb: { invoke } });
  useMaterialStore.setState({ materials: [], selectedMaterial: null });
  useFilamentStore.setState({
    filaments: [],
    userFilamentIds: [],
    selectedFilament: null,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Material selection", () => {
  it("loads the materials in the order of the families and the filaments by brand", async () => {
    await MaterialSelectionService.load();

    expect(useMaterialStore.getState().materials.map(({ id }) => id)).toEqual([
      "pla",
      "petg",
    ]);
    expect(useFilamentStore.getState().filaments.map(({ id }) => id)).toEqual([
      "alpha_petg",
      "alpha_pla",
      "zeta_pla",
    ]);
    expect(useFilamentStore.getState().userFilamentIds).toEqual(["zeta_pla"]);
    expect(useMaterialStore.getState().selectedMaterial).toBeNull();
  });

  it("selects the last material and filament again", async () => {
    preferences = {
      defaultMaterial: "pla",
      defaultFilament: "alpha_pla",
      autoloadLastMaterial: true,
    };

    await MaterialSelectionService.load();

    expect(useMaterialStore.getState().selectedMaterial?.id).toBe("pla");
    expect(useFilamentStore.getState().selectedFilament?.id).toBe("alpha_pla");
  });

  it("ignores a last choice no longer loaded, of another family, or with autoload off", async () => {
    preferences = {
      defaultMaterial: "petg",
      defaultFilament: "alpha_pla",
      autoloadLastMaterial: true,
    };
    await MaterialSelectionService.load();
    expect(useMaterialStore.getState().selectedMaterial?.id).toBe("petg");
    expect(useFilamentStore.getState().selectedFilament).toBeNull();

    useMaterialStore.setState({ selectedMaterial: null });
    preferences = {
      defaultMaterial: "abs",
      defaultFilament: "gone",
      autoloadLastMaterial: true,
    };
    await MaterialSelectionService.load();
    expect(useMaterialStore.getState().selectedMaterial).toBeNull();
    expect(useFilamentStore.getState().selectedFilament).toBeNull();

    preferences = {
      defaultMaterial: "pla",
      defaultFilament: null,
      autoloadLastMaterial: false,
    };
    await MaterialSelectionService.load();
    expect(useMaterialStore.getState().selectedMaterial).toBeNull();
  });

  it("selects the family of a filament and saves both", async () => {
    await MaterialSelectionService.load();
    await MaterialSelectionService.selectFilament("alpha_petg");

    expect(useMaterialStore.getState().selectedMaterial?.id).toBe("petg");
    expect(preferences).toEqual({
      defaultMaterial: "petg",
      defaultFilament: "alpha_petg",
      autoloadLastMaterial: true,
    });
  });

  it("clears the filament when another family is chosen, keeps it otherwise", async () => {
    await MaterialSelectionService.load();
    await MaterialSelectionService.selectFilament("alpha_pla");
    await MaterialSelectionService.selectMaterial("pla");
    expect(useFilamentStore.getState().selectedFilament?.id).toBe("alpha_pla");

    await MaterialSelectionService.selectMaterial("petg");
    expect(useFilamentStore.getState().selectedFilament).toBeNull();
    expect(preferences.defaultFilament).toBeNull();

    await MaterialSelectionService.selectMaterial(null);
    expect(preferences).toMatchObject({
      defaultMaterial: null,
      defaultFilament: null,
    });
  });

  it("refuses an invalid response and does nothing outside Electron", async () => {
    materials = [{ ...pla, category: "WOOD" }];
    await MaterialSelectionService.load();
    expect(useMaterialStore.getState().materials).toEqual([]);

    vi.stubGlobal("window", {});
    await MaterialSelectionService.selectMaterial("pla");
    expect(invoke).not.toHaveBeenCalledWith(
      "settings:update",
      expect.anything(),
    );
  });
});

describe("Filaments of the user", () => {
  it("follows the update of the selected filament and its family", async () => {
    await MaterialSelectionService.load();
    await MaterialSelectionService.selectFilament("zeta_pla");

    const changed = { ...zetaPla, material: "PETG", color: "Blue" };
    await expect(
      MaterialSelectionService.updateFilament(changed),
    ).resolves.toEqual({ ok: true, filament: changed });

    expect(useFilamentStore.getState().selectedFilament).toEqual(changed);
    expect(useMaterialStore.getState().selectedMaterial?.id).toBe("petg");
    expect(preferences).toMatchObject({
      defaultMaterial: "petg",
      defaultFilament: "zeta_pla",
    });
  });

  it("clears the selected filament and the saved choice when it is removed", async () => {
    await MaterialSelectionService.load();
    await MaterialSelectionService.selectFilament("zeta_pla");

    await expect(
      MaterialSelectionService.removeFilament("zeta_pla"),
    ).resolves.toEqual({ ok: true, filament: null });

    expect(useFilamentStore.getState().filaments.map(({ id }) => id)).toEqual([
      "alpha_petg",
      "alpha_pla",
    ]);
    expect(useFilamentStore.getState().selectedFilament).toBeNull();
    expect(useMaterialStore.getState().selectedMaterial?.id).toBe("pla");
    expect(preferences).toMatchObject({
      defaultMaterial: "pla",
      defaultFilament: null,
    });
  });

  it("gives the errors of a refused change", async () => {
    await MaterialSelectionService.load();

    await expect(
      MaterialSelectionService.updateFilament(alphaPla),
    ).resolves.toEqual({
      ok: false,
      errors: ["FIL_003 Filament Not Editable"],
    });
  });
});

describe("Material families of a printer", () => {
  it("reads the words of the manufacturers with the aliases", () => {
    expect(familyOf("Flex")).toBe("TPU");
    expect(familyOf("NYLON")).toBe("PA");
    expect(familyOf("Nylon")).toBe("PA");
    expect(familyOf("petg")).toBe("PETG");
    expect(familyOf("CPE")).toBeNull();
  });

  it("warns only when the printer lists materials without the family", () => {
    expect(isFamilyNotListed([], "ASA")).toBe(false);
    expect(isFamilyNotListed(["PLA", "PETG", "Flex"], "TPU")).toBe(false);
    expect(isFamilyNotListed(["PLA", "PETG", "Flex"], "ASA")).toBe(true);
    expect(isFamilyNotListed(["CPE"], "PLA")).toBe(true);
  });
});
