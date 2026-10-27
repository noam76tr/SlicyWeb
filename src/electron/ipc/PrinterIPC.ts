/**
 * SlicyWeb
 * Printer IPC
 *
 * Responsible for:
 * - Printer IPC communication
 * - Printer profile requests
 * - Printer repository access
 * - Printer management requests
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - PRINTER_PROFILE_SPEC.md
 * - DATA_SCHEMA.md (IPC Payload Schema)
 * - DECISIONS.md (ADR-032, D4)
 *
 * The printers are loaded by the main process at start (PrinterService,
 * data/printers/ and the printers of the user). printer:getAll,
 * printer:get and printer:count serve them; printer:getAll also gives
 * the ids of the printers of the user (userPrinterIds).
 *
 * printer:add, printer:update and printer:remove change the printers of
 * the user (Local Custom, Phase 7 lot 61). The payload is validated
 * (PrinterSchema, default nozzle in the list of nozzles); the id of a
 * new printer is chosen by the main process. Official printers are never
 * changed (PRN_005), the same brand and model is refused (PRN_006), a
 * file not written changes nothing (PRN_007).
 */

import { ipcMain } from "electron";
import { z } from "zod";

import type { PrinterChangeResult } from "../../printer_database/PrinterManager";
import { PrinterSchema } from "../../schemas/PrinterSchema";
import type { PrinterService } from "../../services/PrinterService";

// Zod schemas for IPC payloads
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

const PrinterIdSchema = z.object({
  printerId: z.string().min(1, "printerId is required"),
});

/** A printer of the user: its default nozzle is one of its nozzles */
const UserPrinterSchema = PrinterSchema.refine(
  (printer) => printer.supportedNozzles.includes(printer.defaultNozzle),
  {
    message: "The default nozzle is not in the list of nozzles",
    path: ["defaultNozzle"],
  },
);

type IPCResponse = z.infer<typeof IPCResponseSchema>;

const ERROR_NAMES: Record<
  Extract<PrinterChangeResult, { ok: false }>["code"],
  string
> = {
  PRN_001: "Printer Not Found",
  PRN_005: "Printer Not Editable",
  PRN_006: "Printer Already Exists",
  PRN_007: "Printer Not Saved",
};

/** Error of a refused change: "PRN_00X Name" */
function changeError(
  result: Extract<PrinterChangeResult, { ok: false }>,
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

export class PrinterIPC {
  public constructor(
    private readonly printerService: PrinterService,
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
      "printer:getAll",
      async (
        _event,
        requestId: string,
      ) => {
        try {
          const printers = this.printerService.getPrinters();
          const userPrinterIds = this.printerService.getUserPrinterIds();

          const response = this.createResponse(
            "printer:getAll",
            requestId,
            true,
            { printers, userPrinterIds },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "printer:getAll",
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
      "printer:get",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const { printerId } = PrinterIdSchema.parse(payload);

          const printer = this.printerService.getPrinter(printerId);

          const response = printer
            ? this.createResponse("printer:get", requestId, true, { printer })
            : this.createResponse("printer:get", requestId, false, undefined, [
                "PRN_001 Printer Not Found",
              ]);

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "printer:get",
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
      "printer:add",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload, then change the printer
          const result = this.printerService.addUserPrinter(
            UserPrinterSchema.parse(payload),
          );

          const response = result.ok
            ? this.createResponse(
                "printer:add",
                requestId,
                true,
                { printer: result.printer },
              )
            : this.createResponse(
                "printer:add",
                requestId,
                false,
                undefined,
                [changeError(result)],
              );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const response = this.createResponse(
            "printer:add",
            requestId,
            false,
            undefined,
            validationErrors(error),
          );
          return IPCResponseSchema.parse(response);
        }
      },
    );

    ipcMain.handle(
      "printer:update",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload, then change the printer
          const result = this.printerService.updateUserPrinter(
            UserPrinterSchema.parse(payload),
          );

          const response = result.ok
            ? this.createResponse(
                "printer:update",
                requestId,
                true,
                { printer: result.printer },
              )
            : this.createResponse(
                "printer:update",
                requestId,
                false,
                undefined,
                [changeError(result)],
              );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const response = this.createResponse(
            "printer:update",
            requestId,
            false,
            undefined,
            validationErrors(error),
          );
          return IPCResponseSchema.parse(response);
        }
      },
    );

    ipcMain.handle(
      "printer:remove",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload, then change the printer
          const result = this.printerService.removeUserPrinter(
            PrinterIdSchema.parse(payload).printerId,
          );

          const response = result.ok
            ? this.createResponse(
                "printer:remove",
                requestId,
                true,
                { printerId: result.printer.id },
              )
            : this.createResponse(
                "printer:remove",
                requestId,
                false,
                undefined,
                [changeError(result)],
              );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const response = this.createResponse(
            "printer:remove",
            requestId,
            false,
            undefined,
            validationErrors(error),
          );
          return IPCResponseSchema.parse(response);
        }
      },
    );

    ipcMain.handle(
      "printer:count",
      async (
        _event,
        requestId: string,
      ) => {
        try {
          const count = this.printerService.getPrinterCount();

          const response = this.createResponse(
            "printer:count",
            requestId,
            true,
            { count },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "printer:count",
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
