/**
 * Wichy
 * Preset Validator Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PRINT_PRESETS_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import type { PrintPreset } from "../types/PrintPreset";

export class PresetValidator {
  public validate(
    preset: PrintPreset
  ): boolean {
    return (
      this.validateName(preset) &&
      this.validateCategory(preset) &&
      this.validateSettings(preset)
    );
  }

  private validateName(
    preset: PrintPreset
  ): boolean {
    return (
      preset.name.trim().length > 0
    );
  }

  private validateCategory(
    preset: PrintPreset
  ): boolean {
    return (
      preset.category.trim().length > 0
    );
  }

  private validateSettings(
    preset: PrintPreset
  ): boolean {
    return (
      preset.settings !== null &&
      typeof preset.settings ===
        "object"
    );
  }
}
