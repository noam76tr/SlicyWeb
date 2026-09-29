/**
 * Wichy
 * Auto Save Service Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PROJECT_SPEC.md
 * - DATA_SCHEMA.md
 */

import type { Project } from "../types/Project";

export class AutoSaveService {
  private autoSaveProject:
    Project | null = null;

  private autoSaveEnabled = true;

  public save(
    project: Project
  ): void {
    if (!this.autoSaveEnabled) {
      return;
    }

    this.autoSaveProject = project;
  }

  public getLastSave():
    Project | null {
    return this.autoSaveProject;
  }

  public hasSave(): boolean {
    return (
      this.autoSaveProject !== null
    );
  }

  public enable(): void {
    this.autoSaveEnabled = true;
  }

  public disable(): void {
    this.autoSaveEnabled = false;
  }

  public isEnabled(): boolean {
    return this.autoSaveEnabled;
  }

  public clear(): void {
    this.autoSaveProject = null;
  }
}
