/**
 * Wichy
 * Project Storage Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PROJECT_SPEC.md
 */

import type { Project } from "../types/Project";

export class ProjectStorage {
  private project: Project | null =
    null;

  public save(
    project: Project
  ): void {
    this.project = project;
  }

  public load():
    Project | null {
    return this.project;
  }

  public hasProject(): boolean {
    return this.project !== null;
  }

  public clear(): void {
    this.project = null;
  }
}
