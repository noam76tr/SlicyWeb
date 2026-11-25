/**
 * SlicyWeb
 * Project Store Definition
 *
 * The project of the window (Phase 13, lot 111, ADR-038; decision 119 of
 * Noam, Q1 to Q22 A):
 * - token: the project file opened or saved, known by the main process
 *   only (Q20 A); null for a project never saved;
 * - identity: projectId and createdAt of the project, kept at each save;
 * - projectName: the name of its file without .wyproj (Q9 A); "" before
 *   the first save (shown "Untitled", never written);
 * - modified (Q11 A): the place of the history at the last save
 *   (savedActionId: the action at the top of the undo stack) and the
 *   changes that are not in the history (changed: import, printer,
 *   material, filament, type of object). Undo or Redo back to the place
 *   saved removes the mark;
 * - lastSavedAt, busy (saving, opening), the messages over the viewport,
 *   the list of recent projects, the copy offered at start (Q19 A) and the
 *   question "Save the changes?" waiting (Q13 A).
 *
 * Not saved, not undoable.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (File Menu, Project Section, Status Bar, Unsaved Changes
 *   Dialog, Recovery Dialog)
 * - UNDO_REDO_SPEC.md (Project Operations)
 */

import { create } from "zustand";

import { useHistoryStore, type HistoryEntry } from "./historyStore";
import { useObjectStore } from "./objectStore";

export interface ProjectIdentity {
  projectId: string;
  createdAt: string;
}

export interface RecentProject {
  /** Name of the file without .wyproj */
  name: string;
  /** Full path, shown on hover */
  path: string;
}

/** Message over the viewport (an error PROJ_00x, or an information) */
export interface ProjectMessage {
  messageId: string;
  /** Translation key */
  key: string;
  params: Record<string, string>;
  error: boolean;
}

/** What waits for the answer to "Save the changes?" */
export type PendingAction =
  | { type: "new" }
  | { type: "close" }
  | { type: "quit" }
  | { type: "open" }
  | { type: "openRecent"; index: number }
  | { type: "openPath"; filePath: string };

export interface RecoveryOffer {
  projectName: string;
  savedAt: string;
}

interface ProjectState {
  token: string | null;

  identity: ProjectIdentity | null;

  projectName: string;

  /** actionId at the top of the undo stack at the last save or opening */
  savedActionId: string | null;

  /** Changes outside the history since the last save or opening */
  changed: boolean;

  /** ISO 8601 time of the last save; null when never saved here */
  lastSavedAt: string | null;

  busy: "saving" | "opening" | null;

  /** "Project saved" shown for a few seconds */
  justSaved: boolean;

  messages: ProjectMessage[];

  recentProjects: RecentProject[];

  recovery: RecoveryOffer | null;

  pending: PendingAction | null;

  set: (state: Partial<Omit<ProjectState, "set">>) => void;

  addMessage: (message: ProjectMessage) => void;

  removeMessage: (messageId: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  token: null,

  identity: null,

  projectName: "",

  savedActionId: null,

  changed: false,

  lastSavedAt: null,

  busy: null,

  justSaved: false,

  messages: [],

  recentProjects: [],

  recovery: null,

  pending: null,

  set: (state) => set(state),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter(
        (message) => message.messageId !== messageId,
      ),
    })),
}));

/** actionId at the top of an undo stack, or null */
export function topActionId(undoStack: HistoryEntry[]): string | null {
  return undoStack[undoStack.length - 1]?.actionId ?? null;
}

/**
 * The project has changes not saved (Q11 A). An empty project never
 * saved is never modified: it closes without a question (Q13 A).
 */
export function isModified(
  project: Pick<ProjectState, "changed" | "savedActionId" | "token">,
  undoStack: HistoryEntry[],
  objectCount: number,
): boolean {
  if (project.token === null && objectCount === 0) {
    return false;
  }

  return project.changed || topActionId(undoStack) !== project.savedActionId;
}

/** The project of the window is modified (for the GUI) */
export function useIsModified(): boolean {
  const changed = useProjectStore((state) => state.changed);
  const savedActionId = useProjectStore((state) => state.savedActionId);
  const token = useProjectStore((state) => state.token);
  const undoStack = useHistoryStore((state) => state.undoStack);
  const objectCount = useObjectStore((state) => state.objects.length);

  return isModified({ changed, savedActionId, token }, undoStack, objectCount);
}
