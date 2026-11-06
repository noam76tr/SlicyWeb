/**
 * SlicyWeb
 * Feature Detector
 *
 * Measures the geometric features of an object as placed on the build
 * plate (OBJECT_CLASSIFICATION_SPEC.md 1.2.0, Geometric Features;
 * ADR-035 D2): small, large, tall, flat, planar, curved, holes, hollow,
 * open_top, thin_walls. Each name at most once, in this order.
 *
 * - small, large, tall, flat: from the dimensions of the analysis;
 * - planar, curved: planar share = area of the planar regions divided by
 *   geometry.surfaceArea; a planar region joins triangles by their edges
 *   while their normals differ by at most 1 degree from the normal of the
 *   first triangle of the region, and counts when its area is at least
 *   1 % of the surface;
 * - holes: genus of the welded mesh, only when the mesh is closed;
 * - hollow: geometry.volume divided by the volume of the convex hull of
 *   the vertices; absent when the hull has no volume;
 * - open_top: a vertical ray at the center of the bounding box seen from
 *   above first meets a face turned up below 50 % of the height (the inner
 *   bottom), and this bottom is surrounded by walls: from just above the
 *   point met, four horizontal rays (+X, -X, +Y, -Y) each meet a face
 *   (Noam, 2026-11-05: an L bracket is not open towards the top);
 * - thin_walls: thinWalls.detected of the analysis.
 *
 * Pure functions, deterministic: the same placed mesh always gives the
 * same features. Runs in the Web Worker of the analysis (no Electron,
 * KI-024).
 *
 * Domain: Classification (depends on the Analysis Domain,
 * DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - OBJECT_CLASSIFICATION_SPEC.md (1.2.0: Geometric Features)
 * - DATA_SCHEMA.md (3.10.0: Classification Rules)
 * - DECISIONS.md (ADR-035 D2)
 */

import * as THREE from "three";
import { ConvexHull } from "three/examples/jsm/math/ConvexHull.js";
import { MeshBVH } from "three-mesh-bvh";

import {
  FEATURE_THRESHOLDS,
  GEOMETRIC_FEATURES,
} from "../constants/AnalysisConstants";
import type {
  ModelAnalysisResult,
  PlacedMesh,
} from "../model_analysis/ModelAnalyzer";
import type { GeometricFeature } from "../types/Classification";

/** Rounding of the computation: a value this close to a limit is on it */
const TOLERANCE = 1e-9;

/**
 * open_top: height above the inner bottom of the four horizontal rays, in
 * mm (just above the face met: they never run along it).
 */
export const WALL_RAY_LIFT_MM = 0.01;

/** open_top: the vertical ray starts this far above the object, in mm */
const RAY_START_ABOVE_MM = 1;

