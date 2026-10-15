/**
 * SlicyWeb
 * Storage Service Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PROJECT_SPEC.md
 * - USER_SETTINGS_SPEC.md
 */

import type { Project } from "../types/Project";
import type { UserPreferences } from "../types/UserPreferences";

import { StorageManager } from "../storage/StorageManager";

export class StorageService {
  public constructor(
    private readonly storageManager: StorageManager =
      new StorageManager()
  ) {}

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

  /**
   * Returns the user preferences (settings.json)
   */
  public getSettings(): UserPreferences {
    return this.storageManager.loadSettings();
  }

  /**
   * Applies a partial update and returns the stored preferences.
   * The update must have been validated by the caller
   * (UserPreferencesUpdateSchema).
   */
  public updateSettings(
    update: Partial<UserPreferences>
  ): UserPreferences {
    return this.storageManager.saveSettings({
      ...this.storageManager.loadSettings(),
      ...update,
    });
  }

  /**
   * Restores the default preferences
   */
  public resetSettings(): UserPreferences {
    return this.storageManager.resetSettings();
  }
}
