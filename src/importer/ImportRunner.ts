/**
 * SlicyWeb
 * Import Runner
 *
 * Shared steps of the STL and 3MF importers (ADR-029):
 * - readFile: reads the file chosen by the user, with progress;
 * - runParserWorker: sends the content to a parser Web Worker
 *   (transferred, no copy), relays its progress, and returns its result
 *   or an ImportError.
 * Progress of an import: reading the file 0 to 30 %, parsing 30 to 100 %.
 * Cancel (AbortSignal): the reading is aborted, the worker is terminated
 * at once (even in the middle of a parse), and ImportCancelledError is
 * thrown.
 *
 * The worker itself is created by each importer with
 * new Worker(new URL("./workers/...", import.meta.url)), so that Vite
 * compiles it.
 *
 * Based on:
 * - DECISIONS.md (ADR-029)
 * - IMPORT_EXPORT_SPEC.md (Performance Requirements)
 */

import {
  ImportCancelledError,
  ImportError,
  isImportErrorCode,
  type ImportErrorCode,
} from "./ImportError";

/** Progress callback: fraction from 0 to 1 */
export type ImportProgress = (fraction: number) => void;

/** Share of the progress used to read the file */
export const READ_SHARE = 0.3;

/**
 * Reads a file, reporting the share of bytes already read.
 */
export function readFile(
  file: File,
  onProgress: ImportProgress,
  errorCode: "STL_001" | "MF_001",
  signal?: AbortSignal,
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ImportCancelledError());
      return;
    }

    const reader = new FileReader();

    const onAbort = (): void => {
      reader.abort();
      reject(new ImportCancelledError());
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    reader.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(event.loaded / event.total);
      }
    };

    reader.onload = () => {
      signal?.removeEventListener("abort", onAbort);
      resolve(reader.result as ArrayBuffer);
    };

    reader.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
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

/**
 * Reads a file, then parses it in a worker, with the progress of both.
 */
export async function readAndParse<T>(
  file: File,
  createWorker: () => Worker,
  onProgress: ImportProgress,
  readErrorCode: "STL_001" | "MF_001",
  parseErrorCode: ImportErrorCode,
  signal?: AbortSignal,
): Promise<T> {
  const buffer = await readFile(
    file,
    (fraction) => onProgress(fraction * READ_SHARE),
    readErrorCode,
    signal,
  );

  return runParserWorker<T>(
    createWorker(),
    buffer,
    (fraction) => onProgress(READ_SHARE + fraction * (1 - READ_SHARE)),
    parseErrorCode,
    signal,
  );
}

type WorkerMessage<T> =
  | { type: "progress"; fraction: number }
  | { type: "result"; result: T }
  | { type: "error"; code: string; message: string };

/**
 * Parses a buffer in a worker; the worker is terminated at the end.
 * fallbackCode: error code when the worker fails without a code.
 */
export function runParserWorker<T>(
  worker: Worker,
  buffer: ArrayBuffer,
  onProgress: ImportProgress,
  fallbackCode: ImportErrorCode,
  signal?: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      worker.terminate();
      reject(new ImportCancelledError());
      return;
    }

    // Cancel: the worker is stopped at once, even in the middle of a parse
    const onAbort = (): void => {
      worker.terminate();
      reject(new ImportCancelledError());
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    worker.onmessage = (event: MessageEvent<WorkerMessage<T>>) => {
      const message = event.data;

      if (message.type === "progress") {
        onProgress(message.fraction);
        return;
      }

      worker.terminate();
      signal?.removeEventListener("abort", onAbort);

      if (message.type === "result") {
        resolve(message.result);
      } else {
        reject(
          new ImportError(
            isImportErrorCode(message.code) ? message.code : fallbackCode,
            message.message,
          ),
        );
      }
    };

    worker.onerror = (event) => {
      worker.terminate();
      signal?.removeEventListener("abort", onAbort);
      reject(
        new ImportError(
          fallbackCode,
          `Parsing failed: ${event.message || "worker error"}`,
        ),
      );
    };

    worker.postMessage(buffer, [buffer]);
  });
}
