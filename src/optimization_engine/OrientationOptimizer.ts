/**
 * SlicyWeb
 * Orientation Optimizer
 *
 * Search of the best orientation of one object (Phase 11, ADR-036 D2, D3;
 * AI_ENGINE_SPEC.md 1.1.0, Rules Of Version 1.1.0):
 * - candidates: the object is laid on one of its flat sides: the 6
 *   directions of the axes of the plate (bottom, top, left, right, front,
 *   back) of the object as it is placed now, then the faces of its convex
 *   hull whose area is at least 1 % of the hull (the 50 largest at most);
 *   two directions closer than 1 degree count as one;
 * - each candidate is the smallest turn that brings its direction down
 *   (the turn around the vertical axis closest to the current one); the
 *   top (+Z) is brought down by a half turn around the X axis of the plate;
 * - each candidate is measured with the functions of the analysis
 *   (overhangs, stability, dimensions: DATA_SCHEMA.md, Analysis Rules) and
 *   gets the Orientation Score 100 − S − T − H;
 * - Reliability Rules: risk 100, an object larger than the build volume,
 *   or a risk above 60 (unless the current risk is above 60 too) exclude
 *   a candidate; the best is applied only with at least 5 points more than
 *   the current orientation; equal scores: the smallest turn, then the
 *   order of the candidates.
 *
 * Pure functions, no state, deterministic: the same object gives the same
 * result. Runs in the Web Worker of the optimization (no Electron,
 * KI-024).
 *
 * Domain: Optimization (depends on the Analysis Domain and on the types of
 * the Profiles Domain, DOMAINS_DEPENDENCY_MATRIX.md; never on the
 * Recommendation Domain, ADR-036 D7).
 *
 * Based on:
 * - AI_ENGINE_SPEC.md (1.1.0: Orientation Candidates, Orientation Score,
 *   Reliability Rules)
 * - DATA_SCHEMA.md (3.13.0: Optimization Result Rules; Analysis Rules)
 * - DECISIONS.md (ADR-036 D2, D3)
 * - PERFORMANCE_SPEC.md (1.4.0: Optimization Performance)
 */

import * as THREE from "three";
import { ConvexHull } from "three/examples/jsm/math/ConvexHull.js";

import {
  CANDIDATE_HULL,
  ORIENTATION_CANDIDATES,
  ORIENTATION_SCORE,
  RELIABILITY,
} from "../constants/OptimizationConstants";
import {
  analyzeOverhangs,
  downAngles,
} from "../model_analysis/PrintabilityAnalyzer";
import { analyzeStability } from "../model_analysis/StabilityAnalyzer";
import type { CenterOfGravity } from "../types/Analysis";
import type { BuildVolume } from "../types/Printer";
import type { OptimizationResult } from "../types/Recommendation";

/** Direction or point, along the axes of the plate */
export type Vec3 = [number, number, number];

/** Turn around the axes of the plate (unit quaternion) */
export interface Turn {
  x: number;
  y: number;
  z: number;
  w: number;
}

/** No turn: the current orientation */
export const NO_TURN: Turn = { x: 0, y: 0, z: 0, w: 1 };

/** The object as placed now, measured once by OptimizationEngine */
export interface CurrentMesh {
  /** x, y, z of each welded vertex, relative to the center (placed) */
  placed: Float64Array;

  /** Vertex of each corner, 3 per triangle */
  corners: Uint32Array;

  vertexCount: number;

  /** Center of gravity, relative to the center of the object */
  centerOfGravity: CenterOfGravity;

  /** geometry.surfaceArea, in mm² (does not change with a turn) */
  surfaceArea: number;
}

/** One orientation to try */
export interface OrientationCandidate {
  /** Direction of the object (as placed now) brought down */
  down: Vec3;

  /** "current", one of the 6 axes, or a face of the convex hull */
  source: "current" | "axis" | "hull";

  /** Turn that brings `down` to −Z */
  turn: Turn;

  /** Angle of the turn, in degrees (0 to 180) */
  angle: number;
}

/** Measures and score of one orientation */
export interface OrientationMeasure {
  /** Orientation Score, whole number 0 to 100 */
  score: number;

