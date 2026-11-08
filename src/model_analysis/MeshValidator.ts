/**
 * SlicyWeb
 * Mesh Validator
 *
 * Checks of the mesh before and during the analysis (ADR-034 D6):
 * - checkMeshData: the triangle data can be read (ANA_001 otherwise):
 *   at least one triangle, 9 numbers per triangle, every number finite;
 * - countOpenEdges: edges shared by an odd number of triangles (1, 3…):
 *   the surface is open there (mesh not closed: warning ANA_002,
 *   non-blocking; no field of DATA_SCHEMA.md);
 * - countEdgeDefects: the open edges and the non-manifold edges, shared
 *   by an even number of triangles above two (parts touching along an
 *   edge: information ANA_005, the mesh stays closed; lot 91, Noam
 *   2026-11-08).
 *
 * Pure functions, no state. Used in the Web Worker of the analysis.
 *
 * Domain: Analysis.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Analysis Rules, Mesh not closed)
 * - ERROR_CODES_SPEC.md (ANA_001, ANA_002, ANA_005)
 * - DECISIONS.md (ADR-034 D6)
 */

import { AnalysisError } from "./AnalysisError";

/**
 * Throws ANA_001 when the triangle data cannot be analyzed.
 * positions: x, y, z of the 3 corners of each triangle (not indexed).
 */
export function checkMeshData(positions: Float32Array): void {
  if (positions.length === 0) {
    throw new AnalysisError("ANA_001", "The mesh is empty.");
  }

  if (positions.length % 9 !== 0) {
    throw new AnalysisError(
      "ANA_001",
      `The mesh cannot be read: ${positions.length} numbers, not 9 per triangle.`,
    );
  }

  for (let i = 0; i < positions.length; i += 1) {
    if (!Number.isFinite(positions[i])) {
      throw new AnalysisError(
        "ANA_001",
        "The mesh cannot be read: a coordinate is not a finite number.",
      );
    }
  }
}

/**
 * Number of open edges: edges shared by an odd number of triangles (1: a
 * hole; 3: the surface is open somewhere too, Noam 2026-11-08).
 * corners: welded vertex of each corner (3 per triangle, MeshAnalyzer).
 * Triangles with two corners on the same vertex (no area) are ignored.
 * 0 = the mesh is closed.
 */
export function countOpenEdges(
  corners: Uint32Array,
  vertexCount: number,
): number {
  return countEdgeDefects(corners, vertexCount).open;
}

/** Edges of the welded mesh that are not shared by exactly two triangles */
export interface EdgeDefects {
  /** Edges shared by an odd number of triangles (ANA_002) */
  open: number;

  /** Edges shared by 4, 6… triangles: parts touching along an edge (ANA_005) */
  nonManifold: number;
}

/**
 * Open and non-manifold edges of the welded mesh. Triangles with two
 * corners on the same vertex (no area) are ignored.
 */
export function countEdgeDefects(
  corners: Uint32Array,
  vertexCount: number,
): EdgeDefects {
  const triangleCount = corners.length / 3;
  const keys = new Float64Array(corners.length);
  let edgeCount = 0;

  for (let t = 0; t < triangleCount; t += 1) {
    const a = corners[t * 3];
    const b = corners[t * 3 + 1];
    const c = corners[t * 3 + 2];

    if (a === b || b === c || a === c) {
      continue;
    }

    keys[edgeCount++] = edgeKey(a, b, vertexCount);
    keys[edgeCount++] = edgeKey(b, c, vertexCount);
    keys[edgeCount++] = edgeKey(c, a, vertexCount);
  }

  const edges = keys.subarray(0, edgeCount).sort();
  const defects: EdgeDefects = { open: 0, nonManifold: 0 };
  let i = 0;

  while (i < edges.length) {
    let j = i + 1;

    while (j < edges.length && edges[j] === edges[i]) {
      j += 1;
    }

    const shared = j - i;

    if (shared % 2 === 1) {
      defects.open += 1;
    } else if (shared > 2) {
      defects.nonManifold += 1;
    }

    i = j;
  }

  return defects;
}

/** One number per edge, whatever the order of its two vertices */
function edgeKey(a: number, b: number, vertexCount: number): number {
  return a < b ? a * vertexCount + b : b * vertexCount + a;
}
