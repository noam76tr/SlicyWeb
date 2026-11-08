/**
 * SlicyWeb
 * Model Analyzer
 *
 * Computes the analysis of one object, as placed on the build plate
 * (DATA_SCHEMA.md 3.9.0, Analysis Rules; ADR-034):
 * 1. checks the triangle data (ANA_001 when empty or unreadable);
 * 2. welds the vertices (mesh.vertices = distinct vertices);
 * 3. applies scale and rotation, position ignored;
 * 4. dimensions, geometry (volume, area), center of gravity;
 * 5. stability (contact area, contact hull, height ratio, risk);
 * 6. overhangs and bridges (angle from the vertical, ADR-034 D3);
 * 7. thin walls (rays towards the inside, three-mesh-bvh, ADR-034 D5);
 * 8. open edges: meshClosed false = warning ANA_002 (non-blocking);
 *    non-manifold edges: meshManifold false = information ANA_005;
 * 9. the triangles beyond 45 degrees, for the display in red (lot 82);
 * 10. the classification (Phase 10 lot 85), on the same placed mesh, by
 *    the classifier given by the Web Worker of the analysis: this domain
 *    never imports the Classification Domain
 *    (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Phase 9: base of the analysis (lot 77), overhangs and bridges (lot 78),
 * thin walls (lot 79); the Complete Analysis Schema
 * (analysisId, objectId, status, classification) is built and
 * validated with AnalysisSchema by AnalysisService (lot 80).
 *
 * Pure functions, no state, deterministic: the same object gives the same
 * result. Runs in the Web Worker of the analysis (no Electron, KI-024).
 *
 * Domain: Analysis.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Complete Analysis Schema, Analysis Rules;
 *   3.10.0: classification computed with the analysis)
 * - DECISIONS.md (ADR-034 D2, D3, D4, D5, D6, D7; ADR-035 D2)
 * - ERROR_CODES_SPEC.md (ANA_001, ANA_002)
 */

import type {
  Bridges,
  Dimensions,
  Geometry,
  MeshStatistics,
  Overhangs,
  Stability,
  ThinWalls,
} from "../types/Analysis";
import type { Classification } from "../types/Classification";

import { AnalysisError } from "./AnalysisError";
import { analyzeGeometry } from "./GeometryAnalyzer";
import {
  meshStatistics,
  placeVertices,
  weldVertices,
  type AnalysisTransform,
} from "./MeshAnalyzer";
import { checkMeshData, countEdgeDefects } from "./MeshValidator";
import {
  analyzeBridges,
  analyzeOverhangs,
  analyzeThinWalls,
  downAngles,
  overhangTriangles,
} from "./PrintabilityAnalyzer";
import { analyzeStability } from "./StabilityAnalyzer";

/**
 * The object as placed on the build plate, as the analysis computes it:
 * welded vertices (x, y, z relative to the center of the object, rotation
 * and scale applied) and the vertex of each corner.
 */
export interface PlacedMesh {
  placed: Float64Array;

  corners: Uint32Array;

  vertexCount: number;
}

/**
 * Classification of the placed object from its analysis (Phase 10,
 * ClassificationEngine.classifyModel, given by the Web Worker).
 */
export type ModelClassifier = (
  mesh: PlacedMesh,
  result: ModelAnalysisResult,
) => Classification;

/** Result of the computation of one object (lots 77 to 79, 85) */
export interface ModelAnalysisResult {
  dimensions: Dimensions;

  geometry: Geometry;

  mesh: MeshStatistics;

  stability: Stability;

  overhangs: Overhangs;

  bridges: Bridges;

  thinWalls: ThinWalls;

  /**
   * false: an edge is shared by an odd number of triangles (a hole); the
   * message ANA_002 is shown (not stored, DATA_SCHEMA.md: Mesh not closed).
   */
  meshClosed: boolean;

  /**
   * false: an edge is shared by 4, 6… triangles (parts touching along an
   * edge); information ANA_005 when the mesh is closed (not stored; lot 91).
   */
  meshManifold: boolean;

