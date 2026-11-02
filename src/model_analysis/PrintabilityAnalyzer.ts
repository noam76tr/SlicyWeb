/**
 * SlicyWeb
 * Printability Analyzer
 *
 * Overhangs, bridges and thin walls of the object as placed on the build
 * plate (DATA_SCHEMA.md 3.9.0, Analysis Rules; ADR-034 D3, D5):
 * - angle of a triangle facing down: measured from the vertical,
 *   0 = vertical wall, 90 = flat ceiling (SUPPORT_GENERATION_SPEC.md,
 *   Overhang Angle Thresholds); triangles lying on the build plate
 *   (facing down, the three vertices at Z <= 0.01 mm) are excluded;
 * - overhangs: maxAngle = the largest angle (0 when no triangle faces
 *   down); percentage = area of the triangles beyond 45 degrees divided by
 *   geometry.surfaceArea, x 100; detected = a triangle beyond 45 degrees;
 * - bridges: a flat region is made of triangles facing down beyond
 *   80 degrees, not on the plate, joined by their edges; on its border, an
 *   edge where the next triangle goes down is a support (a wall that
 *   carries it), an edge where it goes up is a free edge; supports joined
 *   by a vertex are one support; a region with at least two separate
 *   supports is a bridge; its span is the shortest distance between two of
 *   its supports; longestBridge = the largest span, 0 without bridge.
 *   This is an approximation (ADR-034: a curved or slanted bridge can be
 *   counted wrongly);
 * - thin walls: see analyzeThinWalls (ADR-034 D5, lot 79).
 *
 * No printability score: no field in DATA_SCHEMA.md (ADR-034 D9).
 *
 * Pure functions, no state, deterministic. Used in the Web Worker of the
 * analysis (no Electron, KI-024).
 *
 * Domain: Analysis.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Analysis Rules, overhangs, bridges, thinWalls)
 * - DECISIONS.md (ADR-034 D3, D5, D9)
 * - SUPPORT_GENERATION_SPEC.md (Overhang Angle Thresholds)
 */

import * as THREE from "three";
import { MeshBVH } from "three-mesh-bvh";

import type { Bridges, Overhangs, ThinWalls } from "../types/Analysis";

import { CONTACT_TOLERANCE_MM } from "./StabilityAnalyzer";

/** Beyond this angle a triangle is an overhang, in degrees ("Safe" limit) */
export const OVERHANG_LIMIT_DEG = 45;

/** Beyond this angle a triangle is flat (bridges), in degrees */
export const FLAT_LIMIT_DEG = 80;

/**
 * Rounding of the computation, in degrees: an angle at most this far from
 * a limit is on the limit (the cube turned 45 degrees is not beyond 45),
 * and a triangle at most this far from the vertical does not face down.
 */
const ANGLE_TOLERANCE_DEG = 1e-6;

/**
 * Slope, as a share of the length, below which the next triangle goes
 * down (support); between the two, it is neither down nor up.
 */
const SUPPORT_SLOPE = 1e-6;

/** The triangle does not face down, has no area or lies on the plate */
const NOT_DOWN = -1;

/** Edge shared by two triangles of the same flat region (not a border) */
const INSIDE_REGION = -1;

const DEGREES = 180 / Math.PI;

/** Angle of each triangle facing down, and its area */
export interface DownAngles {
  /** Angle from the vertical in degrees, or -1 (not facing down, on the plate, no area) */
  angles: Float64Array;

  /** Area of each triangle, in mm² */
  areas: Float64Array;
}

/**
 * placed: x, y, z of each vertex (MeshAnalyzer.placeVertices);
 * corners: vertex of each corner; lowestZ: level of the plate.
 */
