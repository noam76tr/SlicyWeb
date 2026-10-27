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
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - FILE_STRUCTURE.md
 */

import { useEffect } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import { PrinterSelectionService } from "../services/PrinterSelectionService";
import { TransformService } from "../services/TransformService";
import { usePrinterStore } from "../state/printerStore";

import MainLayout from "./MainLayout";
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
  const { t, direction } = useTranslation();
  const buildVolume = usePrinterStore(
    (state) => state.selectedPrinter?.buildVolume ?? null,
  );
  useUndoRedoShortcuts();
  useSelectAllShortcut();

  useEffect(() => {
    document.title = "SlicyWeb";
    void PrinterSelectionService.load();
  }, []);

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
                  ? t("viewport.plate", { x: buildVolume.x, y: buildVolume.y })
                  : null
              }
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
    </DirectionProvider>
  );
}