  /** overhangs.maxAngle above 60 degrees: the supports would be enabled */
  supportsNeeded: boolean;

  /** overhangs.maxAngle, in degrees */
  maxAngle: number;

  /** overhangs.percentage: area beyond 45 degrees, % of the surface */
  overhangPercentage: number;

  /** stability.riskScore, 0 to 100 */
  riskScore: number;

  /** Size on the plate along X, Y, Z, in mm */
  width: number;
  depth: number;
  height: number;

  /** Inside the build volume; null without a printer (no control) */
  fits: boolean | null;
}

/** Result of the search for one object */
export interface OrientationSearch {
  /** Turn to apply around the axes of the plate; null: keep the current one */
  turn: Turn | null;

  /** Angle of the turn applied, in degrees; 0 when kept */
  angle: number;

  /** The current orientation */
  before: OrientationMeasure;

  /** The orientation kept (the same as before when nothing is applied) */
  after: OrientationMeasure;

  /** Optimization Result Schema (DATA_SCHEMA.md 3.13.0) */
  optimization: OptimizationResult;

  /** Number of orientations measured, the current one included */
  measured: number;
}

const DOWN: Vec3 = [0, 0, -1];

/** The 6 directions of the axes: bottom, top, left, right, front, back */
const AXES: Vec3[] = [
  [0, 0, -1],
  [0, 0, 1],
  [-1, 0, 0],
  [1, 0, 0],
  [0, -1, 0],
  [0, 1, 0],
];

const DEGREES = 180 / Math.PI;

/** Two turns whose angles differ by less than this are equal, in degrees */
const SAME_ANGLE_DEG = 1e-6;

/**
 * Orientations to try for the object as placed now: the current one
 * first, then the 5 other axes, then the faces of the convex hull.
 */
export function orientationCandidates(
  placed: Float64Array,
  vertexCount: number,
): OrientationCandidate[] {
  const sameCos = Math.cos(ORIENTATION_CANDIDATES.SAME_DIRECTION_DEG / DEGREES);
  const directions: { down: Vec3; source: OrientationCandidate["source"] }[] =
    AXES.map((down, index) => ({
      down,
      source: index === 0 ? "current" : "axis",
    }));
  let hullCount = 0;

  for (const face of hullFaceDirections(placed, vertexCount)) {
    if (hullCount >= ORIENTATION_CANDIDATES.MAX_HULL_FACES) break;

    const known = directions.some(
      ({ down }) => dot(down, face.direction) >= sameCos,
    );

    if (!known) {
      directions.push({ down: face.direction, source: "hull" });
      hullCount += 1;
    }
  }

  return directions.map(({ down, source }) => {
    const turn = turnDown(down);

    return { down, source, turn, angle: turnAngle(turn) };
  });
}

/**
 * Outward normals of the faces of the convex hull of the vertices whose
 * area is at least 1 % of the area of the hull, the largest first. Faces
 * whose normals differ by less than 1 degree are one face (their areas
 * added). Empty when the hull has no volume (flat object).
 */
export function hullFaceDirections(
  placed: Float64Array,
  vertexCount: number,
): { direction: Vec3; area: number }[] {
  const hull = candidateHull(placed, vertexCount);

  if (!hull) return [];

  const sameCos = Math.cos(ORIENTATION_CANDIDATES.SAME_DIRECTION_DEG / DEGREES);
  const faces = hull.faces
    .map((face) => ({
      normal: [face.normal.x, face.normal.y, face.normal.z] as Vec3,
      area: face.area,
    }))
    .filter((face) => face.area > 0 && Number.isFinite(face.area))
    .sort((a, b) => b.area - a.area);
  const total = faces.reduce((sum, face) => sum + face.area, 0);

  if (!(total > 0)) return [];

  // The direction of a group is the normal of its largest face
  const groups: { direction: Vec3; area: number }[] = [];

  for (const face of faces) {
    const group = groups.find(
      ({ direction }) => dot(direction, face.normal) >= sameCos,
    );

    if (group) {
      group.area += face.area;
    } else {
      groups.push({ direction: normalized(face.normal), area: face.area });
    }
  }

  return groups
    .filter(
      (group) =>
        group.area >= ORIENTATION_CANDIDATES.HULL_FACE_MIN_SHARE * total,
    )
    .sort((a, b) => b.area - a.area);
}

