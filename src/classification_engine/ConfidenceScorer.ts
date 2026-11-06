/**
 * SlicyWeb
 * Confidence Scorer
 *
 * Responsible for:
 * - Confidence score of a classification (OBJECT_CLASSIFICATION_SPEC.md
 *   1.2.0, Classification Confidence): the confidence of the category rule
 *   that matched (at most 75), 0 for unknown; 100 for a category chosen by
 *   the user
 * - Confidence level evaluation
 * - Confidence score normalization
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md (1.2.0: Category Rules, Confidence
 *   Levels)
 * - DATA_SCHEMA.md (3.10.0: Classification Rules)
 */

import {
  CATEGORY_RULES,
  CONFIDENCE_LEVELS,
  USER_CLASSIFICATION_CONFIDENCE,
} from "../constants/AnalysisConstants";
import type {
  ClassificationCategory,
  ClassificationSource,
  ConfidenceLevel,
} from "../types/Classification";

export class ConfidenceScorer {
  /**
   * Clamps a score between 0 and 100.
   */
  public static normalize(score: number): number {
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Confidence score of a classification: 100 when the user chose the
   * category; otherwise the confidence of the rule of the category, 0 for
   * unknown (and for a category no rule gives).
   */
  public static calculate(
    category: ClassificationCategory,
    source: ClassificationSource,
  ): number {
    if (source === "user") {
      return USER_CLASSIFICATION_CONFIDENCE;
    }

    const rule = CATEGORY_RULES.find(
      (candidate) => candidate.category === category,
    );

    return this.normalize(rule?.confidence ?? 0);
  }

  /**
   * Returns the confidence level
   * (OBJECT_CLASSIFICATION_SPEC.md, Confidence Levels:
   * 0-39 unknown, 40-59 low, 60-74 medium, 75-89 high, 90-100 very high).
   */
  public static getLevel(score: number): ConfidenceLevel {
    const normalizedScore = this.normalize(score);

    if (normalizedScore >= CONFIDENCE_LEVELS.VERY_HIGH.min) {
      return "very_high";
    }

    if (normalizedScore >= CONFIDENCE_LEVELS.HIGH.min) {
      return "high";
    }

    if (normalizedScore >= CONFIDENCE_LEVELS.MEDIUM.min) {
      return "medium";
    }

    if (normalizedScore >= CONFIDENCE_LEVELS.LOW.min) {
      return "low";
    }

    return "unknown";
  }
}
