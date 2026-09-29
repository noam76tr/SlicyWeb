/**
 * Wichy
 * Mesh Analyzer Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

import type { Object3D } from "../types/Object3D";

export interface MeshAnalysisResult {
  vertices: number;

  triangles: number;

  volume: number;

  surfaceArea: number;
}

export class MeshAnalyzer {
  public analyze(
    object: Object3D
  ): MeshAnalysisResult {
    return {
      vertices:
        object.mesh.vertices,

      triangles:
        object.mesh.triangles,

      volume:
        object.geometry.volume,

      surfaceArea:
        object.geometry.surfaceArea
    };
  }

  public getVertexCount(
    object: Object3D
  ): number {
    return object.mesh.vertices;
  }

  public getTriangleCount(
    object: Object3D
  ): number {
    return object.mesh.triangles;
  }

  public getVolume(
    object: Object3D
  ): number {
    return object.geometry.volume;
  }

  public getSurfaceArea(
    object: Object3D
  ): number {
    return object.geometry.surfaceArea;
  }
}
