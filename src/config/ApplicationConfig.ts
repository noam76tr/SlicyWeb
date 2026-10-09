/**
 * SlicyWeb
 * Application Configuration Definition
 *
 * Responsible for:
 * - Application configuration interface
 * - Application settings definition
 * - Configuration property specification
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 */

export interface ApplicationConfig {
  appName: string;

  appVersion: string;

  environment: string;

  debugMode: boolean;

  autoSaveEnabled: boolean;

  autoSaveIntervalMinutes: number;

  theme: string;

  language: string;
}
