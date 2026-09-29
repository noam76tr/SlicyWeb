/**
 * Wichy
 * Printer Repository Sync
 *
 * Responsible for:
 * - Repository synchronization
 * - Remote profile retrieval
 * - Local repository updates
 * - Profile synchronization status
 *
 * No AI logic.
 * No rendering logic.
 * No business logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - REPOSITORY_SPEC.md
 * - PRINTER_PROFILE_SPEC.md
 */

import type { Printer } from "../types/Printer";

import { PrinterRepository } from "../printer_database/PrinterRepository";

export class PrinterRepositorySync {
  private readonly repository =
    new PrinterRepository();

  /**
   * Synchronizes printer profiles.
   */
  public synchronize(
    printers: Printer[],
  ): number {
    let synchronizedCount = 0;

    for (const printer of printers) {
      this.repository.add(
        printer,
      );

      synchronizedCount++;
    }

    return synchronizedCount;
  }

  /**
   * Updates a printer profile.
   */
  public update(
    printer: Printer,
  ): void {
    this.repository.add(
      printer,
    );
  }

  /**
   * Removes a printer profile.
   */
  public remove(
    printerId: string,
  ): boolean {
    return this.repository.remove(
      printerId,
    );
  }

  /**
   * Returns all synchronized printers.
   */
  public getPrinters(): Printer[] {
    return this.repository.getAll();
  }

  /**
   * Returns synchronization count.
   */
  public getCount(): number {
    return this.repository.getCount();
  }

  /**
   * Clears synchronized data.
   */
  public clear(): void {
    this.repository.clear();
  }
}
