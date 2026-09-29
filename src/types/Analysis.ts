/**
 * Wichy
 * Analysis Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */

import type { Classification } from "./Classification";

export interface Dimensions {
  width: number;
  depth: number;
  height: number;
}

export interface Geometry {
  width: number;
  depth: number;
  height: number;
  volume: number;
  surfaceArea: number;
}

export interface MeshStatistics {
  vertices: number;
  triangles: number;
}

export interface CenterOfGravity {
  x: number;
  y: number;
  z: number;
}

export interface Stability {
  contactArea: number;
  heightRatio: number;
  centerOfGravity: CenterOfGravity;
  riskScore: number;
}

export interface Overhangs {
  detected: boolean;
  maxAngle: number;
  percentage: number;
}

export interface Bridges {
  detected: boolean;
  count: number;
  longestBridge: number;
}

export interface ThinWalls {
  detected: boolean;
  minimumThickness: number;
}

export interface Analysis {
  dimensions: Dimensions;

  geometry: Geometry;

  mesh: MeshStatistics;

  stability: Stability;

  overhangs: Overhangs;

  bridges: Bridges;

  thinWalls: ThinWalls;

  classification: Classification;
}
