/**
 * SlicyWeb
 * Optimization Engine
 *
 * Orientation optimization of one object (Phase 11, ADR-036 D1: the
 * orientation only; time, material and preset optimization in Phase 15,
 * after the estimation of Phase 12):
 * 1. checks the triangle data and the transform (OPT_002 when they cannot
 *    be used);
 * 2. welds the vertices and places the object as it is now (scale and
 *    rotation, as the analysis: DATA_SCHEMA.md, Analysis Rules);
 * 3. center of gravity and area of the surface (GeometryAnalyzer);
 * 4. searches the best orientation (OrientationOptimizer).
 *
 * The result is a turn around the axes of the plate, applied by the
 * caller (TransformService, lot 98): the rotation of the object becomes
 * turn · R, position X and Y unchanged, the object placed back on the
 * plate. Nothing is stored (ADR-036 D5).
 *
 * Pure functions, no state, deterministic. Runs in the Web Worker of the
 * optimization (no Electron, KI-024).
 *
 * Domain: Optimization.
 *
 * Based on:
 * - DECISIONS.md (ADR-036 D1, D2, D3, D4, D5)
 * - AI_ENGINE_SPEC.md (1.1.0: Rules Of Version 1.1.0)
 * - DATA_SCHEMA.md (3.13.0: Optimization Result Rules)
 * - ERROR_CODES_SPEC.md (OPT_002)
 */

import { analyzeGeometry } from "../model_analysis/GeometryAnalyzer";
import {
  placeVertices,
  weldVertices,
  type AnalysisTransform,
} from "../model_analysis/MeshAnalyzer";
import { checkMeshData } from "../model_analysis/MeshValidator";
import type { BuildVolume } from "../types/Printer";

import { OptimizationError } from "./OptimizationError";
import {
  searchOrientation,
  type OrientationSearch,
} from "./OrientationOptimizer";

/**
 * Best orientation of one object.
 * positions: x, y, z of the 3 corners of each triangle, coordinates of the
 * object (GeometryRegistry); transform: its scale and rotation;
 * buildVolume: of the selected printer, null without a printer (no
 * control of the size).
 * Throws OptimizationError OPT_002 when the search cannot be made.
 */
export function optimizeOrientation(
  positions: Float32Array,
  transform: AnalysisTransform,
  buildVolume: BuildVolume | null,
): OrientationSearch {
  try {
    checkMeshData(positions);
    checkTransform(transform);
    checkBuildVolume(buildVolume);

    const welded = weldVertices(positions);
    const placed = placeVertices(
      welded.vertices,
      welded.vertexCount,
      transform,
    );
    const { geometry, centerOfGravity } = analyzeGeometry(
      placed,
      welded.corners,
    );

    return searchOrientation(
      {
        placed,
        corners: welded.corners,
        vertexCount: welded.vertexCount,
        centerOfGravity,
        surfaceArea: geometry.surfaceArea,
      },
      buildVolume,
    );
  } catch (error) {
    if (error instanceof OptimizationError) throw error;

    throw new OptimizationError(
      "OPT_002",
      error instanceof Error ? error.message : String(error),
    );
  }
}

/** Scale and rotation must be finite numbers, the scale above 0 */
function checkTransform(transform: AnalysisTransform): void {
  const { rotation, scale } = transform ?? {};
  const values = [
    rotation?.x,
    rotation?.y,
    rotation?.z,
    scale?.x,
    scale?.y,
    scale?.z,
  ];

  if (
    !values.every((value) => Number.isFinite(value)) ||
    !(scale.x > 0 && scale.y > 0 && scale.z > 0)
  ) {
    throw new OptimizationError(
      "OPT_002",
      "The transform of the object cannot be used for the optimization.",
    );
  }
}

/** A build volume, when given, has three sizes above 0 */
function checkBuildVolume(buildVolume: BuildVolume | null): void {
  if (buildVolume === null) return;

  const { x, y, z } = buildVolume ?? {};

  if (![x, y, z].every((value) => Number.isFinite(value) && value > 0)) {
    throw new OptimizationError(
      "OPT_002",
      "The build volume cannot be used for the optimization.",
    );
  }
}

/** Message sent to the Web Worker of the optimization */
export interface OrientationRequest {
  /** Copy of the triangle data of the object (transferred) */
  positions: Float32Array;

  transform: AnalysisTransform;

  buildVolume: BuildVolume | null;
}

/** Message returned by the Web Worker of the optimization */
export type OrientationResponse =
  | { type: "result"; result: OrientationSearch }
  | { type: "error"; code: "OPT_002"; message: string };

/**
 * Answer to one request of the worker; never throws: any failure is
 * OPT_002 (ERROR_CODES_SPEC.md, Optimization Errors).
 */
export function runOrientationRequest(
  request: OrientationRequest,
): OrientationResponse {
  try {
    if (!(request?.positions instanceof Float32Array) || !request.transform) {
      throw new OptimizationError(
        "OPT_002",
        "The optimization request is not valid.",
      );
    }

    return {
      type: "result",
      result: optimizeOrientation(
        request.positions,
        request.transform,
        request.buildVolume ?? null,
      ),
    };
  } catch (error) {
    return {
      type: "error",
      code: "OPT_002",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
