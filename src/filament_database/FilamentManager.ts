/**
 * SlicyWeb
 * Filament Manager Definition
 *
 * Loading of the filament profile files (main process, Phase 8 lot 68):
 * the folders are read in order (Official first, then the filaments of
 * the user), each file is validated (FilamentProfileFileSchema, source of
 * its folder), and a refused file is reported with FIL_002 without
 * stopping the others. A filament whose id is already loaded is refused:
 * a filament of the user never replaces an Official filament.
 *
 * Filaments of the user (Local Custom, Phase 8 lot 71): add, update and
 * remove write or delete their file in the Local Custom folder first,
 * then change the filaments; a failed write changes nothing (FIL_005).
 * The id of a new filament is chosen here ("user_" + random UUID, without
 * dashes: a profile id has only a-z, 0-9 and _). Official filaments are
 * never changed (FIL_003). Two filaments with the same brand, name and
 * color (case and outer spaces ignored) are refused (FIL_004).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md (Filament Schema 3.7.0, Repository Data Schema)
 * - FILAMENT_SETTINGS_SPEC.md
 * - DECISIONS.md (ADR-033, D3, D6)
 * - ERROR_CODES_SPEC.md (FIL_001, FIL_002, FIL_003, FIL_004, FIL_005)
 */

import { randomUUID } from "node:crypto";

import { FilamentProfileFileSchema } from "../schemas/FilamentSchema";
import type { ProfileSource } from "../schemas/MaterialSchema";
import { PrinterProfileStorage } from "../storage/PrinterProfileStorage";
import type { Filament } from "../types/Filament";

import { FilamentRepository } from "./FilamentRepository";

/** A folder of filament profile files and the source of its profiles */
export interface FilamentProfileFolder {
  folder: string;
  source: ProfileSource;
}

/** A refused profile file, named by its file name only */
export interface RejectedFilamentProfile {
  fileName: string;
  source: ProfileSource;
  code: "FIL_002";
  reason: string;
}

export interface FilamentLoadResult {
  loaded: number;
  rejected: RejectedFilamentProfile[];
}

export type FilamentChangeErrorCode =
  "FIL_001" | "FIL_003" | "FIL_004" | "FIL_005";

/** Result of a change of a filament of the user */
export type FilamentChangeResult =
  | { ok: true; filament: Filament }
  | { ok: false; code: FilamentChangeErrorCode; reason: string };

/** Version of the profile files written for the filaments of the user */
const USER_PROFILE_VERSION = "1.0.0";

const USER_SOURCE: ProfileSource = "Local Custom";

/** Same brand, name and color, case and outer spaces ignored */
function sameFilament(a: Filament, b: Filament): boolean {
  const key = (filament: Filament): string =>
    [filament.brand, filament.name, filament.color ?? ""]
      .map((part) => part.trim().toLowerCase())
      .join("\n");

  return key(a) === key(b);
}

/**
 * FIL_005: the file could not be written or deleted. The reason is the
 * system error code (ENOSPC, EACCES…), never a message with a path.
 */
function notSaved(error: unknown): FilamentChangeResult {
  const code =
    error instanceof Error && "code" in error && typeof error.code === "string"
      ? error.code
      : null;

  return {
    ok: false,
    code: "FIL_005",
    reason: code ?? (error instanceof Error ? error.message : "File not saved"),
  };
}

/**
 * The filament of a profile file of the expected source, or the reason
 * of the refusal ("path: message").
 */
function readProfile(
  content: unknown,
  expectedSource: ProfileSource,
): { filament: Filament } | { reason: string } {
  const result = FilamentProfileFileSchema.safeParse(content);

  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.join(".") || "profile";

    return { reason: `${where}: ${issue?.message ?? "invalid"}` };
  }

  if (result.data.source !== expectedSource) {
    return { reason: `source: ${result.data.source} is not ${expectedSource}` };
  }

  return { filament: result.data.data };
}

export class FilamentManager {
  private readonly repository =
    new FilamentRepository();

  /** File name of each filament of the user, by id */
  private readonly userFiles = new Map<string, string>();

  /** Folder of the filaments of the user (Local Custom), if any */
  private userFolder: string | null = null;

  public constructor(
    private readonly storage = new PrinterProfileStorage(),
    private readonly createId: () => string = () =>
      `user_${randomUUID().replaceAll("-", "")}`,
  ) {}

