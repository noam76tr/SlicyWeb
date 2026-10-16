/**
 * SlicyWeb
 * STL Parser
 *
 * Parses an STL file (binary or ASCII, IMPORT_EXPORT_SPEC.md, STL
 * Import) into triangle data. Pure code without DOM: it runs in the
 * import Web Worker (ADR-029) and in tests.
 *
 * Format detection (IMPORT_EXPORT_SPEC.md, Format Detection):
 * - binary: 80-byte header, triangle count, then 50 bytes per
 *   triangle; the file size must be 84 + 50 x count;
 * - ASCII: text starting with "solid" and containing facets.
 * Some binary files start their header with "solid": the size test
 * is done first.
 *
 * Validation (SECURITY_SPEC.md, STL Validation and Rejection
 * Conditions; ERROR_CODES_SPEC.md):
 * - STL_002 Invalid STL Format: empty file, neither binary nor ASCII;
 * - STL_003 Corrupted STL File: truncated binary data, triangle count
 *   not matching the size, malformed ASCII facet, no triangle,
 *   coordinate not finite.
 *
 * Extracted data (IMPORT_EXPORT_SPEC.md, Extracted Data): vertices,
 * triangles, bounding box, mesh statistics; volume and surface area
 * (DATA_SCHEMA.md, Model Geometry Schema). Normals are recomputed from
 * the vertices; the normals stored in the file are not used.
 *
 * Based on:
 * - IMPORT_EXPORT_SPEC.md
 * - SECURITY_SPEC.md
 * - ERROR_CODES_SPEC.md
 * - DATA_SCHEMA.md (Model Geometry Schema, Mesh Statistics Schema)
 */

import { ImportError } from "./ImportError";

export interface StlParseResult {
  format: "binary" | "ascii";

  /** 9 values per triangle (3 vertices x, y, z), millimeters */
  positions: Float32Array;

  /** Normal of each vertex (face normal repeated 3 times) */
  normals: Float32Array;

  triangleCount: number;

  min: [number, number, number];
  max: [number, number, number];

  /** Volume enclosed by the mesh, mm³ (absolute value) */
  volume: number;

  /** Total area of the triangles, mm² */
  surfaceArea: number;
}

/** Progress callback: fraction from 0 to 1 */
export type ParseProgress = (fraction: number) => void;

const BINARY_HEADER_BYTES = 84;
const BINARY_TRIANGLE_BYTES = 50;

/** Number of triangles between two progress reports */
const PROGRESS_STEP = 50000;

export function parseStl(
  buffer: ArrayBuffer,
  onProgress: ParseProgress = () => {},
): StlParseResult {
  if (buffer.byteLength === 0) {
    throw new ImportError("STL_002", "Empty file.");
  }

  if (isBinaryStl(buffer)) {
    return parseBinary(buffer, onProgress);
  }

  if (looksLikeAscii(buffer)) {
    return parseAscii(buffer, onProgress);
  }

  if (buffer.byteLength >= BINARY_HEADER_BYTES) {
    // Binary header present, but the size does not match the count
    throw new ImportError(
      "STL_003",
      "Binary STL: the triangle count does not match the file size.",
    );
  }

  throw new ImportError("STL_002", "Not a binary or ASCII STL file.");
}

function isBinaryStl(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < BINARY_HEADER_BYTES) {
    return false;
  }

  const count = new DataView(buffer).getUint32(80, true);

  return (
    BINARY_HEADER_BYTES + count * BINARY_TRIANGLE_BYTES === buffer.byteLength
  );
}

function looksLikeAscii(buffer: ArrayBuffer): boolean {
  const start = new TextDecoder().decode(
    new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 512)),
  );

  return /^\s*solid/i.test(start);
}

/** Accumulates triangles, statistics and bounds */
class TriangleCollector {
  readonly positions: Float32Array;
  readonly normals: Float32Array;

  private index = 0;
  private volume6 = 0;
  private area2 = 0;

  readonly min: [number, number, number] = [Infinity, Infinity, Infinity];
  readonly max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  constructor(capacity: number) {
    this.positions = new Float32Array(capacity * 9);
    this.normals = new Float32Array(capacity * 9);
  }

  get count(): number {
    return this.index;
  }

