/**
 * Wichy
 * Preset Manager
 *
 * Responsible for:
 * - Preset management
 * - Active preset access
 * - Repository coordination
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PRINT_PRESETS_SPEC.md
 */

import type { PrintPreset } from "../types/PrintPreset";

import { PresetRepository } from "./PresetRepository";

export class PresetManager {
  private readonly repository =
    new PresetRepository();

  /**
   * Adds a preset.
   */
  public addPreset(
    preset: PrintPreset,
  ): void {
    this.repository.add(
      preset,
    );
  }

  /**
   * Removes a preset.
   */
  public removePreset(
    presetName: string,
  ): boolean {
    return this.repository.remove(
      presetName,
    );
  }

  /**
   * Returns a preset by name.
   */
  public getPreset(
    presetName: string,
  ): PrintPreset | undefined {
    return this.repository.get(
      presetName,
    );
  }

  /**
   * Returns all presets.
   */
  public getPresets(): PrintPreset[] {
    return this.repository.getAll();
  }

  /**
   * Checks whether a preset exists.
   */
  public hasPreset(
    presetName: string,
  ): boolean {
    return this.repository.exists(
      presetName,
    );
  }

  /**
   * Returns preset count.
   */
  public getPresetCount(): number {
    return this.repository.getCount();
  }

  /**
   * Clears all presets.
   */
  public clear(): void {
    this.repository.clear();
  }
}
