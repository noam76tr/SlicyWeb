/**
 * Wichy
 * Printer Constants
 *
 * Shared printer-related constants.
 */

export const DEFAULT_NOZZLE_SIZE = 0.4;

export const SUPPORTED_NOZZLE_SIZES = [
  0.2,
  0.4,
  0.6,
  0.8,
];

export const DEFAULT_BUILD_VOLUME = {
  x: 220,
  y: 220,
  z: 250,
};

export const MAX_SUPPORTED_NOZZLE_TEMP = 500;

export const MAX_SUPPORTED_BED_TEMP = 150;

export const MAX_SUPPORTED_CHAMBER_TEMP = 100;

export const DIRECT_DRIVE = "direct_drive";

export const BOWDEN = "bowden";

export const UNKNOWN_EXTRUDER = "unknown";
