/**
 * SlicyWeb
 * Recommendation Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - PRINT_PRESETS_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import type { ResultStatus } from "./Analysis";
import type { Classification } from "./Classification";
import type { PrintPreset } from "./PrintPreset";
import type { Warning } from "./Warning";

/**
 * Support Type values (DATA_SCHEMA.md 3.10.0): tree is the only name of
 * the tree supports (ADR-035 D5).
 */
export type SupportType =
  | "none"
  | "tree"
  | "standard";

export type AdhesionType =
  | "none"
  | "skirt"
  | "brim"
  | "raft";

export interface QualitySettings {
  layerHeight: number;
  wallCount: number;
  topLayers: number;
  bottomLayers: number;
}

export interface SpeedSettings {
  print: number;
  outerWall: number;
  innerWall: number;
  infill: number;
  travel: number;
}

export interface CoolingSettings {
  fanSpeed: number;
  minimumLayerTime: number;
}

export interface RetractionSettings {
  distance: number;
  speed: number;
}

/**
 * Temperature Settings (DATA_SCHEMA.md 3.10.0, ADR-035 D7): degrees
 * Celsius, whole numbers.
 */
export interface TemperatureSettings {
  nozzle: number;
  bed: number;
}

export interface SupportSettings {
  enabled: boolean;
  type: SupportType;
}

/**
 * Recommended Profile Schema (DATA_SCHEMA.md).
 */
export interface RecommendedProfile {
  preset: PrintPreset;

  quality: QualitySettings;

  speed: SpeedSettings;

  cooling: CoolingSettings;

  retraction: RetractionSettings;

  supports: SupportSettings;

  adhesion: AdhesionType;

  temperature: TemperatureSettings;

  infillDensity: number;

  infillPattern: string;

  confidenceScore: number;
}

export interface OptimizationResult {
  orientationScore: number;

  supportReduction: number;

  timeReduction: number;

  materialReduction: number;
}

/**
 * Recommendation of one object (DATA_SCHEMA.md, Recommendation Schema).
 */
export interface Recommendation {
  recommendationId: string;

  objectId: string;

  printerId: string;

  materialId: string;

  /** null when no filament is selected (DATA_SCHEMA.md 3.10.0) */
  filamentId: string | null;

  analysisId: string;

  classification: Classification;

  recommendedProfile: RecommendedProfile;

  preset: PrintPreset;

  warnings: Warning[];

  confidenceScore: number;

  createdAt: string;

  status: ResultStatus;
}
