/**
 * SlicyWeb
 * Toolbar
 *
 * The buttons of GUI_SPEC.md (Toolbar Buttons): Import, Save, Undo, Redo,
 * Reset, Analyze, Optimize, Generate. Move, Rotate and Scale are shown
 * over the 3D viewport only (TransformModeBar; decision of Noam, Phase 6).
 *
 * Import (Phase 5) opens the system file dialog (STL and 3MF). Undo and
 * Redo (Phase 6) undo and redo the last change of transform
 * (TransformService); they are disabled while their history is empty
 * (UNDO_REDO_SPEC.md, Disabled State). Analyze (Phase 9 lot 80) does the
 * same as Tools > Analyze Models (AnalysisService); it is disabled while the
 * scene has no object. Generate (Phase 10 lot 88) does the same as Tools >
 * Generate Recommendations (RecommendationService); it is disabled while
 * the scene has no object, or no printer or no material is selected
 * (ADR-035 D11). The other buttons are visible and
 * disabled until the phase that provides their action. They use aria-disabled
 * instead of disabled, so that their tooltip ("available in a later
 * version") is still shown and they stay reachable with the keyboard.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Toolbar Buttons)
 * - CLAUDE.md (Internationalization Rule)
 */

import { Fragment } from "react";
import {
  Redo2,
  RotateCcw,
  Save,
  ScanSearch,
  Sparkles,
  Undo2,
  Upload,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import { AnalysisService } from "../../services/AnalysisService";
import { generateRecommendations } from "../../services/RecommendationService";
import { TransformService } from "../../services/TransformService";
import { useHistoryStore } from "../../state/historyStore";
import { useMaterialStore } from "../../state/materialStore";
import { useObjectStore } from "../../state/objectStore";
import { usePrinterStore } from "../../state/printerStore";
import { useTranslation } from "../hooks/useTranslation";
import { IMPORT_ACCEPT, openImportDialog } from "../import/openImportDialog";

interface ToolbarButtonDefinition {
  /** Dictionary key of the button label */
  key: string;

  icon: LucideIcon;

  /** The icon has a direction and is mirrored in right-to-left */
  mirrorInRtl?: boolean;

  /** Action of the button; a button without action is disabled */
  action?: () => void;

  /** History read to enable the button (Undo, Redo) */
  history?: "undo" | "redo";

  /** Shortcut shown in the tooltip */
  shortcut?: string;

  /** Enabled only when the scene has objects */
  needsObjects?: boolean;

  /** Enabled only when a printer and a material are selected */
  needsPrinterAndMaterial?: boolean;
}

/** Groups of buttons, separated by a line */
const TOOLBAR_GROUPS: ToolbarButtonDefinition[][] = [
  [
    {
      key: "toolbar.import",
      icon: Upload,
      action: () => openImportDialog(IMPORT_ACCEPT.all),
    },
    { key: "toolbar.save", icon: Save },
  ],
  [
    {
      key: "toolbar.undo",
      icon: Undo2,
      mirrorInRtl: true,
      history: "undo",
      shortcut: "Ctrl+Z",
      action: () => {
        TransformService.undo();
      },
    },
    {
      key: "toolbar.redo",
      icon: Redo2,
      mirrorInRtl: true,
      history: "redo",
      shortcut: "Ctrl+Y",
      action: () => {
        TransformService.redo();
      },
    },
  ],
  [{ key: "toolbar.reset", icon: RotateCcw }],
  [
    {
      key: "toolbar.analyze",
      icon: ScanSearch,
      needsObjects: true,
      action: () => AnalysisService.analyzeModels(),
    },
    { key: "toolbar.optimize", icon: Sparkles },
    {
      key: "toolbar.generate",
      icon: WandSparkles,
      needsObjects: true,
      needsPrinterAndMaterial: true,
      action: generateRecommendations,
    },
  ],
];

export default function Toolbar(): JSX.Element {
  const { t } = useTranslation();
  const canUndo = useHistoryStore((state) => state.undoStack.length > 0);
  const canRedo = useHistoryStore((state) => state.redoStack.length > 0);
  const hasObjects = useObjectStore((state) => state.objects.length > 0);
  const hasPrinter = usePrinterStore((state) => state.selectedPrinter !== null);
  const hasMaterial = useMaterialStore(
    (state) => state.selectedMaterial !== null,
  );

  const notAvailable = t("app.notAvailable");

  return (
    <div
      role="toolbar"
      aria-label={t("toolbar.title")}
      className="flex h-11 shrink-0 items-center gap-1 overflow-x-auto border-b border-border bg-card px-2"
    >
      {TOOLBAR_GROUPS.map((group, index) => (
        <Fragment key={group[0].key}>
          {index > 0 && (
            <div
              className="mx-1 h-6 w-px shrink-0 bg-border"
              aria-hidden="true"
            />
          )}

          {group.map((button) => {
            const Icon = button.icon;
            const label = t(button.key);
            // Not available before its phase: the tooltip says so
            const notYet = !button.action;
            const empty =
              (button.history === "undo" && !canUndo) ||
              (button.history === "redo" && !canRedo) ||
              (button.needsObjects === true && !hasObjects) ||
              (button.needsPrinterAndMaterial === true &&
                !(hasPrinter && hasMaterial));
            const disabled = notYet || empty;
            const title = notYet
              ? `${label} (${notAvailable})`
              : button.shortcut
                ? `${label} (${button.shortcut})`
                : label;

            return (
              <button
                key={button.key}
                type="button"
                aria-disabled={disabled || undefined}
                title={title}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:hover:bg-transparent"
                onClick={disabled ? undefined : button.action}
              >
                <Icon
                  className={`size-4 ${button.mirrorInRtl ? "rtl:-scale-x-100" : ""}`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
