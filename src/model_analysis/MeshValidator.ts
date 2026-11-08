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
 * Edges of the welded mesh, found once and shared by the analysis and the
 * classification (lot 92: the edges were sorted three times).
 * Slot t * 3 + e is the edge of triangle t from its corner e to its
 * corner e + 1 (corner 2 to corner 0).
 */
export interface EdgeTable {
  /** Edge of each slot, -1 when its two corners are on the same vertex */
  edgeOf: Int32Array;

  /** Number of distinct edges */
  edgeCount: number;
}

/** Group sizes up to this length are matched by a plain scan */
const SCAN_GROUP = 24;

/**
 * Edge of each slot: the slots joining the same two vertices share one
 * edge number. Linear time: the slots are grouped by their smaller vertex
 * (counting sort), then matched inside each group.
 */
export function buildEdgeTable(
  corners: Uint32Array,
  vertexCount: number,
): EdgeTable {
  const slotCount = corners.length;
  const edgeOf = new Int32Array(slotCount).fill(-1);
  const start = new Int32Array(vertexCount + 1);

  for (let s = 0; s < slotCount; s += 1) {
    const a = corners[s];
    const b = corners[s % 3 === 2 ? s - 2 : s + 1];

    if (a !== b) start[Math.min(a, b) + 1] += 1;
  }

  for (let v = 0; v < vertexCount; v += 1) start[v + 1] += start[v];

  const cursor = start.slice(0, vertexCount);
  const others = new Int32Array(start[vertexCount]);
  const slots = new Int32Array(start[vertexCount]);

  // Slots in increasing order inside each group
  for (let s = 0; s < slotCount; s += 1) {
    const a = corners[s];
    const b = corners[s % 3 === 2 ? s - 2 : s + 1];

    if (a === b) continue;

    const position = cursor[Math.min(a, b)]++;

    others[position] = Math.max(a, b);
    slots[position] = s;
  }

  let edgeCount = 0;

  for (let v = 0; v < vertexCount; v += 1) {
    const first = start[v];
    const end = start[v + 1];

    if (end - first <= SCAN_GROUP) {
      for (let i = first; i < end; i += 1) {
        let edge = -1;

        for (let j = first; j < i; j += 1) {
          if (others[j] === others[i]) {
            edge = edgeOf[slots[j]];
            break;
          }
        }

        edgeOf[slots[i]] = edge >= 0 ? edge : edgeCount++;
      }

      continue;
    }

    // Large group (a vertex shared by many triangles): sorted by the other
    // vertex
    const order = Array.from({ length: end - first }, (_, k) => first + k);

    order.sort((x, y) => others[x] - others[y] || slots[x] - slots[y]);

    for (let k = 0; k < order.length; k += 1) {
      const i = order[k];

      if (k === 0 || others[i] !== others[order[k - 1]]) {
        edgeOf[slots[i]] = edgeCount++;
      } else {
        edgeOf[slots[i]] = edgeOf[slots[order[k - 1]]];
      }
    }
  }

  return { edgeOf, edgeCount };
}

/**
 * Open and non-manifold edges of the welded mesh. Triangles with two
 * corners on the same vertex (no area) are ignored.
 * edges: the table of the mesh, when already built.
 */
export function countEdgeDefects(
  corners: Uint32Array,
  vertexCount: number,
  edges: EdgeTable = buildEdgeTable(corners, vertexCount),
): EdgeDefects {
  const uses = triangleUses(corners, edges);
  const defects: EdgeDefects = { open: 0, nonManifold: 0 };

  for (let e = 0; e < edges.edgeCount; e += 1) {
    const shared = uses[e];

    if (shared % 2 === 1) {
      defects.open += 1;
    } else if (shared > 2) {
      defects.nonManifold += 1;
    }
  }

  return defects;
}

/**
 * Number of triangles using each edge, triangles with two corners on the
 * same vertex left out (0: the edge belongs only to such triangles).
 */
export function triangleUses(
  corners: Uint32Array,
  edges: EdgeTable,
): Int32Array {
  const uses = new Int32Array(edges.edgeCount);
  const triangleCount = corners.length / 3;

  for (let t = 0; t < triangleCount; t += 1) {
    const a = corners[t * 3];
    const b = corners[t * 3 + 1];
    const c = corners[t * 3 + 2];

    if (a === b || b === c || a === c) continue;

    uses[edges.edgeOf[t * 3]] += 1;
    uses[edges.edgeOf[t * 3 + 1]] += 1;
    uses[edges.edgeOf[t * 3 + 2]] += 1;
  }

  return uses;
}
