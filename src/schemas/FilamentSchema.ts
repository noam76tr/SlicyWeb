/**
 * SlicyWeb
 * Filament Schema
 *
 * Runtime validation schema.
 *
 * - FilamentSchema: a filament, a product line of a brand in a family
 *   (Filament Schema, flat). density, pricePerKg, the values of
 *   temperature and of manufacturerSettings are numbers, or null when not
 *   published (never 0). Unknown fields are refused.
 * - FilamentProfileFileSchema: a filament profile file, a Repository Data
 *   Schema envelope whose data is a filament (ADR-033, D3). A shipped
 *   (Official) filament is a product line: its color and its price per kg
 *   are null, its four temperatures are required.
 *
 * Based on:
 * - DATA_SCHEMA.md (Filament Schema 3.7.0, Filament rules, Repository
 *   Data Schema)
 * - FILAMENT_SETTINGS_SPEC.md
 * - DECISIONS.md (ADR-033, D3, D4)
 */

import { z } from "zod";

import {
  hasAllTemperatures,
  MaterialFamilySchema,
  ProfileIdSchema,
  ProfileSourceSchema,
  TemperatureSchema,
} from "./MaterialSchema";

/** The five single values published by the manufacturer, or null */
export const ManufacturerSettingsSchema = z
  .object({
    retractionDistance: z.number().nonnegative().nullable(),
    retractionSpeed: z.number().nonnegative().nullable(),
    fanSpeed: z.number().min(0).max(100).nullable(),
    nozzleTemperature: z.number().nonnegative().nullable(),
    bedTemperature: z.number().nonnegative().nullable(),
  })
  .strict();

export const FilamentSchema = z
  .object({
    id: ProfileIdSchema,
    brand: z.string().trim().min(1),
    name: z.string().trim().min(1),
    material: MaterialFamilySchema,
    color: z.string().trim().min(1).nullable(),
    diameter: z.union([z.literal(1.75), z.literal(2.85)]),
    density: z.number().positive().nullable(),
    pricePerKg: z.number().nonnegative().nullable(),
    temperature: TemperatureSchema,
    manufacturerSettings: ManufacturerSettingsSchema,
    // Stays {} until the recommendation engine (Phase 10)
    recommendedProfile: z.object({}).strict(),
  })
  .strict();

export type FilamentSchemaType = z.infer<typeof FilamentSchema>;

/**
 * Filament profile file (DATA_SCHEMA.md, Repository Data Schema).
 * The id of the envelope is the id of the filament. validated is written
 * false in the files: the loader trusts a profile only after this
 * validation.
 */
export const FilamentProfileFileSchema = z
  .object({
    id: ProfileIdSchema,
    type: z.literal("filament"),
    version: z.string().trim().min(1),
    source: ProfileSourceSchema,
    data: FilamentSchema,
    validated: z.boolean(),
  })
  .strict()
  .refine((file) => file.id === file.data.id, {
    message: "The id of the profile file is not the id of its filament",
    path: ["id"],
  })
  .superRefine((file, context) => {
    if (file.source !== "Official") {
      return;
    }

    if (!hasAllTemperatures(file.data.temperature)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "The nozzle and bed temperatures of a shipped filament are required",
        path: ["data", "temperature"],
      });
    }

    if (file.data.color !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The color of a shipped filament is null",
        path: ["data", "color"],
      });
    }

    if (file.data.pricePerKg !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The price per kg of a shipped filament is null",
        path: ["data", "pricePerKg"],
      });
    }
  });

export type FilamentProfileFile = z.infer<typeof FilamentProfileFileSchema>;
