/**
 * SlicyWeb
 * Analysis Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Complete Analysis Schema, Analysis Rules)
 * - DECISIONS.md (ADR-034)
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */

import type { Classification } from "./Classification";

/**
 * Size of the object as placed on the build plate along X, Y, Z, in mm.
 */
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

/**
 * Center of gravity of the solid, relative to the center of the object
 * (transform.position), along the axes of the build plate, in mm.
 */
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

/**
 * Status of an analysis or a recommendation (DATA_SCHEMA.md,
 * Analysis Status Values and Recommendation Status Values).
 */
export type ResultStatus =
  | "generated"
  | "outdated";

export interface Analysis {
  analysisId: string;

  objectId: string;

  status: ResultStatus;

  dimensions: Dimensions;

  geometry: Geometry;

  mesh: MeshStatistics;

  stability: Stability;

  overhangs: Overhangs;

  bridges: Bridges;

  thinWalls: ThinWalls;

  /**
   * null = not yet classified (Phase 10, ADR-034 D1).
   */
  classification: Classification | null;
}
