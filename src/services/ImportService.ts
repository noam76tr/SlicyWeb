/**
 * SlicyWeb
 * Import Service
 *
 * Imports the files chosen by the user (file dialog or drag and drop),
 * one after the other, and publishes their progress and result in the
 * import store for the GUI.
 *
 * A successful import is removed from the list after a few seconds;
 * an error stays until the user closes it.
 *
 * Domain: Service. Depends on the Import Domain and on State
 * Management (DOMAINS_DEPENDENCY_MATRIX.md, ADR-029).
 *
 * Based on:
 * - IMPORT_EXPORT_SPEC.md (Import Workflow, Import Errors)
 * - DECISIONS.md (ADR-029)
 */

import { ImportError } from "../importer/ImportError";
import { ImportManager } from "../importer/ImportManager";
import { useImportStore } from "../state/importStore";

/** Time a successful import stays displayed, in milliseconds */
const DONE_DISPLAY_MS = 3000;

const importManager = new ImportManager();

/** Files are imported one at a time, in the order received */
let queue: Promise<void> = Promise.resolve();

export const ImportService = {
  /**
   * Adds files to the import queue.
   */
  importFiles(files: Iterable<File>): void {
    const store = useImportStore.getState();

    for (const file of files) {
      const taskId = crypto.randomUUID();

      store.addTask({
        taskId,
        fileName: file.name,
        status: "waiting",
        progress: 0,
        errorCode: null,
      });

      queue = queue.then(() => importOne(taskId, file));
    }
  },

  /**
   * Removes a finished import from the list (closed by the user).
   */
  dismiss(taskId: string): void {
    useImportStore.getState().removeTask(taskId);
  },
};

async function importOne(taskId: string, file: File): Promise<void> {
  const store = useImportStore.getState();

  try {
    await importManager.importFile(file, (phase, fraction) => {
      store.updateTask(taskId, { status: phase, progress: fraction });
    });

    store.updateTask(taskId, { status: "done", progress: 1 });

    setTimeout(() => {
      useImportStore.getState().removeTask(taskId);
    }, DONE_DISPLAY_MS);
  } catch (error) {
    console.error(`Import failed: ${file.name}`, error);

    store.updateTask(taskId, {
      status: "error",
      errorCode: error instanceof ImportError ? error.code : "UNKNOWN",
    });
  }
}

export default ImportService;
