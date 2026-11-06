/**
 * SlicyWeb
 * Classification Engine Definition
 *
 * Automatic classification of one object from its geometry (Phase 10
 * lot 85; OBJECT_CLASSIFICATION_SPEC.md 1.2.0, Automatic Classification;
 * ADR-035 D2, D3):
 * - computed in the Web Worker of the analysis, on the object as placed
 *   on the build plate (classifyModel);
 * - geometric features (FeatureDetector), then the category of the first
 *   rule that matches (CategoryDetector) and its confidence
 *   (ConfidenceScorer);
 * - subcategory "", detectedTags [], classificationVersion 1.2.0, source
 *   automatic;
 * - every result is checked with ClassificationValidator (KI-011): a
 *   result refused throws (ANA_001 in the worker).
 *
 * A category chosen by the user is kept when the object is analyzed again
 * (keepUserChoice): only detectedFeatures and classificationVersion are
 * computed again (DATA_SCHEMA.md 3.10.0, Classification Rules).
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md (1.2.0)
 * - DATA_SCHEMA.md (3.10.0: Object Classification Schema, Classification
 *   Rules)
 * - DECISIONS.md (ADR-035 D2, D3)
 */

import { CLASSIFICATION_VERSION } from "../constants/AnalysisConstants";
import type {
  ModelAnalysisResult,
  PlacedMesh,
} from "../model_analysis/ModelAnalyzer";
import type {
  Classification,
  ClassificationCategory,
  GeometricFeature,
} from "../types/Classification";

import { CategoryDetector } from "./CategoryDetector";
import { ClassificationValidator } from "./ClassificationValidator";
import { ConfidenceScorer } from "./ConfidenceScorer";
import { detectFeatures } from "./FeatureDetector";

export class ClassificationEngine {
  private readonly categoryDetector = new CategoryDetector();

  /**
   * Classification of the placed object, from its analysis (given to the
   * analysis by the Web Worker, ModelAnalyzer.ModelClassifier).
   */
  public static classifyModel(
    mesh: PlacedMesh,
    result: ModelAnalysisResult,
  ): Classification {
    return new ClassificationEngine().classify(detectFeatures(mesh, result));
  }

  /**
   * Automatic classification from the measured features
   * (DATA_SCHEMA.md, Object Classification Schema).
   * The confidence level is not stored; it is computed
   * from confidenceScore with ConfidenceScorer.getLevel.
   */
  public classify(features: readonly GeometricFeature[]): Classification {
    const category: ClassificationCategory =
      this.categoryDetector.detect(features);

    return ClassificationEngine.checked({
      category,
      subcategory: "",
      confidenceScore: ConfidenceScorer.calculate(category, "automatic"),
      detectedFeatures: [...features],
      detectedTags: [],
      classificationVersion: CLASSIFICATION_VERSION,
      source: "automatic",
    });
  }

  /**
   * Classification stored after a new analysis of an object: the new
   * automatic classification, unless the user chose the category of the
   * object (previous source user): this category stays, with the
   * confidence 100 and the features just measured.
   */
  public static keepUserChoice(
    previous: Classification | null | undefined,
    computed: Classification,
  ): Classification {
    if (previous?.source !== "user") {
      return computed;
    }

    return ClassificationEngine.checked({
      ...previous,
      confidenceScore: ConfidenceScorer.calculate(previous.category, "user"),
      detectedFeatures: [...computed.detectedFeatures],
      classificationVersion: computed.classificationVersion,
      source: "user",
    });
  }

  /** The classification, checked by ClassificationValidator (KI-011) */
  private static checked(classification: Classification): Classification {
    if (!ClassificationValidator.validate(classification)) {
      throw new Error("The classification of the object is not valid.");
    }

    return classification;
  }
}
