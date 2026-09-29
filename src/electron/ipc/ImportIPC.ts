/**
 * SlicyWeb
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
 * - DATA_SCHEMA.md (IPC Payload Schema)
 */

import { ipcMain } from "electron";
import { z } from "zod";

// Zod schemas for IPC payloads
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

const FilePathSchema = z.object({
  filePath: z.string().min(1, "filePath is required"),
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

export class ImportIPC {
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
      "import:stl",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const { filePath } = FilePathSchema.parse(payload);

          // Import STL file (delegated to ImportManager/STLImporter)
          // TODO: Call ImportManager.importSTL(filePath)
          
          const response = this.createResponse(
            "import:stl",
            requestId,
            true,
            { type: "stl", filePath },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "import:stl",
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
      "import:3mf",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const { filePath } = FilePathSchema.parse(payload);

          // Import 3MF file (delegated to ImportManager/ThreeMFImporter)
          // TODO: Call ImportManager.import3MF(filePath)
          
          const response = this.createResponse(
            "import:3mf",
            requestId,
            true,
            { type: "3mf", filePath },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "import:3mf",
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
      "import:validate",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const { filePath } = FilePathSchema.parse(payload);

          // Validate file (delegated to FileValidator)
          // TODO: Call FileValidator.validate(filePath)
          
          const response = this.createResponse(
            "import:validate",
            requestId,
            true,
            { filePath, isValid: true },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "import:validate",
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
