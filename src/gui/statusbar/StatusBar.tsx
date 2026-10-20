/**
 * SlicyWeb
 * Status Bar Component
 *
 * Fields, in the order of GUI_SPEC.md (Status Bar): Selected Printer,
 * Selected Material, Selected Object, Object Count, Analysis Status,
 * Selected Filament, Active Preset, Current Language, Project Status.
 *
 * Values come from the stores. Project Status shows "None" until
 * the project state is available to the GUI.
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
import {
  LANGUAGE_NAME_KEYS,
  useTranslation,
} from "../hooks/useTranslation";
import { getDisplayNames } from "../sidebar/objectNames";

interface StatusFieldProps {
  label: string;
  value: string;
}

function StatusField({ label, value }: StatusFieldProps): JSX.Element {
  return (
    <div className="flex min-w-0 items-center gap-1" title={`${label}: ${value}`}>
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
  const preset = usePresetStore((state) => state.selectedPreset);
  const objectCount = useObjectStore((state) => state.objects.length);

  const objects = useObjectStore((state) => state.objects);
  const names = useMemo(() => getDisplayNames(objects), [objects]);

  const selectedObject = useObjectStore((state) =>
    state.objects.find(
      (object) => object.objectId === state.selectedObjectId,
    ) ?? null,
  );

  const selectedCount = useObjectStore(
    (state) => state.selectedObjectIds.length,
  );

  const selectedName =
    selectedCount > 1
      ? t("object.multipleSelected", { count: selectedCount })
      : selectedObject
        ? (names.get(selectedObject.objectId) ?? selectedObject.fileName)
        : "";

  const analysis = useAnalysisStore((state) =>
    selectedObject ? state.analysis[selectedObject.objectId] : undefined,
  );

  const none = t("statusBar.none");

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
        value={String(objectCount)}
      />
      <StatusField
        label={t("statusBar.analysisStatus")}
        value={analysis ? t(`result.${analysis.status}`) : none}
      />
      <StatusField
        label={t("statusBar.filament")}
        value={filament ? `${filament.brand} ${filament.name}` : none}
      />
      <StatusField
        label={t("statusBar.preset")}
        value={preset ? preset.name : none}
      />
      <StatusField
        label={t("statusBar.language")}
        value={t(LANGUAGE_NAME_KEYS[language])}
      />
      <StatusField label={t("statusBar.projectStatus")} value={none} />
    </footer>
  );
}
