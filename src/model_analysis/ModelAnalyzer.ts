/**
 * Wichy
 * Model Analyzer Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

import type { Object3D } from "../types/Object3D";

import { MeshAnalyzer } from "./MeshAnalyzer";
import { MeshValidator } from "./MeshValidator";

export interface ModelAnalysisResult {
  valid: boolean;

  vertices: number;

  triangles: number;

  width: number;

  depth: number;

  height: number;

  volume: number;

  surfaceArea: number;
}

export class ModelAnalyzer {
  private readonly meshAnalyzer =
    new MeshAnalyzer();

  private readonly meshValidator =
    new MeshValidator();

  public analyze(
    object: Object3D
  ): ModelAnalysisResult {
    const meshAnalysis =
      this.meshAnalyzer.analyze(
        object
      );

    return {
      valid:
        this.meshValidator.validate(
          object
        ),

      vertices:
        meshAnalysis.vertices,

      triangles:
        meshAnalysis.triangles,

      width:
        object.geometry.width,

      depth:
        object.geometry.depth,

      height:
        object.geometry.height,

      volume:
        meshAnalysis.volume,

      surfaceArea:
        meshAnalysis.surfaceArea
    };
  }
}