  /**
   * Replaces the filaments with the valid profiles of the folders.
   */
  public loadProfiles(
    folders: FilamentProfileFolder[],
  ): FilamentLoadResult {
    this.repository.clear();
    this.userFiles.clear();
    this.userFolder =
      folders.find(({ source }) => source === USER_SOURCE)?.folder ?? null;

    const rejected: RejectedFilamentProfile[] = [];

    for (const { folder, source } of folders) {
      const content = this.storage.readFolder(folder);

      for (const { fileName, reason } of content.errors) {
        rejected.push({ fileName, source, code: "FIL_002", reason });
      }

      for (const file of content.files) {
        const result = readProfile(file.content, source);

        if ("reason" in result) {
          rejected.push({
            fileName: file.fileName,
            source,
            code: "FIL_002",
            reason: result.reason,
          });
          continue;
        }

        if (this.repository.exists(result.filament.id)) {
          rejected.push({
            fileName: file.fileName,
            source,
            code: "FIL_002",
            reason: `id: ${result.filament.id} is already loaded`,
          });
          continue;
        }

        this.repository.save(result.filament);

        if (source === USER_SOURCE) {
          this.userFiles.set(result.filament.id, file.fileName);
        }
      }
    }

    return { loaded: this.repository.count(), rejected };
  }

  /**
   * Ids of the filaments of the user (Local Custom).
   */
  public getUserFilamentIds(): string[] {
    return [...this.userFiles.keys()];
  }

  /**
   * Adds a filament of the user. Its id is chosen here; the id received
   * is ignored.
   */
  public addUserFilament(filament: Filament): FilamentChangeResult {
    const created: Filament = { ...filament, id: this.createId() };

    const refused = this.checkName(created);
    if (refused) {
      return refused;
    }

    return this.saveUserFilament(created, `${created.id}.json`);
  }

  /**
   * Replaces a filament of the user, found by its id.
   */
  public updateUserFilament(filament: Filament): FilamentChangeResult {
    const refused =
      this.checkEditable(filament.id) ?? this.checkName(filament);
    if (refused) {
      return refused;
    }

    return this.saveUserFilament(
      filament,
      this.userFiles.get(filament.id) ?? `${filament.id}.json`,
    );
  }

  /**
   * Removes a filament of the user and its file.
   */
  public removeUserFilament(filamentId: string): FilamentChangeResult {
    const refused = this.checkEditable(filamentId);
    const filament = this.repository.get(filamentId);
    const fileName = this.userFiles.get(filamentId);

    if (refused || !filament || fileName === undefined) {
      return refused ?? this.notEditable(filamentId);
    }

    try {
      this.storage.deleteFile(this.userFolderOrThrow(), fileName);
    } catch (error) {
      return notSaved(error);
    }

    this.repository.remove(filamentId);
    this.userFiles.delete(filamentId);

    return { ok: true, filament };
  }

  private userFolderOrThrow(): string {
    if (!this.userFolder) {
      throw new Error("No folder for the filaments of the user");
    }

    return this.userFolder;
  }

  /** FIL_001 for an unknown id, FIL_003 for a filament not of the user */
  private checkEditable(filamentId: string): FilamentChangeResult | null {
    if (!this.repository.exists(filamentId)) {
      return { ok: false, code: "FIL_001", reason: `id: ${filamentId}` };
    }

    return this.userFiles.has(filamentId)
      ? null
      : this.notEditable(filamentId);
  }

  private notEditable(filamentId: string): FilamentChangeResult {
    return { ok: false, code: "FIL_003", reason: `id: ${filamentId}` };
  }

  /** FIL_004 when another filament has the same brand, name and color */
  private checkName(filament: Filament): FilamentChangeResult | null {
    const other = this.repository
      .getAll()
      .find((item) => item.id !== filament.id && sameFilament(item, filament));

    return other
      ? {
          ok: false,
          code: "FIL_004",
          reason: `${filament.brand} ${filament.name}`,
        }
      : null;
  }

  /** Writes the profile file, then keeps the filament */
  private saveUserFilament(
    filament: Filament,
    fileName: string,
  ): FilamentChangeResult {
    try {
      this.storage.writeFile(this.userFolderOrThrow(), fileName, {
        id: filament.id,
        type: "filament",
        version: USER_PROFILE_VERSION,
        source: USER_SOURCE,
        data: filament,
        validated: false,
      });
    } catch (error) {
      return notSaved(error);
    }

    this.repository.save(filament);
    this.userFiles.set(filament.id, fileName);

    return { ok: true, filament };
  }

  public addFilament(
    filament: Filament
  ): void {
    this.repository.save(
      filament
    );
  }

  public removeFilament(
    filamentId: string
  ): boolean {
    this.userFiles.delete(filamentId);

    return this.repository.remove(
      filamentId
    );
  }

  public getFilament(
    filamentId: string
  ): Filament | undefined {
    return this.repository.get(
      filamentId
    );
  }

  public getFilaments(): Filament[] {
    return this.repository.getAll();
  }

  public hasFilament(
    filamentId: string
  ): boolean {
    return this.repository.exists(
      filamentId
    );
  }

  public getFilamentCount(): number {
    return this.repository.count();
  }

  public clear(): void {
    this.repository.clear();
    this.userFiles.clear();
  }
}
