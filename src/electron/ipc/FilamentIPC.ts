/**
 * SlicyWeb
 * Filament IPC
 *
 * Responsible for:
 * - Filament IPC communication
 * - Filament profile requests
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md (FilamentIPC Channels)
 * - FILAMENT_SETTINGS_SPEC.md
 * - DATA_SCHEMA.md (IPC Payload Schema, Filament Schema 3.7.0)
 * - DECISIONS.md (ADR-033, D6)
 *
 * The filaments are loaded by the main process at start (FilamentService,
 * data/filaments/ and the filaments of the user). filament:getAll serves
 * them, with the ids of the filaments of the user (userFilamentIds). The
 * renderer reads no profile file. filament:add, filament:update and
 * filament:remove come with Manage Filaments (Phase 8 lot 71).
 */

import { ipcMain } from "electron";
import { z } from "zod";

import type { FilamentService } from "../../services/FilamentService";

// Zod schema for IPC responses
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

export class FilamentIPC {
  public constructor(
    private readonly filamentService: FilamentService,
  ) {}

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
      "filament:getAll",
      async (
        _event,
        requestId: string,
      ) => {
        try {
          const filaments = this.filamentService.getFilaments();
          const userFilamentIds = this.filamentService.getUserFilamentIds();

          const response = this.createResponse(
            "filament:getAll",
            requestId,
            true,
            { filaments, userFilamentIds },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "filament:getAll",
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
