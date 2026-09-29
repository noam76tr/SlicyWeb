/**
 * Wichy
 * Application Configuration Definition
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