export function downAngles(
  placed: Float64Array,
  corners: Uint32Array,
  lowestZ: number,
): DownAngles {
  const triangleCount = corners.length / 3;
  const angles = new Float64Array(triangleCount).fill(NOT_DOWN);
  const areas = new Float64Array(triangleCount);
  const plate = lowestZ + CONTACT_TOLERANCE_MM;

  for (let t = 0; t < triangleCount; t += 1) {
    const a = corners[t * 3] * 3;
    const b = corners[t * 3 + 1] * 3;
    const c = corners[t * 3 + 2] * 3;
    const ux = placed[b] - placed[a];
    const uy = placed[b + 1] - placed[a + 1];
    const uz = placed[b + 2] - placed[a + 2];
    const vx = placed[c] - placed[a];
    const vy = placed[c + 1] - placed[a + 1];
    const vz = placed[c + 2] - placed[a + 2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const horizontal = Math.sqrt(nx * nx + ny * ny);

    areas[t] = Math.sqrt(horizontal * horizontal + nz * nz) / 2;

    if (areas[t] === 0 || nz >= 0) {
      continue;
    }

    // Lying on the plate: excluded (same rule as the contact area)
    if (
      placed[a + 2] <= plate &&
      placed[b + 2] <= plate &&
      placed[c + 2] <= plate
    ) {
      continue;
    }

    // atan2 stays exact near 0 and 90 degrees
    const angle = Math.min(90, Math.atan2(-nz, horizontal) * DEGREES);

    if (angle > ANGLE_TOLERANCE_DEG) {
      angles[t] = angle;
    }
  }

  return { angles, areas };
}

/** surfaceArea: geometry.surfaceArea (above 0, GeometryAnalyzer) */
export function analyzeOverhangs(
  { angles, areas }: DownAngles,
  surfaceArea: number,
): Overhangs {
  let maxAngle = 0;
  let overhangArea = 0;
  let detected = false;

  for (let t = 0; t < angles.length; t += 1) {
    const angle = angles[t];

    if (angle > maxAngle) {
      maxAngle = angle;
    }

    if (angle > OVERHANG_LIMIT_DEG + ANGLE_TOLERANCE_DEG) {
      detected = true;
      overhangArea += areas[t];
    }
  }

  return {
    detected,
    maxAngle,
    percentage: detected
      ? Math.min(100, (overhangArea / surfaceArea) * 100)
      : 0,
  };
}

/**
 * placed, corners: as for downAngles; vertexCount: number of distinct
 * vertices; down: result of downAngles.
 */
export function analyzeBridges(
  placed: Float64Array,
  corners: Uint32Array,
  vertexCount: number,
  { angles, areas }: DownAngles,
): Bridges {
  const triangleCount = angles.length;
  const flatLimit = FLAT_LIMIT_DEG + ANGLE_TOLERANCE_DEG;

  // Flat triangles, numbered 0 to flatCount - 1
  const flatIndex = new Int32Array(triangleCount).fill(-1);
  let flatCount = 0;

  for (let t = 0; t < triangleCount; t += 1) {
    if (angles[t] > flatLimit) {
      flatIndex[t] = flatCount;
      flatCount += 1;
    }
  }

  if (flatCount === 0) {
    return { detected: false, count: 0, longestBridge: 0 };
  }

  // Flat regions: flat triangles joined by an edge
  const regions = new UnionFind(flatCount);
  const edgeOwner = new Map<number, number>();

  for (let t = 0; t < triangleCount; t += 1) {
    const flat = flatIndex[t];

    if (flat < 0) continue;

    for (let k = 0; k < 3; k += 1) {
      const key = edgeKey(
        corners[t * 3 + k],
        corners[t * 3 + ((k + 1) % 3)],
        vertexCount,
      );
      const owner = edgeOwner.get(key);

      if (owner === undefined) {
        edgeOwner.set(key, flat);
      } else {
        if (owner !== INSIDE_REGION) regions.union(owner, flat);
        edgeOwner.set(key, INSIDE_REGION);
      }
    }
  }

  // Supports: border edges where the next triangle goes down
  const supports = new Map<number, number[]>();

  for (let t = 0; t < triangleCount; t += 1) {
    if (flatIndex[t] >= 0 || areas[t] === 0) continue;

    for (let k = 0; k < 3; k += 1) {
      const p = corners[t * 3 + k];
      const q = corners[t * 3 + ((k + 1) % 3)];
      const owner = edgeOwner.get(edgeKey(p, q, vertexCount));

      if (owner === undefined || owner === INSIDE_REGION) continue;

      if (goesDown(placed, p, q, corners[t * 3 + ((k + 2) % 3)])) {
        const region = regions.find(owner);
        const list = supports.get(region);

        if (list) {
          list.push(p, q);
        } else {
          supports.set(region, [p, q]);
        }
      }
    }
  }

  let count = 0;
  let longestBridge = 0;

  // Regions in a fixed order: the same object gives the same result
  for (const region of [...supports.keys()].sort((x, y) => x - y)) {
    const groups = separateSupports(supports.get(region) ?? []);

    if (groups.length < 2) continue;

    count += 1;

    let span = Infinity;

    for (let i = 0; i < groups.length; i += 1) {
      for (let j = i + 1; j < groups.length; j += 1) {
        span = supportDistance(placed, groups[i], groups[j], span);
      }
    }

    longestBridge = Math.max(longestBridge, span);
  }

  return { detected: count > 0, count, longestBridge };
}

/**
 * The triangle p, q, r leaves the edge p-q downwards: the direction from
 * the edge to r, across the edge, goes down.
 */
function goesDown(
  placed: Float64Array,
  p: number,
  q: number,
  r: number,
): boolean {
  const ex = placed[q * 3] - placed[p * 3];
  const ey = placed[q * 3 + 1] - placed[p * 3 + 1];
  const ez = placed[q * 3 + 2] - placed[p * 3 + 2];
  const wx = placed[r * 3] - placed[p * 3];
  const wy = placed[r * 3 + 1] - placed[p * 3 + 1];
  const wz = placed[r * 3 + 2] - placed[p * 3 + 2];
  const length = ex * ex + ey * ey + ez * ez;

  if (length === 0) return false;

  const s = (wx * ex + wy * ey + wz * ez) / length;
  const dx = wx - s * ex;
  const dy = wy - s * ey;
  const dz = wz - s * ez;
  const across = Math.sqrt(dx * dx + dy * dy + dz * dz);

  return across > 0 && dz < -SUPPORT_SLOPE * across;
}

/**
 * Support edges (pairs of vertices) grouped into separate supports: edges
 * joined by a vertex belong to the same support. Each group: pairs of
 * vertices.
 */
function separateSupports(edges: number[]): number[][] {
  const vertices = [...new Set(edges)].sort((x, y) => x - y);
  const position = new Map<number, number>();

  vertices.forEach((vertex, i) => position.set(vertex, i));

  const joined = new UnionFind(vertices.length);

  for (let i = 0; i < edges.length; i += 2) {
    joined.union(
      position.get(edges[i]) as number,
      position.get(edges[i + 1]) as number,
    );
  }

  const groups = new Map<number, number[]>();

  for (let i = 0; i < edges.length; i += 2) {
    const root = joined.find(position.get(edges[i]) as number);
    const group = groups.get(root);

    if (group) {
      group.push(edges[i], edges[i + 1]);
    } else {
      groups.set(root, [edges[i], edges[i + 1]]);
    }
  }

  return [...groups.keys()]
    .sort((x, y) => x - y)
    .map((root) => groups.get(root) as number[]);
}

/**
 * Shortest distance between two supports (pairs of vertices), at most
 * best: pairs of edges whose boxes are already farther are skipped.
 */
function supportDistance(
  placed: Float64Array,
  first: number[],
  second: number[],
  best: number,
): number {
  let shortest = best;

  for (let i = 0; i < first.length; i += 2) {
    const a = first[i] * 3;
    const b = first[i + 1] * 3;

    for (let j = 0; j < second.length; j += 2) {
      const c = second[j] * 3;
      const d = second[j + 1] * 3;

      if (boxDistance(placed, a, b, c, d) >= shortest) continue;

      shortest = Math.min(shortest, segmentDistance(placed, a, b, c, d));
    }
  }

  return shortest;
}

/** Distance between the boxes of the segments a-b and c-d (offsets in placed) */
function boxDistance(
  placed: Float64Array,
  a: number,
  b: number,
  c: number,
  d: number,
): number {
  let squared = 0;

  for (let axis = 0; axis < 3; axis += 1) {
    const gap = Math.max(
      0,
      Math.min(placed[c + axis], placed[d + axis]) -
        Math.max(placed[a + axis], placed[b + axis]),
      Math.min(placed[a + axis], placed[b + axis]) -
        Math.max(placed[c + axis], placed[d + axis]),
    );

    squared += gap * gap;
  }

  return Math.sqrt(squared);
}

/**
 * Shortest distance between the segments a-b and c-d (offsets in placed),
 * closest points of two segments (Ericson, Real-Time Collision Detection).
 */
function segmentDistance(
  placed: Float64Array,
  a: number,
  b: number,
  c: number,
  d: number,
): number {
  const d1x = placed[b] - placed[a];
  const d1y = placed[b + 1] - placed[a + 1];
  const d1z = placed[b + 2] - placed[a + 2];
  const d2x = placed[d] - placed[c];
  const d2y = placed[d + 1] - placed[c + 1];
  const d2z = placed[d + 2] - placed[c + 2];
  const rx = placed[a] - placed[c];
  const ry = placed[a + 1] - placed[c + 1];
  const rz = placed[a + 2] - placed[c + 2];
  const aa = d1x * d1x + d1y * d1y + d1z * d1z;
  const ee = d2x * d2x + d2y * d2y + d2z * d2z;
  const f = d2x * rx + d2y * ry + d2z * rz;
  let s = 0;
  let t = 0;

  if (aa === 0) {
    t = ee === 0 ? 0 : clamp01(f / ee);
  } else {
    const cc = d1x * rx + d1y * ry + d1z * rz;

    if (ee === 0) {
      s = clamp01(-cc / aa);
    } else {
      const bb = d1x * d2x + d1y * d2y + d1z * d2z;
      const denom = aa * ee - bb * bb;

      s = denom > 0 ? clamp01((bb * f - cc * ee) / denom) : 0;
      t = (bb * s + f) / ee;

      if (t < 0) {
        t = 0;
        s = clamp01(-cc / aa);
      } else if (t > 1) {
        t = 1;
        s = clamp01((bb - cc) / aa);
      }
    }
  }

  const gx = rx + d1x * s - d2x * t;
  const gy = ry + d1y * s - d2y * t;
  const gz = rz + d1z * s - d2z * t;

  return Math.sqrt(gx * gx + gy * gy + gz * gz);
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** One number per edge, whatever the order of its two vertices */
function edgeKey(a: number, b: number, vertexCount: number): number {
  return a < b ? a * vertexCount + b : b * vertexCount + a;
}

/** Disjoint sets with path halving */
class UnionFind {
  private readonly parent: Int32Array;

  constructor(size: number) {
    this.parent = new Int32Array(size);

    for (let i = 0; i < size; i += 1) {
      this.parent[i] = i;
    }
  }

  find(i: number): number {
    let x = i;

    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];
      x = this.parent[x];
    }

    return x;
  }

  union(i: number, j: number): void {
    const x = this.find(i);
    const y = this.find(j);

    if (x !== y) {
      // The smaller root stays: the result does not depend on the order
      if (x < y) this.parent[y] = x;
      else this.parent[x] = y;
    }
  }
}

