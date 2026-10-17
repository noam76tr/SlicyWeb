/**
 * SlicyWeb
 * 3MF Parser Worker
 *
 * Web Worker that parses a 3MF file without freezing the window
 * (ADR-029, ADR-030). Receives the file content (transferred
 * ArrayBuffer), reports its progress, then returns the triangle data
 * of each object (transferred).
 *
 * Messages sent:
 * - { type: "progress", fraction }
 * - { type: "result", result }
 * - { type: "error", code, message }
 *
 * Based on:
 * - DECISIONS.md (ADR-029, ADR-030)
 * - IMPORT_EXPORT_SPEC.md (Performance Requirements)
 */

import { ImportError } from "../ImportError";
import { parse3mf } from "../ThreeMFParser";

/** Minimum interval between two progress messages, in milliseconds */
const PROGRESS_INTERVAL_MS = 50;

self.onmessage = (event: MessageEvent<ArrayBuffer>) => {
  let lastReport = 0;

  try {
    const result = parse3mf(event.data, (fraction) => {
      const now = Date.now();

      if (now - lastReport >= PROGRESS_INTERVAL_MS || fraction >= 1) {
        lastReport = now;
        self.postMessage({ type: "progress", fraction });
      }
    });

    self.postMessage(
      { type: "result", result },
      {
        transfer: result.objects.flatMap((object) => [
          object.positions.buffer,
          object.normals.buffer,
        ]),
      },
    );
  } catch (error) {
    self.postMessage({
      type: "error",
      code: error instanceof ImportError ? error.code : "MF_003",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
