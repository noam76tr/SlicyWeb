/**
 * SlicyWeb
 * Analysis Error
 *
 * Error raised by the analysis of an object, with its code of
 * ERROR_CODES_SPEC.md (Analysis Errors):
 * - ANA_001 Analysis Failed: the mesh is empty or cannot be read, or the
 *   computation fails; no analysis is stored.
 * ANA_002 (mesh not closed) is a warning, never an error: the analysis is
 * computed anyway (ModelAnalysisResult.meshClosed). ANA_003 and ANA_004
 * are not used in Phase 9.
 *
 * The message is technical (logs); the GUI shows a translated text chosen
 * from the code.
 *
 * Based on:
 * - ERROR_CODES_SPEC.md (Analysis Errors)
 * - DECISIONS.md (ADR-034 D6)
 */

export type AnalysisErrorCode = "ANA_001";

export class AnalysisError extends Error {
  public readonly code: AnalysisErrorCode;

  constructor(code: AnalysisErrorCode, message: string) {
    super(message);
    this.name = "AnalysisError";
    this.code = code;
  }
}

/**
 * The analysis was no longer needed (object removed, or turned again):
 * not an error, no code, no message (ADR-034 D7).
 */
export class AnalysisCancelledError extends Error {
  constructor() {
    super("Analysis cancelled.");
    this.name = "AnalysisCancelledError";
  }
}
