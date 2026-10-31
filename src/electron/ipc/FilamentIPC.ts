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
 * renderer reads no profile file.
 *
 * filament:add, filament:update and filament:remove change the filaments
 * of the user (Local Custom, Manage Filaments, Phase 8 lot 71). The
 * payload is validated (FilamentSchema); the id of a new filament is
 * chosen by the main process. An unknown filament is refused (FIL_001),
 * Official filaments are never changed (FIL_003), the same brand, name
 * and color is refused (FIL_004), a file not written changes nothing
 * (FIL_005).
 */

import { ipcMain } from "electron";
import { z } from "zod";

import type { FilamentChangeResult } from "../../filament_database/FilamentManager";
import { FilamentSchema } from "../../schemas/FilamentSchema";
import type { FilamentService } from "../../services/FilamentService";

// Zod schema for IPC responses
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

const FilamentIdSchema = z.object({
  filamentId: z.string().min(1, "filamentId is required"),
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

type ChangeChannel = "filament:add" | "filament:update" | "filament:remove";

const ERROR_NAMES: Record<
  Extract<FilamentChangeResult, { ok: false }>["code"],
  string
> = {
  FIL_001: "Filament Not Found",
  FIL_003: "Filament Not Editable",
  FIL_004: "Filament Already Exists",
  FIL_005: "Filament Not Saved",
};

/** Error of a refused change: "FIL_00X Name" */
function changeError(
  result: Extract<FilamentChangeResult, { ok: false }>,
): string {
  return `${result.code} ${ERROR_NAMES[result.code]}`;
}

/** Validation errors of a payload: "path: message" */
function validationErrors(error: unknown): string[] {
  if (error instanceof z.ZodError) {
    return error.issues.map(
      (issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`,
    );
  }

  return [error instanceof Error ? error.message : "Unknown error"];
}

export class FilamentIPC {
  public constructor(private readonly filamentService: FilamentService) {}

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
    ipcMain.handle("filament:getAll", async (_event, requestId: string) => {
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
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const response = this.createResponse(
          "filament:getAll",
          requestId,
          false,
          undefined,
          [errorMessage],
        );
        return IPCResponseSchema.parse(response);
      }
    });

    ipcMain.handle(
      "filament:add",
      this.changeHandler("filament:add", (payload) =>
        this.filamentService.addUserFilament(FilamentSchema.parse(payload)),
      ),
    );

    ipcMain.handle(
      "filament:update",
      this.changeHandler("filament:update", (payload) =>
        this.filamentService.updateUserFilament(FilamentSchema.parse(payload)),
      ),
    );

    ipcMain.handle(
      "filament:remove",
      this.changeHandler("filament:remove", (payload) =>
        this.filamentService.removeUserFilament(
          FilamentIdSchema.parse(payload).filamentId,
        ),
      ),
    );
  }

  /**
   * Handler of a channel that changes a filament of the user: the payload
   * is validated, then the change is made. filament:remove answers the id
   * of the filament removed, the others the filament saved.
   */
  private changeHandler(
    channel: ChangeChannel,
    run: (payload: unknown) => FilamentChangeResult,
  ): (
    event: unknown,
    requestId: string,
    payload: unknown,
  ) => Promise<IPCResponse> {
    return async (_event, requestId, payload) => {
      try {
        const result = run(payload);

        const response = !result.ok
          ? this.createResponse(channel, requestId, false, undefined, [
              changeError(result),
            ])
          : channel === "filament:remove"
            ? this.createResponse(channel, requestId, true, {
                filamentId: result.filament.id,
              })
            : this.createResponse(channel, requestId, true, {
                filament: result.filament,
              });

        return IPCResponseSchema.parse(response);
      } catch (error) {
        const response = this.createResponse(
          channel,
          requestId,
          false,
          undefined,
          validationErrors(error),
        );
        return IPCResponseSchema.parse(response);
      }
    };
  }
}
