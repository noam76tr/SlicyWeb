/**
 * SlicyWeb
 * Printer Schema
 *
 * Runtime validation schema.
 *
 * - PrinterSchema: a printer (Complete Printer Schema, flat). A value of
 *   motion or thermal is a number, or null when the manufacturer does
 *   not publish it (null = unknown, never 0). Unknown fields are refused.
 * - PrinterProfileFileSchema: a printer profile file, a Repository Data
 *   Schema envelope whose data is a printer (ADR-032, D3).
 *
 * Based on:
 * - DATA_SCHEMA.md (Printer Schema 3.5.0, Repository Data Schema)
 * - PRINTER_PROFILE_SPEC.md (Alignment With DATA_SCHEMA.md, Profile
 *   Source Types)
 * - DECISIONS.md (ADR-032)
 */

import { z } from "zod";

/** Number of motion or thermal: null when not published (unknown) */
const LimitSchema = z.number().nonnegative().nullable();

export const BuildVolumeSchema = z
  .object({
    x: z.number().positive(),
    y: z.number().positive(),
    z: z.number().positive(),
  })
  .strict();

export const MotionSystemSchema = z
  .object({
    maxPrintSpeed: LimitSchema,
    maxTravelSpeed: LimitSchema,
    maxAcceleration: LimitSchema,
    maxJerk: LimitSchema,
  })
  .strict();

export const ThermalSystemSchema = z
  .object({
    maxNozzleTemp: LimitSchema,
    maxBedTemp: LimitSchema,
    maxChamberTemp: LimitSchema,
  })
  .strict();

export const CoolingSystemSchema = z
  .object({
    partFan: z.boolean(),
    auxFan: z.boolean(),
    chamberFan: z.boolean(),
  })
  .strict();

export const ExtruderSchema = z
  .object({
    type: z.enum(["direct_drive", "bowden", "unknown"]),
    count: z.number().int().positive(),
  })
  .strict();

export const PrinterSchema = z
  .object({
    id: z.string().trim().min(1),
    brand: z.string().trim().min(1),
    model: z.string().trim().min(1),
    series: z.string(),
    manufacturer: z.string(),
    firmware: z.string(),
    releaseDate: z.string(),
    supported: z.boolean(),
    buildVolume: BuildVolumeSchema,
    defaultNozzle: z.number().positive(),
    supportedNozzles: z.array(z.number().positive()).min(1),
    motion: MotionSystemSchema,
    thermal: ThermalSystemSchema,
    cooling: CoolingSystemSchema,
    extruder: ExtruderSchema,
    supportedMaterials: z.array(z.string()),
    supportedFilaments: z.array(z.string()),
  })
  .strict();

export type PrinterSchemaType = z.infer<typeof PrinterSchema>;

/**
 * Source types of a printer profile (PRINTER_PROFILE_SPEC.md, Profile
 * Source Types). SlicyWeb loads Official (data/printers/, the SlicyWeb
 * profile repository) and Local Custom (printers of the user) profiles.
 */
export const PrinterProfileSourceSchema = z.enum([
  "Official",
  "Verified Repository",
  "Community",
  "Local Custom",
]);

export type PrinterProfileSource = z.infer<typeof PrinterProfileSourceSchema>;

/**
 * Printer profile file (DATA_SCHEMA.md, Repository Data Schema).
 * The id of the envelope is the id of the printer. validated is written
 * false in the files: the loader trusts a profile only after this
 * validation.
 */
export const PrinterProfileFileSchema = z
  .object({
    id: z.string().trim().min(1),
    type: z.literal("printer"),
    version: z.string().trim().min(1),
    source: PrinterProfileSourceSchema,
    data: PrinterSchema,
    validated: z.boolean(),
  })
  .strict()
  .refine((file) => file.id === file.data.id, {
    message: "The id of the profile file is not the id of its printer",
    path: ["id"],
  });

export type PrinterProfileFile = z.infer<typeof PrinterProfileFileSchema>;
