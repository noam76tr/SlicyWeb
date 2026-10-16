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
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - FILE_STRUCTURE.md
 */

import { useEffect } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import MainLayout from "./MainLayout";
import { useTranslation } from "./hooks/useTranslation";
import MenuBar from "./menus/MenuBar";
import LeftSidebar from "./sidebar/LeftSidebar";
import RightSidebar from "./sidebar/RightSidebar";
import StatusBar from "./statusbar/StatusBar";
import Toolbar from "./toolbars/Toolbar";
import ImportDropZone from "./import/ImportDropZone";
import Viewport from "./viewport/Viewport";

export default function App(): JSX.Element {
  const { t, direction } = useTranslation();

  useEffect(() => {
    document.title = "SlicyWeb";
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
            />
          </ImportDropZone>
        }
        rightTitle={t("properties.title")}
        rightPanel={<RightSidebar />}
        statusBar={<StatusBar />}
      />
    </DirectionProvider>
  );
}
