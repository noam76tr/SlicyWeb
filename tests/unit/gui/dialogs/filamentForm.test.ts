/**
 * SlicyWeb
 * Filament Form Tests
 *
 * Form of the Filament Manager (Phase 8 lot 71): a value left empty is
 * null (never 0), an empty color is null; numbers accept a comma; brand,
 * name and family are required; numbers of 0 and over (density over 0),
 * a fan speed of 0 to 100 and a minimum not above its maximum are
 * checked; a filament goes to the form and back unchanged.
 *
 * Based on:
 * - DATA_SCHEMA.md (Filament Schema 3.7.0)
 * - GUI_SPEC.md (Filament Manager)
 * - TEST_PLAN.md
 */

import { describe, expect, it } from "vitest";

import {
  emptyFilamentForm,
  filamentToForm,
  formToFilament,
  NEW_FILAMENT_ID,
  type FilamentForm,
} from "../../../../src/gui/dialogs/filamentForm";
import { FilamentSchema } from "../../../../src/schemas/FilamentSchema";
import type { Filament } from "../../../../src/types/Filament";

function filledForm(): FilamentForm {
  return {
    ...emptyFilamentForm("PLA"),
    brand: " Home ",
    name: "Basic",
    color: " Red ",
    pricePerKg: "19,90",
    minNozzle: "190",
    maxNozzle: "230",
  };
}

describe("Filament form", () => {
  it("gives null for the values left empty, never 0", () => {
    const result = formToFilament(filledForm(), NEW_FILAMENT_ID);

    expect(result).toEqual({
      ok: true,
      filament: {
        id: NEW_FILAMENT_ID,
        brand: "Home",
        name: "Basic",
        material: "PLA",
        color: "Red",
        diameter: 1.75,
        density: null,
        pricePerKg: 19.9,
        temperature: {
          minNozzle: 190,
          maxNozzle: 230,
          minBed: null,
          maxBed: null,
        },
        manufacturerSettings: {
          retractionDistance: null,
          retractionSpeed: null,
          fanSpeed: null,
          nozzleTemperature: null,
          bedTemperature: null,
        },
        recommendedProfile: {},
      },
    });
    if (!result.ok) return;
    expect(FilamentSchema.safeParse(result.filament).success).toBe(true);

    const noColor = formToFilament(
      { ...filledForm(), color: " " },
      NEW_FILAMENT_ID,
    );
    expect(noColor.ok && noColor.filament.color).toBeNull();
  });

  it("refuses missing and invalid values, by field", () => {
    const result = formToFilament(
      {
        ...filledForm(),
        brand: " ",
        material: "",
        density: "0",
        pricePerKg: "-1",
        fanSpeed: "120",
        retractionDistance: "abc",
      },
      NEW_FILAMENT_ID,
    );

    expect(result).toEqual({
      ok: false,
      errors: {
        brand: "filamentManager.error.required",
        material: "filamentManager.error.required",
        density: "filamentManager.error.positive",
        pricePerKg: "filamentManager.error.number",
        fanSpeed: "filamentManager.error.percent",
        retractionDistance: "filamentManager.error.number",
      },
    });
  });

  it("refuses a maximum below its minimum", () => {
    expect(
      formToFilament({ ...filledForm(), minBed: "70", maxBed: "60" }, "user_1"),
    ).toEqual({
      ok: false,
      errors: { maxBed: "filamentManager.error.minAboveMax" },
    });

    // One bound alone is accepted
    expect(formToFilament({ ...filledForm(), minBed: "70" }, "user_1").ok).toBe(
      true,
    );
  });

  it("keeps a filament unchanged through the form", () => {
    const filament: Filament = {
      id: "user_1",
      brand: "Home",
      name: "Silk",
      material: "PETG",
      color: "Gold",
      diameter: 2.85,
      density: 1.27,
      pricePerKg: 24.5,
      temperature: { minNozzle: 230, maxNozzle: 250, minBed: 70, maxBed: 80 },
      manufacturerSettings: {
        retractionDistance: 0.8,
        retractionSpeed: 40,
        fanSpeed: 30,
        nozzleTemperature: 240,
        bedTemperature: null,
      },
      recommendedProfile: {},
    };

    expect(formToFilament(filamentToForm(filament), filament.id)).toEqual({
      ok: true,
      filament,
    });
  });
});
