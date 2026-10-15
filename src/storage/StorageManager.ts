/**
 * SlicyWeb
 * Storage Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PROJECT_SPEC.md
 * - USER_SETTINGS_SPEC.md (Storage Location)
 */

import type { Project } from "../types/Project";
import type { UserPreferences } from "../types/UserPreferences";

import { ProjectStorage } from "./ProjectStorage";
import { CacheStorage } from "./CacheStorage";
import type { SettingsStorage } from "./SettingsStorage";

export class StorageManager {
  /**
   * settingsStorage: settings.json storage, created by the
   * Electron main process (file path in the user data folder).
   * Without it, the settings methods throw.
   */
  public constructor(
    private readonly settingsStorage: SettingsStorage | null = null,
  ) {}

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

  public loadSettings(): UserPreferences {
    return this.requireSettingsStorage().load();
  }

  public saveSettings(
    preferences: UserPreferences
  ): UserPreferences {
    return this.requireSettingsStorage().save(
      preferences
    );
  }

  public resetSettings(): UserPreferences {
    return this.requireSettingsStorage().reset();
  }

  private requireSettingsStorage(): SettingsStorage {
    if (!this.settingsStorage) {
      throw new Error(
        "Settings storage is not configured."
      );
    }

    return this.settingsStorage;
  }
}
