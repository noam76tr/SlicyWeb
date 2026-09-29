/**
 * Wichy
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
 */

import { ipcMain } from "electron";

import type { Printer } from "../../types/Printer";

export class PrinterIPC {
  public register(): void {
    ipcMain.handle(
      "printer:getAll",
      async () => {
        return [];
      },
    );

    ipcMain.handle(
      "printer:get",
      async (
        _event,
        printerId: string,
      ) => {
        return {
          success: true,
          printerId,
        };
      },
    );

    ipcMain.handle(
      "printer:add",
      async (
        _event,
        printer: Printer,
      ) => {
        return {
          success: true,
          printer,
        };
      },
    );

    ipcMain.handle(
      "printer:update",
      async (
        _event,
        printer: Printer,
      ) => {
        return {
          success: true,
          printer,
        };
      },
    );

    ipcMain.handle(
      "printer:remove",
      async (
        _event,
        printerId: string,
      ) => {
        return {
          success: true,
          printerId,
        };
      },
    );

    ipcMain.handle(
      "printer:count",
      async () => {
        return 0;
      },
    );
  }
}