  add(v: number[]): void {
    for (let i = 0; i < 9; i += 1) {
      if (!Number.isFinite(v[i])) {
        throw new ImportError(
          "STL_003",
          `Coordinate not finite in triangle ${this.index + 1}.`,
        );
      }
    }

    const [ax, ay, az, bx, by, bz, cx, cy, cz] = v;

    // Edges and face normal
    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;
    const wx = cx - ax;
    const wy = cy - ay;
    const wz = cz - az;
    let nx = uy * wz - uz * wy;
    let ny = uz * wx - ux * wz;
    let nz = ux * wy - uy * wx;
    const length = Math.hypot(nx, ny, nz);

    this.area2 += length;

    if (length > 0) {
      nx /= length;
      ny /= length;
      nz /= length;
    }

    // Signed volume of the tetrahedron (origin, a, b, c) x 6
    this.volume6 +=
      ax * (by * cz - bz * cy) -
      ay * (bx * cz - bz * cx) +
      az * (bx * cy - by * cx);

    const offset = this.index * 9;

    for (let i = 0; i < 9; i += 1) {
      this.positions[offset + i] = v[i];
    }

    for (let k = 0; k < 3; k += 1) {
      this.normals[offset + k * 3] = nx;
      this.normals[offset + k * 3 + 1] = ny;
      this.normals[offset + k * 3 + 2] = nz;

      for (let axis = 0; axis < 3; axis += 1) {
        const value = v[k * 3 + axis];
        if (value < this.min[axis]) this.min[axis] = value;
        if (value > this.max[axis]) this.max[axis] = value;
      }
    }

    this.index += 1;
  }

  result(format: "binary" | "ascii"): StlParseResult {
    if (this.index === 0) {
      throw new ImportError("STL_003", "The file contains no triangle.");
    }

    const used = this.index * 9;

    return {
      format,
      positions:
        used === this.positions.length
          ? this.positions
          : this.positions.slice(0, used),
      normals:
        used === this.normals.length ? this.normals : this.normals.slice(0, used),
      triangleCount: this.index,
      min: [...this.min],
      max: [...this.max],
      volume: Math.abs(this.volume6) / 6,
      surfaceArea: this.area2 / 2,
    };
  }
}

function parseBinary(
  buffer: ArrayBuffer,
  onProgress: ParseProgress,
): StlParseResult {
  const view = new DataView(buffer);
  const count = view.getUint32(80, true);
  const collector = new TriangleCollector(count);
  const vertex = new Array<number>(9);

  for (let t = 0; t < count; t += 1) {
    // 12 bytes of normal (ignored), 36 bytes of vertices, 2 bytes attribute
    const base = BINARY_HEADER_BYTES + t * BINARY_TRIANGLE_BYTES + 12;

    for (let i = 0; i < 9; i += 1) {
      vertex[i] = view.getFloat32(base + i * 4, true);
    }

    collector.add(vertex);

    if (t % PROGRESS_STEP === 0) {
      onProgress(t / count);
    }
  }

  onProgress(1);

  return collector.result("binary");
}

function parseAscii(
  buffer: ArrayBuffer,
  onProgress: ParseProgress,
): StlParseResult {
  const text = new TextDecoder().decode(buffer);

  if (!/\bfacet\b/i.test(text)) {
    throw new ImportError("STL_002", "ASCII STL without facet.");
  }

  // Each facet: "facet normal ... outer loop vertex x y z (x3) endloop endfacet"
  const facetPattern = /facet\b([\s\S]*?)endfacet/gi;
  const vertexPattern = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/gi;
  const facetCount = (text.match(/\bendfacet\b/gi) ?? []).length;
  const collector = new TriangleCollector(facetCount);
  const vertex: number[] = [];
  let facet: RegExpExecArray | null;
  let done = 0;

  while ((facet = facetPattern.exec(text)) !== null) {
    vertex.length = 0;
    vertexPattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = vertexPattern.exec(facet[1])) !== null) {
      vertex.push(Number(match[1]), Number(match[2]), Number(match[3]));
    }

    if (vertex.length !== 9) {
      throw new ImportError(
        "STL_003",
        `ASCII STL: facet ${done + 1} does not have 3 vertices.`,
      );
    }

    collector.add(vertex);
    done += 1;

    if (done % PROGRESS_STEP === 0) {
      onProgress(done / facetCount);
    }
  }

  onProgress(1);

  return collector.result("ascii");
}
