/**
 * SlicyWeb
 * Environment Configuration Definition
 *
 * Responsible for:
 * - Environment configuration interface
 * - Environment settings definition
 * - Path configuration specification
 *
 * No business logic.
 * No rendering logic.
 * No application logic.
 *
 * Based on:
 * - TECH_STACK.md
 * - ARCHITECTURE.md
 */

export interface EnvironmentConfig {
  isDevelopment: boolean;

  isProduction: boolean;

  isTesting: boolean;

  applicationDataPath: string;

  cachePath: string;

  logsPath: string;

  profilesPath: string;

  projectsPath: string;
}
