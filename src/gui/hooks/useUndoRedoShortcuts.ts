/**
 * SlicyWeb
 * Undo Redo Shortcuts
 *
 * Keyboard shortcuts of undo and redo (UNDO_REDO_SPEC.md, Keyboard
 * Shortcuts; GUI_SPEC.md, Keyboard Shortcuts):
 * - Ctrl+Z (Cmd+Z): undo;
 * - Ctrl+Y, Ctrl+Shift+Z (Cmd+Shift+Z): redo.
 *
 * In a text field, the shortcuts keep their usual meaning (undo the
 * typing in the field): the history of the application is not touched
 * (decision of Noam, Phase 6).
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

/** Letter of the shortcut: the key typed, or its position (KeyZ -> z) */
function shortcutLetter(event: KeyboardEvent): string {
  const key = event.key.toLowerCase();

  if (/^[a-z]$/.test(key)) {
    return key;
  }

  return event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : "";
}

export function useUndoRedoShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const command = event.ctrlKey || event.metaKey;

      if (
        !command ||
        event.altKey ||
        event.defaultPrevented ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      const letter = shortcutLetter(event);
      const undo = letter === "z" && !event.shiftKey;
      const redo =
        (letter === "z" && event.shiftKey) ||
        (letter === "y" && !event.shiftKey);

      if (undo || redo) {
        event.preventDefault();

        if (undo) {
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
