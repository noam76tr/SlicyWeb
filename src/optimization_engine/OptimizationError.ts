/**
 * SlicyWeb
 * Optimization Error
 *
 * Error raised by the orientation search of an object, with its code of
 * ERROR_CODES_SPEC.md (Optimization Errors, 2.6.0):
 * - OPT_002 Orientation Search Failed: the mesh is empty or cannot be
 *   read, its transform cannot be used, or the computation fails; the
 *   orientation of the object does not change.
 * OPT_001 is not used in Phase 11 (orientation only, ADR-036 D1).
 *
 * The message is technical (logs); the GUI shows a translated text chosen
 * from the code.
 *
 * Based on:
 * - ERROR_CODES_SPEC.md (Optimization Errors)
 * - DECISIONS.md (ADR-036 D4)
 */

export type OptimizationErrorCode = "OPT_002";

export class OptimizationError extends Error {
  public readonly code: OptimizationErrorCode;

  constructor(code: OptimizationErrorCode, message: string) {
    super(message);
    this.name = "OptimizationError";
    this.code = code;
  }
}

/**
 * The search was no longer needed (object removed, or turned meanwhile):
 * not an error, no code, no message (ADR-036 D4).
 */
export class OptimizationCancelledError extends Error {
  constructor() {
    super("Optimization cancelled.");
    this.name = "OptimizationCancelledError";
  }
}
