/**
 * SlicyWeb
 * Material IPC
 *
 * Responsible for:
 * - Material IPC communication
 * - Material profile requests
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md (MaterialIPC Channels)
 * - MATERIAL_PROFILE_SPEC.md
 * - DATA_SCHEMA.md (IPC Payload Schema, Complete Material Schema 3.7.0)
 * - DECISIONS.md (ADR-033, D6)
 *
 * The materials are loaded by the main process at start (MaterialService,
 * data/materials/). material:getAll serves them. The renderer reads no
 * profile file.
 */

import { ipcMain } from "electron";
import { z } from "zod";

import type { MaterialService } from "../../services/MaterialService";

// Zod schema for IPC responses
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

export class MaterialIPC {
  public constructor(
    private readonly materialService: MaterialService,
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
      "material:getAll",
      async (
        _event,
        requestId: string,
      ) => {
        try {
          const materials = this.materialService.getMaterials();

          const response = this.createResponse(
            "material:getAll",
            requestId,
            true,
            { materials },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "material:getAll",
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
