/**
 * SlicyWeb
 * Orientation Search Worker
 *
 * Web Worker that searches the best orientation of one object without
 * freezing the window (ADR-036 D4). Receives a copy of the triangle data
 * of the object (transferred) with its scale, its rotation and the build
 * volume of the selected printer (or null), then returns the result of
 * OptimizationEngine.
 *
 * Messages sent:
 * - { type: "result", result }
 * - { type: "error", code: "OPT_002", message }
 *
 * No Electron (KI-024): the same worker can run in a web version.
 *
 * Based on:
 * - DECISIONS.md (ADR-036 D4)
 * - PERFORMANCE_SPEC.md (Optimization Performance)
 */

import {
  runOrientationRequest,
  type OrientationRequest,
} from "../OptimizationEngine";

self.onmessage = (event: MessageEvent<OrientationRequest>) => {
  self.postMessage(runOrientationRequest(event.data));
};