/** Below this thickness a wall is thin, in mm (two lines of a 0.4 mm nozzle) */
export const THIN_WALL_LIMIT_MM = 0.8;

/** Largest number of points measured on the surface of an object */
export const MAX_THICKNESS_POINTS = 200_000;

/**
 * Rounding of the computation, in mm: a thickness at most this far from
 * the limit is on the limit (a wall of exactly 0.8 mm is not thin).
 */
const THICKNESS_TOLERANCE_MM = 1e-6;

/**
 * Smallest share of the triangle kept between a point and an edge: the
 * point is always inside its triangle, never on an edge.
 */
const EDGE_MARGIN = 1e-3;

/**
 * The BVH stores the vertices as 32-bit numbers: a face it meets is
 * measured again in 64 bits (planeDistance), and the search goes this far
 * beyond the smallest thickness, in mm.
 */
const SEARCH_MARGIN_MM = 1e-3;

/** Steps of the R2 sequence: points spread evenly inside a triangle */
const R2_STEP_1 = 0.7548776662466927;
const R2_STEP_2 = 0.5698402909980532;

/**
 * Thin walls (DATA_SCHEMA.md 3.9.0, Analysis Rules; ADR-034 D5): from
 * points of the surface, a ray goes towards the inside (against the normal
 * of the triangle); the distance to the next face met, in mm, is the
 * thickness at this point.
 * - at most MAX_THICKNESS_POINTS points, spread in proportion to the area
 *   (point k at the area (k + 0.5) x total / number of points), always the
 *   same points: the result does not change from one computation to the
 *   next;
 * - a point is inside its triangle, never on an edge, and the ray ignores
 *   its own triangle: it never meets its own face or a neighbouring face at
 *   its start (a full cube of 20 mm gives 20 mm);
 * - the faces are met from both sides; a ray that meets nothing (open
 *   mesh) is not counted;
 * - minimumThickness: the smallest thickness, 0 when no thickness can be
 *   measured; detected: below THIN_WALL_LIMIT_MM, false without thickness.
 * The search uses a BVH (three-mesh-bvh, vertices in 32 bits): a ray
 * stops just beyond the smallest thickness found so far; each face met is
 * measured again from the 64-bit vertices.
 *
 * placed: x, y, z of each vertex (MeshAnalyzer.placeVertices);
 * corners: vertex of each corner.
 */