/** Directions of the four horizontal rays (open_top) */
const WALL_DIRECTIONS: readonly [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** Geometric features of the placed object, in their fixed order */
export function detectFeatures(
  mesh: PlacedMesh,
  result: ModelAnalysisResult,
): GeometricFeature[] {
  const found = new Set<GeometricFeature>();
  const { width, depth, height } = result.dimensions;
  const largest = Math.max(width, depth, height);

  if (largest <= FEATURE_THRESHOLDS.SMALL_MAX_MM + TOLERANCE) {
    found.add("small");
  }

  if (largest >= FEATURE_THRESHOLDS.LARGE_MIN_MM - TOLERANCE) {
    found.add("large");
  }

  const base = Math.min(width, depth);
  const ratio = base > 0 ? height / base : height > 0 ? Infinity : 0;

  if (ratio >= FEATURE_THRESHOLDS.TALL_MIN_RATIO - TOLERANCE) {
    found.add("tall");
  }

  if (ratio <= FEATURE_THRESHOLDS.FLAT_MAX_RATIO + TOLERANCE) {
    found.add("flat");
  }

  const { surfaceArea, volume } = result.geometry;

  if (surfaceArea > 0) {
    const share = planarShare(mesh, surfaceArea);

    if (share >= FEATURE_THRESHOLDS.PLANAR_MIN_SHARE - TOLERANCE) {
      found.add("planar");
    }

    if (share <= FEATURE_THRESHOLDS.CURVED_MAX_SHARE + TOLERANCE) {
      found.add("curved");
    }
  }

  if (result.meshClosed && genus(mesh) >= FEATURE_THRESHOLDS.HOLES_MIN_GENUS) {
    found.add("holes");
  }

  const hull = convexHullVolume(mesh);

  if (
    hull > 0 &&
    volume / hull <= FEATURE_THRESHOLDS.HOLLOW_MAX_RATIO + TOLERANCE
  ) {
    found.add("hollow");
  }

  if (isOpenTop(mesh)) {
    found.add("open_top");
  }

  if (result.thinWalls.detected) {
    found.add("thin_walls");
  }

  return GEOMETRIC_FEATURES.filter((feature) => found.has(feature));
}

/**
 * Share of the surface made of planar regions (0 to 1).
 * Triangles in their order: the same regions at each computation.
 */
export function planarShare(mesh: PlacedMesh, surfaceArea: number): number {
  const { placed, corners, vertexCount } = mesh;
  const triangleCount = corners.length / 3;
  const normals = new Float64Array(triangleCount * 3);
  const areas = new Float64Array(triangleCount);

  for (let t = 0; t < triangleCount; t += 1) {
    const n = triangleNormal(placed, corners, t);
    const length = Math.hypot(n.x, n.y, n.z);

    areas[t] = length / 2;

    if (length > 0) {
      normals[t * 3] = n.x / length;
      normals[t * 3 + 1] = n.y / length;
      normals[t * 3 + 2] = n.z / length;
    }
  }

  const neighbours = edgeNeighbours(corners, vertexCount);
  const minimumCos = Math.cos(
    (FEATURE_THRESHOLDS.PLANAR_REGION_MAX_ANGLE_DEG * Math.PI) / 180,
  );
  const minimumArea = surfaceArea * FEATURE_THRESHOLDS.PLANAR_REGION_MIN_SHARE;
  const visited = new Uint8Array(triangleCount);
  const stack: number[] = [];
  let planarArea = 0;

  for (let seed = 0; seed < triangleCount; seed += 1) {
    if (visited[seed] || areas[seed] === 0) continue;

    const nx = normals[seed * 3];
    const ny = normals[seed * 3 + 1];
    const nz = normals[seed * 3 + 2];
    let regionArea = 0;

    visited[seed] = 1;
    stack.push(seed);

    while (stack.length > 0) {
      const t = stack.pop()!;

      regionArea += areas[t];

      for (let e = 0; e < 3; e += 1) {
        const u = neighbours[t * 3 + e];

        if (u < 0 || visited[u] || areas[u] === 0) continue;

        const cos =
          normals[u * 3] * nx +
          normals[u * 3 + 1] * ny +
          normals[u * 3 + 2] * nz;

        if (cos >= minimumCos) {
          visited[u] = 1;
          stack.push(u);
        }
      }
    }

    if (regionArea >= minimumArea - TOLERANCE) {
      planarArea += regionArea;
    }
  }

  return Math.min(1, planarArea / surfaceArea);
}

/**
 * Genus of the welded mesh: (2 x C - (V - E + F)) / 2, C connected parts,
 * V vertices, E edges, F triangles. Triangles with two corners on the same
 * vertex are ignored (as the open edges, MeshValidator).
 */
export function genus(mesh: PlacedMesh): number {
  const { corners, vertexCount } = mesh;
  const triangleCount = corners.length / 3;
  const parent = new Int32Array(vertexCount).fill(-1);
  const keys = new Float64Array(corners.length);
  let edgeCount = 0;
  let faces = 0;

  const find = (v: number): number => {
    let root = v;

    while (parent[root] !== root) root = parent[root];

    // Shorter paths for the next searches
    while (parent[v] !== root) {
      const next = parent[v];

      parent[v] = root;
      v = next;
    }

    return root;
  };

  const join = (a: number, b: number): void => {
    for (const v of [a, b]) {
      if (parent[v] === -1) parent[v] = v;
    }

    const ra = find(a);
    const rb = find(b);

    if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
  };

  for (let t = 0; t < triangleCount; t += 1) {
    const a = corners[t * 3];
    const b = corners[t * 3 + 1];
    const c = corners[t * 3 + 2];

    if (a === b || b === c || a === c) continue;

    faces += 1;
    join(a, b);
    join(b, c);
    keys[edgeCount++] = edgeKey(a, b, vertexCount);
    keys[edgeCount++] = edgeKey(b, c, vertexCount);
    keys[edgeCount++] = edgeKey(c, a, vertexCount);
  }

  const edges = keys.subarray(0, edgeCount).sort();
  let distinctEdges = 0;

  for (let i = 0; i < edges.length; i += 1) {
    if (i === 0 || edges[i] !== edges[i - 1]) distinctEdges += 1;
  }

  let vertices = 0;
  let parts = 0;

  for (let v = 0; v < vertexCount; v += 1) {
    if (parent[v] === -1) continue;

    vertices += 1;

    if (find(v) === v) parts += 1;
  }

  return (2 * parts - (vertices - distinctEdges + faces)) / 2;
}

/** Volume of the convex hull of the vertices, in mm³; 0 when flat */
export function convexHullVolume(mesh: PlacedMesh): number {
  const { placed, vertexCount } = mesh;

  if (vertexCount < 4) return 0;

  const points: THREE.Vector3[] = [];

  for (let v = 0; v < vertexCount; v += 1) {
    points.push(
      new THREE.Vector3(placed[v * 3], placed[v * 3 + 1], placed[v * 3 + 2]),
    );
  }

  let hull: ConvexHull;

  try {
    hull = new ConvexHull().setFromPoints(points);
  } catch {
    // Points on one plane or one line: no volume
    return 0;
  }

  let volume = 0;

  for (const face of hull.faces) {
    const first = face.edge;
    const a = first.head().point;
    let edge = first.next;

    // Fan of the face from its first vertex: signed tetrahedra from 0
    while (edge.next !== first) {
      const b = edge.head().point;
      const c = edge.next.head().point;

      volume +=
        (a.x * (b.y * c.z - b.z * c.y) +
          a.y * (b.z * c.x - b.x * c.z) +
          a.z * (b.x * c.y - b.y * c.x)) /
        6;
      edge = edge.next;
    }
  }

  const result = Math.abs(volume);

  return Number.isFinite(result) ? result : 0;
}

/**
 * open_top: the vertical ray at the center of the object seen from above
 * first meets a face turned up below 50 % of the height, and four
 * horizontal rays from just above this point each meet a face (walls all
 * around the bottom).
 */
export function isOpenTop(mesh: PlacedMesh): boolean {
  const { placed, corners, vertexCount } = mesh;

  if (vertexCount === 0 || corners.length === 0) return false;

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < placed.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = placed[i + axis];

      if (value < min[axis]) min[axis] = value;
      if (value > max[axis]) max[axis] = value;
    }
  }

  const height = max[2] - min[2];

  if (!(height > 0)) return false;

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(placed), 3),
  );
  // Copy: the BVH sorts the triangles of its index
  geometry.setIndex(new THREE.BufferAttribute(corners.slice(), 1));

  const bvh = new MeshBVH(geometry);
  const index = geometry.index!.array as Uint32Array;
  const centerX = (min[0] + max[0]) / 2;
  const centerY = (min[1] + max[1]) / 2;
  const ray = new THREE.Ray(
    new THREE.Vector3(centerX, centerY, max[2] + RAY_START_ABOVE_MM),
    new THREE.Vector3(0, 0, -1),
  );
  const hit = bvh.raycastFirst(ray, THREE.DoubleSide);

  if (!hit || hit.faceIndex == null) return false;

  const n = triangleNormal(placed, index, hit.faceIndex);

  // Face turned up (the inner bottom), below 50 % of the height
  if (!(n.z > 0)) return false;

  const bottom = hit.point.z;

  if (
    bottom - min[2] >=
    FEATURE_THRESHOLDS.OPEN_TOP_MAX_HEIGHT_SHARE * height
  ) {
    return false;
  }

  // Walls all around the bottom: each horizontal ray meets a face
  ray.origin.set(centerX, centerY, bottom + WALL_RAY_LIFT_MM);

  for (const [dx, dy] of WALL_DIRECTIONS) {
    ray.direction.set(dx, dy, 0);

    if (!bvh.raycastFirst(ray, THREE.DoubleSide)) return false;
  }

  return true;
}

