/**
 * Wichy
 * Settings IPC
 *
 * Responsible for:
 * - Settings IPC communication
 * - Settings retrieval
 * - Settings updates
 * - Settings reset operations
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - UserPreferences.ts
 */

import { ipcMain } from "electron";

import type { UserPreferences } from "../../types/UserPreferences";

export class SettingsIPC {
  public register(): void {
    ipcMain.handle(
      "settings:get",
      async () => {
        return {
          success: true,
        };
      },
    );

    ipcMain.handle(
      "settings:update",
      async (
        _event,
        settings: UserPreferences,
      ) => {
        return {
          success: true,
          settings,
        };
      },
    );

    ipcMain.handle(
      "settings:reset",
      async () => {
        return {
          success: true,
        };
      },
    );

    ipcMain.handle(
      "settings:theme",
      async (
        _event,
        theme: string,
      ) => {
        return {
          success: true,
          theme,
        };
      },
    );

    ipcMain.handle(
      "settings:language",
      async (
        _event,
        language: string,
      ) => {
        return {
          success: true,
          language,
        };
      },
    );
  }
}