/**
 * Convex hull of the candidates (PERFORMANCE_SPEC.md 1.4.0): exact hull of
 * the vertices that are not inside the hull of the extreme vertices in 128
 * directions; when more than 20 000 such vertices remain (a surface curved
 * everywhere), the hull of the extreme vertices in 512 directions. null
 * when the vertices have no volume.
 */
function candidateHull(
  placed: Float64Array,
  vertexCount: number,
): ConvexHull | null {
  if (vertexCount < 4) return null;

  const first = extremeVertices(
    placed,
    vertexCount,
    CANDIDATE_HULL.FIRST_DIRECTIONS,
  );
  const small = hullOf(placed, first);

  if (!small) return null;

  // Vertices not strictly inside the small hull (on it or outside)
  const faces = small.faces;
  const planes = new Float64Array(faces.length * 4);

  for (let f = 0; f < faces.length; f += 1) {
    planes[f * 4] = faces[f].normal.x;
    planes[f * 4 + 1] = faces[f].normal.y;
    planes[f * 4 + 2] = faces[f].normal.z;
    planes[f * 4 + 3] = faces[f].constant;
  }

  const tolerance = 1e-7 * diagonal(placed, vertexCount);
  const kept: number[] = [];

  for (let v = 0; v < vertexCount; v += 1) {
    const x = placed[v * 3];
    const y = placed[v * 3 + 1];
    const z = placed[v * 3 + 2];

    for (let f = 0; f < faces.length; f += 1) {
      const outside =
        x * planes[f * 4] +
        y * planes[f * 4 + 1] +
        z * planes[f * 4 + 2] -
        planes[f * 4 + 3];

      if (outside > -tolerance) {
        kept.push(v);
        break;
      }
    }

    if (kept.length > CANDIDATE_HULL.EXACT_HULL_MAX_VERTICES) break;
  }

  if (kept.length > CANDIDATE_HULL.EXACT_HULL_MAX_VERTICES) {
    return hullOf(
      placed,
      extremeVertices(placed, vertexCount, CANDIDATE_HULL.FINE_DIRECTIONS),
    );
  }

  return hullOf(
    placed,
    [...new Set([...first, ...kept])].sort((a, b) => a - b),
  );
}

/** Convex hull of some vertices; null when they have no volume */
function hullOf(placed: Float64Array, vertices: number[]): ConvexHull | null {
  if (vertices.length < 4) return null;

  const points = vertices.map(
    (v) =>
      new THREE.Vector3(placed[v * 3], placed[v * 3 + 1], placed[v * 3 + 2]),
  );

  try {
    const hull = new ConvexHull().setFromPoints(points);

    return hull.faces.length >= 4 ? hull : null;
  } catch {
    // Points on one plane or one line: no volume
    return null;
  }
}

/**
 * The vertex furthest in each of `count` directions spread evenly on the
 * sphere (Fibonacci, always the same), in increasing order, each once.
 */
function extremeVertices(
  placed: Float64Array,
  vertexCount: number,
  count: number,
): number[] {
  const directions = new Float64Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let d = 0; d < count; d += 1) {
    const z = 1 - (2 * (d + 0.5)) / count;
    const r = Math.sqrt(1 - z * z);

    directions[d * 3] = r * Math.cos(golden * d);
    directions[d * 3 + 1] = r * Math.sin(golden * d);
    directions[d * 3 + 2] = z;
  }

  const best = new Float64Array(count).fill(-Infinity);
  const extreme = new Int32Array(count);

  for (let v = 0; v < vertexCount; v += 1) {
    const x = placed[v * 3];
    const y = placed[v * 3 + 1];
    const z = placed[v * 3 + 2];

    for (let d = 0; d < count; d += 1) {
      const value =
        x * directions[d * 3] +
        y * directions[d * 3 + 1] +
        z * directions[d * 3 + 2];

      if (value > best[d]) {
        best[d] = value;
        extreme[d] = v;
      }
    }
  }

  return [...new Set(extreme)].sort((a, b) => a - b);
}

