/**
 * Wichy
 * Recovery Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PROJECT_SPEC.md
 * - DATA_SCHEMA.md
 */

import type { Project } from "../types/Project";

export class RecoveryManager {
  private recoveryProject:
    Project | null = null;

  public saveRecovery(
    project: Project
  ): void {
    this.recoveryProject = project;
  }

  public getRecovery():
    Project | null {
    return this.recoveryProject;
  }

  public hasRecovery(): boolean {
    return (
      this.recoveryProject !== null
    );
  }

  public clearRecovery(): void {
    this.recoveryProject = null;
  }

  public restore():
    Project | null {
    return this.recoveryProject;
  }
}
