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
 * - Printers of the user (Local Custom, Phase 7 lot 61): add, update and
 *   remove write or delete their file in the Local Custom folder first,
 *   then change the printers; a failed write changes nothing (PRN_007).
 *   The id of a new printer is chosen here ("user_" + random UUID).
 *   Official printers are never changed (PRN_005). Two printers with the
 *   same brand and model (case ignored) are refused (PRN_006).
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
 * - ERROR_CODES_SPEC.md (PRN_001, PRN_002, PRN_005, PRN_006, PRN_007)
 */

import { randomUUID } from "node:crypto";

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

export type PrinterChangeErrorCode =
  "PRN_001" | "PRN_005" | "PRN_006" | "PRN_007";

/** Result of a change of a printer of the user */
export type PrinterChangeResult =
  | { ok: true; printer: Printer }
  | { ok: false; code: PrinterChangeErrorCode; reason: string };

/** Version of the profile files written for the printers of the user */
const USER_PROFILE_VERSION = "1.0.0";

const USER_SOURCE: PrinterProfileSource = "Local Custom";

/** Same brand and same model, case and outer spaces ignored */
function sameName(a: Printer, b: Printer): boolean {
  const key = (printer: Printer): string =>
    `${printer.brand.trim().toLowerCase()}\n${printer.model
      .trim()
      .toLowerCase()}`;

  return key(a) === key(b);
}

/**
 * PRN_007: the file could not be written or deleted. The reason is the
 * system error code (ENOSPC, EACCES…), never a message with a path.
 */
function notSaved(error: unknown): PrinterChangeResult {
  const code =
    error instanceof Error && "code" in error && typeof error.code === "string"
      ? error.code
      : null;

  return {
    ok: false,
    code: "PRN_007",
    reason: code ?? (error instanceof Error ? error.message : "File not saved"),
  };
}

export class PrinterManager {
  private readonly repository =
    new PrinterRepository();

  /** File name of each printer of the user, by id */
  private readonly userFiles = new Map<string, string>();

  /** Folder of the printers of the user (Local Custom), if any */
  private userFolder: string | null = null;

  public constructor(
    private readonly storage = new PrinterProfileStorage(),
    private readonly createId: () => string = () => `user_${randomUUID()}`,
  ) {}

  /**
   * Replaces the printers with the valid profiles of the folders.
   */
  public loadProfiles(
    folders: PrinterProfileFolder[],
  ): PrinterLoadResult {
    this.repository.clear();
    this.userFiles.clear();
    this.userFolder =
      folders.find(({ source }) => source === USER_SOURCE)?.folder ?? null;

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

        if (source === USER_SOURCE) {
          this.userFiles.set(printer.id, file.fileName);
        }
      }
    }

    return { loaded: this.repository.getCount(), rejected };
  }

  /**
   * Ids of the printers of the user (Local Custom).
   */
  public getUserPrinterIds(): string[] {
    return [...this.userFiles.keys()];
  }

  /**
   * Adds a printer of the user. Its id is chosen here; the id received
   * is ignored.
   */
  public addUserPrinter(printer: Printer): PrinterChangeResult {
    const created: Printer = { ...printer, id: this.createId() };

    const refused = this.checkName(created);
    if (refused) {
      return refused;
    }

    return this.saveUserPrinter(created, `${created.id}.json`);
  }

  /**
   * Replaces a printer of the user, found by its id.
   */
  public updateUserPrinter(printer: Printer): PrinterChangeResult {
    const refused = this.checkEditable(printer.id) ?? this.checkName(printer);
    if (refused) {
      return refused;
    }

    return this.saveUserPrinter(
      printer,
      this.userFiles.get(printer.id) ?? `${printer.id}.json`,
    );
  }

  /**
   * Removes a printer of the user and its file.
   */
  public removeUserPrinter(printerId: string): PrinterChangeResult {
    const refused = this.checkEditable(printerId);
    const printer = this.repository.get(printerId);
    const fileName = this.userFiles.get(printerId);

    if (refused || !printer || fileName === undefined) {
      return refused ?? this.notEditable(printerId);
    }

    try {
      this.storage.deleteFile(this.userFolderOrThrow(), fileName);
    } catch (error) {
      return notSaved(error);
    }

    this.repository.remove(printerId);
    this.userFiles.delete(printerId);

    return { ok: true, printer };
  }

  private userFolderOrThrow(): string {
    if (!this.userFolder) {
      throw new Error("No folder for the printers of the user");
    }

    return this.userFolder;
  }

  /** PRN_001 for an unknown id, PRN_005 for a printer not of the user */
  private checkEditable(printerId: string): PrinterChangeResult | null {
    if (!this.repository.exists(printerId)) {
      return { ok: false, code: "PRN_001", reason: `id: ${printerId}` };
    }

    return this.userFiles.has(printerId) ? null : this.notEditable(printerId);
  }

  private notEditable(printerId: string): PrinterChangeResult {
    return { ok: false, code: "PRN_005", reason: `id: ${printerId}` };
  }

  /** PRN_006 when another printer has the same brand and model */
  private checkName(printer: Printer): PrinterChangeResult | null {
    const other = this.repository
      .getAll()
      .find((item) => item.id !== printer.id && sameName(item, printer));

    return other
      ? {
          ok: false,
          code: "PRN_006",
          reason: `${printer.brand} ${printer.model}`,
        }
      : null;
  }

  /** Writes the profile file, then keeps the printer */
  private saveUserPrinter(
    printer: Printer,
    fileName: string,
  ): PrinterChangeResult {
    try {
      this.storage.writeFile(this.userFolderOrThrow(), fileName, {
        id: printer.id,
        type: "printer",
        version: USER_PROFILE_VERSION,
        source: USER_SOURCE,
        data: printer,
        validated: false,
      });
    } catch (error) {
      return notSaved(error);
    }

    this.repository.add(printer);
    this.userFiles.set(printer.id, fileName);

    return { ok: true, printer };
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
    this.userFiles.clear();
  }
}
