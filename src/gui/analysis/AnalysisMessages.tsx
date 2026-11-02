/**
 * SlicyWeb
 * Analysis Messages
 *
 * Messages of the analysis over the viewport, shown like the messages of
 * the import (Phase 9 lot 80; GUI_SPEC.md, Error Handling UI; ADR-034 D6):
 * - ANA_001 (error): the analysis of the object failed;
 * - ANA_002 (warning, non-blocking): the mesh is not closed, the volume
 *   and the wall thickness are approximate; the analysis is shown.
 * Both stay until closed (Close button). Texts translated, no technical
 * details.
 *
 * The messages never stop the clicks in the viewport under them (lot 55):
 * only the Close button receives the pointer.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Error Handling UI)
 * - ERROR_CODES_SPEC.md (ANA_001, ANA_002)
 */

import { X } from "lucide-react";
import { useMemo } from "react";

import { AnalysisService } from "../../services/AnalysisService";
import { useAnalysisTaskStore } from "../../state/analysisTaskStore";
import { useObjectStore } from "../../state/objectStore";
import { useTranslation } from "../hooks/useTranslation";
import { getDisplayNames } from "../sidebar/objectNames";

export default function AnalysisMessages(): JSX.Element | null {
  const { t } = useTranslation();
  const messages = useAnalysisTaskStore((state) => state.messages);
  const objects = useObjectStore((state) => state.objects);
  const names = useMemo(() => getDisplayNames(objects), [objects]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <ul className="pointer-events-none flex flex-col gap-2" aria-live="polite">
      {messages.map((message) => {
        const failed = message.code === "ANA_001";
        const name = names.get(message.objectId) ?? message.fileName;

        return (
          <li
            key={message.messageId}
            role={failed ? "alert" : "status"}
            className={`rounded-md border bg-card px-3 py-2 text-xs shadow-md ${
              failed ? "border-destructive" : "border-warning"
            }`}
          >
            <div className="flex items-start gap-2">
              <p
                className={`min-w-0 flex-1 break-words ${
                  failed ? "text-destructive" : "text-warning"
                }`}
              >
                {t(`analysis.error.${message.code}`, { name })}
              </p>

              <button
                type="button"
                className="pointer-events-auto shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={t("import.dismiss")}
                title={t("import.dismiss")}
                onClick={() => AnalysisService.dismiss(message.messageId)}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
