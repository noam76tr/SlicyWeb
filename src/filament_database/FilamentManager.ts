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
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md (Filament Schema 3.7.0, Repository Data Schema)
 * - FILAMENT_SETTINGS_SPEC.md
 * - DECISIONS.md (ADR-033, D3, D6)
 * - ERROR_CODES_SPEC.md (FIL_002 Invalid Filament Profile)
 */

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

const USER_SOURCE: ProfileSource = "Local Custom";

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

  /** Ids of the filaments of the user (Local Custom) */
  private readonly userFilamentIds = new Set<string>();

  public constructor(
    private readonly storage = new PrinterProfileStorage(),
  ) {}

  /**
   * Replaces the filaments with the valid profiles of the folders.
   */
  public loadProfiles(
    folders: FilamentProfileFolder[],
  ): FilamentLoadResult {
    this.repository.clear();
    this.userFilamentIds.clear();

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
          this.userFilamentIds.add(result.filament.id);
        }
      }
    }

    return { loaded: this.repository.count(), rejected };
  }

  /**
   * Ids of the filaments of the user (Local Custom).
   */
  public getUserFilamentIds(): string[] {
    return [...this.userFilamentIds];
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
    this.userFilamentIds.delete(filamentId);

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
    this.userFilamentIds.clear();
  }
}