export function analyzeThinWalls(
  placed: Float64Array,
  corners: Uint32Array,
): ThinWalls {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(placed), 3),
  );
  // Copy: the BVH sorts the triangles of its index
  geometry.setIndex(new THREE.BufferAttribute(corners.slice(), 1));

  const bvh = new MeshBVH(geometry);
  // Triangles in the order of the BVH: the same order at each computation
  const index = geometry.index!.array as Uint32Array;
  const triangleCount = index.length / 3;
  const areas = new Float64Array(triangleCount);
  let totalArea = 0;

  for (let t = 0; t < triangleCount; t += 1) {
    const n = triangleNormal(placed, index, t);

    areas[t] = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) / 2;
    totalArea += areas[t];
  }

  if (!(totalArea > 0)) {
    return { detected: false, minimumThickness: 0 };
  }

  const pointCount = MAX_THICKNESS_POINTS;
  const spacing = totalArea / pointCount;
  const ray = new THREE.Ray();
  let minimum = Infinity;
  let areaBefore = 0;
  let firstPoint = 0;

  for (let t = 0; t < triangleCount; t += 1) {
    areaBefore += areas[t];

    // Points k whose area (k + 0.5) x spacing falls in this triangle
    const lastPoint = Math.min(
      pointCount,
      Math.ceil(areaBefore / spacing - 0.5),
    );
    const points = lastPoint - firstPoint;

    firstPoint = lastPoint;

    if (points <= 0 || areas[t] === 0) continue;

    const a = index[t * 3] * 3;
    const b = index[t * 3 + 1] * 3;
    const c = index[t * 3 + 2] * 3;
    const n = triangleNormal(placed, index, t);
    const length = areas[t] * 2;

    // Towards the inside: against the normal
    ray.direction.set(-n.x / length, -n.y / length, -n.z / length);

    for (let i = 0; i < points; i += 1) {
      const r1 = insideEdges(0.5 + i * R2_STEP_1);
      const r2 = insideEdges(0.5 + i * R2_STEP_2);
      const s = Math.sqrt(r1);
      const wa = 1 - s;
      const wb = s * (1 - r2);
      const wc = s * r2;

      ray.origin.set(
        wa * placed[a] + wb * placed[b] + wc * placed[c],
        wa * placed[a + 1] + wb * placed[b + 1] + wc * placed[c + 1],
        wa * placed[a + 2] + wb * placed[b + 2] + wc * placed[c + 2],
      );

      const hits = bvh.raycast(
        ray,
        THREE.DoubleSide,
        0,
        minimum + SEARCH_MARGIN_MM,
      );

      for (const hit of hits) {
        if (hit.faceIndex == null || hit.faceIndex === t) continue;

        const distance = planeDistance(
          placed,
          index,
          hit.faceIndex,
          ray,
          hit.distance,
        );

        if (distance < minimum) {
          minimum = distance;
        }
      }
    }
  }

  if (minimum === Infinity) {
    return { detected: false, minimumThickness: 0 };
  }

  return {
    detected: minimum < THIN_WALL_LIMIT_MM - THICKNESS_TOLERANCE_MM,
    minimumThickness: minimum,
  };
}

