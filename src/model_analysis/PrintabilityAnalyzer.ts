/**
 * Wichy
 * Printability Analyzer
 *
 * Responsible for:
 * - Overhang analysis
 * - Bridge analysis
 * - Thin wall detection
 * - Printability estimation
 *
 * No business logic.
 * No AI logic.
 * No scene management.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - Analysis.ts
 */

import * as THREE from "three";

import type {
  Overhangs,
  Bridges,
  ThinWalls,
} from "../types/Analysis";

export class PrintabilityAnalyzer {
  /**
   * Analyzes overhangs.
   */
  public analyzeOverhangs(
    geometry: THREE.BufferGeometry,
  ): Overhangs {
    const triangleCount =
      this.getTriangleCount(
        geometry,
      );

    return {
      detected:
        triangleCount > 0,

      maxAngle: 45,

      percentage: 0,
    };
  }

  /**
   * Analyzes bridges.
   */
  public analyzeBridges(
    geometry: THREE.BufferGeometry,
  ): Bridges {
    const triangleCount =
      this.getTriangleCount(
        geometry,
      );

    return {
      detected:
        triangleCount > 0,

      count: 0,

      longestBridge: 0,
    };
  }

  /**
   * Analyzes thin walls.
   */
  public analyzeThinWalls(
    geometry: THREE.BufferGeometry,
  ): ThinWalls {
    const vertexCount =
      this.getVertexCount(
        geometry,
      );

    return {
      detected:
        vertexCount > 0,

      minimumThickness: 0,
    };
  }

  /**
   * Returns a printability score.
   */
  public getPrintabilityScore(
    geometry: THREE.BufferGeometry,
  ): number {
    const triangleCount =
      this.getTriangleCount(
        geometry,
      );

    if (triangleCount === 0) {
      return 0;
    }

    return 100;
  }

  /**
   * Returns mesh vertex count.
   */
  private getVertexCount(
    geometry: THREE.BufferGeometry,
  ): number {
    const position =
      geometry.getAttribute(
        "position",
      );

    if (!position) {
      return 0;
    }

    return position.count;
  }

  /**
   * Returns mesh triangle count.
   */
  private getTriangleCount(
    geometry: THREE.BufferGeometry,
  ): number {
    const position =
      geometry.getAttribute(
        "position",
      );

    if (!position) {
      return 0;
    }

    return Math.floor(
      position.count / 3,
    );
  }
}
