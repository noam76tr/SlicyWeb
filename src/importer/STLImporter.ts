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
 * a Web Worker (ADR-029), so that the window never freezes
 * (ImportRunner.ts).
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

import { readAndParse, type ImportProgress } from "./ImportRunner";
import type { StlParseResult } from "./StlParser";

export class STLImporter {
  /**
   * Reads and parses an STL file.
   */
  public import(
    file: File,
    onProgress: ImportProgress = () => {},
    signal?: AbortSignal,
  ): Promise<StlParseResult> {
    return readAndParse<StlParseResult>(
      file,
      () =>
        new Worker(
          new URL("./workers/stlParser.worker.ts", import.meta.url),
          { type: "module" },
        ),
      onProgress,
      "STL_001",
      "STL_003",
      signal,
    );
  }
}
