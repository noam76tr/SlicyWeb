/**
 * Wichy
 * Printer Service Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PRINTER_PROFILE_SPEC.md
 */

import type { Printer } from "../types/Printer";

import { PrinterManager } from "../printer_database/PrinterManager";

export class PrinterService {
  private readonly printerManager =
    new PrinterManager();

  public addPrinter(
    printer: Printer
  ): void {
    this.printerManager.addPrinter(
      printer
    );
  }

  public removePrinter(
    printerId: string
  ): void {
    this.printerManager.removePrinter(
      printerId
    );
  }

  public getPrinter(
    printerId: string
  ): Printer | undefined {
    return this.printerManager.getPrinter(
      printerId
    );
  }

  public getPrinters(): Printer[] {
    return this.printerManager.getPrinters();
  }

  public hasPrinter(
    printerId: string
  ): boolean {
    return this.printerManager.hasPrinter(
      printerId
    );
  }

  public getPrinterCount(): number {
    return this.printerManager.getPrinterCount();
  }

  public clearPrinters(): void {
    this.printerManager.clear();
  }
}