/** Normal of triangle t (not unit: its length is twice the area) */
function triangleNormal(
  placed: Float64Array,
  index: Uint32Array,
  t: number,
): { x: number; y: number; z: number } {
  const a = index[t * 3] * 3;
  const b = index[t * 3 + 1] * 3;
  const c = index[t * 3 + 2] * 3;
  const ux = placed[b] - placed[a];
  const uy = placed[b + 1] - placed[a + 1];
  const uz = placed[b + 2] - placed[a + 2];
  const vx = placed[c] - placed[a];
  const vy = placed[c + 1] - placed[a + 1];
  const vz = placed[c + 2] - placed[a + 2];

  return {
    x: uy * vz - uz * vy,
    y: uz * vx - ux * vz,
    z: ux * vy - uy * vx,
  };
}

/**
 * Distance along the ray to the plane of triangle t, from the 64-bit
 * vertices (the ray meets the triangle: found by the BVH); bvhDistance
 * when the ray is almost along the face.
 */
function planeDistance(
  placed: Float64Array,
  index: Uint32Array,
  t: number,
  ray: THREE.Ray,
  bvhDistance: number,
): number {
  const n = triangleNormal(placed, index, t);
  const a = index[t * 3] * 3;
  const { origin, direction } = ray;
  const facing = n.x * direction.x + n.y * direction.y + n.z * direction.z;
  const distance =
    (n.x * (placed[a] - origin.x) +
      n.y * (placed[a + 1] - origin.y) +
      n.z * (placed[a + 2] - origin.z)) /
    facing;

  // Ray almost along the face: the distance of the BVH stays
  return Number.isFinite(distance) ? Math.max(0, distance) : bvhDistance;
}

/** Fractional part, kept away from 0 and 1 (point away from the edges) */
function insideEdges(x: number): number {
  const fraction = x - Math.floor(x);

  return Math.min(1 - EDGE_MARGIN, Math.max(EDGE_MARGIN, fraction));
}
