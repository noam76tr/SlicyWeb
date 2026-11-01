/**
 * SlicyWeb
 * Analysis Runner
 *
 * Runs the analysis of one object in a Web Worker (ADR-034 D7):
 * - the triangle data are copied, then transferred to the worker (the
 *   geometry of the scene is never moved);
 * - one worker per computation, terminated at the end;
 * - a computation that is no longer needed (object removed, or turned
 *   again) is dropped with its AbortSignal: the worker is terminated at
 *   once and AnalysisCancelledError is thrown;
 * - a failure is an AnalysisError ANA_001.
 *
 * Started by AnalysisService (lot 80). No Electron (KI-024).
 *
 * Domain: Analysis.
 *
 * Based on:
 * - DECISIONS.md (ADR-034 D7)
 * - ERROR_CODES_SPEC.md (ANA_001)
 */

import { AnalysisCancelledError, AnalysisError } from "./AnalysisError";
import type { AnalysisTransform } from "./MeshAnalyzer";
import type { AnalysisResponse, ModelAnalysisResult } from "./ModelAnalyzer";

/** The worker of the analysis, compiled by Vite */
export function createAnalysisWorker(): Worker {
  return new Worker(
    new URL("./workers/modelAnalysis.worker.ts", import.meta.url),
    { type: "module" },
  );
}

/**
 * Analysis of one object in a worker.
 * positions: triangle data of the object (not changed); transform: its
 * scale and rotation.
 */
export function runModelAnalysis(
  positions: Float32Array,
  transform: AnalysisTransform,
  signal?: AbortSignal,
  createWorker: () => Worker = createAnalysisWorker,
): Promise<ModelAnalysisResult> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AnalysisCancelledError());
      return;
    }

    const worker = createWorker();

    const finish = (): void => {
      worker.terminate();
      signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = (): void => {
      finish();
      reject(new AnalysisCancelledError());
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    worker.onmessage = (event: MessageEvent<AnalysisResponse>) => {
      finish();

      const message = event.data;

      if (message?.type === "result") {
        resolve(message.result);
      } else {
        reject(
          new AnalysisError(
            "ANA_001",
            message?.message ?? "The analysis failed.",
          ),
        );
      }
    };

    worker.onerror = (event) => {
      finish();
      reject(
        new AnalysisError(
          "ANA_001",
          `The analysis failed: ${event.message || "worker error"}`,
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
      },
      [copy.buffer],
    );
  });
}
