/**
 * SlicyWeb
 * Undo Redo Shortcuts
 *
 * Keyboard shortcuts of undo and redo (UNDO_REDO_SPEC.md, Keyboard
 * Shortcuts; GUI_SPEC.md, Keyboard Shortcuts):
 * - Ctrl+Z (Cmd+Z): undo;
 * - Ctrl+Y, Ctrl+Shift+Z (Cmd+Shift+Z): redo.
 *
 * In a text field, the field handles the shortcuts itself (decision of
 * Noam, Phase 6): typing not applied yet is undone first; with nothing
 * pending, the field calls the undo and redo of the application
 * (TransformSection.tsx). undoRedoCommand() is shared with the fields.
 *
 * The letter is read from the key typed (Z of an AZERTY keyboard), or
 * from the key position when the layout has no Latin letters (Hebrew).
 *
 * No business logic: the actions are those of TransformService.
 *
 * Based on:
 * - UNDO_REDO_SPEC.md (Keyboard Shortcuts)
 * - GUI_SPEC.md (Keyboard Shortcuts)
 */

import { useEffect } from "react";

import { TransformService } from "../../services/TransformService";

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  );
}

/** Keys of a keyboard event read by the shortcuts (DOM or React event) */
export type ShortcutKeys = Pick<
  KeyboardEvent,
  "key" | "code" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey"
>;

/** Letter of the shortcut: the key typed, or its position (KeyZ -> z) */
function shortcutLetter(event: ShortcutKeys): string {
  const key = event.key.toLowerCase();

  if (/^[a-z]$/.test(key)) {
    return key;
  }

  return event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : "";
}

/** Undo (Ctrl+Z), redo (Ctrl+Y, Ctrl+Shift+Z), or null for other keys */
export function undoRedoCommand(event: ShortcutKeys): "undo" | "redo" | null {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) {
    return null;
  }

  const letter = shortcutLetter(event);

  if (letter === "z") {
    return event.shiftKey ? "redo" : "undo";
  }

  return letter === "y" && !event.shiftKey ? "redo" : null;
}

export function useUndoRedoShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }

      const command = undoRedoCommand(event);

      if (command) {
        event.preventDefault();

        if (command === "undo") {
          TransformService.undo();
        } else {
          TransformService.redo();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
