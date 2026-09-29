/**
 * Wichy
 * Printer Importer
 *
 * Responsible for:
 * - Printer profile import
 * - JSON profile loading
 * - External profile parsing
 * - Profile validation before import
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

import { PrinterValidator } from "./PrinterValidator";

export class PrinterImporter {
  /**
   * Imports a printer profile from JSON text.
   */
  public importFromJson(
    json: string,
  ): Printer | null {
    try {
      const printer = JSON.parse(
        json,
      ) as Printer;

      if (
        !PrinterValidator.validate(
          printer,
        )
      ) {
        return null;
      }

      return printer;
    } catch {
      return null;
    }
  }

  /**
   * Imports multiple printer profiles.
   */
  public importMany(
    json: string,
  ): Printer[] {
    try {
      const printers = JSON.parse(
        json,
      ) as Printer[];

      return printers.filter(
        (printer) =>
          PrinterValidator.validate(
            printer,
          ),
      );
    } catch {
      return [];
    }
  }

  /**
   * Imports a printer profile from a file.
   */
  public async importFile(
    file: File,
  ): Promise<Printer | null> {
    try {
      const content =
        await file.text();

      return this.importFromJson(
        content,
      );
    } catch {
      return null;
    }
  }

  /**
   * Returns whether a file can be imported.
   */
  public isSupportedFile(
    fileName: string,
  ): boolean {
    return fileName
      .toLowerCase()
      .endsWith(".json");
  }
}
