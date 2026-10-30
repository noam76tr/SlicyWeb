/**
 * SlicyWeb
 * Material Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - MATERIAL_PROFILE_SPEC.md
 * - MaterialSchema.ts
 *
 * A material is a family (category: a name of the Material Families of
 * MATERIAL_PROFILE_SPEC.md). A value is null when it is not published:
 * null means not published, never 0 (DATA_SCHEMA.md 3.7.0, ADR-033).
 */

export interface MaterialTemperature {
  minNozzle: number | null;
  maxNozzle: number | null;

  minBed: number | null;
  maxBed: number | null;
}

export interface MaterialCooling {
  fanMin: number | null;
  fanMax: number | null;
}

export type WarpingRisk =
  | "low"
  | "medium"
  | "high";

export interface MaterialPhysical {
  density: number | null;

  shrinkage: number | null;

  warpingRisk: WarpingRisk | null;
}

export interface MaterialRecommendedSettings {
  printSpeed: number | null;

  travelSpeed: number | null;

  retractionDistance: number | null;

  retractionSpeed: number | null;
}

export interface Material {
  id: string;

  name: string;

  category: string;

  brand?: string;

  description?: string;

  temperature: MaterialTemperature;

  cooling: MaterialCooling;

  physical: MaterialPhysical;

  recommended: MaterialRecommendedSettings;
}
