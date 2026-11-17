/**
 * SlicyWeb
 * Context Menu
 *
 * Menu of the right click (lot 105, decisions of Noam Q1 to Q11 A;
 * GUI_SPEC.md, Object Context Menu):
 * - on an object (3D viewport or row of the Object Panel): Properties
 *   (opens the Object tab), Move, Rotate, Scale (mode of the gizmo, G, R,
 *   S), Duplicate (Ctrl+D), Delete (Del; confirmation for several objects),
 *   Optimize Orientation, Center On Bed, Reset Rotation And Scale (one
 *   action of the history), Recompute Analysis; they act on the selection
 *   (the object right-clicked is selected first when it was not);
 * - in the empty space (viewport, Object Panel under its rows): Import…
 *   (STL and 3MF, like the Import button), Select All (Ctrl+A), Arrange
 *   (A), Reset View (Home).
 *
 * openContextMenu() opens it at a point of the window (right click) or
 * under an element (Menu key, Shift+F10, on a row of the Object Panel).
 * It is placed after the point on the side where the text starts (to the
 * left of the pointer in Hebrew, Q11 A), above the point when there is no
 * room under it. An item that cannot act now is shown disabled (Q8 A).
 * Shortcuts are shown only, as in the Menu Bar, in Latin letters in the
 * three languages. Escape or a click outside closes it without action.
 *
 * Each item calls the command of the Menu Bar, of the Transform section
 * or of the Toolbar: no business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Object Context Menu, Keyboard Shortcuts)
 * - CLAUDE.md (Internationalization Rule, UI Development Rule)
 */

import { Fragment, useRef } from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { create } from "zustand";

import { AnalysisService } from "../../services/AnalysisService";
import { ArrangeService } from "../../services/ArrangeService";
import { ObjectEditService } from "../../services/ObjectEditService";
import { optimizeOrientation } from "../../services/OptimizationService";
import { PropertiesTabService } from "../../services/PropertiesTabService";
import { TransformService } from "../../services/TransformService";
import { useObjectStore } from "../../state/objectStore";
import { useOptimizationTaskStore } from "../../state/optimizationTaskStore";
import {
  useViewportStore,
  type TransformMode,
} from "../../state/viewportStore";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "../components/ui/dropdown-menu";
import { deleteSelectedObjects } from "../dialogs/DeleteObjectsDialog";
import { useTranslation } from "../hooks/useTranslation";
import { IMPORT_ACCEPT, openImportDialog } from "../import/openImportDialog";

export type ContextMenuKind = "object" | "scene";

/** Point of the window (right click) or element (keyboard) */
type ContextMenuAnchor = { x: number; y: number } | HTMLElement;

interface ContextMenuState {
  menu: {
    kind: ContextMenuKind;
    anchor: ContextMenuAnchor;
    /** Element that gets the focus back when the menu closes */
    returnFocus: HTMLElement | null;
    /** Changes at each opening: a new menu, at its new place */
    openId: number;
  } | null;
}

const useContextMenuStore = create<ContextMenuState>(() => ({ menu: null }));

let nextOpenId = 1;

/**
 * Opens the context menu of the selection (object) or of the scene, at a
 * point of the window or under an element; the selection must already be
 * the one the menu acts on
 */
export function openContextMenu(
  kind: ContextMenuKind,
  anchor: ContextMenuAnchor,
  returnFocus: HTMLElement | null = null,
): void {
  useContextMenuStore.setState({
    menu: { kind, anchor, returnFocus, openId: nextOpenId++ },
  });
}

function closeContextMenu(): void {
  useContextMenuStore.setState({ menu: null });
}

interface ContextMenuItem {
  /** Dictionary key of the label */
  key: string;

  /** Shortcut shown next to the label (GUI_SPEC.md, Keyboard Shortcuts) */
  shortcut?: string;

  action: () => void;

  /**
   * Enabled only when objects are selected, or the scene has objects, or
   * the scene has objects and no search of orientation runs
   */
  needs?: "selection" | "objects" | "optimize";
}

function selection(): string[] {
  return [...useObjectStore.getState().selectedObjectIds];
}

function setMode(mode: TransformMode): () => void {
  return () => useViewportStore.getState().setTransformMode(mode);
}

