/**
 * SlicyWeb
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

export interface ProjectMetadata {
  createdAt: string;

  updatedAt: string;

  version: string;

  author?: string;

  description?: string;
}

export interface Project {
  id: string;

  name: string;

  format: string;

  version: string;

  metadata: ProjectMetadata;

  scene?: Record<string, unknown>;

  objects?: Record<string, unknown>[];

  settings?: Record<string, unknown>;
}