  /**
   * Index of each triangle beyond 45 degrees, in the triangle data of the
   * object (GUI_SPEC.md, Overhang Display, lot 82). Not part of the
   * analysis (DATA_SCHEMA.md): never stored in a project.
   */
  overhangTriangles: Uint32Array;

  /**
   * Automatic classification of the object (Phase 10 lot 85,
   * OBJECT_CLASSIFICATION_SPEC.md 1.2.0); null when no classifier was
   * given (the analysis alone).
   */
  classification: Classification | null;
}

/**
 * Analysis of one object.
 * positions: x, y, z of the 3 corners of each triangle, coordinates of the
 * object (GeometryRegistry); transform: its scale and rotation.
 * classify: classification of the result (Web Worker of the analysis);
 * without it, classification is null.
 * Throws AnalysisError ANA_001 when the mesh is empty or cannot be read.
 */
export function analyzeModel(
  positions: Float32Array,
  transform: AnalysisTransform,
  classify?: ModelClassifier,
): ModelAnalysisResult {
  checkMeshData(positions);
  checkTransform(transform);

  const welded = weldVertices(positions);
  const placed = placeVertices(welded.vertices, welded.vertexCount, transform);
  const { dimensions, geometry, centerOfGravity, lowestZ } = analyzeGeometry(
    placed,
    welded.corners,
  );
  const stability = analyzeStability(
    placed,
    welded.corners,
    lowestZ,
    dimensions.height,
    centerOfGravity,
  );
  const down = downAngles(placed, welded.corners, lowestZ);
  const edges = countEdgeDefects(welded.corners, welded.vertexCount);

  const result: ModelAnalysisResult = {
    dimensions,
    geometry,
    mesh: meshStatistics(welded),
    stability,
    overhangs: analyzeOverhangs(down, geometry.surfaceArea),
    bridges: analyzeBridges(placed, welded.corners, welded.vertexCount, down),
    thinWalls: analyzeThinWalls(placed, welded.corners),
    meshClosed: edges.open === 0,
    meshManifold: edges.nonManifold === 0,
    overhangTriangles: overhangTriangles(down),
    classification: null,
  };

  if (classify) {
    result.classification = classify(
      { placed, corners: welded.corners, vertexCount: welded.vertexCount },
      result,
    );
  }

  return result;
}

/** Scale and rotation must be finite numbers, the scale above 0 */
function checkTransform(transform: AnalysisTransform): void {
  const { rotation, scale } = transform;
  const values = [
    rotation.x,
    rotation.y,
    rotation.z,
    scale.x,
    scale.y,
    scale.z,
  ];

  if (
    !values.every((value) => Number.isFinite(value)) ||
    scale.x <= 0 ||
    scale.y <= 0 ||
    scale.z <= 0
  ) {
    throw new AnalysisError(
      "ANA_001",
      "The transform of the object cannot be used for the analysis.",
    );
  }
}

/** Message sent to the Web Worker of the analysis */
export interface AnalysisRequest {
  /** Copy of the triangle data of the object (transferred) */
  positions: Float32Array;

  transform: AnalysisTransform;
}

/** Message returned by the Web Worker of the analysis */
export type AnalysisResponse =
  | { type: "result"; result: ModelAnalysisResult }
  | { type: "error"; code: "ANA_001"; message: string };

/**
 * Answer to one request of the worker; never throws: any failure of the
 * computation, classification included, is ANA_001 (ERROR_CODES_SPEC.md,
 * Analysis Errors).
 */
export function runAnalysisRequest(
  request: AnalysisRequest,
  classify?: ModelClassifier,
): AnalysisResponse {
  try {
    if (!(request?.positions instanceof Float32Array) || !request.transform) {
      throw new AnalysisError("ANA_001", "The analysis request is not valid.");
    }

    return {
      type: "result",
      result: analyzeModel(request.positions, request.transform, classify),
    };
  } catch (error) {
    return {
      type: "error",
      code: "ANA_001",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
