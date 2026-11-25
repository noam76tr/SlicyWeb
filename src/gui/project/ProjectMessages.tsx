/**
 * SlicyWeb
 * Project Messages
 *
 * Messages of the project over the viewport, under the imports (GUI_SPEC.md,
 * Messages Over The Viewport; lot 111, decision 119 of Noam): the errors
 * PROJ_001 to PROJ_005 (Q16 A), "Drop a project alone" (Q15 A), the
 * profiles of a project opened (Q3 A) and a copy of the automatic save set
 * aside (Q19 A). Each message stays until it is closed; while a project
 * is read, "Opening the project…".
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Messages Over The Viewport)
 * - ERROR_CODES_SPEC.md 2.7.0 (PROJ_001 to PROJ_005)
 */

import { X } from "lucide-react";

import { formatQuantity } from "../../i18n/NumberFormatter";
import { ProjectService } from "../../services/ProjectService";
import { useProjectStore } from "../../state/projectStore";
import { useTranslation } from "../hooks/useTranslation";

export default function ProjectMessages(): JSX.Element | null {
  const { t, language } = useTranslation();
  const messages = useProjectStore((state) => state.messages);
  const opening = useProjectStore((state) => state.busy === "opening");

  if (messages.length === 0 && !opening) {
    return null;
  }

  return (
    <ul className="pointer-events-none flex flex-col gap-2" aria-live="polite">
      {opening && (
        <li
          role="status"
          className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md"
        >
          {t("project.opening")}
        </li>
      )}
      {messages.map((message) => (
        <li
          key={message.messageId}
          role={message.error ? "alert" : "status"}
          data-project-message={message.key}
          className={`rounded-md border bg-card px-3 py-2 text-xs shadow-md ${
            message.error ? "border-destructive" : "border-border"
          }`}
        >
          <div className="flex items-start gap-2">
            <p
              className={`min-w-0 flex-1 break-words ${
                message.error ? "text-destructive" : ""
              }`}
            >
              {t(message.key, {
                ...message.params,
                // The limit of PROJ_005, number first in Hebrew (lot 109)
                limit: formatQuantity(500, t("unit.megabyte"), language),
              })}
            </p>

            <button
              type="button"
              className="pointer-events-auto shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={t("import.dismiss")}
              title={t("import.dismiss")}
              onClick={() => ProjectService.dismissMessage(message.messageId)}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
