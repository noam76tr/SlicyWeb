/**
 * SlicyWeb
 * Stability Analyzer
 *
 * Stability of the object as placed on the build plate (DATA_SCHEMA.md
 * 3.9.0, Analysis Rules; ADR-034 D4 corrected by Noam):
 * - contactArea: area of the triangles lying on the plate (facing down,
 *   the three vertices at Z <= 0.01 mm), in mm²; used for adhesion;
 * - contact hull (not stored): convex hull, seen from above, of the
 *   contact points, the vertices at Z <= 0.01 mm; an object on legs is
 *   stable when its center of gravity is inside the hull of its legs;
 * - heightRatio: height divided by the square root of the area of the
 *   contact hull; 0 when this area is 0;
 * - riskScore: (heightRatio - 1) x 20, rounded, limited to 0 and 100;
 *   100 when the center of gravity, seen from above, is outside the hull,
 *   or when the area of the hull is 0 (no contact, a point or a line).
 *
 * Pure functions, no state. Used in the Web Worker of the analysis.
 *
 * Domain: Analysis.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Analysis Rules, stability)
 * - DECISIONS.md (ADR-034 D4)
 * - AI_ENGINE_SPEC.md (risk levels, AnalysisConstants.ts)
 */

import { RISK_SCORE } from "../constants/AnalysisConstants";
import type { CenterOfGravity, Stability } from "../types/Analysis";

/** A vertex at most this height above the plate touches it, in mm */
export const CONTACT_TOLERANCE_MM = 0.01;

/** Risk points for each unit of heightRatio above 1 */
const RISK_PER_RATIO = 20;

/** Hull smaller than this area: a point or a line, in mm² */
const MIN_HULL_AREA = 1e-6;

/** Center of gravity at most this far outside an edge of the hull: inside, in mm */
const INSIDE_TOLERANCE_MM = 1e-6;

/** Point seen from above */
export interface Point2 {
  x: number;
  y: number;
}

/**
 * placed: x, y, z of each vertex (MeshAnalyzer.placeVertices);
 * corners: vertex of each corner; lowestZ: level of the plate;
 * height: dimensions.height; centerOfGravity: GeometryAnalyzer.
 */
export function analyzeStability(
  placed: Float64Array,
  corners: Uint32Array,
  lowestZ: number,
  height: number,
  centerOfGravity: CenterOfGravity,
): Stability {
  const limit = lowestZ + CONTACT_TOLERANCE_MM;

  // Contact points: the vertices at Z <= 0.01 mm
  const points: Point2[] = [];

  for (let i = 0; i < placed.length; i += 3) {
    if (placed[i + 2] <= limit) {
      points.push({ x: placed[i], y: placed[i + 1] });
    }
  }

  // Contact area: triangles facing down with their three vertices on the plate
  let contactArea = 0;

  for (let t = 0; t < corners.length; t += 3) {
    const a = corners[t] * 3;
    const b = corners[t + 1] * 3;
    const c = corners[t + 2] * 3;

    if (
      placed[a + 2] > limit ||
      placed[b + 2] > limit ||
      placed[c + 2] > limit
    ) {
      continue;
    }

    // Z of (b - a) × (c - a): twice the area seen from above, negative
    // when the triangle faces down
    const nz =
      (placed[b] - placed[a]) * (placed[c + 1] - placed[a + 1]) -
      (placed[b + 1] - placed[a + 1]) * (placed[c] - placed[a]);

    if (nz < 0) {
      const ux = placed[b] - placed[a];
      const uy = placed[b + 1] - placed[a + 1];
      const uz = placed[b + 2] - placed[a + 2];
      const vx = placed[c] - placed[a];
      const vy = placed[c + 1] - placed[a + 1];
      const vz = placed[c + 2] - placed[a + 2];
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;

      contactArea += Math.sqrt(nx * nx + ny * ny + nz * nz) / 2;
    }
  }

  const hull = convexHull(points);
  const hullArea = polygonArea(hull);

  if (hullArea < MIN_HULL_AREA) {
    return {
      contactArea,
      heightRatio: 0,
      centerOfGravity,
      riskScore: RISK_SCORE.MAX,
    };
  }

  const heightRatio = height / Math.sqrt(hullArea);
  const inside = isInsideHull(hull, centerOfGravity);

  return {
    contactArea,
    heightRatio,
    centerOfGravity,
    riskScore: inside ? riskFromRatio(heightRatio) : RISK_SCORE.MAX,
  };
}

/** (heightRatio - 1) x 20, rounded to the nearest whole number, 0 to 100 */
export function riskFromRatio(heightRatio: number): number {
  const risk = Math.round((heightRatio - 1) * RISK_PER_RATIO);

  return Math.min(RISK_SCORE.MAX, Math.max(RISK_SCORE.MIN, risk)) + 0;
}

/**
 * Convex hull of points seen from above, counterclockwise, without
 * points on its edges (monotone chain). Fewer than 3 points: a point or a
 * line, area 0.
 */
export function convexHull(points: Point2[]): Point2[] {
  if (points.length < 3) {
    return points.slice();
  }

  const sorted = points
    .slice()
    .sort((p, q) => (p.x === q.x ? p.y - q.y : p.x - q.x));
  const lower: Point2[] = [];

  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }

    lower.push(point);
  }

  const upper: Point2[] = [];

  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const point = sorted[i];

    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }

    upper.push(point);
  }

  lower.pop();
  upper.pop();

  return lower.concat(upper);
}

/** Area of a polygon (shoelace formula), 0 with fewer than 3 points */
export function polygonArea(polygon: Point2[]): number {
  if (polygon.length < 3) {
    return 0;
  }

  let twice = 0;

  for (let i = 0; i < polygon.length; i += 1) {
    const p = polygon[i];
    const q = polygon[(i + 1) % polygon.length];

    twice += p.x * q.y - q.x * p.y;
  }

  return Math.abs(twice) / 2;
}

/**
 * The point, seen from above, is inside the counterclockwise hull or on
 * its border.
 */
export function isInsideHull(hull: Point2[], point: Point2): boolean {
  for (let i = 0; i < hull.length; i += 1) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    const length = Math.hypot(b.x - a.x, b.y - a.y);

    if (length > 0 && cross(a, b, point) / length < -INSIDE_TOLERANCE_MM) {
      return false;
    }
  }

  return true;
}

/** Z of (b - a) × (c - a): positive when a, b, c turn counterclockwise */
function cross(a: Point2, b: Point2, c: Point2): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
