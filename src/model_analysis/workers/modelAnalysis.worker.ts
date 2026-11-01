/**
 * SlicyWeb
 * Model Analysis Worker
 *
 * Web Worker that computes the analysis of one object without freezing
 * the window (ADR-034 D7, D10). Receives a copy of the triangle data of
 * the object (transferred) with its scale and rotation, then returns the
 * result of ModelAnalyzer.
 *
 * Messages sent:
 * - { type: "result", result }
 * - { type: "error", code: "ANA_001", message }
 *
 * No Electron (KI-024): the same worker can run in a web version.
 *
 * Based on:
 * - DECISIONS.md (ADR-034 D7)
 * - PERFORMANCE_SPEC.md (Analysis Performance)
 */

import { runAnalysisRequest, type AnalysisRequest } from "../ModelAnalyzer";

self.onmessage = (event: MessageEvent<AnalysisRequest>) => {
  self.postMessage(runAnalysisRequest(event.data));
};
