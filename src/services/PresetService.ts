/**
 * Wichy
 * Preset Service
 *
 * Responsible for:
 * - Preset creation
 * - Preset retrieval
 * - Preset validation
 * - Preset serialization
 *
 * No AI logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PRINT_PRESETS_SPEC.md
 */

import type { PrintPreset } from "../types/PrintPreset";

export class PresetService {
  /**
   * Creates a preset.
   */
  public createPreset(
    preset: PrintPreset,
  ): PrintPreset {
    return {
      ...preset,
    };
  }

  /**
   * Serializes a preset.
   */
  public serialize(
    preset: PrintPreset,
  ): string {
    return JSON.stringify(
      preset,
      null,
      2,
    );
  }

  /**
   * Deserializes a preset.
   */
  public deserialize(
    json: string,
  ): PrintPreset {
    return JSON.parse(
      json,
    ) as PrintPreset;
  }

  /**
   * Validates a preset.
   */
  public validate(
    preset:
      | PrintPreset
      | null
      | undefined,
  ): boolean {
    if (!preset) {
      return false;
    }

    if (!preset.name.trim()) {
      return false;
    }

    if (!preset.description.trim()) {
      return false;
    }

    if (
      preset.confidenceScore < 0 ||
      preset.confidenceScore > 100
    ) {
      return false;
    }

    return true;
  }

  /**
   * Duplicates a preset.
   */
  public duplicate(
    preset: PrintPreset,
    newName: string,
  ): PrintPreset {
    return {
      ...preset,

      name: newName,
    };
  }
}
