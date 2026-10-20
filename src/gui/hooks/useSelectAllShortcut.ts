/**
 * SlicyWeb
 * Select All Shortcut
 *
 * Ctrl+A (Cmd+A) selects all the objects (GUI_SPEC.md, Keyboard
 * Shortcuts, Selection; Phase 6, decision of Noam). In a text field, the
 * shortcut keeps its usual meaning (select the text of the field).
 *
 * The letter is read from the key typed (A of an AZERTY keyboard is Q of
 * a QWERTY one), or from the key position when the layout has no Latin
 * letters (Hebrew).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Keyboard Shortcuts)
 */

import { useEffect } from "react";

import { useObjectStore } from "../../state/objectStore";

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  );
}

/** Letter of the shortcut: the key typed, or its position (KeyA -> a) */
function shortcutLetter(event: KeyboardEvent): string {
  const key = event.key.toLowerCase();

  if (/^[a-z]$/.test(key)) {
    return key;
  }

  return event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : "";
}

export function useSelectAllShortcut(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.altKey ||
        event.shiftKey ||
        event.defaultPrevented ||
        isEditableTarget(event.target) ||
        shortcutLetter(event) !== "a"
      ) {
        return;
      }

      event.preventDefault();
      useObjectStore.getState().selectAllObjects();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
