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
 * - DATA_SCHEMA.md (IPC Payload Schema, User Preferences Schema)
 * - USER_SETTINGS_SPEC.md
 *
 * Preferences are read and written by StorageService
 * (settings.json, USER_SETTINGS_SPEC.md, Storage Location).
 * Responses carry the stored preferences: data.settings.
 */

import { ipcMain } from "electron";
import { z } from "zod";

import {
  LanguageSchema as LanguageValueSchema,
  ThemeSchema as ThemeValueSchema,
  UserPreferencesUpdateSchema,
} from "../../schemas/UserPreferencesSchema";
import type { StorageService } from "../../services/StorageService";

// Zod schemas for IPC payloads
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

const ThemeSchema = z.object({
  theme: ThemeValueSchema,
});

const LanguageSchema = z.object({
  language: LanguageValueSchema,
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

export class SettingsIPC {
  public constructor(
    private readonly storageService: StorageService,
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
      "settings:get",
      async (
        _event,
        requestId: string,
      ) => {
        try {
          const settings = this.storageService.getSettings();

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
          const update = UserPreferencesUpdateSchema.parse(payload);

          const settings = this.storageService.updateSettings(update);

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
          const settings = this.storageService.resetSettings();

          const response = this.createResponse(
            "settings:reset",
            requestId,
            true,
            { settings },
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

          const settings = this.storageService.updateSettings({ theme });

          const response = this.createResponse(
            "settings:theme",
            requestId,
            true,
            { settings },
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

          // The renderer loads the translations of the new language
          // (I18nProvider); the main process only stores the choice.
          const settings = this.storageService.updateSettings({ language });

          const response = this.createResponse(
            "settings:language",
            requestId,
            true,
            { settings },
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
