/**
 * SlicyWeb
 * Event Types
 *
 * Responsible for:
 * - Event type definition
 * - Event enumeration
 * - Event type specification
 *
 * No business logic.
 * No rendering logic.
 * No application logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - FILE_STRUCTURE.md
 * - EVENT_SPEC.md
 */

export enum EventType {
  ObjectAdded = "ObjectAdded",
  ObjectRemoved = "ObjectRemoved",
  ObjectUpdated = "ObjectUpdated",
  ObjectSelected = "ObjectSelected",

  ObjectMoved = "ObjectMoved",
  ObjectRotated = "ObjectRotated",
  ObjectScaled = "ObjectScaled",

  AnalysisStarted = "AnalysisStarted",
  AnalysisFinished = "AnalysisFinished",
  AnalysisFailed = "AnalysisFailed",

  RecommendationGenerated = "RecommendationGenerated",
  RecommendationUpdated = "RecommendationUpdated",
}
