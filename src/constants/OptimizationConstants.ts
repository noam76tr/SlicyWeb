/**
 * SlicyWeb
 * Optimization Constants Definition
 *
 * The numbers of the orientation search of Phase 11 (ADR-036 D2, D3,
 * decisions of Noam, 2026-11-09). Each value comes from the section of
 * the document named beside it; none is chosen here.
 *
 * Based on:
 * - AI_ENGINE_SPEC.md 1.1.0 (Rules Of Version 1.1.0: Orientation
 *   Candidates, Orientation Score, Reliability Rules)
 * - PERFORMANCE_SPEC.md 1.4.0 (Optimization Performance)
 */

/**
 * Orientation Candidates (AI_ENGINE_SPEC.md 1.1.0): the 6 directions of
 * the axes, then the large faces of the convex hull.
 */
export const ORIENTATION_CANDIDATES = {
  /** A face of the hull is tried when its area is at least 1 % of the hull */
  HULL_FACE_MIN_SHARE: 0.01,

  /** At most the 50 largest faces of the hull */
  MAX_HULL_FACES: 50,

  /** Two directions closer than 1 degree count as one */
  SAME_DIRECTION_DEG: 1,
} as const;

/**
 * Convex hull of the candidates (PERFORMANCE_SPEC.md 1.4.0, Optimization
 * Performance): exact hull of the vertices that are not inside the hull
 * of the extreme vertices in 128 directions; above 20 000 such vertices,
 * the hull of the extreme vertices in 512 directions.
 */
export const CANDIDATE_HULL = {
  FIRST_DIRECTIONS: 128,
  EXACT_HULL_MAX_VERTICES: 20_000,
  FINE_DIRECTIONS: 512,
} as const;

/**
 * Orientation Score (AI_ENGINE_SPEC.md 1.1.0): 100 − S − T − H, rounded
 * to the nearest whole number.
 */
export const ORIENTATION_SCORE = {
  MAX: 100,

  /**
   * S: the recommendation would enable the supports: overhangs.maxAngle
   * above 60 degrees (RECOMMENDATION_RULES.md 1.1.0, Supports And
   * Adhesion; a bridge is always beyond 80 degrees)
   */
  SUPPORTS_ANGLE_DEG: 60,
  SUPPORTS_PENALTY: 30,

  /** S: overhangs.percentage × 2, at most 30 */
  OVERHANG_FACTOR: 2,
  OVERHANG_MAX: 30,

  /** T: stability.riskScore × 0.3, at most 30 */
  RISK_FACTOR: 0.3,
  RISK_MAX: 30,

  /** H: height ÷ largest dimension × 10, at most 10 */
  HEIGHT_FACTOR: 10,
  HEIGHT_MAX: 10,
} as const;

/** Reliability Rules (AI_ENGINE_SPEC.md 1.1.0) */
export const RELIABILITY = {
  /** Center of gravity outside the contact hull: never chosen */
  EXCLUDED_RISK: 100,

  /** Above "moderate": never chosen, unless the current one is above too */
  MAX_RISK: 60,

  /** The orientation found is applied only with at least 5 points more */
  MIN_GAIN: 5,
} as const;
