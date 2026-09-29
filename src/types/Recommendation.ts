/**
 * Wichy
 * Recommendation Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - PRINT_PRESETS_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import type { PrintPreset } from "./PrintPreset";
import type { Warning } from "./Warning";

export type SupportType =
  | "none"
  | "organic"
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

export interface SupportSettings {
  enabled: boolean;
  type: SupportType;
}

export interface RecommendedProfile {
  printPreset: PrintPreset;

  quality: QualitySettings;

  speed: SpeedSettings;

  cooling: CoolingSettings;

  retraction: RetractionSettings;

  supports: SupportSettings;

  adhesion: AdhesionType;

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

export interface Recommendation {
  recommendedProfile: RecommendedProfile;

  printPreset: PrintPreset;

  optimization: OptimizationResult;

  warnings: Warning[];

  confidenceScore: number;
}
