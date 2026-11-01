/**
 * SlicyWeb
 * Mesh Validator
 *
 * Checks of the mesh before and during the analysis (ADR-034 D6):
 * - checkMeshData: the triangle data can be read (ANA_001 otherwise):
 *   at least one triangle, 9 numbers per triangle, every number finite;
 * - countOpenEdges: edges not shared by exactly two triangles (mesh not
 *   closed: warning ANA_002, non-blocking; no field of DATA_SCHEMA.md).
 *
 * Pure functions, no state. Used in the Web Worker of the analysis.
 *
 * Domain: Analysis.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Analysis Rules, Mesh not closed)
 * - ERROR_CODES_SPEC.md (ANA_001, ANA_002)
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
 * Number of edges not shared by exactly two triangles.
 * corners: welded vertex of each corner (3 per triangle, MeshAnalyzer).
 * Triangles with two corners on the same vertex (no area) are ignored.
 * 0 = the mesh is closed.
 */
export function countOpenEdges(
  corners: Uint32Array,
  vertexCount: number,
): number {
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
  let open = 0;
  let i = 0;

  while (i < edges.length) {
    let j = i + 1;

    while (j < edges.length && edges[j] === edges[i]) {
      j += 1;
    }

    if (j - i !== 2) {
      open += 1;
    }

    i = j;
  }

  return open;
}

/** One number per edge, whatever the order of its two vertices */
function edgeKey(a: number, b: number, vertexCount: number): number {
  return a < b ? a * vertexCount + b : b * vertexCount + a;
}
