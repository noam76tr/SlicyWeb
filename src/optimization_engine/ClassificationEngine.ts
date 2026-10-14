/**
 * SlicyWeb
 * Classification Engine
 *
 * Responsible for:
 * - Classification orchestration
 * - Category detection
 * - Confidence evaluation
 * - Classification generation
 *
 * No repository logic.
 * No rendering logic.
 * No GUI logic.
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - DATA_SCHEMA.md
 */

import { CLASSIFICATION_VERSION } from "../constants/AnalysisConstants";
import type {
  Classification,
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
   * Validation is available through ClassificationValidator.
   */
  public classify(
    features: string[],
  ): Classification {
    const category =
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
