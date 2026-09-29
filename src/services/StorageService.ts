/**
 * Wichy
 * Storage Service Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PROJECT_SPEC.md
 */

import type { Project } from "../types/Project";

import { StorageManager } from "../storage/StorageManager";

export class StorageService {
  private readonly storageManager =
    new StorageManager();

  public saveProject(
    project: Project
  ): void {
    this.storageManager.saveProject(
      project
    );
  }

  public loadProject():
    Project | null {
    return this.storageManager.loadProject();
  }

  public clearProjects(): void {
    this.storageManager.clearProjects();
  }

  public saveCache(
    key: string,
    value: unknown
  ): void {
    this.storageManager.saveCache(
      key,
      value
    );
  }

  public loadCache(
    key: string
  ): unknown {
    return this.storageManager.loadCache(
      key
    );
  }

  public clearCache(): void {
    this.storageManager.clearCache();
  }
}
