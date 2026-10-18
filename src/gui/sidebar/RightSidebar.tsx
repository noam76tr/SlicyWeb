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
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import { useMemo } from "react";

import { useAnalysisStore } from "../../state/analysisStore";
import { useFilamentStore } from "../../state/filamentStore";
import { useMaterialStore } from "../../state/materialStore";
import { useObjectStore } from "../../state/objectStore";
import { usePresetStore } from "../../state/presetStore";
import { usePrinterStore } from "../../state/printerStore";
import { useRecommendationStore } from "../../state/recommendationStore";
import { useTranslation } from "../hooks/useTranslation";

import { getDisplayNames } from "./objectNames";
import SidebarSection from "./SidebarSection";
import TransformSection from "./TransformSection";

export default function RightSidebar(): JSX.Element {
  const { t } = useTranslation();

  const printer = usePrinterStore((state) => state.selectedPrinter);
  const material = useMaterialStore((state) => state.selectedMaterial);
  const filament = useFilamentStore((state) => state.selectedFilament);
  const preset = usePresetStore((state) => state.selectedPreset);

  const objects = useObjectStore((state) => state.objects);
  const names = useMemo(() => getDisplayNames(objects), [objects]);

  const selectedObject = useObjectStore((state) =>
    state.objects.find(
      (object) => object.objectId === state.selectedObjectId,
    ) ?? null,
  );

  const selectedName = selectedObject
    ? (names.get(selectedObject.objectId) ?? selectedObject.fileName)
    : "";

  const analysis = useAnalysisStore((state) =>
    selectedObject ? state.analysis[selectedObject.objectId] : undefined,
  );

  const recommendation = useRecommendationStore((state) =>
    selectedObject
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
        {printer
          ? `${printer.brand} ${printer.model}`
          : t("printer.noSelection")}
      </SidebarSection>

      <SidebarSection title={t("material.title")}>
        {material ? material.name : t("material.noSelection")}
      </SidebarSection>

      <SidebarSection title={t("filament.title")}>
        {filament
          ? `${filament.brand} ${filament.name}`
          : t("filament.noSelection")}
      </SidebarSection>

      <SidebarSection title={t("preset.title")}>
        {preset ? preset.name : t("preset.noSelection")}
      </SidebarSection>

      <SidebarSection title={t("object.title")}>
        {selectedObject ? selectedName : noObject}
      </SidebarSection>

      <SidebarSection title={t("transform.title")}>
        {selectedObject ? (
          <TransformSection object={selectedObject} />
        ) : (
          noObject
        )}
      </SidebarSection>

      <SidebarSection title={t("analysis.title")}>
        {!selectedObject
          ? noObject
          : analysis
            ? t(`result.${analysis.status}`)
            : t("analysis.none")}
      </SidebarSection>

      <SidebarSection title={t("recommendation.title")}>
        {!selectedObject
          ? noObject
          : recommendation
            ? t(`result.${recommendation.status}`)
            : t("recommendation.none")}
      </SidebarSection>
    </div>
  );
}
