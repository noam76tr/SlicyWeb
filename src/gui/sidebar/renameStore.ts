/**
 * SlicyWeb
 * Rename Store
 *
 * Object whose name is being edited in its row of the Object Panel (lot
 * 106, decision 112 of Noam, Q2 A): opened by a double-click on the row,
 * F2 or Rename of the context menu; request counts the requests, so that
 * a collapsed Object Panel opens (MainLayout). Not project data.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Object Panel, Rename)
 */

import { create } from "zustand";

import { ObjectStateService } from "../../services/ObjectStateService";
import { useObjectStore } from "../../state/objectStore";

/**
 * Object whose name is being edited in its row (lot 106, Q2 A); request
 * counts the requests, so that a collapsed Object Panel opens
 */
export const useRenameStore = create<{
  objectId: string | null;
  request: number;
}>(() => ({ objectId: null, request: 0 }));

/** Opens the name field of this object in its row */
export function startRename(objectId: string): void {
  useRenameStore.setState((state) => ({
    objectId,
    request: state.request + 1,
  }));
}

export function stopRename(): void {
  useRenameStore.setState({ objectId: null });
}

/** F2, Rename of the context menu: the object selected (one only, Q6 A) */
export function renameSelection(): void {
  const { selectedObjectIds } = useObjectStore.getState();

  if (ObjectStateService.canRenameSelection()) {
    startRename(selectedObjectIds[0]);
  }
}
