/**
 * Wichy
 * Material Validator
 *
 * Responsible for:
 * - Material profile validation
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
 * - MATERIAL_PROFILE_SPEC.md
 */

import type { Material } from "../types/Material";

export class MaterialValidator {
  /**
   * Validates a material profile.
   */
  public static validate(
    material: Material | null | undefined,
  ): boolean {
    if (!material) {
      return false;
    }

    if (!material.id.trim()) {
      return false;
    }

    if (!material.name.trim()) {
      return false;
    }

    if (!material.category.trim()) {
      return false;
    }

    if (
      material.physical.density <= 0
    ) {
      return false;
    }

    if (
      material.temperature.minNozzle >
      material.temperature.maxNozzle
    ) {
      return false;
    }

    if (
      material.temperature.minBed >
      material.temperature.maxBed
    ) {
      return false;
    }

    return true;
  }

  /**
   * Validates thermal settings.
   */
  public static validateTemperature(
    material: Material,
  ): boolean {
    return (
      material.temperature.minNozzle >= 0 &&
      material.temperature.maxNozzle > 0 &&
      material.temperature.minNozzle <=
        material.temperature.maxNozzle &&
      material.temperature.minBed >= 0 &&
      material.temperature.maxBed >= 0 &&
      material.temperature.minBed <=
        material.temperature.maxBed
    );
  }

  /**
   * Validates cooling settings.
   */
  public static validateCooling(
    material: Material,
  ): boolean {
    return (
      material.cooling.fanMin >= 0 &&
      material.cooling.fanMin <= 100 &&
      material.cooling.fanMax >= 0 &&
      material.cooling.fanMax <= 100 &&
      material.cooling.fanMin <=
        material.cooling.fanMax
    );
  }

  /**
   * Validates physical properties.
   */
  public static validatePhysical(
    material: Material,
  ): boolean {
    return (
      material.physical.density > 0 &&
      material.physical.shrinkage >= 0
    );
  }

  /**
   * Validates recommended settings.
   */
  public static validateRecommended(
    material: Material,
  ): boolean {
    return (
      material.recommended.printSpeed >
        0 &&
      material.recommended.travelSpeed >
        0 &&
      material.recommended
        .retractionDistance >= 0 &&
      material.recommended
        .retractionSpeed >= 0
    );
  }
}
