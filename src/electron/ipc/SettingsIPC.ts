/**
 * SlicyWeb
 * Settings IPC
 *
 * Responsible for:
 * - Settings IPC communication
 * - Settings retrieval
 * - Settings updates
 * - Settings reset operations
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - UserPreferences.ts
 * - DATA_SCHEMA.md (IPC Payload Schema)
 */

import { ipcMain } from "electron";
import { z } from "zod";

import type { UserPreferences } from "../../types/UserPreferences";

// Zod schemas for IPC payloads
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

const ThemeSchema = z.object({
  theme: z.string().min(1, "theme is required"),
});

const LanguageSchema = z.object({
  language: z.string().min(1, "language is required"),
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

export class SettingsIPC {
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
      "settings:get",
      async (
        _event,
        requestId: string,
      ) => {
        try {
          // Get settings (delegated to StorageService)
          // TODO: Call StorageService.getSettings()
          const settings: Partial<UserPreferences> = {};

          const response = this.createResponse(
            "settings:get",
            requestId,
            true,
            { settings },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "settings:get",
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
      "settings:update",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const settings = payload as UserPreferences;

          // Update settings (delegated to StorageService)
          // TODO: Call StorageService.updateSettings(settings)

          const response = this.createResponse(
            "settings:update",
            requestId,
            true,
            { settings },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "settings:update",
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
      "settings:reset",
      async (
        _event,
        requestId: string,
      ) => {
        try {
          // Reset settings (delegated to StorageService)
          // TODO: Call StorageService.resetSettings()

          const response = this.createResponse(
            "settings:reset",
            requestId,
            true,
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "settings:reset",
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
      "settings:theme",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const { theme } = ThemeSchema.parse(payload);

          // Update theme (delegated to StorageService)
          // TODO: Call StorageService.setTheme(theme)

          const response = this.createResponse(
            "settings:theme",
            requestId,
            true,
            { theme },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "settings:theme",
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
      "settings:language",
      async (
        _event,
        requestId: string,
        payload: unknown,
      ) => {
        try {
          // Validate incoming payload
          const { language } = LanguageSchema.parse(payload);

          // Update language (delegated to StorageService/LocalizationService)
          // TODO: Call LocalizationService.setLanguage(language)

          const response = this.createResponse(
            "settings:language",
            requestId,
            true,
            { language },
          );

          return IPCResponseSchema.parse(response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const response = this.createResponse(
            "settings:language",
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
