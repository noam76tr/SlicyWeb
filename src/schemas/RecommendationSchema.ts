/**
 * Wichy
 * Recommendation Schema Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import { z } from "zod";

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

export const RecommendationSchema =
  z.object({
    recommendedProfile:
      RecommendedProfileSchema,

    printPreset: z.string(),

    optimization:
      OptimizationSchema,

    warnings: z.array(
      WarningSchema
    ),

    confidenceScore: z.number()
  });

export type RecommendationSchemaType =
  z.infer<
    typeof RecommendationSchema
  >;
