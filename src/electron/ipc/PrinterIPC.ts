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
 * printer:get and printer:count serve them. printer:add, printer:update
 * and printer:remove validate their payload, then refuse: the printers
 * entered by the user come with Phase 7 lot 61.
 */

import { ipcMain } from "electron";
import { z } from "zod";

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

type IPCResponse = z.infer<typeof IPCResponseSchema>;

const NOT_AVAILABLE =
  "Printers entered by the user are not available yet";

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

          const response = this.createResponse(
            "printer:getAll",
            requestId,
            true,
            { printers },
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
          // Validate incoming payload
          PrinterSchema.parse(payload);

          const response = this.createResponse(
            "printer:add",
            requestId,
            false,
            undefined,
            [NOT_AVAILABLE],
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "printer:add",
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
      "printer:update",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          PrinterSchema.parse(payload);

          const response = this.createResponse(
            "printer:update",
            requestId,
            false,
            undefined,
            [NOT_AVAILABLE],
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "printer:update",
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
      "printer:remove",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          PrinterIdSchema.parse(payload);

          const response = this.createResponse(
            "printer:remove",
            requestId,
            false,
            undefined,
            [NOT_AVAILABLE],
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "printer:remove",
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
