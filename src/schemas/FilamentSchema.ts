/**
 * Wichy
 * Filament Schema
 *
 * Runtime validation schema.
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 */

import { z } from "zod";

export const FilamentSchema = z.object({
  id: z.string(),

  brand: z.string(),

  name: z.string(),

  material: z.string(),

  color: z.string(),

  diameter: z.number().positive(),

  density: z.number().positive(),

  recommendedProfile: z.record(
    z.string(),
    z.unknown(),
  ),

  manufacturerSettings: z.record(
    z.string(),
    z.unknown(),
  ),

  pricePerKg: z.number().nonnegative(),
});

export type FilamentSchemaType =
  z.infer<typeof FilamentSchema>;