/** Diagonal of the bounding box of the vertices, in mm */
function diagonal(placed: Float64Array, vertexCount: number): number {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let v = 0; v < vertexCount; v += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = placed[v * 3 + axis];

      if (value < min[axis]) min[axis] = value;
      if (value > max[axis]) max[axis] = value;
    }
  }

  return Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
}

/**
 * Smallest turn that brings `down` to −Z; the top (+Z) is brought down by
 * a half turn around the X axis of the plate.
 */
export function turnDown(down: Vec3): Turn {
  const from = new THREE.Vector3(...normalized(down));
  const target = new THREE.Vector3(...DOWN);

  if (from.dot(target) > 1 - 1e-12) return { ...NO_TURN };
  if (from.dot(target) < -1 + 1e-12) return { x: 1, y: 0, z: 0, w: 0 };

  const q = new THREE.Quaternion().setFromUnitVectors(from, target);

  return { x: q.x, y: q.y, z: q.z, w: q.w };
}

/** Angle of a turn, in degrees (0 to 180) */
export function turnAngle(turn: Turn): number {
  return 2 * Math.acos(Math.min(1, Math.abs(turn.w))) * DEGREES;
}

/**
 * Measures and score of the object turned by `turn` (around its center),
 * with the functions of the analysis. buffer: optional array of the size
 * of mesh.placed, reused between the candidates.
 */
export function measureOrientation(
  mesh: CurrentMesh,
  turn: Turn,
  buildVolume: BuildVolume | null,
  buffer?: Float64Array,
): OrientationMeasure {
  const { corners, vertexCount } = mesh;
  const m = new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion(turn.x, turn.y, turn.z, turn.w),
  ).elements;
  const placed =
    buffer && buffer.length === vertexCount * 3
      ? buffer
      : new Float64Array(vertexCount * 3);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  // Column-major matrix: elements[column * 4 + row]
  for (let v = 0; v < vertexCount; v += 1) {
    const x = mesh.placed[v * 3];
    const y = mesh.placed[v * 3 + 1];
    const z = mesh.placed[v * 3 + 2];
    const px = m[0] * x + m[4] * y + m[8] * z;
    const py = m[1] * x + m[5] * y + m[9] * z;
    const pz = m[2] * x + m[6] * y + m[10] * z;

    placed[v * 3] = px;
    placed[v * 3 + 1] = py;
    placed[v * 3 + 2] = pz;

    if (px < min[0]) min[0] = px;
    if (px > max[0]) max[0] = px;
    if (py < min[1]) min[1] = py;
    if (py > max[1]) max[1] = py;
    if (pz < min[2]) min[2] = pz;
    if (pz > max[2]) max[2] = pz;
  }

  const width = max[0] - min[0];
  const depth = max[1] - min[1];
  const height = max[2] - min[2];
  const { x, y, z } = mesh.centerOfGravity;
  const centerOfGravity = {
    x: m[0] * x + m[4] * y + m[8] * z,
    y: m[1] * x + m[5] * y + m[9] * z,
    z: m[2] * x + m[6] * y + m[10] * z,
  };
  const stability = analyzeStability(
    placed,
    corners,
    min[2],
    height,
    centerOfGravity,
  );
  const overhangs = analyzeOverhangs(
    downAngles(placed, corners, min[2]),
    mesh.surfaceArea,
  );
  const fits = buildVolume
    ? !(
        width > buildVolume.x ||
        depth > buildVolume.y ||
        height > buildVolume.z
      )
    : null;
  const supportsNeeded =
    overhangs.maxAngle > ORIENTATION_SCORE.SUPPORTS_ANGLE_DEG;

  return {
    score: orientationScore(
      supportsNeeded,
      overhangs.percentage,
      stability.riskScore,
      height,
      Math.max(width, depth, height),
    ),
    supportsNeeded,
    maxAngle: overhangs.maxAngle,
    overhangPercentage: overhangs.percentage,
    riskScore: stability.riskScore,
    width,
    depth,
    height,
    fits,
  };
}

/**
 * Orientation Score (AI_ENGINE_SPEC.md 1.1.0): 100 − S − T − H, rounded to
 * the nearest whole number, 0 to 100.
 * S = 30 when the supports would be enabled, + overhang % × 2 (at most 30);
 * T = risk × 0.3 (at most 30); H = height ÷ largest dimension × 10 (at
 * most 10).
 */
