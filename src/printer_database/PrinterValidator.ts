/**
 * SlicyWeb
 * Printer Validator
 *
 * Responsible for:
 * - Printer profile validation
 * - Required field validation
 * - Data integrity validation
 *
 * Validation uses PrinterSchema and PrinterProfileFileSchema (Zod): a
 * missing or wrong field is refused, never a crash. A value of motion or
 * thermal may be null (unknown, DATA_SCHEMA.md 3.5.0).
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md (Printer Schema, Repository Data Schema)
 * - PRINTER_PROFILE_SPEC.md
 * - ERROR_CODES_SPEC.md (PRN_002 Invalid Printer Profile)
 */

import {
  PrinterProfileFileSchema,
  PrinterSchema,
  type PrinterProfileFile,
  type PrinterProfileSource,
} from "../schemas/PrinterSchema";

import type { Printer } from "../types/Printer";

export type ProfileFileValidation =
  | { valid: true; profile: PrinterProfileFile }
  | { valid: false; reason: string };

export class PrinterValidator {
  /**
   * Validates a printer profile.
   */
  public static validate(printer: unknown): printer is Printer {
    return PrinterSchema.safeParse(printer).success;
  }

  /**
   * Validates a printer profile file (Repository Data Schema envelope)
   * of the expected source. The returned profile is marked validated.
   */
  public static validateProfileFile(
    content: unknown,
    expectedSource: PrinterProfileSource,
  ): ProfileFileValidation {
    const result = PrinterProfileFileSchema.safeParse(content);

    if (!result.success) {
      const issue = result.error.issues[0];
      const where = issue?.path.join(".") || "profile";

      return { valid: false, reason: `${where}: ${issue?.message ?? "invalid"}` };
    }

    if (result.data.source !== expectedSource) {
      return {
        valid: false,
        reason: `source: ${result.data.source} is not ${expectedSource}`,
      };
    }

    return { valid: true, profile: { ...result.data, validated: true } };
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
   * Validates thermal limits. An unknown value (null) is accepted.
   */
  public static validateThermal(
    printer: Printer,
  ): boolean {
    const { maxNozzleTemp, maxBedTemp, maxChamberTemp } = printer.thermal;

    return (
      (maxNozzleTemp === null || maxNozzleTemp > 0) &&
      (maxBedTemp === null || maxBedTemp >= 0) &&
      (maxChamberTemp === null || maxChamberTemp >= 0)
    );
  }
}
