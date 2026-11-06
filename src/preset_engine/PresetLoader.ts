/**
 * SlicyWeb
 * Preset Loader
 *
 * Responsible for:
 * - Loading of the preset files (main process, Phase 10 lot 86): the
 *   folders are read in order, each file is validated
 *   (PresetProfileFileSchema, source of its folder), and a refused file
 *   is reported with SCH_001 without stopping the others. A preset whose
 *   id is already loaded is refused.
 * - The loaded presets, in the order of the files (sorted by name).
 *
 * The presets are values written by SlicyWeb (data/presets/, source
 * Official). No synchronization with the profile repository in Phase 10,
 * no preset of the user (Phase 15).
 *
 * No business logic.
 * No AI logic.
 * No cache logic.
 *
 * Based on:
 * - DATA_SCHEMA.md (Print Preset Schema, Preset Settings, Repository Data
 *   Schema 3.10.0)
 * - PRINT_PRESETS_SPEC.md 1.3.0 (Shipped Presets)
 * - DECISIONS.md (ADR-035 D4)
 * - ERROR_CODES_SPEC.md (SCH_001 Schema Validation Failed)
 */

import type { ProfileSource } from "../schemas/MaterialSchema";
import { PresetProfileFileSchema } from "../schemas/PrintPresetSchema";
import { PrinterProfileStorage } from "../storage/PrinterProfileStorage";
import type { PrintPreset } from "../types/PrintPreset";

/** A folder of preset files and the source of its presets */
export interface PresetFolder {
  folder: string;
  source: ProfileSource;
}

/** A refused preset file, named by its file name only */
export interface RejectedPreset {
  fileName: string;
  source: ProfileSource;
  code: "SCH_001";
  reason: string;
}

export interface PresetLoadResult {
  loaded: number;
  rejected: RejectedPreset[];
}

/**
 * The id and the preset of a file of the expected source, or the reason
 * of the refusal ("path: message").
 */
function readPreset(
  content: unknown,
  expectedSource: ProfileSource,
): { id: string; preset: PrintPreset } | { reason: string } {
  const result = PresetProfileFileSchema.safeParse(content);

  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.join(".") || "preset";

    return { reason: `${where}: ${issue?.message ?? "invalid"}` };
  }

  if (result.data.source !== expectedSource) {
    return { reason: `source: ${result.data.source} is not ${expectedSource}` };
  }

  return { id: result.data.id, preset: result.data.data };
}

export class PresetLoader {
  private presets: { id: string; preset: PrintPreset }[] = [];

  public constructor(
    private readonly storage = new PrinterProfileStorage(),
  ) {}

  /**
   * Replaces the presets with the valid preset files of the folders.
   */
  public loadPresets(
    folders: PresetFolder[],
  ): PresetLoadResult {
    this.presets = [];

    const rejected: RejectedPreset[] = [];

    for (const { folder, source } of folders) {
      const content = this.storage.readFolder(folder);

      for (const { fileName, reason } of content.errors) {
        rejected.push({ fileName, source, code: "SCH_001", reason });
      }

      for (const file of content.files) {
        const result = readPreset(file.content, source);

        if ("reason" in result) {
          rejected.push({
            fileName: file.fileName,
            source,
            code: "SCH_001",
            reason: result.reason,
          });
          continue;
        }

        if (this.presets.some(({ id }) => id === result.id)) {
          rejected.push({
            fileName: file.fileName,
            source,
            code: "SCH_001",
            reason: `id: ${result.id} is already loaded`,
          });
          continue;
        }

        this.presets.push(result);
      }
    }

    return { loaded: this.presets.length, rejected };
  }

  /**
   * Returns the loaded presets, in the order of their files.
   */
  public getPresets(): PrintPreset[] {
    return this.presets.map(({ preset }) => preset);
  }
}
