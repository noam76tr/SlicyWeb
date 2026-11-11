/**
 * SlicyWeb
 * Optimization Messages
 *
 * Message of the result of each orientation search, over the viewport,
 * under the messages of the import and of the analysis, until closed
 * (Phase 11 lot 98; GUI_SPEC.md, Error Handling UI: Optimization
 * messages; ADR-036 D4). One line for each object searched, in the order
 * of the scene:
 * - orientation applied: the Orientation Score before and after, then
 *   only what changed: the overhangs (supportReduction), "Supports no
 *   longer needed", the tip risk;
 * - orientation kept: "already the best", with its score;
 * - OPT_002: the search failed, the orientation of this object did not
 *   change.
 * Texts translated, no technical details.
 *
 * The messages never stop the clicks in the viewport under them (lot 55):
 * only the Close button receives the pointer.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Error Handling UI)
 * - DATA_SCHEMA.md (3.13.0: Optimization Result Rules)
 * - ERROR_CODES_SPEC.md (OPT_002)
 */

import { X } from "lucide-react";
import { useMemo } from "react";

import { formatNumber, formatQuantity } from "../../i18n/NumberFormatter";
import { OptimizationService } from "../../services/OptimizationService";
import { useObjectStore } from "../../state/objectStore";
import {
  useOptimizationTaskStore,
  type OptimizationLine,
} from "../../state/optimizationTaskStore";
import { useTranslation } from "../hooks/useTranslation";
import { getDisplayNames } from "../sidebar/objectNames";

export default function OptimizationMessages(): JSX.Element | null {
  const { t, language } = useTranslation();
  const messages = useOptimizationTaskStore((state) => state.messages);
  const objects = useObjectStore((state) => state.objects);
  const names = useMemo(() => getDisplayNames(objects), [objects]);

  if (messages.length === 0) {
    return null;
  }

  const number = (value: number): string => formatNumber(value, language);

  /** Main text of a line, then the details of what changed */
  const texts = (line: OptimizationLine): string[] => {
    const name = names.get(line.objectId) ?? line.fileName;

    if (line.kind === "failed") {
      return [t(`optimization.error.${line.code}`, { name })];
    }

    if (line.kind === "kept") {
      return [t("optimization.kept", { name, score: number(line.score) })];
    }

    const details: string[] = [];

    if (line.supportReduction !== 0) {
      details.push(
        t(
          line.supportReduction > 0
            ? "optimization.overhangsLess"
            : "optimization.overhangsMore",
          {
            percent: formatQuantity(
              Math.abs(line.supportReduction),
              "%",
              language,
            ),
          },
        ),
      );
    }

    if (line.supportsRemoved) {
      details.push(t("optimization.supportsRemoved"));
    }

    if (line.riskBefore !== line.riskAfter) {
      details.push(
        t("optimization.tipRiskChange", {
          before: number(line.riskBefore),
          after: number(line.riskAfter),
        }),
      );
    }

    return [
      t("optimization.applied", {
        name,
        before: number(line.scoreBefore),
        after: number(line.scoreAfter),
      }),
      ...details,
    ];
  };

  return (
    <ul className="pointer-events-none flex flex-col gap-2" aria-live="polite">
      {messages.map((message) => {
        const failed = message.lines.some((line) => line.kind === "failed");

        return (
          <li
            key={message.messageId}
            role={failed ? "alert" : "status"}
            data-optimization-message=""
            className={`rounded-md border bg-card px-3 py-2 text-xs shadow-md ${
              failed ? "border-destructive" : "border-primary"
            }`}
          >
            <div className="flex items-start gap-2">
              <ul className="min-w-0 flex-1 space-y-1.5 break-words">
                {message.lines.map((line) => {
                  const [main, ...details] = texts(line);

                  return (
                    <li
                      key={line.objectId}
                      className={
                        line.kind === "failed" ? "text-destructive" : undefined
                      }
                    >
                      <p>{main}</p>

                      {details.length > 0 && (
                        <ul className="mt-0.5 ps-3 text-muted-foreground">
                          {details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                className="pointer-events-auto shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={t("import.dismiss")}
                title={t("import.dismiss")}
                onClick={() => OptimizationService.dismiss(message.messageId)}
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
