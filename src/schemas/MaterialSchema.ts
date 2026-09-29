/**
 * Wichy
 * Material Schema
 *
 * Runtime validation schema.
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - MATERIAL_PROFILE_SPEC.md
 */

import { z } from "zod";

export const TemperatureSchema = z.object({
  minNozzle: z.number().nonnegative(),
  maxNozzle: z.number().nonnegative(),
  minBed: z.number().nonnegative(),
  maxBed: z.number().nonnegative(),
});

export const CoolingSchema = z.object({
  fanMin: z.number().min(0).max(100),
  fanMax: z.number().min(0).max(100),
});

export const PhysicalSchema = z.object({
  density: z.number().positive(),
  shrinkage: z.number().nonnegative(),
  warpingRisk: z.enum([
    "low",
    "medium",
    "high",
  ]),
});

export const RecommendedSettingsSchema = z.object({
  printSpeed: z.number().positive(),
  travelSpeed: z.number().positive(),
  retractionDistance: z.number().nonnegative(),
  retractionSpeed: z.number().nonnegative(),
});

export const MaterialSchema = z.object({
  id: z.string(),

  name: z.string(),

  category: z.string(),

  brand: z.string().optional(),

  description: z.string().optional(),

  temperature: TemperatureSchema,

  cooling: CoolingSchema,

  physical: PhysicalSchema,

  recommended: RecommendedSettingsSchema,
});

export type MaterialSchemaType =
  z.infer<typeof MaterialSchema>;
