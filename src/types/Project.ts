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

import type { Scene } from "./Scene";
import type { Analysis } from "./Analysis";
import type { Recommendation } from "./Recommendation";
import type { PrintPreset } from "./PrintPreset";
import type { Printer } from "./Printer";
import type { Material } from "./Material";
import type { Filament } from "./Filament";

export interface ProjectSettings {
  [key: string]: unknown;
}

export interface Project {
  projectId: string;

  projectName: string;

  projectFormat: "WYPROJ";

  createdAt: string;

  updatedAt: string;

  version: string;

  scene: Scene;

  settings: ProjectSettings;

  analysis: Record<string, Analysis>;

  recommendations: Record<string, Recommendation>;

  preset: PrintPreset | null;

  printer: Printer | null;

  material: Material | null;

  filament: Filament | null;
}
