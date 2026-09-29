/**
 * Wichy
 * Preset Repository Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PRINT_PRESETS_SPEC.md
 */

import type { PrintPreset } from "../types/PrintPreset";

export class PresetRepository {
  private readonly presets =
    new Map<string, PrintPreset>();

  public save(
    preset: PrintPreset
  ): void {
    this.presets.set(
      preset.name,
      preset
    );
  }

  public get(
    presetName: string
  ): PrintPreset | undefined {
    return this.presets.get(
      presetName
    );
  }

  public getAll(): PrintPreset[] {
    return Array.from(
      this.presets.values()
    );
  }

  public exists(
    presetName: string
  ): boolean {
    return this.presets.has(
      presetName
    );
  }

  public remove(
    presetName: string
  ): void {
    this.presets.delete(
      presetName
    );
  }

  public clear(): void {
    this.presets.clear();
  }

  public count(): number {
    return this.presets.size;
  }
}