/** Normal of triangle t (not unit: its length is twice the area) */
function triangleNormal(
  placed: Float64Array,
  corners: Uint32Array,
  t: number,
): { x: number; y: number; z: number } {
  const a = corners[t * 3] * 3;
  const b = corners[t * 3 + 1] * 3;
  const c = corners[t * 3 + 2] * 3;
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
 * Neighbour of each edge of each triangle (slot t x 3 + e: edge from
 * corner e to corner e + 1), -1 when none. An edge shared by more than two
 * triangles joins each of them to the first.
 */
function edgeNeighbours(corners: Uint32Array, vertexCount: number): Int32Array {
  const triangleCount = corners.length / 3;
  const neighbours = new Int32Array(corners.length).fill(-1);
  const firstSlot = new Map<number, number>();

  for (let t = 0; t < triangleCount; t += 1) {
    for (let e = 0; e < 3; e += 1) {
      const a = corners[t * 3 + e];
      const b = corners[t * 3 + ((e + 1) % 3)];

      if (a === b) continue;

      const key = edgeKey(a, b, vertexCount);
      const slot = firstSlot.get(key);

      if (slot === undefined) {
        firstSlot.set(key, t * 3 + e);
        continue;
      }

      const first = Math.floor(slot / 3);

      if (first === t) continue;

      neighbours[t * 3 + e] = first;

      if (neighbours[slot] === -1) neighbours[slot] = t;
    }
  }

  return neighbours;
}

/** One number per edge, whatever the order of its two vertices */
function edgeKey(a: number, b: number, vertexCount: number): number {
  return a < b ? a * vertexCount + b : b * vertexCount + a;
}
