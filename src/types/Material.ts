/**
 * Wichy
 * Material Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - MATERIAL_PROFILE_SPEC.md
 */

export interface MaterialTemperature {
  minNozzle: number;
  maxNozzle: number;

  minBed: number;
  maxBed: number;
}

export interface MaterialCooling {
  fanMin: number;
  fanMax: number;
}

export type WarpingRisk =
  | "low"
  | "medium"
  | "high";

export interface MaterialPhysical {
  density: number;

  shrinkage: number;

  warpingRisk: WarpingRisk;
}

export interface MaterialRecommendedSettings {
  printSpeed: number;

  travelSpeed: number;

  retractionDistance: number;

  retractionSpeed: number;
}

export interface Material {
  id: string;

  name: string;

  category: string;

  description: string;

  temperature: MaterialTemperature;

  cooling: MaterialCooling;

  physical: MaterialPhysical;

  recommended: MaterialRecommendedSettings;
}
