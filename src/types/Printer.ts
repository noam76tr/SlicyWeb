/**
 * SlicyWeb
 * Printer Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - PRINTER_PROFILE_SPEC.md
 *
 * A value of motion or thermal is null when the manufacturer does not
 * publish it: null means unknown, never 0 (DATA_SCHEMA.md 3.5.0,
 * ADR-032).
 */

export interface BuildVolume {
  x: number;
  y: number;
  z: number;
}

export interface MotionSystem {
  maxPrintSpeed: number | null;
  maxTravelSpeed: number | null;
  maxAcceleration: number | null;
  maxJerk: number | null;
}

export interface ThermalSystem {
  maxNozzleTemp: number | null;
  maxBedTemp: number | null;
  maxChamberTemp: number | null;
}

export interface CoolingSystem {
  partFan: boolean;
  auxFan: boolean;
  chamberFan: boolean;
}

export type ExtruderType =
  | "direct_drive"
  | "bowden"
  | "unknown";

export interface Extruder {
  type: ExtruderType;
  count: number;
}

export interface Printer {
  id: string;

  brand: string;

  model: string;

  series: string;

  manufacturer: string;

  firmware: string;

  releaseDate: string;

  supported: boolean;

  buildVolume: BuildVolume;

  defaultNozzle: number;

  supportedNozzles: number[];

  motion: MotionSystem;

  thermal: ThermalSystem;

  cooling: CoolingSystem;

  extruder: Extruder;

  supportedMaterials: string[];

  supportedFilaments: string[];
}
