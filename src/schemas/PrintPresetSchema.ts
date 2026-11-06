/**
 * SlicyWeb
 * Preset Schema Definition
 *
 * - PresetSchema: Print Preset Schema and Preset Settings (DATA_SCHEMA.md
 *   3.10.0, ADR-035 D4 and D5): strict, no fan value, support types
 *   without organic (tree is the only name of the tree supports).
 * - PresetProfileFileSchema: a preset file of data/presets/, a Repository
 *   Data Schema envelope of type "preset" (DATA_SCHEMA.md 3.10.0,
 *   Repository Data Schema).
 *
 * Based on:
 * - DATA_SCHEMA.md (Print Preset Schema, Preset Settings, Repository Data
 *   Schema 3.10.0)
 * - PRINT_PRESETS_SPEC.md 1.3.0 (Shipped Presets)
 * - PRINT_SETTINGS_SPEC.md
 */

import { z } from "zod";

import {
  ADHESION_TYPES,
  PRESET_CATEGORIES,
  SUPPORT_TYPES
} from "../constants/PresetConstants";

import {
  ProfileIdSchema,
  ProfileSourceSchema
} from "./MaterialSchema";

/** A whole number of walls or layers */
const CountSchema = z.number().int().nonnegative();

/**
 * Preset Settings (DATA_SCHEMA.md 3.10.0): layerHeight in mm;
 * wallCount, topLayers, bottomLayers whole numbers; infillDensity
 * percentage 0 to 100; printSpeed in mm/s. No other field is accepted.
 */
export const PresetSettingsSchema = z
  .object({
    layerHeight: z.number().positive(),

    wallCount: CountSchema,

    topLayers: CountSchema,

    bottomLayers: CountSchema,

    infillDensity: z.number().min(0).max(100),

    infillPattern: z.string().min(1),

    supportEnabled: z.boolean(),

    supportType: z.enum(SUPPORT_TYPES),

    adhesionType: z.enum(ADHESION_TYPES),

    printSpeed: z.number().positive()
  })
  .strict();

/**
 * Print Preset Schema (DATA_SCHEMA.md).
 */
export const PresetSchema = z
  .object({
    name: z.string().min(1),

    category: z.enum(PRESET_CATEGORIES),

    description: z.string(),

    settings: PresetSettingsSchema,

    confidenceScore: z.number().min(0).max(100)
  })
  .strict();

export type PresetSchemaType =
  z.infer<typeof PresetSchema>;

/**
 * Preset file (DATA_SCHEMA.md, Repository Data Schema, type "preset").
 * In the shipped presets, the id of the envelope is the stored value of
 * the category of the preset, also the name of its file (as balanced.json, PRINT_PRESETS_SPEC.md
 * 1.3.0, Shipped Presets). validated is written false in the files: the
 * loader trusts a preset only after this validation.
 */
export const PresetProfileFileSchema = z
  .object({
    id: ProfileIdSchema,
    type: z.literal("preset"),
    version: z.string().trim().min(1),
    source: ProfileSourceSchema,
    data: PresetSchema,
    validated: z.boolean()
  })
  .strict();

export type PresetProfileFile =
  z.infer<typeof PresetProfileFileSchema>;
