/**
 * Wichy
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

import type {
  Classification,
  ConfidenceLevel,
} from "../types/Classification";

import { CategoryDetector } from "./CategoryDetector";
import { ConfidenceScorer } from "./ConfidenceScorer";
import { ClassificationValidator } from "./ClassificationValidator";

export class ClassificationEngine {
  private readonly categoryDetector =
    new CategoryDetector();

  /**
   * Classifies a model from extracted features.
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

    const confidenceLevel =
      this.getConfidenceLevel(
        confidenceScore,
      );

    const classification: Classification = {
      category,
      confidenceScore,
      confidenceLevel,
      detectedFeatures: features,
      validated: false,
    };

    classification.validated =
      ClassificationValidator.validate(
        classification,
      );

    return classification;
  }

  /**
   * Converts confidence score to level.
   */
  private getConfidenceLevel(
    score: number,
  ): ConfidenceLevel {
    if (score >= 80) {
      return "high";
    }

    if (score >= 50) {
      return "medium";
    }

    if (score > 0) {
      return "low";
    }

    return "unknown";
  }
}
