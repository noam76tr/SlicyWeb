/**
 * SlicyWeb
 * Model Analysis Worker
 *
 * Web Worker that computes the analysis of one object without freezing
 * the window (ADR-034 D7, D10). Receives a copy of the triangle data of
 * the object (transferred) with its scale and rotation, then returns the
 * result of ModelAnalyzer with the classification of the object, computed
 * on the same placed mesh (Phase 10 lot 85; DATA_SCHEMA.md 3.10.0).
 *
 * Entry point of the computation: it joins the Analysis Domain and the
 * Classification Domain (DOMAINS_DEPENDENCY_MATRIX.md, Analysis Worker);
 * the modules of the Analysis Domain never import the Classification
 * Domain.
 *
 * Messages sent:
 * - { type: "result", result }
 * - { type: "error", code: "ANA_001", message }
 *
 * No Electron (KI-024): the same worker can run in a web version.
 *
 * Based on:
 * - DECISIONS.md (ADR-034 D7)
 * - DECISIONS.md (ADR-035 D2)
 * - PERFORMANCE_SPEC.md (Analysis Performance)
 */

import { ClassificationEngine } from "../../classification_engine/ClassificationEngine";
import { runAnalysisRequest, type AnalysisRequest } from "../ModelAnalyzer";

self.onmessage = (event: MessageEvent<AnalysisRequest>) => {
  self.postMessage(
    runAnalysisRequest(event.data, ClassificationEngine.classifyModel),
  );
};
