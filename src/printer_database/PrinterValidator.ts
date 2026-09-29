/**
 * Wichy
 * Printer Validator
 *
 * Responsible for:
 * - Printer profile validation
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
 * - PRINTER_PROFILE_SPEC.md
 */

import type { Printer } from "../types/Printer";

export class PrinterValidator {
  /**
   * Validates a printer profile.
   */
  public static validate(
    printer: Printer | null | undefined,
  ): boolean {
    if (!printer) {
      return false;
    }

    if (!printer.id.trim()) {
      return false;
    }

    if (!printer.brand.trim()) {
      return false;
    }

    if (!printer.model.trim()) {
      return false;
    }

    if (
      printer.buildVolume.x <= 0 ||
      printer.buildVolume.y <= 0 ||
      printer.buildVolume.z <= 0
    ) {
      return false;
    }

    if (printer.defaultNozzle <= 0) {
      return false;
    }

    if (
      printer.supportedNozzles.length === 0
    ) {
      return false;
    }

    return true;
  }

  /**
   * Validates printer dimensions.
   */
  public static validateBuildVolume(
    printer: Printer,
  ): boolean {
    return (
      printer.buildVolume.x > 0 &&
      printer.buildVolume.y > 0 &&
      printer.buildVolume.z > 0
    );
  }

  /**
   * Validates nozzle configuration.
   */
  public static validateNozzles(
    printer: Printer,
  ): boolean {
    return (
      printer.defaultNozzle > 0 &&
      printer.supportedNozzles.length > 0
    );
  }

  /**
   * Validates thermal limits.
   */
  public static validateThermal(
    printer: Printer,
  ): boolean {
    return (
      printer.thermal.maxNozzleTemp > 0 &&
      printer.thermal.maxBedTemp >= 0 &&
      printer.thermal.maxChamberTemp >= 0
    );
  }
}
