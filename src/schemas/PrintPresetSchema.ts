/**
 * SlicyWeb
 * Preset Schema Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - PRINT_PRESETS_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import { z } from "zod";

import {
  ADHESION_TYPES,
  PRESET_CATEGORIES,
  SUPPORT_TYPES
} from "../constants/PresetConstants";

/**
 * Print Preset Schema (DATA_SCHEMA.md).
 */
export const PresetSchema = z.object({
  name: z.string().min(1),

  category: z.enum(PRESET_CATEGORIES),

  description: z.string(),

  settings: z.object({
    layerHeight: z.number(),

    wallCount: z.number(),

    topLayers: z.number(),

    bottomLayers: z.number(),

    infillDensity: z.number(),

    infillPattern: z.string(),

    supportEnabled: z.boolean(),

    supportType: z.enum(SUPPORT_TYPES),

    adhesionType: z.enum(ADHESION_TYPES),

    printSpeed: z.number(),

    fanSpeed: z.number()
  }),

  confidenceScore: z.number().min(0).max(100)
});

export type PresetSchemaType =
  z.infer<typeof PresetSchema>;
