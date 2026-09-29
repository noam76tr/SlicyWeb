/**
 * Wichy
 * Event Types
 *
 * Based on:
 * - ARCHITECTURE.md
 * - FILE_STRUCTURE.md
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
