/**
 * Wichy
 * Classification Engine Definition
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - DATA_SCHEMA.md
 */

import type {
  Classification,
  ConfidenceLevel,
  ClassificationCategory,
} from "../types/Classification";

import { CategoryDetector } from "./CategoryDetector";
import { ConfidenceScorer } from "./ConfidenceScorer";

export class ClassificationEngine {
  private readonly categoryDetector =
    new CategoryDetector();

  private readonly confidenceScorer =
    new ConfidenceScorer();

  public classify(
    features: string[],
  ): Classification {
    const category =
      this.categoryDetector.detect(
        features,
      ) as ClassificationCategory;

    const confidenceScore =
      this.confidenceScorer.calculate(
        features,
        category,
      );

    const confidenceLevel =
      this.getConfidenceLevel(
        confidenceScore,
      );

    return {
      category,
      confidenceScore,
      confidenceLevel,
      detectedFeatures: features,
      validated: true,
    };
  }

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
