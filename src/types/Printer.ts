/**
 * Wichy
 * Printer Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - PRINTER_PROFILE_SPEC.md
 */

export interface BuildVolume {
  x: number;
  y: number;
  z: number;
}

export interface MotionSystem {
  maxPrintSpeed: number;
  maxTravelSpeed: number;
  maxAcceleration: number;
  maxJerk: number;
}

export interface ThermalSystem {
  maxNozzleTemp: number;
  maxBedTemp: number;
  maxChamberTemp: number;
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
