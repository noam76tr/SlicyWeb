/**
 * Wichy
 * Feature Flags Definition
 *
 * Based on:
 * - ROADMAP.md
 * - ARCHITECTURE.md
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
