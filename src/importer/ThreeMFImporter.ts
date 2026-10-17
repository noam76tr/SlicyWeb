/**
 * SlicyWeb
 * 3MF Importer
 *
 * Responsible for:
 * - 3MF file loading
 * - 3MF file parsing
 * - Geometry extraction
 * - Mesh statistics extraction
 *
 * The file chosen by the user is read in the renderer, then parsed in
 * a Web Worker (ADR-029, ADR-030), so that the window never freezes
 * (ImportRunner.ts, ThreeMFParser.ts).
 *
 * No business logic.
 * No AI logic.
 * No scene management.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - FILE_STRUCTURE.md
 * - DATA_SCHEMA.md
 * - IMPORT_EXPORT_SPEC.md (3MF Import, Performance Requirements)
 * - DECISIONS.md (ADR-029, ADR-030)
 */

import { readAndParse, type ImportProgress } from "./ImportRunner";
import type { ThreeMFParseResult } from "./ThreeMFParser";

export class ThreeMFImporter {
  /**
   * Reads and parses a 3MF file.
   */
  public import(
    file: File,
    onProgress: ImportProgress = () => {},
  ): Promise<ThreeMFParseResult> {
    return readAndParse<ThreeMFParseResult>(
      file,
      () =>
        new Worker(
          new URL("./workers/threeMfParser.worker.ts", import.meta.url),
          { type: "module" },
        ),
      onProgress,
      "MF_001",
      "MF_003",
    );
  }
}
