/**
 * Wichy
 * Filament Validator
 *
 * Responsible for:
 * - Filament profile validation
 * - Required field validation
 * - Data integrity validation
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 */

import type { Filament } from "../types/Filament";

export class FilamentValidator {
  /**
   * Validates a filament profile.
   */
  public static validate(
    filament: Filament | null | undefined,
  ): boolean {
    if (!filament) {
      return false;
    }

    if (!filament.id.trim()) {
      return false;
    }

    if (!filament.brand.trim()) {
      return false;
    }

    if (!filament.name.trim()) {
      return false;
    }

    if (!filament.material.trim()) {
      return false;
    }

    if (filament.diameter <= 0) {
      return false;
    }

    if (filament.density <= 0) {
      return false;
    }

    if (filament.pricePerKg < 0) {
      return false;
    }

    return true;
  }

  /**
   * Validates filament dimensions.
   */
  public static validateDiameter(
    filament: Filament,
  ): boolean {
    return filament.diameter > 0;
  }

  /**
   * Validates physical properties.
   */
  public static validateDensity(
    filament: Filament,
  ): boolean {
    return filament.density > 0;
  }

  /**
   * Validates pricing information.
   */
  public static validatePricing(
    filament: Filament,
  ): boolean {
    return filament.pricePerKg >= 0;
  }

  /**
   * Validates recommended profile.
   */
  public static validateProfile(
    filament: Filament,
  ): boolean {
    return (
      filament.recommendedProfile !== null &&
      filament.recommendedProfile !== undefined
    );
  }

  /**
   * Validates manufacturer settings.
   */
  public static validateManufacturerSettings(
    filament: Filament,
  ): boolean {
    return (
      filament.manufacturerSettings !== null &&
      filament.manufacturerSettings !== undefined
    );
  }
}
