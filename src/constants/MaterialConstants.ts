/**
 * Wichy
 * Material Constants Definition
 *
 * Based on:
 * - MATERIAL_PROFILE_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

export const MATERIAL_CATEGORIES = [
  "PLA",
  "PLA+",
  "PETG",
  "ABS",
  "ASA",
  "TPU",
  "NYLON",
  "PC",
  "PP"
] as const;

export const WARPING_RISKS = [
  "low",
  "medium",
  "high"
] as const;

export const MATERIAL_DEFAULTS = {
  density: 1.24,
  shrinkage: 0.2
} as const;

export const MATERIAL_COOLING_RANGES = {
  PLA: {
    fanMin: 80,
    fanMax: 100
  },

  PETG: {
    fanMin: 30,
    fanMax: 70
  },

  ABS: {
    fanMin: 0,
    fanMax: 30
  },

  ASA: {
    fanMin: 0,
    fanMax: 30
  },

  TPU: {
    fanMin: 20,
    fanMax: 60
  }
} as const;
