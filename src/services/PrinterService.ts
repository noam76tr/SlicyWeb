/**
 * SlicyWeb
 * Printer Service Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PRINTER_PROFILE_SPEC.md
 * - DECISIONS.md (ADR-032, D4): the main process loads the profiles
 *   (loadProfiles) and serves them through the printer:* IPC channels.
 * - Printers of the user (Local Custom, Phase 7 lot 61): addUserPrinter,
 *   updateUserPrinter, removeUserPrinter (PrinterManager).
 */

import type { Printer } from "../types/Printer";

import {
  PrinterManager,
  type PrinterChangeResult,
  type PrinterLoadResult,
  type PrinterProfileFolder,
} from "../printer_database/PrinterManager";

export class PrinterService {
  public constructor(
    private readonly printerManager = new PrinterManager(),
  ) {}

  public loadProfiles(
    folders: PrinterProfileFolder[]
  ): PrinterLoadResult {
    return this.printerManager.loadProfiles(
      folders
    );
  }

  public getUserPrinterIds(): string[] {
    return this.printerManager.getUserPrinterIds();
  }

  public addUserPrinter(
    printer: Printer
  ): PrinterChangeResult {
    return this.printerManager.addUserPrinter(
      printer
    );
  }

  public updateUserPrinter(
    printer: Printer
  ): PrinterChangeResult {
    return this.printerManager.updateUserPrinter(
      printer
    );
  }

  public removeUserPrinter(
    printerId: string
  ): PrinterChangeResult {
    return this.printerManager.removeUserPrinter(
      printerId
    );
  }

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
