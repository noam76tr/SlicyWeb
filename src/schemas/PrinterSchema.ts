/**
 * Wichy
 * Printer Schema
 *
 * Runtime validation schema.
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - PRINTER_PROFILE_SPEC.md
 */

import { z } from "zod";

export const BuildVolumeSchema = z.object({
  x: z.number().positive(),
  y: z.number().positive(),
  z: z.number().positive(),
});

export const MotionSystemSchema = z.object({
  maxPrintSpeed: z.number().nonnegative(),
  maxTravelSpeed: z.number().nonnegative(),
  maxAcceleration: z.number().nonnegative(),
  maxJerk: z.number().nonnegative(),
});

export const ThermalSystemSchema = z.object({
  maxNozzleTemp: z.number().nonnegative(),
  maxBedTemp: z.number().nonnegative(),
  maxChamberTemp: z.number().nonnegative(),
});

export const CoolingSystemSchema = z.object({
  partFan: z.boolean(),
  auxFan: z.boolean(),
  chamberFan: z.boolean(),
});

export const ExtruderSchema = z.object({
  type: z.enum([
    "direct_drive",
    "bowden",
    "unknown",
  ]),
  count: z.number().int().positive(),
});

export const PrinterSchema = z.object({
  id: z.string(),

  brand: z.string(),

  model: z.string(),

  series: z.string(),

  manufacturer: z.string(),

  firmware: z.string(),

  releaseDate: z.string(),

  supported: z.boolean(),

  buildVolume: BuildVolumeSchema,

  defaultNozzle: z.number().positive(),

  supportedNozzles: z.array(
    z.number().positive(),
  ),

  motion: MotionSystemSchema,

  thermal: ThermalSystemSchema,

  cooling: CoolingSystemSchema,

  extruder: ExtruderSchema,

  supportedMaterials: z.array(
    z.string(),
  ),

  supportedFilaments: z.array(
    z.string(),
  ),
});

export type PrinterSchemaType =
  z.infer<typeof PrinterSchema>;
