/**
 * SlicyWeb
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

const StorageKeySchema = z.object({
  key: z.string().min(1, "key is required"),
});

const StorageSaveSchema = z.object({
  key: z.string().min(1, "key is required"),
  data: z.unknown(),
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

export class StorageIPC {
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
      "storage:save",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const { key, data } = StorageSaveSchema.parse(payload);

          // Save to storage (delegated to StorageService)
          // TODO: Call StorageService.save(key, data)

          const response = this.createResponse(
            "storage:save",
            requestId,
            true,
            { key, data },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "storage:save",
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
      "storage:load",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const { key } = StorageKeySchema.parse(payload);

          // Load from storage (delegated to StorageService)
          // TODO: Call StorageService.load(key)
          const data = null;

          const response = this.createResponse(
            "storage:load",
            requestId,
            true,
            { key, data },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "storage:load",
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
      "storage:delete",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const { key } = StorageKeySchema.parse(payload);

          // Delete from storage (delegated to StorageService)
          // TODO: Call StorageService.delete(key)

          const response = this.createResponse(
            "storage:delete",
            requestId,
            true,
            { key },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "storage:delete",
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
      "storage:clear",
      async (
        _event,
        requestId: string,
      ) => {
        try {
          // Clear all storage (delegated to StorageService)
          // TODO: Call StorageService.clear()

          const response = this.createResponse(
            "storage:clear",
            requestId,
            true,
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "storage:clear",
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