const OBJECT_MENU: ContextMenuItem[][] = [
  [
    {
      key: "contextMenu.properties",
      action: () => PropertiesTabService.choose("object"),
    },
  ],
  [
    {
      key: "transform.move",
      shortcut: "G",
      needs: "selection",
      action: setMode("translate"),
    },
    {
      key: "transform.rotate",
      shortcut: "R",
      needs: "selection",
      action: setMode("rotate"),
    },
    {
      key: "transform.scale",
      shortcut: "S",
      needs: "selection",
      action: setMode("scale"),
    },
  ],
  [
    {
      key: "edit.duplicate",
      shortcut: "Ctrl+D",
      needs: "selection",
      action: () => {
        ObjectEditService.duplicateSelection();
      },
    },
    {
      key: "edit.delete",
      shortcut: "Del",
      needs: "selection",
      action: deleteSelectedObjects,
    },
  ],
  [
    {
      key: "tools.optimizeOrientation",
      needs: "optimize",
      action: optimizeOrientation,
    },
    {
      key: "transform.centerOnBed",
      needs: "selection",
      action: () => {
        TransformService.centerGroupOnBed(selection());
      },
    },
    {
      key: "contextMenu.resetRotationScale",
      needs: "selection",
      action: () => {
        TransformService.resetGroupRotationAndScale(selection());
      },
    },
  ],
  [
    {
      key: "tools.recomputeAnalysis",
      needs: "selection",
      action: () => AnalysisService.recompute(selection()),
    },
  ],
];

const SCENE_MENU: ContextMenuItem[][] = [
  [
    {
      key: "contextMenu.import",
      action: () => openImportDialog(IMPORT_ACCEPT.all),
    },
  ],
  [
    {
      key: "edit.selectAll",
      shortcut: "Ctrl+A",
      needs: "objects",
      action: () => useObjectStore.getState().selectAllObjects(),
    },
    {
      key: "edit.arrange",
      shortcut: "A",
      needs: "objects",
      action: () => {
        ArrangeService.arrange();
      },
    },
  ],
  [
    {
      key: "view.resetView",
      shortcut: "Home",
      action: () => useViewportStore.getState().requestView("reset"),
    },
  ],
];

/** Element of zero size at a point of the window (Base UI virtual anchor) */
function pointAnchor(x: number, y: number) {
  return {
    getBoundingClientRect: () =>
      DOMRect.fromRect({ x, y, width: 0, height: 0 }),
  };
}

export default function ContextMenu(): JSX.Element {
  const { t } = useTranslation();
  const menu = useContextMenuStore((state) => state.menu);
  const hasObjects = useObjectStore((state) => state.objects.length > 0);
  const hasSelection = useObjectStore(
    (state) => state.selectedObjectIds.length > 0,
  );
  const optimizing = useOptimizationTaskStore((state) => state.running);

  // Kept while the menu closes (animation): its content does not change
  const shown = useRef(menu);
  if (menu) {
    shown.current = menu;
  }
  const current = shown.current;

  const isDisabled = (item: ContextMenuItem): boolean =>
    (item.needs === "selection" && !hasSelection) ||
    (item.needs === "objects" && !hasObjects) ||
    (item.needs === "optimize" && !(hasObjects && !optimizing));

  /**
   * Focus when the menu closes: the element given at the opening (row of
   * the Object Panel); none when the item opened a window (Delete
   * confirmation), which keeps the focus it chose
   */
  const finalFocus = (): HTMLElement | boolean => {
    if (document.querySelector('[role="dialog"][data-open]')) {
      return false;
    }

    return current?.returnFocus?.isConnected ? current.returnFocus : false;
  };

  const groups = current?.kind === "scene" ? SCENE_MENU : OBJECT_MENU;
  const anchor = current
    ? current.anchor instanceof HTMLElement
      ? current.anchor
      : pointAnchor(current.anchor.x, current.anchor.y)
    : null;

  return (
    <MenuPrimitive.Root
      key={current?.openId ?? 0}
      open={menu !== null}
      onOpenChange={(open) => {
        if (!open) {
          closeContextMenu();
        }
      }}
    >
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          className="isolate z-50 outline-none"
          anchor={anchor}
          side="bottom"
          align="start"
          sideOffset={2}
        >
          <MenuPrimitive.Popup
            data-slot="context-menu"
            data-context-menu={current?.kind}
            aria-label={t(
              current?.kind === "scene"
                ? "contextMenu.sceneTitle"
                : "contextMenu.objectTitle",
            )}
            finalFocus={finalFocus}
            className="z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            {groups.map((group, index) => (
              <Fragment key={group[0].key}>
                {index > 0 && <DropdownMenuSeparator />}

                {group.map((item) => (
                  <DropdownMenuItem
                    key={item.key}
                    disabled={isDisabled(item)}
                    onClick={() => item.action()}
                  >
                    {t(item.key)}
                    {item.shortcut && (
                      <DropdownMenuShortcut dir="ltr" className="ps-6">
                        {item.shortcut}
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                ))}
              </Fragment>
            ))}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
