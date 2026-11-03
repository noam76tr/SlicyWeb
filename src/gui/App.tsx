/**
 * SlicyWeb
 * App
 *
 * Main application component: assembles the main window
 * (GUI_SPEC.md, Main Window) in MainLayout:
 * Menu Bar, Toolbar, Object Panel, Viewport, Properties Panel,
 * Status Bar.
 *
 * DirectionProvider gives the text direction of the current language
 * to the Base UI components (menus): keyboard navigation and popup
 * placement follow right-to-left in Hebrew.
 *
 * Texts come from the translation dictionaries (useTranslation).
 *
 * The viewport receives the function that applies a transform
 * (TransformService, Phase 6): gizmos and dragging on the plate.
 * The buttons Move, Rotate, Scale (TransformModeBar) are shown over the
 * viewport. Undo and redo: Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z
 * (useUndoRedoShortcuts), toolbar and Edit menu (TransformService).
 * Ctrl+A selects all the objects (useSelectAllShortcut).
 *
 * At start, the printers loaded by the main process are read, and the
 * last printer is selected again (PrinterSelectionService, Phase 7).
 * The Printer Manager (PrinterManagerDialog) adds, changes and removes
 * the printers entered by the user (Phase 7 lot 61); the Filament
 * Manager (FilamentManagerDialog) the filaments entered by the user
 * (Phase 8 lot 71).
 *
 * The analysis of the objects starts by itself (AnalysisService, Phase 9
 * lot 80): after the import of each object, and when its analysis
 * becomes outdated (ADR-034 D7).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - FILE_STRUCTURE.md
 */

import { useEffect } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import { formatNumber } from "../i18n/NumberFormatter";
import { AnalysisService } from "../services/AnalysisService";
import { MaterialSelectionService } from "../services/MaterialSelectionService";
import { PrinterSelectionService } from "../services/PrinterSelectionService";
import { TransformService } from "../services/TransformService";
import { usePrinterStore } from "../state/printerStore";

import MainLayout from "./MainLayout";
import FilamentManagerDialog from "./dialogs/FilamentManagerDialog";
import PrinterManagerDialog from "./dialogs/PrinterManagerDialog";
import { useTranslation } from "./hooks/useTranslation";
import { useSelectAllShortcut } from "./hooks/useSelectAllShortcut";
import { useUndoRedoShortcuts } from "./hooks/useUndoRedoShortcuts";
import MenuBar from "./menus/MenuBar";
import LeftSidebar from "./sidebar/LeftSidebar";
import RightSidebar from "./sidebar/RightSidebar";
import StatusBar from "./statusbar/StatusBar";
import Toolbar from "./toolbars/Toolbar";
import TransformModeBar from "./toolbars/TransformModeBar";
import ImportDropZone from "./import/ImportDropZone";
import Viewport from "./viewport/Viewport";

export default function App(): JSX.Element {
  const { t, direction, language } = useTranslation();
  const printer = usePrinterStore((state) => state.selectedPrinter);
  const buildVolume = usePrinterStore(
    (state) => state.selectedPrinter?.buildVolume ?? null,
  );
  useUndoRedoShortcuts();
  useSelectAllShortcut();

  useEffect(() => {
    document.title = "SlicyWeb";
    void PrinterSelectionService.load();
    void MaterialSelectionService.load();
  }, []);

  useEffect(() => AnalysisService.start(), []);

  const header = (
    <header className="shrink-0">
      <div className="flex h-9 items-center gap-3 border-b border-border bg-card px-3">
        <span className="text-sm font-semibold">SlicyWeb</span>
        <MenuBar />
      </div>

      <Toolbar />
    </header>
  );

  return (
    <DirectionProvider direction={direction}>
      <MainLayout
        header={header}
        leftTitle={t("objects.title")}
        leftPanel={<LeftSidebar />}
        centerPanel={
          <ImportDropZone>
            <Viewport
              label={t("viewport.title")}
              unavailableMessage={t("viewport.unavailable")}
              plateLabel={
                buildVolume
                  ? t("viewport.plate", {
                      x: formatNumber(buildVolume.x, language),
                      y: formatNumber(buildVolume.y, language),
                    })
                  : null
              }
              printerName={printer ? `${printer.brand} ${printer.model}` : null}
              cubeLabels={{
                top: t("viewCube.top"),
                bottom: t("viewCube.bottom"),
                front: t("viewCube.front"),
                back: t("viewCube.back"),
                left: t("viewCube.left"),
                right: t("viewCube.right"),
              }}
              onTransformObjects={(transforms, live) =>
                TransformService.applyMany(transforms, { live })
              }
              onTransformGesture={(objectIds, phase) =>
                phase === "start"
                  ? TransformService.beginGesture(objectIds)
                  : TransformService.endGesture()
              }
            />
            <TransformModeBar />
          </ImportDropZone>
        }
        rightTitle={t("properties.title")}
        rightPanel={<RightSidebar />}
        statusBar={<StatusBar />}
      />
      <PrinterManagerDialog />
      <FilamentManagerDialog />
    </DirectionProvider>
  );
}
