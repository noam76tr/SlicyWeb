/**
 * SlicyWeb
 * Feature Flags Definition
 *
 * Responsible for:
 * - Feature flags configuration
 * - Feature activation/deactivation
 * - Feature availability specification
 *
 * No business logic.
 * No rendering logic.
 * No application logic.
 *
 * Based on:
 * - ROADMAP.md
 * - ARCHITECTURE.md
 * - CONFIG_SPEC.md
 */

export interface FeatureFlags {
  classificationEngine: boolean;

  recommendationEngine: boolean;

  optimizationEngine: boolean;

  filamentProfiles: boolean;

  printPresets: boolean;

  projectRecovery: boolean;

  githubRepositories: boolean;

  cloudSync: boolean;

  pluginSystem: boolean;

  gcodeEngine: boolean;

  machineLearning: boolean;

  visionClassification: boolean;
}
