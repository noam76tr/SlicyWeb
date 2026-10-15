/**
 * SlicyWeb
 * Main Layout
 *
 * Responsible for:
 * - Main application layout (GUI_SPEC.md, Main Window)
 * - Panel organization
 * - View structure
 *
 * Areas, from top to bottom:
 * - header: Menu Bar and Toolbar;
 * - Object Panel (start side), Viewport (center), Properties Panel
 *   (end side);
 * - Status Bar.
 *
 * Object Panel and Properties Panel are resizable and collapsible
 * (GUI_SPEC.md, Object Panel, Properties Panel, Responsive Behavior).
 * Their width is kept when the window is resized; the viewport takes
 * the remaining space. A collapsed panel stays visible as a narrow
 * bar with a button to expand it.
 *
 * In Hebrew (dir="rtl"), the start side is on the right: the Object
 * Panel and the Properties Panel swap sides.
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - FILE_STRUCTURE.md
 */

import { useState, type ReactNode } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { usePanelRef } from "react-resizable-panels";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { useTranslation } from "./hooks/useTranslation";

interface MainLayoutProps {
  header?: ReactNode;

  leftTitle: string;

  leftPanel: ReactNode;

  centerPanel: ReactNode;

  rightTitle: string;

  rightPanel: ReactNode;

  statusBar?: ReactNode;
}

/** Width of a collapsed panel, in pixels */
const COLLAPSED_SIZE = 40;

type Side = "start" | "end";

interface SidePanelProps {
  id: string;
  side: Side;
  title: string;
  defaultSize: number;
  minSize: number;
  maxSize: string;
  children: ReactNode;
}

function SidePanel({
  id,
  side,
  title,
  defaultSize,
  minSize,
  maxSize,
  children,
}: SidePanelProps): JSX.Element {
  const { t } = useTranslation();
  const panelRef = usePanelRef();
  const [collapsed, setCollapsed] = useState(false);

  // Icons are drawn for left-to-right; they are mirrored in
  // right-to-left (rtl:-scale-x-100), where the sides are swapped.
  const CollapseIcon = side === "start" ? PanelLeftClose : PanelRightClose;
  const ExpandIcon = side === "start" ? PanelLeftOpen : PanelRightOpen;

  const toggle = (): void => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  const buttonLabel = collapsed ? t("panel.expand") : t("panel.collapse");

  const button = (
    <button
      type="button"
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      aria-label={`${buttonLabel}: ${title}`}
      title={buttonLabel}
      aria-expanded={!collapsed}
      aria-controls={id}
      onClick={toggle}
    >
      {collapsed ? (
        <ExpandIcon className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      ) : (
        <CollapseIcon className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      )}
    </button>
  );

  return (
    <ResizablePanel
      id={id}
      panelRef={panelRef}
      collapsible
      collapsedSize={COLLAPSED_SIZE}
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      groupResizeBehavior="preserve-pixel-size"
      onResize={() => {
        setCollapsed(panelRef.current?.isCollapsed() ?? false);
      }}
      className="bg-card text-card-foreground"
    >
      {collapsed ? (
        <div className="flex h-full flex-col items-center py-1.5">
          {button}
        </div>
      ) : (
        <section aria-label={title} className="flex h-full min-w-0 flex-col">
          <header className="flex h-9 shrink-0 items-center gap-2 border-b border-border ps-3 pe-1.5">
            <h2 className="flex-1 truncate text-sm font-semibold">{title}</h2>
            {button}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </section>
      )}
    </ResizablePanel>
  );
}

export default function MainLayout({
  header,
  leftTitle,
  leftPanel,
  centerPanel,
  rightTitle,
  rightPanel,
  statusBar,
}: MainLayoutProps): JSX.Element {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {header}

      <main className="min-h-0 flex-1">
        <ResizablePanelGroup orientation="horizontal">
          <SidePanel
            id="object-panel"
            side="start"
            title={leftTitle}
            defaultSize={260}
            minSize={200}
            maxSize="40%"
          >
            {leftPanel}
          </SidePanel>

          <ResizableHandle />

          <ResizablePanel id="viewport-panel" minSize="30%">
            {centerPanel}
          </ResizablePanel>

          <ResizableHandle />

          <SidePanel
            id="properties-panel"
            side="end"
            title={rightTitle}
            defaultSize={320}
            minSize={260}
            maxSize="40%"
          >
            {rightPanel}
          </SidePanel>
        </ResizablePanelGroup>
      </main>

      {statusBar}
    </div>
  );
}
