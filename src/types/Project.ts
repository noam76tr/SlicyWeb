/**
 * Wichy
 * Project Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - ARCHITECTURE.md
 */

import type { Scene } from "./Scene";
import type { PrintPreset } from "./PrintPreset";

export interface ProjectSettings {
  [key: string]: unknown;
}

export interface ProjectRecommendations {
  [key: string]: unknown;
}

export interface Project {
  projectId: string;

  projectName: string;

  createdAt: string;

  updatedAt: string;

  version: string;

  scene: Scene;

  settings: ProjectSettings;

  recommendations: ProjectRecommendations;

  preset: PrintPreset | null;

}
