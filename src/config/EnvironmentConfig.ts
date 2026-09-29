/**
 * Wichy
 * Environment Configuration Definition
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
