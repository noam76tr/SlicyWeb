/**
 * SlicyWeb
 * Classification Engine Definition
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - DATA_SCHEMA.md
 */

import { CLASSIFICATION_VERSION } from "../constants/AnalysisConstants";
import type {
  Classification,
  ClassificationCategory,
} from "../types/Classification";

import { CategoryDetector } from "./CategoryDetector";
import { ConfidenceScorer } from "./ConfidenceScorer";

export class ClassificationEngine {
  private readonly categoryDetector =
    new CategoryDetector();

  /**
   * Classifies a model from extracted features
   * (DATA_SCHEMA.md, Object Classification Schema).
   * The confidence level is not stored; it is computed
   * from confidenceScore with ConfidenceScorer.getLevel.
   */
  public classify(
    features: string[],
  ): Classification {
    const category: ClassificationCategory =
      this.categoryDetector.detect(
        features,
      );

    const confidenceScore =
      ConfidenceScorer.calculate(
        features,
        category,
      );

    return {
      category,
      subcategory: "",
      confidenceScore,
      detectedFeatures: features,
      detectedTags: [],
      classificationVersion: CLASSIFICATION_VERSION,
    };
  }
}
