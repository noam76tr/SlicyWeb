/**
 * SlicyWeb
 * Printer Form
 *
 * Values of the form of the Printer Manager (GUI_SPEC.md, Printer
 * Manager), kept as typed text, and their conversion to a printer
 * (DATA_SCHEMA.md 3.5.0, Printer Schema):
 * - required: brand, model, build volume X, Y, Z, default nozzle, list
 *   of nozzles (the default nozzle is one of them);
 * - a motion or thermal value left empty is null (unknown, "Not
 *   published"), never 0;
 * - series, manufacturer, firmware, release date: text, empty allowed;
 * - supported is always true; supportedFilaments stays empty until
 *   Phase 9.
 * Numbers accept a comma as decimal separator ("0,4"). The list of
 * nozzles is separated by semicolons or spaces ("0,4; 0,6" or
 * "0.4 0.6"); the list of materials by commas or semicolons.
 *
 * Errors are translation keys (printerManager.error.*), by field.
 *
 * No business logic: the main process validates again (PrinterSchema)
 * and chooses the id of a new printer.
 *
 * Based on:
 * - DATA_SCHEMA.md (Printer Schema)
 * - DECISIONS.md (ADR-032, D6)
 * - GUI_SPEC.md (Printer Manager)
 */

import type { ExtruderType, Printer } from "../../types/Printer";

/** Id sent for a new printer: the main process replaces it */
export const NEW_PRINTER_ID = "user_new";

export interface PrinterForm {
  brand: string;
  model: string;
  series: string;
  manufacturer: string;
  firmware: string;
  releaseDate: string;
  buildX: string;
  buildY: string;
  buildZ: string;
  defaultNozzle: string;
  supportedNozzles: string;
  maxPrintSpeed: string;
  maxTravelSpeed: string;
  maxAcceleration: string;
  maxJerk: string;
  maxNozzleTemp: string;
  maxBedTemp: string;
  maxChamberTemp: string;
  partFan: boolean;
  auxFan: boolean;
  chamberFan: boolean;
  extruderType: ExtruderType;
  extruderCount: string;
  supportedMaterials: string;
}

export type PrinterFormField = keyof PrinterForm;

/** Translation key of the error of each refused field */
export type PrinterFormErrors = Partial<Record<PrinterFormField, string>>;

export type PrinterFormResult =
  { ok: true; printer: Printer } | { ok: false; errors: PrinterFormErrors };

/** Number shown in a field: 2 decimals at most, empty for null */
function text(value: number | null): string {
  return value === null ? "" : String(Math.round(value * 100) / 100);
}

function parseNumber(value: string): number {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? NaN : Number(normalized);
}

