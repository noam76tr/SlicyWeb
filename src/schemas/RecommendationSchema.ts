/**
 * SlicyWeb
 * Recommendation Schema Definition
 *
 * Recommendation Schema, Recommended Profile Schema and Warning Schema
 * of DATA_SCHEMA.md 3.10.0 (ADR-035 D7 to D9, Phase 10 lot 87):
 * temperature {nozzle, bed} required, filamentId null when no filament
 * is selected, supports {enabled, type} without organic, warnings with
 * source and recommendedAction.
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import { z } from "zod";

import {
  AnalysisClassificationSchema,
  ResultStatusSchema
} from "./AnalysisSchema";
import { SUPPORT_TYPES } from "../constants/PresetConstants";

import { PresetSchema } from "./PrintPresetSchema";

export const QualitySettingsSchema = z.object({
  layerHeight: z.number(),

  wallCount: z.number(),

  topLayers: z.number(),

  bottomLayers: z.number()
});

export const SpeedSettingsSchema = z.object({
  print: z.number(),

  outerWall: z.number(),

  innerWall: z.number(),

  infill: z.number(),

  travel: z.number()
});

export const CoolingSettingsSchema = z.object({
  fanSpeed: z.number(),

  minimumLayerTime: z.number()
});

export const RetractionSettingsSchema = z.object({
  distance: z.number(),

  speed: z.number()
});

export const SupportSettingsSchema = z.object({
  enabled: z.boolean(),

  type: z.enum(SUPPORT_TYPES)
});

/**
 * Temperature Settings (DATA_SCHEMA.md 3.10.0): whole numbers of degrees
 * Celsius, both required.
 */
export const TemperatureSettingsSchema = z.object({
  nozzle: z.number().int().nonnegative(),

  bed: z.number().int().nonnegative()
});

/**
 * Recommended Profile Schema (DATA_SCHEMA.md).
 */
export const RecommendedProfileSchema =
  z.object({
    preset: PresetSchema,

    quality: QualitySettingsSchema,

    speed: SpeedSettingsSchema,

    cooling: CoolingSettingsSchema,

    retraction: RetractionSettingsSchema,

    supports: SupportSettingsSchema,

    adhesion: z.enum([
      "none",
      "skirt",
      "brim",
      "raft"
    ]),

    temperature: TemperatureSettingsSchema,

    infillDensity: z.number(),

    infillPattern: z.string(),

    confidenceScore: z.number()
  });

export const WarningSchema = z.object({
  code: z.string(),

  severity: z.enum([
    "info",
    "low",
    "medium",
    "high",
    "critical"
  ]),

  message: z.string(),

  source: z.string(),

  recommendedAction: z.string()
});

export const OptimizationSchema =
  z.object({
    orientationScore: z.number(),

    supportReduction: z.number(),

    timeReduction: z.number(),

    materialReduction: z.number()
  });

/**
 * Recommendation Schema (DATA_SCHEMA.md).
 */
export const RecommendationSchema =
  z.object({
    recommendationId: z.string().min(1),

    objectId: z.string().min(1),

    printerId: z.string().min(1),

    materialId: z.string().min(1),

    // null when no filament is selected (DATA_SCHEMA.md 3.10.0)
    filamentId: z.string().min(1).nullable(),

    analysisId: z.string().min(1),

    classification:
      AnalysisClassificationSchema,

    recommendedProfile:
      RecommendedProfileSchema,

    preset: PresetSchema,

    warnings: z.array(
      WarningSchema
    ),

    confidenceScore: z.number(),

    createdAt: z.string().min(1),

    status: ResultStatusSchema
  });

export type RecommendationSchemaType =
  z.infer<
    typeof RecommendationSchema
  >;
