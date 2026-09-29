/**
 * Wichy
 * Analysis Service
 *
 * Responsible for:
 * - Analysis execution
 * - Analysis validation
 * - Analysis serialization
 * - Analysis result management
 *
 * No rendering logic.
 * No repository logic.
 * No UI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - Analysis.ts
 */

import type { Analysis } from "../types/Analysis";

export class AnalysisService {
  /**
   * Creates an analysis result.
   */
  public createAnalysis(
    analysis: Analysis,
  ): Analysis {
    return {
      ...analysis,
    };
  }

  /**
   * Serializes an analysis result.
   */
  public serialize(
    analysis: Analysis,
  ): string {
    return JSON.stringify(
      analysis,
      null,
      2,
    );
  }

  /**
   * Deserializes an analysis result.
   */
  public deserialize(
    json: string,
  ): Analysis {
    return JSON.parse(
      json,
    ) as Analysis;
  }

  /**
   * Validates an analysis result.
   */
  public validate(
    analysis:
      | Analysis
      | null
      | undefined,
  ): boolean {
    if (!analysis) {
      return false;
    }

    if (
      analysis.geometry.width < 0 ||
      analysis.geometry.depth < 0 ||
      analysis.geometry.height < 0
    ) {
      return false;
    }

    if (
      analysis.mesh.vertices < 0 ||
      analysis.mesh.triangles < 0
    ) {
      return false;
    }

    if (
      analysis.stability.riskScore < 0 ||
      analysis.stability.riskScore > 100
    ) {
      return false;
    }

    if (
      analysis.classification.confidenceScore < 0 ||
      analysis.classification.confidenceScore > 100
    ) {
      return false;
    }

    return true;
  }

  /**
   * Returns whether the analysis is printable.
   */
  public isPrintable(
    analysis: Analysis,
  ): boolean {
    return (
      analysis.stability.riskScore <
      80
    );
  }

  /**
   * Returns the classification confidence.
   */
  public getConfidenceScore(
    analysis: Analysis,
  ): number {
    return analysis.classification
      .confidenceScore;
  }
}
