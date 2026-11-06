/**
 * SlicyWeb
 * Preset IPC
 *
 * Responsible for:
 * - Preset IPC communication
 * - Print preset requests
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md (PresetIPC Channels)
 * - PRINT_PRESETS_SPEC.md 1.3.0 (Shipped Presets)
 * - DATA_SCHEMA.md (IPC Payload Schema, Print Preset Schema 3.10.0)
 * - DECISIONS.md (ADR-035 D4)
 *
 * The presets are loaded by the main process at start (PresetLoader,
 * data/presets/). preset:getAll serves them. The renderer reads no
 * preset file.
 */

import { ipcMain } from "electron";
import { z } from "zod";

import type { PresetLoader } from "../../preset_engine/PresetLoader";

// Zod schema for IPC responses
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

export class PresetIPC {
  public constructor(
    private readonly presetLoader: PresetLoader,
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
      "preset:getAll",
      async (
        _event,
        requestId: string,
      ) => {
        try {
          const presets = this.presetLoader.getPresets();

          const response = this.createResponse(
            "preset:getAll",
            requestId,
            true,
            { presets },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "preset:getAll",
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
