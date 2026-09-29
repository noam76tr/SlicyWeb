/**
 * Wichy
 * Printer Repository
 *
 * Responsible for:
 * - Printer storage
 * - Printer retrieval
 * - Printer lookup
 * - Repository management
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

export class PrinterRepository {
  private readonly printers =
    new Map<string, Printer>();

  /**
   * Adds a printer profile.
   */
  public add(
    printer: Printer,
  ): void {
    this.printers.set(
      printer.id,
      printer,
    );
  }

  /**
   * Returns a printer by id.
   */
  public get(
    printerId: string,
  ): Printer | undefined {
    return this.printers.get(
      printerId,
    );
  }

  /**
   * Returns all printers.
   */
  public getAll(): Printer[] {
    return Array.from(
      this.printers.values(),
    );
  }

  /**
   * Returns printers by brand.
   */
  public getByBrand(
    brand: string,
  ): Printer[] {
    return this.getAll().filter(
      (printer) =>
        printer.brand.toLowerCase() ===
        brand.toLowerCase(),
    );
  }

  /**
   * Checks whether a printer exists.
   */
  public exists(
    printerId: string,
  ): boolean {
    return this.printers.has(
      printerId,
    );
  }

  /**
   * Removes a printer profile.
   */
  public remove(
    printerId: string,
  ): boolean {
    return this.printers.delete(
      printerId,
    );
  }

  /**
   * Clears repository.
   */
  public clear(): void {
    this.printers.clear();
  }

  /**
   * Returns repository size.
   */
  public getCount(): number {
    return this.printers.size;
  }
}
