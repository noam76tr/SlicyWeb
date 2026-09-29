/**
 * Wichy
 * Storage Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PROJECT_SPEC.md
 */

import type { Project } from "../types/Project";

import { ProjectStorage } from "./ProjectStorage";
import { CacheStorage } from "./CacheStorage";

export class StorageManager {
  private readonly projectStorage =
    new ProjectStorage();

  private readonly cacheStorage =
    new CacheStorage();

  public saveProject(
    project: Project
  ): void {
    this.projectStorage.save(
      project
    );
  }

  public loadProject():
    Project | null {
    return this.projectStorage.load();
  }

  public clearProjects(): void {
    this.projectStorage.clear();
  }

  public saveCache(
    key: string,
    value: unknown
  ): void {
    this.cacheStorage.save(
      key,
      value
    );
  }

  public loadCache(
    key: string
  ): unknown {
    return this.cacheStorage.load(
      key
    );
  }

  public clearCache(): void {
    this.cacheStorage.clear();
  }
}
