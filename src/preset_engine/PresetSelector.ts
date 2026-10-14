/**
 * SlicyWeb
 * Preset Selector Definition
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - PRINT_PRESETS_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */

import { CLASSIFICATION_PRESET_CATEGORIES } from "../constants/PresetConstants";
import type { ClassificationCategory } from "../types/Classification";
import type {
  PresetCategory,
  PrintPreset
} from "../types/PrintPreset";

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

  /**
   * Returns the preset category selected by a classification category
   * (PRINT_PRESETS_SPEC.md, Classification To Preset Mapping).
   */
  public getRecommendedCategory(
    classification: ClassificationCategory
  ): PresetCategory {
    return CLASSIFICATION_PRESET_CATEGORIES[
      classification
    ];
  }

  /**
   * Returns the first preset of the mapped category,
   * or undefined when it is not available.
   */
  public selectRecommended(
    presets: PrintPreset[],
    classification: ClassificationCategory
  ): PrintPreset | undefined {
    return this.selectByCategory(
      presets,
      this.getRecommendedCategory(
        classification
      )
    );
  }
}
