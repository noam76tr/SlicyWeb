/**
 * SlicyWeb
 * Edit Shortcuts
 *
 * Keyboard shortcuts of Delete and Duplicate (lot 100; GUI_SPEC.md,
 * Keyboard Shortcuts):
 * - Delete: deletes the selected objects (confirmation for several,
 *   DeleteObjectsDialog);
 * - Ctrl+D (Cmd+D): duplicates the selected objects (ObjectEditService).
 *
 * Not in a text field (the keys keep their usual meaning there), nor in an
 * open window or menu. The letter is read from the key typed, or from the
 * key position when the layout has no Latin letters (Hebrew).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Keyboard Shortcuts, Edit Menu)
 */

import { useEffect } from "react";

import { ObjectEditService } from "../../services/ObjectEditService";
import {
  deleteSelectedObjects,
  isDeleteConfirmationOpen,
} from "../dialogs/DeleteObjectsDialog";

/** Text field, or element of an open window or menu */
function isIgnoredTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.closest('[role="dialog"], [role="alertdialog"], [role="menu"]') !==
        null)
  );
}

/** Letter of the shortcut: the key typed, or its position (KeyD -> d) */
function shortcutLetter(event: KeyboardEvent): string {
  const key = event.key.toLowerCase();

  if (/^[a-z]$/.test(key)) {
    return key;
  }

  return event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : "";
}

export function useEditShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.shiftKey ||
        isIgnoredTarget(event.target) ||
        isDeleteConfirmationOpen()
      ) {
        return;
      }

      const control = event.ctrlKey || event.metaKey;

      if (!control && event.key === "Delete") {
        event.preventDefault();
        deleteSelectedObjects();
      } else if (control && shortcutLetter(event) === "d") {
        event.preventDefault();
        ObjectEditService.duplicateSelection();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