/** Items of a list typed as "a, b; c", without the empty ones */
function splitList(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

/**
 * Numbers of a list typed as "0,4; 0,6" or "0.4 0.6": a comma between
 * two digits is a decimal separator, other commas separate the items
 */
function splitNumbers(value: string): number[] {
  return value
    .replace(/(\d),(\d)/g, "$1.$2")
    .split(/[,;\s]+/)
    .filter((item) => item !== "")
    .map(Number);
}

/** An empty form: no value is guessed */
export function emptyPrinterForm(): PrinterForm {
  return {
    brand: "",
    model: "",
    series: "",
    manufacturer: "",
    firmware: "",
    releaseDate: "",
    buildX: "",
    buildY: "",
    buildZ: "",
    defaultNozzle: "",
    supportedNozzles: "",
    maxPrintSpeed: "",
    maxTravelSpeed: "",
    maxAcceleration: "",
    maxJerk: "",
    maxNozzleTemp: "",
    maxBedTemp: "",
    maxChamberTemp: "",
    partFan: false,
    auxFan: false,
    chamberFan: false,
    extruderType: "unknown",
    extruderCount: "1",
    supportedMaterials: "",
  };
}

/** The form of an existing printer */
export function printerToForm(printer: Printer): PrinterForm {
  return {
    brand: printer.brand,
    model: printer.model,
    series: printer.series,
    manufacturer: printer.manufacturer,
    firmware: printer.firmware,
    releaseDate: printer.releaseDate,
    buildX: text(printer.buildVolume.x),
    buildY: text(printer.buildVolume.y),
    buildZ: text(printer.buildVolume.z),
    defaultNozzle: text(printer.defaultNozzle),
    supportedNozzles: printer.supportedNozzles.map(text).join("; "),
    maxPrintSpeed: text(printer.motion.maxPrintSpeed),
    maxTravelSpeed: text(printer.motion.maxTravelSpeed),
    maxAcceleration: text(printer.motion.maxAcceleration),
    maxJerk: text(printer.motion.maxJerk),
    maxNozzleTemp: text(printer.thermal.maxNozzleTemp),
    maxBedTemp: text(printer.thermal.maxBedTemp),
    maxChamberTemp: text(printer.thermal.maxChamberTemp),
    partFan: printer.cooling.partFan,
    auxFan: printer.cooling.auxFan,
    chamberFan: printer.cooling.chamberFan,
    extruderType: printer.extruder.type,
    extruderCount: String(printer.extruder.count),
    supportedMaterials: printer.supportedMaterials.join(", "),
  };
}

/**
 * Converts the form into a printer, or gives the error of each refused
 * field. id is the id of the printer changed, or NEW_PRINTER_ID.
 */
export function formToPrinter(
  form: PrinterForm,
  id: string,
): PrinterFormResult {
  const errors: PrinterFormErrors = {};

  const required = (field: "brand" | "model"): string => {
    const value = form[field].trim();
    if (value === "") {
      errors[field] = "printerManager.error.required";
    }
    return value;
  };

  /** A number over 0 (or 0 and over when zero is allowed) */
  const number = (field: PrinterFormField, allowZero = false): number => {
    const raw = form[field];
    const value = typeof raw === "string" ? parseNumber(raw) : NaN;

    if (typeof raw === "string" && raw.trim() === "") {
      errors[field] = "printerManager.error.required";
    } else if (
      !Number.isFinite(value) ||
      value < 0 ||
      (!allowZero && value === 0)
    ) {
      errors[field] = "printerManager.error.positive";
    }
    return value;
  };

  /** Empty: null (not published); otherwise a number of 0 and over */
  const limit = (field: PrinterFormField): number | null => {
    const raw = form[field];
    if (typeof raw !== "string" || raw.trim() === "") {
      return null;
    }
    return number(field, true);
  };

  const brand = required("brand");
  const model = required("model");
  const buildVolume = {
    x: number("buildX"),
    y: number("buildY"),
    z: number("buildZ"),
  };
  const defaultNozzle = number("defaultNozzle");

  const supportedNozzles = splitNumbers(form.supportedNozzles);
  if (supportedNozzles.length === 0) {
    errors.supportedNozzles = "printerManager.error.required";
  } else if (
    supportedNozzles.some((value) => !Number.isFinite(value) || value <= 0)
  ) {
    errors.supportedNozzles = "printerManager.error.positiveList";
  } else if (
    !errors.defaultNozzle &&
    !supportedNozzles.includes(defaultNozzle)
  ) {
    errors.defaultNozzle = "printerManager.error.nozzleNotInList";
  }

  const extruderCount = number("extruderCount");
  if (!errors.extruderCount && !Number.isInteger(extruderCount)) {
    errors.extruderCount = "printerManager.error.integer";
  }

  const printer: Printer = {
    id,
    brand,
    model,
    series: form.series.trim(),
    manufacturer: form.manufacturer.trim(),
    firmware: form.firmware.trim(),
    releaseDate: form.releaseDate.trim(),
    supported: true,
    buildVolume,
    defaultNozzle,
    supportedNozzles,
    motion: {
      maxPrintSpeed: limit("maxPrintSpeed"),
      maxTravelSpeed: limit("maxTravelSpeed"),
      maxAcceleration: limit("maxAcceleration"),
      maxJerk: limit("maxJerk"),
    },
    thermal: {
      maxNozzleTemp: limit("maxNozzleTemp"),
      maxBedTemp: limit("maxBedTemp"),
      maxChamberTemp: limit("maxChamberTemp"),
    },
    cooling: {
      partFan: form.partFan,
      auxFan: form.auxFan,
      chamberFan: form.chamberFan,
    },
    extruder: { type: form.extruderType, count: extruderCount },
    supportedMaterials: splitList(form.supportedMaterials),
    supportedFilaments: [],
  };

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, printer };
}
