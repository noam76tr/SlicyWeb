/**
 * Wichy
 * Printer Manager
 *
 * Responsible for:
 * - Printer management
 * - Active printer access
 * - Repository coordination
 *
 * No business logic.
 * No AI logic.
 * No cache logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PRINTER_PROFILE_SPEC.md
 */

import type { Printer } from "../types/Printer";

import { PrinterRepository } from "./PrinterRepository";

export class PrinterManager {
  private readonly repository =
    new PrinterRepository();

  /**
   * Adds a printer profile.
   */
  public addPrinter(
    printer: Printer,
  ): void {
    this.repository.add(
      printer,
    );
  }

  /**
   * Removes a printer profile.
   */
  public removePrinter(
    printerId: string,
  ): boolean {
    return this.repository.remove(
      printerId,
    );
  }

  /**
   * Returns a printer by id.
   */
  public getPrinter(
    printerId: string,
  ): Printer | undefined {
    return this.repository.get(
      printerId,
    );
  }

  /**
   * Returns all printers.
   */
  public getPrinters(): Printer[] {
    return this.repository.getAll();
  }

  /**
   * Checks whether a printer exists.
   */
  public hasPrinter(
    printerId: string,
  ): boolean {
    return this.repository.exists(
      printerId,
    );
  }

  /**
   * Returns printer count.
   */
  public getPrinterCount(): number {
    return this.repository.getCount();
  }

  /**
   * Clears all printers.
   */
  public clear(): void {
    this.repository.clear();
  }
}
