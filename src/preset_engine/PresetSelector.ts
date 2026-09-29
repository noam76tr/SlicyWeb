/**
 * Wichy
 * Preset Selector Definition
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - PRINT_PRESETS_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */

import type { PrintPreset } from "../types/PrintPreset";

export class PresetSelector {
  public selectByName(
    presets: PrintPreset[],
    presetName: string
  ): PrintPreset | undefined {
    return presets.find(
      (preset) =>
        preset.name === presetName
    );
  }

  public selectByCategory(
    presets: PrintPreset[],
    category: string
  ): PrintPreset | undefined {
    return presets.find(
      (preset) =>
        preset.category === category
    );
  }

  public getRecommendedCategory(
    classification: string
  ): string {
    switch (classification) {
      case "Prototype":
        return "prototype";

      case "Figurine":
        return "quality";

      case "Miniature":
        return "miniature";

      case "Mechanical Part":
        return "mechanical";

      case "Structural Part":
        return "mechanical";

      default:
        return "balanced";
    }
  }

  public selectRecommended(
    presets: PrintPreset[],
    classification: string
  ): PrintPreset | undefined {
    const category =
      this.getRecommendedCategory(
        classification
      );

    return this.selectByCategory(
      presets,
      category
    );
  }
}
