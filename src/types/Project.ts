/**
 * SlicyWeb
 * Project Type Definition
 *
 * Project Schema (WYPROJ, option 1).
 *
 * analysis and recommendations are indexed by objectId (ADR-026).
 * printer, material, filament and preset are null while no
 * selection has been made (Selection Fields).
 *
 * Runtime validation: schemas/ProjectSchema.ts.
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - ARCHITECTURE.md
 */

import type { Analysis } from "./Analysis";
import type { Recommendation } from "./Recommendation";
import type { Printer } from "./Printer";
import type { Material } from "./Material";
import type { Filament } from "./Filament";
import type { Object3D } from "./Object3D";

/**
 * Settings of the project: none yet (DATA_SCHEMA.md 3.16.0; lot 111,
 * Q4 A). Always written as {}.
 */
export type ProjectSettings = Record<string, never>;

/**
 * Object of a project file: the Object Schema with its triangles
 * (DATA_SCHEMA.md 3.16.0, Object Schema: meshData; lot 111, Q2 A).
 * meshData: vertices of the triangles, 9 numbers per triangle, 32-bit
 * floating point numbers (little-endian) in the coordinate system of the
 * object, written in base64.
 */
export interface ProjectObject extends Object3D {
  meshData: string;
}

/** Scene of a project file: its objects only (Q4 A) */
export interface ProjectScene {
  objects: ProjectObject[];
}

export interface Project {
  projectId: string;
  projectName: string;
  projectFormat: "WYPROJ";
  createdAt: string;
  updatedAt: string;
  version: string;
  scene: ProjectScene;
  settings: ProjectSettings;
  analysis: Record<string, Analysis>;
  recommendations: Record<string, Recommendation>;
  /**
   * Always null (Q4 A): the preset is chosen for each object, in its
   * recommendation (Phase 10)
   */
  preset: null;
  /** Copy of the selected profile, or null (lot 111, Q3 A) */
  printer: Printer | null;
  material: Material | null;
  filament: Filament | null;
}
