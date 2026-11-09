/**
 * SlicyWeb
 * Right Sidebar Component (Properties Panel)
 *
 * Sections of GUI_SPEC.md (Properties Sections), in three tabs since
 * lot 93 (Properties Tabs): Project above the tabs; Printer, Material,
 * Filament; Object, Transform, Analysis; Print Preset, Recommendations.
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
 * Lot 93 (GUI_SPEC.md, Properties Tabs; PASSATION.md decision 90, Q1 to
 * Q6 A): the Project line stays above three tabs (shadcn Tabs, text
 * only): Printer (Printer, Material, Filament), Object (Object,
 * Transform, Analysis), Settings (Print Preset, Recommendations).
 * - The tab changes only when the user chooses it (click, or the arrow
 *   keys then Enter when a tab has the focus); the last tab is opened
 *   again at start (PropertiesTabService).
 * - A red dot on Settings when the single selected object has a critical
 *   warning in its recommendation; it stays when Settings is open, and
 *   the name of the tab then says "critical warning" to a screen reader.
 * - The tabs stay mounted and each one keeps its own scroll position.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import { useLayoutEffect, useMemo, useRef, type UIEvent } from "react";

import { formatNumber } from "../../i18n/NumberFormatter";
import { PropertiesTabSchema } from "../../schemas/UserPreferencesSchema";
import { PropertiesTabService } from "../../services/PropertiesTabService";
import { useObjectStore } from "../../state/objectStore";
import { usePropertiesPanelStore } from "../../state/propertiesPanelStore";
import { useRecommendationStore } from "../../state/recommendationStore";
import type { PropertiesTab } from "../../types/UserPreferences";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useTranslation } from "../hooks/useTranslation";

import AnalysisSection from "./AnalysisSection";
import FilamentSection from "./FilamentSection";
import MaterialSection from "./MaterialSection";
import { getDisplayNames } from "./objectNames";
import PrinterSection from "./PrinterSection";
import RecommendationSection, { presetKey } from "./RecommendationSection";
import SidebarSection from "./SidebarSection";
import TransformSection from "./TransformSection";

/** Each tab scrolls on its own (GUI_SPEC.md, Properties Tabs) */
const PANEL_CLASS = "min-h-0 overflow-y-auto border-t border-border";

export default function RightSidebar(): JSX.Element {
  const { t, language } = useTranslation();

  const tab = usePropertiesPanelStore((state) => state.tab);

  // Scroll position of each tab, given back when the tab is open again
  const panels = useRef<Partial<Record<PropertiesTab, HTMLDivElement>>>({});
  const scrollTops = useRef<Partial<Record<PropertiesTab, number>>>({});

  useLayoutEffect(() => {
    const panel = panels.current[tab];

    if (panel) {
      panel.scrollTop = scrollTops.current[tab] ?? 0;
    }
  }, [tab]);

  const panelProps = (value: PropertiesTab) => ({
    value,
    keepMounted: true,
    className: PANEL_CLASS,
    "data-properties-tab": value,
    ref: (element: HTMLDivElement | null) => {
      if (element) {
        panels.current[value] = element;
      }
    },
    onScroll: (event: UIEvent<HTMLDivElement>) => {
      scrollTops.current[value] = event.currentTarget.scrollTop;
    },
  });

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

  // Red dot on Settings: the single selected object has a critical
  // warning (PASSATION.md decision 90, Q4 A)
  const critical =
    recommendation?.warnings.some(
      (warning) => warning.severity === "critical",
    ) ?? false;

  const noObject = t("object.noSelection");
  const settingsLabel = t("properties.tab.settings");

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex shrink-0 items-baseline gap-2 border-b border-border px-3 py-2 text-xs"
        data-properties-project
      >
        <span className="text-sm font-semibold">{t("project.title")}</span>
        <span className="truncate text-muted-foreground">
          {t("project.none")}
        </span>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          const result = PropertiesTabSchema.safeParse(value);

          if (result.success) {
            void PropertiesTabService.choose(result.data);
          }
        }}
        className="min-h-0 flex-1 gap-0"
      >
        <TabsList
          aria-label={t("properties.tabs")}
          className="m-2 flex w-auto shrink-0"
        >
          <TabsTrigger value="printer" data-properties-trigger="printer">
            {t("properties.tab.printer")}
          </TabsTrigger>
          <TabsTrigger value="object" data-properties-trigger="object">
            {t("properties.tab.object")}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            data-properties-trigger="settings"
            aria-label={
              critical
                ? t("properties.criticalWarning", { tab: settingsLabel })
                : undefined
            }
            data-critical={critical ? "true" : undefined}
          >
            {settingsLabel}
            {critical && (
              <span
                aria-hidden="true"
                data-critical-dot
                className="size-2 shrink-0 rounded-full bg-destructive"
              />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent {...panelProps("printer")}>
          <SidebarSection title={t("printer.title")}>
            <PrinterSection />
          </SidebarSection>

          <SidebarSection title={t("material.title")}>
            <MaterialSection />
          </SidebarSection>

          <SidebarSection title={t("filament.title")}>
            <FilamentSection />
          </SidebarSection>
        </TabsContent>

        <TabsContent {...panelProps("object")}>
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
        </TabsContent>

        <TabsContent {...panelProps("settings")}>
          <SidebarSection title={t("preset.title")}>
            {recommendation
              ? t(presetKey(recommendation.preset.category))
              : "—"}
          </SidebarSection>

          <SidebarSection title={t("recommendation.title")}>
            <RecommendationSection objectIds={selectedObjectIds} />
          </SidebarSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
