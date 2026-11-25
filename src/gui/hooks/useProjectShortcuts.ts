/**
 * SlicyWeb
 * Project Shortcuts
 *
 * Keyboard shortcuts of the File menu (GUI_SPEC.md, Keyboard Shortcuts;
 * lot 111, decision 119 of Noam, Q8 and Q10 A): Ctrl+N New Project,
 * Ctrl+O Open Project, Ctrl+S Save, Ctrl+Shift+S Save As. They work in
 * the text fields too (as in other applications), and when the focus is
 * on a title of the menu bar (read first, in the capture phase: the menu
 * bar uses the letters to move between its titles); not while a window or
 * a menu is open.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Keyboard Shortcuts, File Menu)
 */

import { useEffect } from "react";

import { ProjectService } from "../../services/ProjectService";

/** Element of an open window or menu */
function isIgnoredTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('[role="dialog"], [role="alertdialog"], [role="menu"]') !==
      null
  );
}

/** Letter of the shortcut: the key typed, or its position (KeyS -> s) */
function shortcutLetter(event: KeyboardEvent): string {
  const key = event.key.toLowerCase();

  if (/^[a-z]$/.test(key)) {
    return key;
  }

  return event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : "";
}

export function useProjectShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (
        event.altKey ||
        !(event.ctrlKey || event.metaKey) ||
        isIgnoredTarget(event.target) ||
        document.querySelector('[role="dialog"][data-open]')
      ) {
        return;
      }

      const letter = shortcutLetter(event);

      if (letter === "s") {
        event.preventDefault();
        void (event.shiftKey ? ProjectService.saveAs() : ProjectService.save());
      } else if (!event.shiftKey && letter === "n") {
        event.preventDefault();
        void ProjectService.newProject();
      } else if (!event.shiftKey && letter === "o") {
        event.preventDefault();
        void ProjectService.open();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);
}
