/**
 * SlicyWeb
 * Object State Shortcuts
 *
 * Keyboard shortcuts of Rename, Hide and Show (lot 106, decision 112 of
 * Noam, Q2 A, Q9 A; GUI_SPEC.md, Keyboard Shortcuts):
 * - F2: renames the selected object, in its row of the Object Panel (one
 *   object selected only, Q6 A);
 * - H: hides the selected objects (shows them when they are all hidden,
 *   like the line of the context menu, Q18 A);
 * - Alt+H: shows all the hidden objects (View > Show All).
 *
 * Not in a text field, nor in an open window or menu. The letter is read
 * from the key typed, or from the key position when the layout has no
 * Latin letters (Hebrew). Alt+H is taken by the application before any
 * other use of the key (preventDefault): no menu of the Menu Bar has a
 * letter for Alt.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Keyboard Shortcuts, Object Panel)
 */

import { useEffect } from "react";

import { ObjectStateService } from "../../services/ObjectStateService";
import { renameSelection } from "../sidebar/renameStore";

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

/** Letter of the shortcut: the key typed, or its position (KeyH -> h) */
function shortcutLetter(event: KeyboardEvent): string {
  const key = event.key.toLowerCase();

  if (/^[a-z]$/.test(key)) {
    return key;
  }

  return event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : "";
}

export function useObjectStateShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isIgnoredTarget(event.target)
      ) {
        return;
      }

      if (event.key === "F2" && !event.altKey) {
        event.preventDefault();
        renameSelection();
      } else if (shortcutLetter(event) === "h" || event.code === "KeyH") {
        event.preventDefault();

        if (event.altKey) {
          ObjectStateService.showAll();
        } else {
          ObjectStateService.toggleSelectionVisibility();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
