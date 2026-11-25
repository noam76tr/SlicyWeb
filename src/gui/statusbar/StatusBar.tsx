/**
 * SlicyWeb
 * Status Bar Component
 *
 * Fields, in the order of GUI_SPEC.md (Status Bar): Selected Printer,
 * Selected Material, Selected Object, Object Count, Analysis Status,
 * Selected Filament, Active Preset, Plate Estimation, Current Language,
 * Project Status.
 *
 * Values come from the stores. Analysis Status (Phase 9 lot 80):
 * "Analyzing…" while an analysis is computed, otherwise the status of the
 * analysis of the selected object; "Optimizing…" while an orientation
 * search runs (Phase 11 lot 98, ADR-036 D4). Active Preset (Phase 10 lot
 * 88, ADR-035 D12): the preset of the recommendation of the selected object, "—"
 * otherwise (same rule as the Print Preset section). Project Status (Phase 13, lot 111,
 * Q10 and Q12 A): "Saving…", "Project saved" for a few seconds, then
 * "Modified", "Saved at 14:32", "Opened" or "Not saved". Plate Estimation (Phase 12,
 * ADR-037, Q12 and Q13 A): sum of the estimations of the visible objects
 * (a hidden object is not counted, as at export): print time, weight and
 * total cost when known; "(n without an estimation)" when a visible object
 * has none yet; "—" when no object has one.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import { useMemo } from "react";

import { formatNumber } from "../../i18n/NumberFormatter";
import { CostEstimationService } from "../../services/CostEstimationService";
import { useCostSettingsStore } from "../../state/costSettingsStore";
import { useAnalysisStore } from "../../state/analysisStore";
import { useAnalysisTaskStore } from "../../state/analysisTaskStore";
import { useEstimationStore } from "../../state/estimationStore";
import { useFilamentStore } from "../../state/filamentStore";
import { useMaterialStore } from "../../state/materialStore";
import { useObjectStore } from "../../state/objectStore";
import { useOptimizationTaskStore } from "../../state/optimizationTaskStore";
import { usePrinterStore } from "../../state/printerStore";
import { useIsModified, useProjectStore } from "../../state/projectStore";
import { useRecommendationStore } from "../../state/recommendationStore";
import { LANGUAGE_NAME_KEYS, useTranslation } from "../hooks/useTranslation";
import { formatTime } from "../project/projectFormat";
import { getDisplayNames } from "../sidebar/objectNames";
import {
  aboutDuration,
  aboutMoney,
  aboutWeight,
  joinValues,
} from "../sidebar/estimationFormat";
import { presetKey } from "../sidebar/RecommendationSection";

interface StatusFieldProps {
  label: string;
  value: string;
  /** Attribute of the field for the end-to-end tests */
  testId?: string;
  /** Never shortened: the other fields are shortened first */
  whole?: boolean;
}

