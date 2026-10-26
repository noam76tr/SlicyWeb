/**
 * SlicyWeb
 * Printer Manager
 *
 * Responsible for:
 * - Printer management
 * - Active printer access
 * - Repository coordination
 * - Loading of the printer profile files (main process): the folders
 *   are read in order (Official first), each file is validated, and a
 *   refused file is reported with PRN_002 without stopping the others.
 *   A printer whose id is already loaded is refused: a printer of the
 *   user never replaces an Official printer.
 *
 * No business logic.
 * No AI logic.
 * No cache logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PRINTER_PROFILE_SPEC.md
 * - DECISIONS.md (ADR-032, D4)
 * - ERROR_CODES_SPEC.md (PRN_002)
 */

import type { PrinterProfileSource } from "../schemas/PrinterSchema";
import { PrinterProfileStorage } from "../storage/PrinterProfileStorage";
import type { Printer } from "../types/Printer";

import { PrinterRepository } from "./PrinterRepository";
import { PrinterValidator } from "./PrinterValidator";

/** A folder of printer profile files and the source of its profiles */
export interface PrinterProfileFolder {
  folder: string;
  source: PrinterProfileSource;
}

/** A refused profile file, named by its file name only */
export interface RejectedPrinterProfile {
  fileName: string;
  source: PrinterProfileSource;
  code: "PRN_002";
  reason: string;
}

export interface PrinterLoadResult {
  loaded: number;
  rejected: RejectedPrinterProfile[];
}

export class PrinterManager {
  private readonly repository =
    new PrinterRepository();

  public constructor(
    private readonly storage = new PrinterProfileStorage(),
  ) {}

  /**
   * Replaces the printers with the valid profiles of the folders.
   */
  public loadProfiles(
    folders: PrinterProfileFolder[],
  ): PrinterLoadResult {
    this.repository.clear();

    const rejected: RejectedPrinterProfile[] = [];

    for (const { folder, source } of folders) {
      const content = this.storage.readFolder(folder);

      for (const { fileName, reason } of content.errors) {
        rejected.push({ fileName, source, code: "PRN_002", reason });
      }

      for (const file of content.files) {
        const result = PrinterValidator.validateProfileFile(
          file.content,
          source,
        );

        if (!result.valid) {
          rejected.push({
            fileName: file.fileName,
            source,
            code: "PRN_002",
            reason: result.reason,
          });
          continue;
        }

        const printer = result.profile.data;

        if (this.repository.exists(printer.id)) {
          rejected.push({
            fileName: file.fileName,
            source,
            code: "PRN_002",
            reason: `id: ${printer.id} is already loaded`,
          });
          continue;
        }

        this.repository.add(printer);
      }
    }

    return { loaded: this.repository.getCount(), rejected };
  }

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
