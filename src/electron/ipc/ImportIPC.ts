/**
 * Wichy
 * Import IPC
 *
 * Responsible for:
 * - Import IPC communication
 * - STL import requests
 * - 3MF import requests
 * - Import status communication
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - STLImporter.ts
 * - ThreeMFImporter.ts
 */

import { ipcMain } from "electron";

export class ImportIPC {
  public register(): void {
    ipcMain.handle(
      "import:stl",
      async (
        _event,
        filePath: string,
      ) => {
        return {
          success: true,
          type: "stl",
          filePath,
        };
      },
    );

    ipcMain.handle(
      "import:3mf",
      async (
        _event,
        filePath: string,
      ) => {
        return {
          success: true,
          type: "3mf",
          filePath,
        };
      },
    );

    ipcMain.handle(
      "import:validate",
      async (
        _event,
        filePath: string,
      ) => {
        return {
          success: true,
          filePath,
        };
      },
    );
  }
}
