/**
 * SlicyWeb
 * Filament Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 * - FilamentSchema.ts
 *
 * A filament is a product line of a brand in a family (material). A value
 * is null when it is not published: null means not published, never 0
 * (DATA_SCHEMA.md 3.7.0, ADR-033). A shipped filament has no color and no
 * price per kg (null); the user gives them for their own filaments.
 */

import type { MaterialTemperature } from "./Material";

/** The single values published by the manufacturer, or null */
export interface FilamentManufacturerSettings {
  retractionDistance: number | null;
  retractionSpeed: number | null;
  fanSpeed: number | null;
  nozzleTemperature: number | null;
  bedTemperature: number | null;
}

export interface Filament {
  id: string;

  brand: string;

  name: string;

  material: string;

  color: string | null;

  diameter: 1.75 | 2.85;

  density: number | null;

  pricePerKg: number | null;

  temperature: MaterialTemperature;

  manufacturerSettings: FilamentManufacturerSettings;

  /** Stays empty until the recommendation engine (Phase 10) */
  recommendedProfile: Record<string, never>;
}