export function orientationScore(
  supportsNeeded: boolean,
  overhangPercentage: number,
  riskScore: number,
  height: number,
  largestDimension: number,
): number {
  const s =
    (supportsNeeded ? ORIENTATION_SCORE.SUPPORTS_PENALTY : 0) +
    Math.min(
      ORIENTATION_SCORE.OVERHANG_MAX,
      overhangPercentage * ORIENTATION_SCORE.OVERHANG_FACTOR,
    );
  const t = Math.min(
    ORIENTATION_SCORE.RISK_MAX,
    riskScore * ORIENTATION_SCORE.RISK_FACTOR,
  );
  const h =
    largestDimension > 0
      ? Math.min(
          ORIENTATION_SCORE.HEIGHT_MAX,
          (height / largestDimension) * ORIENTATION_SCORE.HEIGHT_FACTOR,
        )
      : 0;
  const score = Math.round(ORIENTATION_SCORE.MAX - s - t - h);

  return Math.min(ORIENTATION_SCORE.MAX, Math.max(0, score)) + 0;
}

/**
 * Reliability Rules: a candidate is never chosen when its center of
 * gravity is outside its contact hull (risk 100), when it does not fit in
 * the build volume, or when its risk is above 60 while the current one is
 * not.
 */
export function isExcluded(
  candidate: OrientationMeasure,
  current: OrientationMeasure,
): boolean {
  return (
    candidate.riskScore >= RELIABILITY.EXCLUDED_RISK ||
    candidate.fits === false ||
    (candidate.riskScore > RELIABILITY.MAX_RISK &&
      current.riskScore <= RELIABILITY.MAX_RISK)
  );
}

/**
 * Search of the best orientation of the object as placed now. The best
 * candidate is kept only with at least 5 points more than the current
 * orientation; equal scores: the smallest turn, then the order of the
 * candidates.
 */
export function searchOrientation(
  mesh: CurrentMesh,
  buildVolume: BuildVolume | null,
): OrientationSearch {
  const candidates = orientationCandidates(mesh.placed, mesh.vertexCount);
  const buffer = new Float64Array(mesh.vertexCount * 3);
  const before = measureOrientation(mesh, NO_TURN, buildVolume, buffer);
  let best: {
    candidate: OrientationCandidate;
    measure: OrientationMeasure;
  } | null = null;

  for (const candidate of candidates) {
    if (candidate.source === "current") continue;

    const measure = measureOrientation(
      mesh,
      candidate.turn,
      buildVolume,
      buffer,
    );

    if (isExcluded(measure, before)) continue;

    if (
      !best ||
      measure.score > best.measure.score ||
      (measure.score === best.measure.score &&
        candidate.angle < best.candidate.angle - SAME_ANGLE_DEG)
    ) {
      best = { candidate, measure };
    }
  }

  const applied =
    best !== null && best.measure.score >= before.score + RELIABILITY.MIN_GAIN
      ? best
      : null;
  const after = applied ? applied.measure : before;

  return {
    turn: applied ? applied.candidate.turn : null,
    angle: applied ? applied.candidate.angle : 0,
    before,
    after,
    optimization: optimizationResult(before, after),
    measured: candidates.length,
  };
}

/**
 * Optimization Result Schema (DATA_SCHEMA.md 3.13.0, Optimization Result
 * Rules): orientationScore of the orientation kept; supportReduction =
 * fall of the area beyond 45 degrees, in % of the area before, rounded
 * (0 when there was none; below 0 when it grows); timeReduction and
 * materialReduction 0 (not measured before Phase 12).
 */
export function optimizationResult(
  before: OrientationMeasure,
  after: OrientationMeasure,
): OptimizationResult {
  const supportReduction =
    before.overhangPercentage > 0
      ? Math.round(
          ((before.overhangPercentage - after.overhangPercentage) /
            before.overhangPercentage) *
            100,
        ) + 0
      : 0;

  return {
    orientationScore: after.score,
    supportReduction,
    timeReduction: 0,
    materialReduction: 0,
  };
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalized(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]);

  return length > 0 ? [v[0] / length, v[1] / length, v[2] / length] : v;
}
