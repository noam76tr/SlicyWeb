/**
 * Wichy
 * Project IPC
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - Project.ts
 */

import { ipcMain } from "electron";

import type { Project } from "../../types/Project";

export class ProjectIPC {
  public register(): void {
    ipcMain.handle(
      "project:create",
      async (
        _event,
        project: Project,
      ) => {
        return project;
      },
    );

    ipcMain.handle(
      "project:save",
      async (
        _event,
        project: Project,
      ) => {
        return {
          success: true,
          project,
        };
      },
    );

    ipcMain.handle(
      "project:load",
      async (
        _event,
        projectId: string,
      ) => {
        return {
          success: true,
          projectId,
        };
      },
    );

    ipcMain.handle(
      "project:delete",
      async (
        _event,
        projectId: string,
      ) => {
        return {
          success: true,
          projectId,
        };
      },
    );
  }
}
