/**
 * SlicyWeb
 * Import Dialog
 *
 * Opens the system file dialog and sends the chosen files to the
 * import (ImportService). Only the files chosen by the user are read
 * (ADR-029). Several files can be chosen at once.
 *
 * Based on:
 * - GUI_SPEC.md (File Menu: Import STL, Import 3MF; Toolbar: Import)
 * - DECISIONS.md (ADR-029)
 */

import { ImportService } from "../../services/ImportService";

/** File extensions accepted by the dialog of each import action */
export const IMPORT_ACCEPT = {
  stl: ".stl",
} as const;

export function openImportDialog(accept: string): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.multiple = true;

  input.addEventListener("change", () => {
    if (input.files && input.files.length > 0) {
      ImportService.importFiles(Array.from(input.files));
    }
  });

  input.click();
}
