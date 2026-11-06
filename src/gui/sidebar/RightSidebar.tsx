/**
 * SlicyWeb
 * Right Sidebar Component (Properties Panel)
 *
 * Sections, in the order of GUI_SPEC.md (Properties Sections):
 * Project, Printer, Material, Filament, Print Preset, Object,
 * Transform, Analysis, Recommendations.
 *
 * Phase 3 (GUI Foundation): each section shows the current selection
 * read from the stores, or an empty state. The detailed contents of
 * each section (GUI_SPEC.md, Project Section to Recommendation
 * Section) come with the phases that provide their data.
 *
 * Phase 6: the Transform section edits the transform of the selected
 * object (TransformSection.tsx).
 *
 * Phase 7: the Printer section chooses the printer and shows its build
 * volume, nozzle and limits (PrinterSection.tsx).
 *
 * Phase 8: the Material and Filament sections choose the material (a
 * family) and the filament and show their values (MaterialSection.tsx,
 * FilamentSection.tsx).
 *
 * Phase 9: the Analysis section shows the analysis of the selected object
 * (AnalysisSection.tsx).
 *
 * Phase 10 (lot 88, ADR-035 D12): the Recommendation section shows the
 * recommendation of the selected object (RecommendationSection.tsx); the
 * Print Preset section shows its preset, "—" when no object or several
 * objects are selected, or when the object has no recommendation (a
 * display only, the choice of a preset comes in Phase 15).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import { useMemo } from "react";

import { formatNumber } from "../../i18n/NumberFormatter";
import { useObjectStore } from "../../state/objectStore";
import { useRecommendationStore } from "../../state/recommendationStore";
import { useTranslation } from "../hooks/useTranslation";

import AnalysisSection from "./AnalysisSection";
import FilamentSection from "./FilamentSection";
import MaterialSection from "./MaterialSection";
import { getDisplayNames } from "./objectNames";
import PrinterSection from "./PrinterSection";
import RecommendationSection, { presetKey } from "./RecommendationSection";
import SidebarSection from "./SidebarSection";
import TransformSection from "./TransformSection";

export default function RightSidebar(): JSX.Element {
  const { t, language } = useTranslation();

  const objects = useObjectStore((state) => state.objects);
  const names = useMemo(() => getDisplayNames(objects), [objects]);

  const selectedObject = useObjectStore(
    (state) =>
      state.objects.find(
        (object) => object.objectId === state.selectedObjectId,
      ) ?? null,
  );

  const selectedName = selectedObject
    ? (names.get(selectedObject.objectId) ?? selectedObject.fileName)
    : "";

  // Several objects selected: the Transform section acts on the group
  const selectedObjectIds = useObjectStore((state) => state.selectedObjectIds);
  const selectedObjects = useMemo(
    () =>
      objects.filter((object) => selectedObjectIds.includes(object.objectId)),
    [objects, selectedObjectIds],
  );
  const group = selectedObjects.length > 1;

  // Preset of the recommendation of the selected object (one object only)
  const recommendation = useRecommendationStore((state) =>
    selectedObject && !group
      ? state.recommendations[selectedObject.objectId]
      : undefined,
  );

  const noObject = t("object.noSelection");

  return (
    <div>
      <SidebarSection title={t("project.title")}>
        {t("project.none")}
      </SidebarSection>

      <SidebarSection title={t("printer.title")}>
        <PrinterSection />
      </SidebarSection>

      <SidebarSection title={t("material.title")}>
        <MaterialSection />
      </SidebarSection>

      <SidebarSection title={t("filament.title")}>
        <FilamentSection />
      </SidebarSection>

      <SidebarSection title={t("preset.title")}>
        {recommendation ? t(presetKey(recommendation.preset.category)) : "—"}
      </SidebarSection>

      <SidebarSection title={t("object.title")}>
        {group
          ? t("object.multipleSelected", {
              count: formatNumber(selectedObjects.length, language),
            })
          : selectedObject
            ? selectedName
            : noObject}
      </SidebarSection>

      <SidebarSection title={t("transform.title")}>
        {selectedObjects.length > 0 ? (
          <TransformSection objects={selectedObjects} />
        ) : (
          noObject
        )}
      </SidebarSection>

      <SidebarSection title={t("analysis.title")}>
        <AnalysisSection objectIds={selectedObjectIds} />
      </SidebarSection>

      <SidebarSection title={t("recommendation.title")}>
        <RecommendationSection objectIds={selectedObjectIds} />
      </SidebarSection>
    </div>
  );
}
