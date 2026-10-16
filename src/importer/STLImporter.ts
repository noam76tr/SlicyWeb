/**
 * SlicyWeb
 * STL Importer
 *
 * Responsible for:
 * - STL file loading
 * - STL file parsing
 * - Geometry extraction
 * - Mesh statistics extraction
 *
 * The file chosen by the user is read in the renderer, then parsed in
 * a Web Worker (ADR-029), so that the window never freezes.
 * Progress: reading the file 0 to 30 %, parsing 30 to 100 %.
 *
 * No business logic.
 * No AI logic.
 * No scene management.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - FILE_STRUCTURE.md
 * - DATA_SCHEMA.md
 * - IMPORT_EXPORT_SPEC.md (STL Import, Performance Requirements)
 * - DECISIONS.md (ADR-029)
 */

import { ImportError, isImportErrorCode } from "./ImportError";
import type { StlParseResult } from "./StlParser";

/** Progress callback: fraction from 0 to 1 */
export type ImportProgress = (fraction: number) => void;

/** Share of the progress used to read the file */
export const READ_SHARE = 0.3;

type WorkerMessage =
  | { type: "progress"; fraction: number }
  | { type: "result"; result: StlParseResult }
  | { type: "error"; code: string; message: string };

/**
 * Reads a file, reporting the share of bytes already read.
 */
export function readFile(
  file: File,
  onProgress: ImportProgress,
  errorCode: "STL_001" | "MF_001",
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(event.loaded / event.total);
      }
    };

    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };

    reader.onerror = () => {
      reject(
        new ImportError(
          errorCode,
          `The file could not be read: ${reader.error?.message ?? "unknown error"}`,
        ),
      );
    };

    reader.readAsArrayBuffer(file);
  });
}

export class STLImporter {
  /**
   * Reads and parses an STL file.
   */
  public async import(
    file: File,
    onProgress: ImportProgress = () => {},
  ): Promise<StlParseResult> {
    const buffer = await readFile(
      file,
      (fraction) => onProgress(fraction * READ_SHARE),
      "STL_001",
    );

    return this.parseInWorker(buffer, (fraction) =>
      onProgress(READ_SHARE + fraction * (1 - READ_SHARE)),
    );
  }

  private parseInWorker(
    buffer: ArrayBuffer,
    onProgress: ImportProgress,
  ): Promise<StlParseResult> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("./workers/stlParser.worker.ts", import.meta.url),
        { type: "module" },
      );

      worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const message = event.data;

        if (message.type === "progress") {
          onProgress(message.fraction);
          return;
        }

        worker.terminate();

        if (message.type === "result") {
          resolve(message.result);
        } else {
          reject(
            new ImportError(
              isImportErrorCode(message.code) ? message.code : "STL_003",
              message.message,
            ),
          );
        }
      };

      worker.onerror = (event) => {
        worker.terminate();
        reject(
          new ImportError(
            "STL_003",
            `STL parsing failed: ${event.message || "worker error"}`,
          ),
        );
      };

      // The buffer is transferred to the worker (no copy)
      worker.postMessage(buffer, [buffer]);
    });
  }
}
