/**
 * SlicyWeb
 * Storage Manager Definition
 *
 * Phase 13 (lot 111, Q22 A and answer of Noam): ProjectStorage (a project
 * kept in memory, never used) is removed with its three methods; projects
 * are read and written by ProjectManager (src/project/).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PROJECT_SPEC.md
 * - USER_SETTINGS_SPEC.md (Storage Location)
 */

import type { UserPreferences } from "../types/UserPreferences";

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

  private readonly cacheStorage =
    new CacheStorage();

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
