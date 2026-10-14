/**
 * SlicyWeb
 * Recommendation Schema Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import { z } from "zod";

import { AnalysisClassificationSchema } from "./AnalysisSchema";
import { PresetSchema } from "./PrintPresetSchema";
import { ResultStatusSchema } from "./ProjectSchema";

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

  type: z.enum([
    "none",
    "organic",
    "tree",
    "standard"
  ])
});

export const RecommendedProfileSchema =
  z.object({
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

  message: z.string()
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

    filamentId: z.string().min(1),

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
