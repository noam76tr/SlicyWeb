/**
 * SlicyWeb
 * Material Schema
 *
 * Runtime validation schema.
 *
 * - MaterialSchema: a material, a family of plastic (Complete Material
 *   Schema, flat). A value is a number (or a warpingRisk value), or null
 *   when it is not published (null = not published, never 0). Unknown
 *   fields are refused.
 * - MaterialProfileFileSchema: a material profile file, a Repository
 *   Data Schema envelope whose data is a material (ADR-033, D3).
 * - MATERIAL_FAMILIES: the reference list of the families (category of a
 *   material, material of a filament).
 *
 * Based on:
 * - DATA_SCHEMA.md (Complete Material Schema 3.7.0, Material rules,
 *   Repository Data Schema)
 * - MATERIAL_PROFILE_SPEC.md (Material Families 2.0.0)
 * - DECISIONS.md (ADR-033, D3, D4)
 */

import { z } from "zod";

/**
 * Reference list of the families (MATERIAL_PROFILE_SPEC.md, Material
 * Families). A variant (PLA+, PLA Matte) is a filament, not a family.
 */
export const MATERIAL_FAMILIES = [
  "PLA",
  "PETG",
  "ABS",
  "ASA",
  "TPU",
  "PA",
  "PC",
  "PVA",
  "HIPS",
  "PP",
  "PET",
  "PLA-CF",
  "PETG-CF",
  "PA-CF",
  "PET-CF",
] as const;

export const MaterialFamilySchema = z.enum(MATERIAL_FAMILIES);

/** id of a material or a filament: lowercase letters, digits and "_" */
export const ProfileIdSchema = z
  .string()
  .regex(/^[a-z0-9_]+$/, "Only lowercase letters, digits and _");

/** Degrees Celsius, or null when not published */
const TemperatureValueSchema = z.number().nonnegative().nullable();

/** Fan speed in percent, or null when not published */
const PercentSchema = z.number().min(0).max(100).nullable();

/** True when both values are known and min is above max */
function inverted(min: number | null, max: number | null): boolean {
  return min !== null && max !== null && min > max;
}

/**
 * Material Thermal Properties: also the temperature ranges of a filament
 * (DATA_SCHEMA.md, Filament Schema).
 */
export const TemperatureSchema = z
  .object({
    minNozzle: TemperatureValueSchema,
    maxNozzle: TemperatureValueSchema,
    minBed: TemperatureValueSchema,
    maxBed: TemperatureValueSchema,
  })
  .strict()
  .superRefine((temperature, context) => {
    if (inverted(temperature.minNozzle, temperature.maxNozzle)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minNozzle is above maxNozzle",
        path: ["minNozzle"],
      });
    }

    if (inverted(temperature.minBed, temperature.maxBed)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minBed is above maxBed",
        path: ["minBed"],
      });
    }
  });

export const CoolingSchema = z
  .object({
    fanMin: PercentSchema,
    fanMax: PercentSchema,
  })
  .strict()
  .refine((cooling) => !inverted(cooling.fanMin, cooling.fanMax), {
    message: "fanMin is above fanMax",
    path: ["fanMin"],
  });

export const PhysicalSchema = z
  .object({
    density: z.number().positive().nullable(),
    shrinkage: z.number().nonnegative().nullable(),
    warpingRisk: z.enum(["low", "medium", "high"]).nullable(),
  })
  .strict();

export const RecommendedSettingsSchema = z
  .object({
    printSpeed: z.number().positive().nullable(),
    travelSpeed: z.number().positive().nullable(),
    retractionDistance: z.number().nonnegative().nullable(),
    retractionSpeed: z.number().nonnegative().nullable(),
  })
  .strict();

export const MaterialSchema = z
  .object({
    id: ProfileIdSchema,
    name: z.string().trim().min(1),
    category: MaterialFamilySchema,
    brand: z.string().optional(),
    description: z.string().optional(),
    temperature: TemperatureSchema,
    cooling: CoolingSchema,
    physical: PhysicalSchema,
    recommended: RecommendedSettingsSchema,
  })
  .strict();

export type MaterialSchemaType = z.infer<typeof MaterialSchema>;

/**
 * Source types of a material or filament profile (the Profile Source
 * Types of the printers, PRINTER_PROFILE_SPEC.md). SlicyWeb loads
 * Official materials and filaments (data/materials/, data/filaments/)
 * and Local Custom filaments (filaments of the user).
 */
export const ProfileSourceSchema = z.enum([
  "Official",
  "Verified Repository",
  "Community",
  "Local Custom",
]);

export type ProfileSource = z.infer<typeof ProfileSourceSchema>;

/** The four temperatures are required (not null) for a shipped profile */
export function hasAllTemperatures(temperature: {
  minNozzle: number | null;
  maxNozzle: number | null;
  minBed: number | null;
  maxBed: number | null;
}): boolean {
  return Object.values(temperature).every((value) => value !== null);
}

/**
 * Material profile file (DATA_SCHEMA.md, Repository Data Schema).
 * The id of the envelope is the id of the material. validated is written
 * false in the files: the loader trusts a profile only after this
 * validation.
 */
export const MaterialProfileFileSchema = z
  .object({
    id: ProfileIdSchema,
    type: z.literal("material"),
    version: z.string().trim().min(1),
    source: ProfileSourceSchema,
    data: MaterialSchema,
    validated: z.boolean(),
  })
  .strict()
  .refine((file) => file.id === file.data.id, {
    message: "The id of the profile file is not the id of its material",
    path: ["id"],
  })
  .refine(
    (file) =>
      file.source !== "Official" || hasAllTemperatures(file.data.temperature),
    {
      message:
        "The nozzle and bed temperatures of a shipped material are required",
      path: ["data", "temperature"],
    },
  );

export type MaterialProfileFile = z.infer<typeof MaterialProfileFileSchema>;
