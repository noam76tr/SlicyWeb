/**
 * Wichy
 * Storage IPC
 *
 * Responsible for:
 * - Storage IPC communication
 * - Save requests
 * - Load requests
 * - Delete requests
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - StorageService.ts
 */

import { ipcMain } from "electron";

export class StorageIPC {
  public register(): void {
    ipcMain.handle(
      "storage:save",
      async (
        _event,
        payload: unknown,
      ) => {
        return {
          success: true,
          data: payload,
        };
      },
    );

    ipcMain.handle(
      "storage:load",
      async (
        _event,
        key: string,
      ) => {
        return {
          success: true,
          key,
        };
      },
    );

    ipcMain.handle(
      "storage:delete",
      async (
        _event,
        key: string,
      ) => {
        return {
          success: true,
          key,
        };
      },
    );

    ipcMain.handle(
      "storage:clear",
      async () => {
        return {
          success: true,
        };
      },
    );
  }
}
