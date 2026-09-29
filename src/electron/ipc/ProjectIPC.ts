/**
 * SlicyWeb
 * Project IPC
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - Project.ts
 * - DATA_SCHEMA.md (IPC Payload Schema)
 */

import { ipcMain } from "electron";
import { z } from "zod";

import type { Project } from "../../types/Project";
import { ProjectSchema } from "../../schemas/ProjectSchema";

// Zod schema for IPC payloads
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

export class ProjectIPC {
  private createResponse(
    channel: string,
    requestId: string,
    success: boolean,
    data?: Record<string, unknown>,
    errors: string[] = [],
  ): IPCResponse {
    return {
      channel,
      requestId,
      success,
      data: data || {},
      errors,
    };
  }

  public register(): void {
    ipcMain.handle(
      "project:create",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const project = ProjectSchema.parse(payload);

          // Create response
          const response = this.createResponse(
            "project:create",
            requestId,
            true,
            { project },
          );

          // Validate response structure
          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "project:create",
            requestId,
            false,
            undefined,
            [errorMessage],
          );
          return IPCResponseSchema.parse(response);
        }
      },
    );

    ipcMain.handle(
      "project:save",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const project = ProjectSchema.parse(payload);

          // Save project (delegated to ProjectService)
          // TODO: Call ProjectService.saveProject(project)
          
          const response = this.createResponse(
            "project:save",
            requestId,
            true,
            { project },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "project:save",
            requestId,
            false,
            undefined,
            [errorMessage],
          );
          return IPCResponseSchema.parse(response);
        }
      },
    );

    ipcMain.handle(
      "project:load",
      async (
        _event,
        requestId: string,
        projectId: string,
      ) => {
        try {
          // Validate projectId
          if (!projectId || typeof projectId !== "string") {
            throw new Error("Invalid projectId");
          }

          // Load project (delegated to ProjectService)
          // TODO: Call ProjectService.loadProject(projectId)
          
          const response = this.createResponse(
            "project:load",
            requestId,
            true,
            { projectId },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "project:load",
            requestId,
            false,
            undefined,
            [errorMessage],
          );
          return IPCResponseSchema.parse(response);
        }
      },
    );

    ipcMain.handle(
      "project:delete",
      async (
        _event,
        requestId: string,
        projectId: string,
      ) => {
        try {
          // Validate projectId
          if (!projectId || typeof projectId !== "string") {
            throw new Error("Invalid projectId");
          }

          // Delete project (delegated to ProjectService)
          // TODO: Call ProjectService.deleteProject(projectId)
          
          const response = this.createResponse(
            "project:delete",
            requestId,
            true,
            { projectId },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "project:delete",
            requestId,
            false,
            undefined,
            [errorMessage],
          );
          return IPCResponseSchema.parse(response);
        }
      },
    );
  }
}
