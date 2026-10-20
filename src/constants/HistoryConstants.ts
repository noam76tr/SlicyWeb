/**
 * SlicyWeb
 * History Constants
 *
 * Undo and redo (UNDO_REDO_SPEC.md, Maximum History Size).
 *
 * Based on:
 * - UNDO_REDO_SPEC.md
 * - NAMING_CONVENTIONS.md (MAX_HISTORY_SIZE)
 */

/**
 * Number of actions kept in the history (decision of Noam, Phase 6:
 * 50; UNDO_REDO_SPEC.md said 100 by default). The oldest action is
 * dropped beyond it.
 */
export const MAX_HISTORY_SIZE = 50;
