/**
 * SlicyWeb
 * Cost Estimation Type Definition
 *
 * Estimation of Phase 12 (ADR-037; DATA_SCHEMA.md 3.15.0, Cost Estimation
 * Rules and Print Estimation Rules). Never stored: not in a project, not
 * in a recommendation; computed again from the analysis and the
 * recommendation of the object (Q14 A).
 *
 * Based on:
 * - DATA_SCHEMA.md (Cost Estimation Schema, Print Estimation Schema)
 * - DECISIONS.md (ADR-037)
 */

/**
 * Cost Estimation Schema. Length in mm, weight in g, amounts in the
 * currency of the preferences; null when a value is missing (no
 * filament, no density, no price, no power), never 0.
 */
export interface CostEstimation {
  filamentLength: number | null;

  filamentWeight: number | null;

  materialCost: number | null;

  electricityCost: number | null;

  /** Sum of the known costs; null when both are missing */
  totalCost: number | null;
}

/** Print Estimation Schema. printTime in seconds */
export interface PrintEstimation {
  printTime: number;

  layerCount: number;
}

/**
 * Areas of the faces of the placed object (mm²), found by the Web Worker
 * of the analysis (Q2 A): turned up, turned down (less than 45 degrees
 * from the horizontal), and the others (side). Not part of the analysis
 * (DATA_SCHEMA.md): never stored.
 */
export interface FaceAreas {
  up: number;

  down: number;

  side: number;
}

/** What the estimation does not count, shown under it (Q5 A, Q10 A) */
export interface NotCounted {
  supports: boolean;

  /** Brim or raft of the recommendation (a skirt is not named) */
  adhesion: "brim" | "raft" | null;
}

/** Estimation of one object, from its recommendation */
export interface ObjectEstimation {
  objectId: string;

  /** Recommendation the estimation was made from */
  recommendationId: string;

  estimation: PrintEstimation;

  cost: CostEstimation;

  notCounted: NotCounted;
}

/** Sum of several objects (selection, or the visible objects of the plate) */
export interface EstimationTotal {
  /** Sum of the print times, in seconds */
  printTime: number;

  /** Highest layer count: the objects are printed together */
  layerCount: number;

  cost: CostEstimation;

  /** Objects counted */
  count: number;

  /** Objects asked for, without an estimation */
  missing: number;

  notCounted: NotCounted;
}
