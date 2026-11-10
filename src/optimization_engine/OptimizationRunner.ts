/**
 * SlicyWeb
 * Optimization Runner
 *
 * Runs the orientation search of one object in a Web Worker (ADR-036 D4),
 * like the analysis (AnalysisRunner):
 * - the triangle data are copied, then transferred to the worker (the
 *   geometry of the scene is never moved);
 * - one worker per computation, terminated at the end;
 * - a search that is no longer needed (object removed, or turned
 *   meanwhile) is dropped with its AbortSignal: the worker is terminated
 *   at once and OptimizationCancelledError is thrown;
 * - a failure is an OptimizationError OPT_002.
 *
 * Started by the optimization service of lot 98. No Electron (KI-024).
 *
 * Domain: Optimization.
 *
 * Based on:
 * - DECISIONS.md (ADR-036 D4)
 * - ERROR_CODES_SPEC.md (OPT_002)
 */

import type { AnalysisTransform } from "../model_analysis/MeshAnalyzer";
import type { BuildVolume } from "../types/Printer";

import type { OrientationResponse } from "./OptimizationEngine";
import {
  OptimizationCancelledError,
  OptimizationError,
} from "./OptimizationError";
import type { OrientationSearch } from "./OrientationOptimizer";

/** The worker of the optimization, compiled by Vite */
export function createOptimizationWorker(): Worker {
  return new Worker(
    new URL("./workers/orientationSearch.worker.ts", import.meta.url),
    { type: "module" },
  );
}

/**
 * Orientation search of one object in a worker.
 * positions: triangle data of the object (not changed); transform: its
 * scale and rotation; buildVolume: of the selected printer, or null.
 */
export function runOrientationSearch(
  positions: Float32Array,
  transform: AnalysisTransform,
  buildVolume: BuildVolume | null,
  signal?: AbortSignal,
  createWorker: () => Worker = createOptimizationWorker,
): Promise<OrientationSearch> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new OptimizationCancelledError());
      return;
    }

    const worker = createWorker();

    const finish = (): void => {
      worker.terminate();
      signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = (): void => {
      finish();
      reject(new OptimizationCancelledError());
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    worker.onmessage = (event: MessageEvent<OrientationResponse>) => {
      finish();

      const message = event.data;

      if (message?.type === "result") {
        resolve(message.result);
      } else {
        reject(
          new OptimizationError(
            "OPT_002",
            message?.message ?? "The orientation search failed.",
          ),
        );
      }
    };

    worker.onerror = (event) => {
      finish();
      reject(
        new OptimizationError(
          "OPT_002",
          `The orientation search failed: ${event.message || "worker error"}`,
        ),
      );
    };

    const copy = positions.slice();

    worker.postMessage(
      {
        positions: copy,
        transform: {
          rotation: { ...transform.rotation },
          scale: { ...transform.scale },
        },
        buildVolume: buildVolume ? { ...buildVolume } : null,
      },
      [copy.buffer],
    );
  });
}
