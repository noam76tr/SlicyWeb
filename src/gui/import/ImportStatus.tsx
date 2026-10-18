/**
 * SlicyWeb
 * Import Status
 *
 * Shows the imports over the viewport (IMPORT_EXPORT_SPEC.md,
 * Performance Requirements: Provide Progress Updates; GUI_SPEC.md,
 * Error Handling UI): one line per file with a progress bar, a short
 * confirmation when the import succeeds, a clear message when it
 * fails (no technical details). Errors stay until closed. An import
 * waiting or in progress has a Cancel button (ImportService.cancel).
 *
 * Based on:
 * - GUI_SPEC.md (Error Handling UI)
 * - IMPORT_EXPORT_SPEC.md (Import Errors, Performance Requirements)
 */

import { X } from "lucide-react";

import { ImportService } from "../../services/ImportService";
import { useImportStore, type ImportTask } from "../../state/importStore";
import { useTranslation } from "../hooks/useTranslation";

function useTaskText(): (task: ImportTask) => string {
  const { t } = useTranslation();

  return (task) => {
    const params = { name: task.fileName };

    switch (task.status) {
      case "waiting":
      case "reading":
        return t("import.progress.reading", params);
      case "analyzing":
        return t("import.progress.analyzing", params);
      case "done":
        return t("import.done", params);
      case "error": {
        const key = `import.error.${task.errorCode ?? "UNKNOWN"}`;
        const text = t(key, params);

        // Unknown code: generic message
        return text === key ? `${task.fileName}: ${t("error.unknown")}` : text;
      }
    }
  };
}

export default function ImportStatus(): JSX.Element | null {
  const { t } = useTranslation();
  const tasks = useImportStore((state) => state.tasks);
  const text = useTaskText();

  if (tasks.length === 0) {
    return null;
  }

  return (
    <ul
      className="absolute end-3 top-3 flex w-80 max-w-[calc(100%-1.5rem)] flex-col gap-2"
      aria-live="polite"
    >
      {tasks.map((task) => {
        const failed = task.status === "error";
        const running = !failed && task.status !== "done";

        return (
          <li
            key={task.taskId}
            role={failed ? "alert" : "status"}
            className={`rounded-md border bg-card px-3 py-2 text-xs shadow-md ${
              failed ? "border-destructive" : "border-border"
            }`}
          >
            <div className="flex items-start gap-2">
              <p
                className={`min-w-0 flex-1 break-words ${
                  failed ? "text-destructive" : ""
                } ${task.status === "done" ? "text-success" : ""}`}
              >
                {text(task)}
              </p>

              {running && (
                <button
                  type="button"
                  className="shrink-0 rounded px-1 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  onClick={() => ImportService.cancel(task.taskId)}
                >
                  {t("import.cancel")}
                </button>
              )}

              {failed && (
                <button
                  type="button"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label={t("import.dismiss")}
                  title={t("import.dismiss")}
                  onClick={() => ImportService.dismiss(task.taskId)}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {running && (
              <div
                className="mt-1.5 h-1 overflow-hidden rounded bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(task.progress * 100)}
              >
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${Math.round(task.progress * 100)}%` }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
