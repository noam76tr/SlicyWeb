/**
 * SlicyWeb
 * Recent Projects Storage
 *
 * File > Recent Projects (lot 111, decision 119 of Noam, Q17 A): the 10
 * last projects opened or saved, the most recent first, kept in
 * settings.json (DATA_SCHEMA.md 3.16.0, User Preferences Schema:
 * files.recentProjects). A project opened again moves to the top; a
 * project not found is removed (PROJ_001); Clear List empties the list.
 * Paths are compared without case on Windows.
 *
 * Main process only (written by the main process, never by the window:
 * settings:update refuses files).
 *
 * Based on:
 * - USER_SETTINGS_SPEC.md 2.4.0 (File Settings)
 * - DATA_SCHEMA.md 3.16.0
 */

import { MAX_RECENT_PROJECTS } from "../constants/ApplicationConstants";

import type { SettingsStorage } from "./SettingsStorage";

export class RecentProjectsStorage {
  public constructor(
    private readonly settings: SettingsStorage,
    private readonly platform: string = process.platform,
  ) {}

  public list(): string[] {
    return this.settings.load().files.recentProjects;
  }

  /** Puts a project at the top of the list */
  public add(filePath: string): string[] {
    return this.write([
      filePath,
      ...this.list().filter((entry) => !this.same(entry, filePath)),
    ]);
  }

  public remove(filePath: string): string[] {
    return this.write(this.list().filter((entry) => !this.same(entry, filePath)));
  }

  public clear(): string[] {
    return this.write([]);
  }

  private same(a: string, b: string): boolean {
    return this.platform === "win32"
      ? a.toLowerCase() === b.toLowerCase()
      : a === b;
  }

  private write(recentProjects: string[]): string[] {
    const preferences = this.settings.load();

    return this.settings.save({
      ...preferences,
      files: { recentProjects: recentProjects.slice(0, MAX_RECENT_PROJECTS) },
    }).files.recentProjects;
  }
}

export default RecentProjectsStorage;
