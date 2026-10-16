/**
 * SlicyWeb
 * STL Parser Worker
 *
 * Web Worker that parses an STL file without freezing the window
 * (ADR-029). Receives the file content (transferred ArrayBuffer),
 * reports its progress, then returns the triangle data (transferred).
 *
 * Messages sent:
 * - { type: "progress", fraction }
 * - { type: "result", result }
 * - { type: "error", code, message }
 *
 * Based on:
 * - DECISIONS.md (ADR-029)
 * - IMPORT_EXPORT_SPEC.md (Performance Requirements)
 */

import { ImportError } from "../ImportError";
import { parseStl } from "../StlParser";

/** Minimum interval between two progress messages, in milliseconds */
const PROGRESS_INTERVAL_MS = 50;

self.onmessage = (event: MessageEvent<ArrayBuffer>) => {
  let lastReport = 0;

  try {
    const result = parseStl(event.data, (fraction) => {
      const now = Date.now();

      if (now - lastReport >= PROGRESS_INTERVAL_MS || fraction >= 1) {
        lastReport = now;
        self.postMessage({ type: "progress", fraction });
      }
    });

    self.postMessage(
      { type: "result", result },
      { transfer: [result.positions.buffer, result.normals.buffer] },
    );
  } catch (error) {
    self.postMessage({
      type: "error",
      code: error instanceof ImportError ? error.code : "STL_003",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
