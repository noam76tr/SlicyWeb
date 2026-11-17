/**
 * SlicyWeb
 * Left Sidebar Component (Object Panel)
 *
 * List of the imported models (GUI_SPEC.md, Object Panel, Contents):
 * icon, object name, visibility toggle, lock toggle, selection state.
 *
 * Objects and selection come from the object store
 * (src/state/objectStore.ts). Clicking an object selects it (clicking the
 * only selected object clears the selection); Ctrl+click (Cmd+click) adds
 * it to the selection or removes it; Shift+click selects the range from
 * the last object clicked to this one, as in the Windows File Explorer
 * (Ctrl+Shift+click adds the range) (Phase 6, decisions of Noam).
 * An object out of the build volume shows the warning icon in orange
 * instead of its cube icon, with the text of the warning for screen
 * readers and as tooltip (lot 101, Q2 A; updated at the end of a gesture,
 * Q4 A). The visibility and lock toggles show the state of the object;
 * changing them is not available yet (no store action exists).
 *
 * Context menu (lot 105, decisions of Noam Q5, Q7, Q9 A; ContextMenu):
 * a right click on a row opens the menu of the selection at the pointer
 * (an object that is not selected becomes the only selected object
 * first, an object already selected keeps the whole selection); the Menu
 * key or Shift+F10 on a row opens it under the row, and the focus comes
 * back to the row when it closes; a right click in the panel under the
 * rows opens the menu of the scene.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import { useMemo, useRef, type MouseEvent } from "react";
import { Box, Eye, EyeOff, Lock, LockOpen, TriangleAlert } from "lucide-react";

import { useObjectStore } from "../../state/objectStore";
import { usePlateCheckStore } from "../../state/plateCheckStore";
import { useTranslation } from "../hooks/useTranslation";
import { openContextMenu } from "../menus/ContextMenu";
import { usePlateWarningText } from "../plate/PlateMessage";

import { getDisplayNames } from "./objectNames";

export default function LeftSidebar(): JSX.Element {
  const { t } = useTranslation();
  const objects = useObjectStore((state) => state.objects);
  const selectedObjectIds = useObjectStore((state) => state.selectedObjectIds);
  const selectObject = useObjectStore((state) => state.selectObject);
  const toggleObjectSelection = useObjectStore(
    (state) => state.toggleObjectSelection,
  );
  const selectObjects = useObjectStore((state) => state.selectObjects);
  const reported = usePlateCheckStore((state) => state.reportedObjectIds);
  const warningText = usePlateWarningText();

  // Start of the Shift+click range: the last object clicked without Shift
  const anchor = useRef<string | null>(null);
  const names = useMemo(() => getDisplayNames(objects), [objects]);

  /**
   * Right click in the panel, not on a row (handled by the row): menu of
   * the scene at the pointer
   */
  const openSceneMenu = (event: MouseEvent<HTMLElement>): void => {
    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    openContextMenu(
      "scene",
      event.button === 2
        ? { x: event.clientX, y: event.clientY }
        : event.currentTarget,
    );
  };

  if (objects.length === 0) {
    return (
      <div className="min-h-full" onContextMenu={openSceneMenu}>
        <p className="px-3 py-4 text-xs text-muted-foreground">
          {t("objects.empty")}
        </p>
      </div>
    );
  }

  const notAvailable = t("app.notAvailable");

  return (
    <div className="min-h-full" onContextMenu={openSceneMenu}>
      <ul className="py-1" aria-label={t("objects.title")}>
        {objects.map((object) => {
          const selected = selectedObjectIds.includes(object.objectId);
          const outside = reported.includes(object.objectId);

          return (
            <li
              key={object.objectId}
              className={`flex items-center gap-2 px-2 py-1 text-xs ${
                selected ? "bg-primary/20" : "hover:bg-accent"
              }`}
              onContextMenu={(event) => {
                event.preventDefault();

                if (!selected) {
                  anchor.current = object.objectId;
                  selectObject(object.objectId);
                }

                // Right button: at the pointer; keyboard: under the row
                openContextMenu(
                  "object",
                  event.button === 2
                    ? { x: event.clientX, y: event.clientY }
                    : event.currentTarget,
                  event.currentTarget.querySelector("button"),
                );
              }}
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 text-start"
                aria-pressed={selected}
                onClick={(event) => {
                  const add = event.ctrlKey || event.metaKey;

                  if (event.shiftKey) {
                    // Range from the anchor (or the last object selected)
                    const ids = objects.map((item) => item.objectId);
                    const from = ids.indexOf(
                      anchor.current ??
                        useObjectStore.getState().selectedObjectId ??
                        object.objectId,
                    );
                    const to = ids.indexOf(object.objectId);
                    const range = ids.slice(
                      Math.min(from, to) < 0 ? to : Math.min(from, to),
                      Math.max(from, to) + 1,
                    );

                    selectObjects(
                      add
                        ? [
                            ...selectedObjectIds,
                            ...range.filter(
                              (id) => !selectedObjectIds.includes(id),
                            ),
                          ]
                        : range,
                    );
                    return;
                  }

                  anchor.current = object.objectId;

                  if (add) {
                    toggleObjectSelection(object.objectId);
                  } else if (selected && selectedObjectIds.length === 1) {
                    selectObject(null);
                  } else {
                    selectObject(object.objectId);
                  }
                }}
              >
                {outside ? (
                  <span
                    role="img"
                    aria-label={warningText([object.objectId])}
                    title={warningText([object.objectId])}
                    data-outside-icon=""
                    className="shrink-0 text-warning"
                  >
                    <TriangleAlert className="size-4" aria-hidden="true" />
                  </span>
                ) : (
                  <Box className="size-4 shrink-0" aria-hidden="true" />
                )}
                <span className="truncate">
                  {names.get(object.objectId) ?? object.fileName}
                </span>
              </button>

              <button
                type="button"
                disabled
                className="text-muted-foreground disabled:opacity-60"
                title={`${t("objects.visibility")} (${notAvailable})`}
                aria-label={t("objects.visibility")}
              >
                {object.visible ? (
                  <Eye className="size-3.5" aria-hidden="true" />
                ) : (
                  <EyeOff className="size-3.5" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                disabled
                className="text-muted-foreground disabled:opacity-60"
                title={`${t("objects.lock")} (${notAvailable})`}
                aria-label={t("objects.lock")}
              >
                {object.locked ? (
                  <Lock className="size-3.5" aria-hidden="true" />
                ) : (
                  <LockOpen className="size-3.5" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