function StatusField({
  label,
  value,
  testId,
  whole = false,
}: StatusFieldProps): JSX.Element {
  return (
    <div
      className={`flex items-center gap-1 ${whole ? "shrink-0" : "min-w-0"}`}
      title={`${label}: ${value}`}
      data-status-field={testId}
    >
      <span className="shrink-0 text-muted-foreground">{label}:</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

export default function StatusBar(): JSX.Element {
  const { t, language } = useTranslation();

  const printer = usePrinterStore((state) => state.selectedPrinter);
  const material = useMaterialStore((state) => state.selectedMaterial);
  const filament = useFilamentStore((state) => state.selectedFilament);
  const objectCount = useObjectStore((state) => state.objects.length);

  const objects = useObjectStore((state) => state.objects);
  const names = useMemo(() => getDisplayNames(objects), [objects]);

  const selectedObject = useObjectStore(
    (state) =>
      state.objects.find(
        (object) => object.objectId === state.selectedObjectId,
      ) ?? null,
  );

  const selectedCount = useObjectStore(
    (state) => state.selectedObjectIds.length,
  );

  const selectedName =
    selectedCount > 1
      ? t("object.multipleSelected", {
          count: formatNumber(selectedCount, language),
        })
      : selectedObject
        ? (names.get(selectedObject.objectId) ?? selectedObject.fileName)
        : "";

  const analysis = useAnalysisStore((state) =>
    selectedObject ? state.analysis[selectedObject.objectId] : undefined,
  );

  const recommendation = useRecommendationStore((state) =>
    selectedObject && selectedCount === 1
      ? state.recommendations[selectedObject.objectId]
      : undefined,
  );

  const analyzing = useAnalysisTaskStore(
    (state) => state.pendingObjectIds.length > 0,
  );

  const optimizing = useOptimizationTaskStore((state) => state.running);

  const none = t("statusBar.none");

  // Project field (lot 111, Q10 and Q12 A)
  const busy = useProjectStore((state) => state.busy);
  const justSaved = useProjectStore((state) => state.justSaved);
  const lastSavedAt = useProjectStore((state) => state.lastSavedAt);
  const token = useProjectStore((state) => state.token);
  const modified = useIsModified();
  const projectStatus =
    busy === "saving"
      ? t("project.status.saving")
      : justSaved
        ? t("project.status.saved")
        : modified
          ? t("project.status.modified")
          : lastSavedAt
            ? t("project.status.savedAt", {
                time: formatTime(lastSavedAt, language),
              })
            : token
              ? t("project.status.opened")
              : t("project.status.notSaved");

  const estimations = useEstimationStore((state) => state.estimations);
  const currency = useCostSettingsStore((state) => state.settings.currency);
  const plate = useMemo(() => {
    const total = CostEstimationService.totalOf(
      objects
        .filter((object) => object.visible)
        .map((object) => object.objectId),
      estimations,
    );

    if (total.count === 0) {
      return "—";
    }

    const parts = [aboutDuration(total.printTime, language)];

    if (total.cost.filamentWeight !== null) {
      parts.push(aboutWeight(total.cost.filamentWeight, language));
    }

    if (total.cost.totalCost !== null) {
      parts.push(aboutMoney(total.cost.totalCost, currency, language));
    }

    const text = joinValues(parts, language);

    return total.missing > 0
      ? `${text} ${t("statusBar.withoutEstimation", {
          count: formatNumber(total.missing, language),
        })}`
      : text;
  }, [objects, estimations, currency, language, t]);

  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 overflow-hidden border-t border-border bg-card px-3 text-xs text-card-foreground">
      <StatusField
        label={t("statusBar.printer")}
        value={printer ? `${printer.brand} ${printer.model}` : none}
      />
      <StatusField
        label={t("statusBar.material")}
        value={material ? material.name : none}
      />
      <StatusField
        label={t("statusBar.selectedObject")}
        value={selectedObject ? selectedName : none}
      />
      <StatusField
        label={t("statusBar.objectCount")}
        value={formatNumber(objectCount, language)}
      />
      <StatusField
        label={t("statusBar.analysisStatus")}
        value={
          optimizing
            ? t("optimization.optimizing")
            : analyzing
              ? t("analysis.analyzing")
              : analysis
                ? t(`result.${analysis.status}`)
                : none
        }
      />
      <StatusField
        label={t("statusBar.filament")}
        value={filament ? `${filament.brand} ${filament.name}` : none}
      />
      <StatusField
        label={t("statusBar.preset")}
        value={
          recommendation ? t(presetKey(recommendation.preset.category)) : "—"
        }
      />
      <StatusField
        label={t("statusBar.plate")}
        value={plate}
        testId="plate-estimation"
        whole
      />
      <StatusField
        label={t("statusBar.language")}
        value={t(LANGUAGE_NAME_KEYS[language])}
      />
      <StatusField
        label={t("statusBar.projectStatus")}
        value={projectStatus}
        testId="project-status"
      />
    </footer>
  );
}
