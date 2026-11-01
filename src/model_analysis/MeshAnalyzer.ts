/**
 * SlicyWeb
 * Mesh Analyzer
 *
 * First steps of the analysis of an object (ADR-034 D2):
 * - weldVertices: distinct vertices of the mesh; a position shared by
 *   several triangles is one vertex (same stored coordinates, -0 = 0);
 * - placeVertices: the object as placed on the build plate, scale and
 *   rotation applied, position ignored (point = R · (S · point of the
 *   object), ObjectTransform, ADR-031); the result stays relative to the
 *   center of the object (its local origin);
 * - meshStatistics: mesh.vertices and mesh.triangles.
 *
 * Pure functions, no state. Used in the Web Worker of the analysis.
 *
 * Domain: Analysis (depends on Scene for the Transform Rules).
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Complete Analysis Schema, Analysis Rules)
 * - DECISIONS.md (ADR-031, ADR-034 D2)
 */

import { objectMatrix } from "../scene/ObjectTransform";
import type { MeshStatistics } from "../types/Analysis";
import type { Transform } from "../types/Object3D";

/** Scale and rotation of an object: the position does not change the analysis */
export type AnalysisTransform = Pick<Transform, "rotation" | "scale">;

/** Mesh with its distinct vertices */
export interface WeldedMesh {
  /** Vertex of each corner, 3 per triangle */
  corners: Uint32Array;

  /** x, y, z of each distinct vertex, coordinates of the object */
  vertices: Float32Array;

  vertexCount: number;
}

const EMPTY_SLOT = -1;

/**
 * Distinct vertices of a mesh (not indexed: 9 numbers per triangle).
 * Two corners are the same vertex when their stored coordinates are equal
 * (no tolerance; -0 and 0 are equal).
 */
export function weldVertices(positions: Float32Array): WeldedMesh {
  const cornerCount = Math.floor(positions.length / 3);
  const bits = new Uint32Array(
    positions.buffer,
    positions.byteOffset,
    cornerCount * 3,
  );

  // Open addressing table, at least twice the number of corners
  let size = 1;

  while (size < cornerCount * 2) {
    size *= 2;
  }

  const mask = size - 1;
  const table = new Int32Array(size).fill(EMPTY_SLOT);
  const vertexBits = new Uint32Array(cornerCount * 3);
  const corners = new Uint32Array(cornerCount);
  let vertexCount = 0;

  for (let corner = 0; corner < cornerCount; corner += 1) {
    const x = positiveZero(bits[corner * 3]);
    const y = positiveZero(bits[corner * 3 + 1]);
    const z = positiveZero(bits[corner * 3 + 2]);

    let slot =
      (Math.imul(x, 73856093) ^
        Math.imul(y, 19349663) ^
        Math.imul(z, 83492791)) &
      mask;

    for (;;) {
      const vertex = table[slot];

      if (vertex === EMPTY_SLOT) {
        table[slot] = vertexCount;
        vertexBits[vertexCount * 3] = x;
        vertexBits[vertexCount * 3 + 1] = y;
        vertexBits[vertexCount * 3 + 2] = z;
        corners[corner] = vertexCount;
        vertexCount += 1;
        break;
      }

      if (
        vertexBits[vertex * 3] === x &&
        vertexBits[vertex * 3 + 1] === y &&
        vertexBits[vertex * 3 + 2] === z
      ) {
        corners[corner] = vertex;
        break;
      }

      slot = (slot + 1) & mask;
    }
  }

  return {
    corners,
    vertices: new Float32Array(vertexBits.buffer.slice(0, vertexCount * 12)),
    vertexCount,
  };
}

/** Bits of -0 (sign bit only) read as the bits of 0 */
function positiveZero(bits: number): number {
  return bits === 0x80000000 ? 0 : bits;
}

/**
 * x, y, z of each vertex on the build plate, relative to the center of the
 * object: R · (S · point of the object), position ignored.
 */
export function placeVertices(
  vertices: Float32Array,
  vertexCount: number,
  transform: AnalysisTransform,
): Float64Array {
  const m = objectMatrix({
    position: { x: 0, y: 0, z: 0 },
    rotation: transform.rotation,
    scale: transform.scale,
  }).elements;
  const placed = new Float64Array(vertexCount * 3);

  // Column-major matrix: elements[column * 4 + row]
  for (let v = 0; v < vertexCount; v += 1) {
    const x = vertices[v * 3];
    const y = vertices[v * 3 + 1];
    const z = vertices[v * 3 + 2];

    placed[v * 3] = m[0] * x + m[4] * y + m[8] * z;
    placed[v * 3 + 1] = m[1] * x + m[5] * y + m[9] * z;
    placed[v * 3 + 2] = m[2] * x + m[6] * y + m[10] * z;
  }

  return placed;
}

/** mesh.vertices (distinct) and mesh.triangles */
export function meshStatistics(mesh: WeldedMesh): MeshStatistics {
  return {
    vertices: mesh.vertexCount,
    triangles: mesh.corners.length / 3,
  };
}
