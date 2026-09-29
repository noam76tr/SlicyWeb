/**
 * Wichy
 * Preset Schema Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - PRINT_PRESETS_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import { z } from "zod";

export const PresetSchema = z.object({
  name: z.string(),

  category: z.string(),

  description: z.string(),

  settings: z.object({
    layerHeight: z.number(),

    wallCount: z.number(),

    topLayers: z.number(),

    bottomLayers: z.number(),

    infillDensity: z.number(),

    infillPattern: z.string(),

    supportEnabled: z.boolean(),

    supportType: z.string(),

    adhesionType: z.string(),

    printSpeed: z.number(),

    fanSpeed: z.number()
  })
});

export type PresetSchemaType =
  z.infer<typeof PresetSchema>;
