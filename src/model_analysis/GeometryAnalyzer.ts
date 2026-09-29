/**
 * Wichy
 * Geometry Analyzer
 *
 * Responsible for:
 * - Bounding box analysis
 * - Dimension calculation
 * - Volume estimation
 * - Surface area estimation
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

import type { Geometry } from "../types/Analysis";

export class GeometryAnalyzer {
  /**
   * Analyzes geometry dimensions.
   */
  public analyze(
    geometry: THREE.BufferGeometry,
  ): Geometry {
    geometry.computeBoundingBox();

    const boundingBox =
      geometry.boundingBox;

    if (!boundingBox) {
      return {
        width: 0,
        depth: 0,
        height: 0,
        volume: 0,
        surfaceArea: 0,
      };
    }

    const width =
      boundingBox.max.x -
      boundingBox.min.x;

    const depth =
      boundingBox.max.y -
      boundingBox.min.y;

    const height =
      boundingBox.max.z -
      boundingBox.min.z;

    const volume =
      width *
      depth *
      height;

    const surfaceArea =
      2 *
      (
        width * depth +
        width * height +
        depth * height
      );

    return {
      width,

      depth,

      height,

      volume,

      surfaceArea,
    };
  }

  /**
   * Returns geometry dimensions.
   */
  public getDimensions(
    geometry: THREE.BufferGeometry,
  ): {
    width: number;
    depth: number;
    height: number;
  } {
    geometry.computeBoundingBox();

    const boundingBox =
      geometry.boundingBox;

    if (!boundingBox) {
      return {
        width: 0,
        depth: 0,
        height: 0,
      };
    }

    return {
      width:
        boundingBox.max.x -
        boundingBox.min.x,

      depth:
        boundingBox.max.y -
        boundingBox.min.y,

      height:
        boundingBox.max.z -
        boundingBox.min.z,
    };
  }
}
