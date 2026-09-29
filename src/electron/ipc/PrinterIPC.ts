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
 */

import { ipcMain } from "electron";
import { z } from "zod";

import type { Printer } from "../../types/Printer";
import { PrinterSchema } from "../../schemas/PrinterSchema";

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

export class PrinterIPC {
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
          // Get all printers (delegated to PrinterService)
          // TODO: Call PrinterService.getAllPrinters()
          const printers: Printer[] = [];

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

          // Get printer (delegated to PrinterService)
          // TODO: Call PrinterService.getPrinter(printerId)
          
          const response = this.createResponse(
            "printer:get",
            requestId,
            true,
            { printerId },
          );

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
          const printer = PrinterSchema.parse(payload);

          // Add printer (delegated to PrinterService)
          // TODO: Call PrinterService.addPrinter(printer)
          
          const response = this.createResponse(
            "printer:add",
            requestId,
            true,
            { printer },
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
          const printer = PrinterSchema.parse(payload);

          // Update printer (delegated to PrinterService)
          // TODO: Call PrinterService.updatePrinter(printer)
          
          const response = this.createResponse(
            "printer:update",
            requestId,
            true,
            { printer },
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
          const { printerId } = PrinterIdSchema.parse(payload);

          // Remove printer (delegated to PrinterService)
          // TODO: Call PrinterService.removePrinter(printerId)
          
          const response = this.createResponse(
            "printer:remove",
            requestId,
            true,
            { printerId },
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
          // Count printers (delegated to PrinterService)
          // TODO: Call PrinterService.getPrinterCount()
          const count = 0;

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
