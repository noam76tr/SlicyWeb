/**
 * SlicyWeb
 * Filament Form
 *
 * Values of the form of the Filament Manager (GUI_SPEC.md, Filament
 * Manager), kept as typed text, and their conversion to a filament
 * (DATA_SCHEMA.md 3.7.0, Filament Schema):
 * - required: brand, name, family (material), diameter (1.75 or 2.85);
 * - color: text, empty is null ("Not specified");
 * - density, price per kg, the temperatures and the values of the
 *   manufacturer left empty are null ("Not published"), never 0;
 * - a minimum is never above its maximum, when both are given;
 * - the fan speed is a percentage (0 to 100);
 * - recommendedProfile stays {} until the recommendation engine
 *   (Phase 10).
 * Numbers accept a comma as decimal separator ("1,24"); the numbers of a
 * filament are shown with the decimal separator of the language (lot 81).
 *
 * Errors are translation keys (filamentManager.error.*), by field.
 *
 * No business logic: the main process validates again (FilamentSchema)
 * and chooses the id of a new filament.
 *
 * Based on:
 * - DATA_SCHEMA.md (Filament Schema 3.7.0, Filament rules)
 * - FILAMENT_SETTINGS_SPEC.md
 * - DECISIONS.md (ADR-033, D4, D10)
 * - GUI_SPEC.md (Filament Manager)
 */

import type { SupportedLanguage } from "../../i18n/LanguageManager";
import { formatFieldNumber } from "../../i18n/NumberFormatter";
import type { Filament } from "../../types/Filament";

/** Id sent for a new filament: the main process replaces it */
export const NEW_FILAMENT_ID = "user_new";

/** Diameters of the Filament Schema, in mm */
export const FILAMENT_DIAMETERS = ["1.75", "2.85"] as const;

export type FilamentDiameter = (typeof FILAMENT_DIAMETERS)[number];

export interface FilamentForm {
  brand: string;
  name: string;
  material: string;
  color: string;
  diameter: FilamentDiameter;
  density: string;
  pricePerKg: string;
  minNozzle: string;
  maxNozzle: string;
  minBed: string;
  maxBed: string;
  nozzleTemperature: string;
  bedTemperature: string;
  fanSpeed: string;
  retractionDistance: string;
  retractionSpeed: string;
}

export type FilamentFormField = keyof FilamentForm;

/** Translation key of the error of each refused field */
export type FilamentFormErrors = Partial<Record<FilamentFormField, string>>;

export type FilamentFormResult =
  { ok: true; filament: Filament } | { ok: false; errors: FilamentFormErrors };

/**
 * Number shown in a field: decimal separator of the language, 2 decimals
 * at most, empty for null
 */
function text(value: number | null, language: SupportedLanguage): string {
  return value === null ? "" : formatFieldNumber(value, language);
}

function parseNumber(value: string): number {
  return Number(value.trim().replace(",", "."));
}

/** An empty form: no value is guessed */
export function emptyFilamentForm(material = ""): FilamentForm {
  return {
    brand: "",
    name: "",
    material,
    color: "",
    diameter: "1.75",
    density: "",
    pricePerKg: "",
    minNozzle: "",
    maxNozzle: "",
    minBed: "",
    maxBed: "",
    nozzleTemperature: "",
    bedTemperature: "",
    fanSpeed: "",
    retractionDistance: "",
    retractionSpeed: "",
  };
}

/** The form of an existing filament */
export function filamentToForm(
  filament: Filament,
  language: SupportedLanguage = "en",
): FilamentForm {
  return {
    brand: filament.brand,
    name: filament.name,
    material: filament.material,
    color: filament.color ?? "",
    diameter: filament.diameter === 2.85 ? "2.85" : "1.75",
    density: text(filament.density, language),
    pricePerKg: text(filament.pricePerKg, language),
    minNozzle: text(filament.temperature.minNozzle, language),
    maxNozzle: text(filament.temperature.maxNozzle, language),
    minBed: text(filament.temperature.minBed, language),
    maxBed: text(filament.temperature.maxBed, language),
    nozzleTemperature: text(
      filament.manufacturerSettings.nozzleTemperature,
      language,
    ),
    bedTemperature: text(
      filament.manufacturerSettings.bedTemperature,
      language,
    ),
    fanSpeed: text(filament.manufacturerSettings.fanSpeed, language),
    retractionDistance: text(
      filament.manufacturerSettings.retractionDistance,
      language,
    ),
    retractionSpeed: text(
      filament.manufacturerSettings.retractionSpeed,
      language,
    ),
  };
}

/**
 * Converts the form into a filament, or gives the error of each refused
 * field. id is the id of the filament changed, or NEW_FILAMENT_ID.
 */
export function formToFilament(
  form: FilamentForm,
  id: string,
): FilamentFormResult {
  const errors: FilamentFormErrors = {};

  const required = (field: "brand" | "name" | "material"): string => {
    const value = form[field].trim();
    if (value === "") {
      errors[field] = "filamentManager.error.required";
    }
    return value;
  };

  /**
   * Empty: null (not published); otherwise a number of 0 and over (over
   * 0 when zero is not allowed), at most max when max is given
   */
  const optional = (
    field: FilamentFormField,
    options: { allowZero?: boolean; max?: number } = {},
  ): number | null => {
    const raw = form[field];
    if (raw.trim() === "") {
      return null;
    }

    const value = parseNumber(raw);
    const allowZero = options.allowZero ?? true;

    if (!Number.isFinite(value) || value < 0 || (!allowZero && value === 0)) {
      errors[field] = allowZero
        ? "filamentManager.error.number"
        : "filamentManager.error.positive";
    } else if (options.max !== undefined && value > options.max) {
      errors[field] = "filamentManager.error.percent";
    }
    return value;
  };

  /** The maximum of a range is never below its minimum */
  const range = (
    minField: FilamentFormField,
    maxField: FilamentFormField,
  ): [number | null, number | null] => {
    const min = optional(minField);
    const max = optional(maxField);

    if (
      min !== null &&
      max !== null &&
      !errors[minField] &&
      !errors[maxField] &&
      min > max
    ) {
      errors[maxField] = "filamentManager.error.minAboveMax";
    }
    return [min, max];
  };

  const brand = required("brand");
  const name = required("name");
  const material = required("material");
  const color = form.color.trim();
  const [minNozzle, maxNozzle] = range("minNozzle", "maxNozzle");
  const [minBed, maxBed] = range("minBed", "maxBed");

  const filament: Filament = {
    id,
    brand,
    name,
    material,
    color: color === "" ? null : color,
    diameter: form.diameter === "2.85" ? 2.85 : 1.75,
    density: optional("density", { allowZero: false }),
    pricePerKg: optional("pricePerKg"),
    temperature: { minNozzle, maxNozzle, minBed, maxBed },
    manufacturerSettings: {
      retractionDistance: optional("retractionDistance"),
      retractionSpeed: optional("retractionSpeed"),
      fanSpeed: optional("fanSpeed", { max: 100 }),
      nozzleTemperature: optional("nozzleTemperature"),
      bedTemperature: optional("bedTemperature"),
    },
    recommendedProfile: {},
  };

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, filament };
}
