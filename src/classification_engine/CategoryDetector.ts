/**
 * SlicyWeb
 * Category Detector Definition
 *
 * Category of the automatic classification from the measured geometric
 * features (OBJECT_CLASSIFICATION_SPEC.md 1.2.0, Category Rules; ADR-035
 * D2): the rules are checked in their order, the first rule that matches
 * gives the category; unknown when none matches. The file name is never
 * used. gear, bracket, enclosure, tool, articulated_model, prototype,
 * structural_part, decorative_object and functional_part are never chosen
 * automatically (User Choice).
 *
 * Based on:
 * - OBJECT_CLASSIFICATION_SPEC.md (1.2.0: Category Rules)
 * - DATA_SCHEMA.md (3.10.0: Classification Rules)
 * - DECISIONS.md (ADR-035 D2)
 */

import { CATEGORY_RULES } from "../constants/AnalysisConstants";
import type {
  ClassificationCategory,
  GeometricFeature,
} from "../types/Classification";

export class CategoryDetector {
  /** Category of the first rule that matches; unknown otherwise */
  public detect(features: readonly GeometricFeature[]): ClassificationCategory {
    const present = new Set<string>(features);

    for (const rule of CATEGORY_RULES) {
      if (
        rule.all.every((feature) => present.has(feature)) &&
        rule.none.every((feature) => !present.has(feature))
      ) {
        return rule.category;
      }
    }

    return "unknown";
  }
}
