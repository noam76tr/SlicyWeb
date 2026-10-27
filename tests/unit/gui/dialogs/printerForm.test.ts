/**
 * SlicyWeb
 * Printer Form Tests
 *
 * Form of the Printer Manager (Phase 7 lot 61): a value of motion or
 * thermal left empty is null (never 0); numbers accept a comma; the
 * nozzles are split on semicolons and spaces, the materials on commas; required fields, numbers over 0 and the default
 * nozzle in the list of nozzles are checked; a printer goes to the form
 * and back unchanged.
 *
 * Based on:
 * - DATA_SCHEMA.md (Printer Schema 3.5.0)
 * - GUI_SPEC.md (Printer Manager)
 * - TEST_PLAN.md
 */

import { describe, expect, it } from "vitest";

import {
  emptyPrinterForm,
  formToPrinter,
  NEW_PRINTER_ID,
  printerToForm,
  type PrinterForm,
} from "../../../../src/gui/dialogs/printerForm";
import { PrinterSchema } from "../../../../src/schemas/PrinterSchema";
import type { Printer } from "../../../../src/types/Printer";

function filledForm(): PrinterForm {
  return {
    ...emptyPrinterForm(),
    brand: " Home ",
    model: "Box",
    buildX: "220",
    buildY: "220,5",
    buildZ: "250",
    defaultNozzle: "0,4",
    supportedNozzles: "0.4; 0,6 0.8",
    supportedMaterials: "PLA, PETG,",
  };
}

describe("Printer form", () => {
  it("gives null for the limits left empty, never 0", () => {
    const result = formToPrinter(filledForm(), NEW_PRINTER_ID);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.printer.motion).toEqual({
      maxPrintSpeed: null,
      maxTravelSpeed: null,
      maxAcceleration: null,
      maxJerk: null,
    });
    expect(result.printer.thermal.maxChamberTemp).toBeNull();
    expect(result.printer).toMatchObject({
      id: NEW_PRINTER_ID,
      brand: "Home",
      buildVolume: { x: 220, y: 220.5, z: 250 },
      defaultNozzle: 0.4,
      supportedNozzles: [0.4, 0.6, 0.8],
      supportedMaterials: ["PLA", "PETG"],
      supportedFilaments: [],
      supported: true,
      extruder: { type: "unknown", count: 1 },
    });
    expect(PrinterSchema.safeParse(result.printer).success).toBe(true);
  });

  it("refuses missing and invalid values, by field", () => {
    const result = formToPrinter(
      {
        ...filledForm(),
        brand: " ",
        buildX: "0",
        buildZ: "abc",
        maxBedTemp: "-5",
        extruderCount: "1.5",
      },
      NEW_PRINTER_ID,
    );

    expect(result).toEqual({
      ok: false,
      errors: {
        brand: "printerManager.error.required",
        buildX: "printerManager.error.positive",
        buildZ: "printerManager.error.positive",
        maxBedTemp: "printerManager.error.positive",
        extruderCount: "printerManager.error.integer",
      },
    });
  });

  it("refuses a default nozzle that is not in the list", () => {
    expect(
      formToPrinter({ ...filledForm(), defaultNozzle: "0.2" }, "user_1"),
    ).toEqual({
      ok: false,
      errors: { defaultNozzle: "printerManager.error.nozzleNotInList" },
    });
    expect(
      formToPrinter({ ...filledForm(), supportedNozzles: "0.4; x" }, "user_1"),
    ).toEqual({
      ok: false,
      errors: { supportedNozzles: "printerManager.error.positiveList" },
    });
  });

  it("keeps a printer unchanged through the form", () => {
    const printer: Printer = {
      id: "user_1",
      brand: "Home",
      model: "Box",
      series: "B",
      manufacturer: "Home Inc.",
      firmware: "1.2",
      releaseDate: "2025",
      supported: true,
      buildVolume: { x: 256, y: 256, z: 256 },
      defaultNozzle: 0.4,
      supportedNozzles: [0.2, 0.4],
      motion: {
        maxPrintSpeed: 500,
        maxTravelSpeed: null,
        maxAcceleration: 20000,
        maxJerk: null,
      },
      thermal: { maxNozzleTemp: 300, maxBedTemp: 110, maxChamberTemp: 0 },
      cooling: { partFan: true, auxFan: true, chamberFan: false },
      extruder: { type: "direct_drive", count: 2 },
      supportedMaterials: ["PLA", "ABS"],
      supportedFilaments: [],
    };

    expect(formToPrinter(printerToForm(printer), "user_1")).toEqual({
      ok: true,
      printer,
    });
  });
});
