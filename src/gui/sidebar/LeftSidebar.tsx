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
 * Q4 A).
 *
 * Rename, Hide, Lock (lot 106, decision 112 of Noam, Q1 to Q18 A;
 * ObjectStateService):
 * - the name becomes a field in the row (Q2 A): double-click on the row,
 *   F2, or Rename in the context menu (startRename); its whole text is
 *   selected; Enter or a click elsewhere applies it, Escape cancels; a
 *   double-click never clears the selection;
 * - the eye hides or shows the object of its row only, the padlock locks
 *   or unlocks it, without changing the selection (Q9 A, Q16 A);
 * - a hidden object: the row in gray, the eye crossed out (Q11 A); a click
 *   still selects it;
 * - when the panel is collapsed, a rename opens it first (MainLayout).
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

import {
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Box, Eye, EyeOff, Lock, LockOpen, TriangleAlert } from "lucide-react";

import {
  MAX_NAME_LENGTH,
  ObjectStateService,
} from "../../services/ObjectStateService";
import { useObjectStore } from "../../state/objectStore";
import { usePlateCheckStore } from "../../state/plateCheckStore";
import { useTranslation } from "../hooks/useTranslation";
import { openContextMenu } from "../menus/ContextMenu";
import { usePlateWarningText } from "../plate/PlateMessage";

import { getDisplayNames } from "./objectNames";
import { startRename, stopRename, useRenameStore } from "./renameStore";

/**
 * Field of the name, in the row: Enter or leaving the field applies the
 * name, Escape cancels; the focus goes back to the row
 */
function NameField({
  objectId,
  value,
  label,
}: {
  objectId: string;
  value: string;
  label: string;
}): JSX.Element {
  const input = useRef<HTMLInputElement>(null);
  const done = useRef(false);

  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);

  const finish = (apply: boolean): void => {
    if (done.current) {
      return;
    }

    done.current = true;
    const text = input.current?.value ?? value;
    const row = input.current?.closest("li");
    stopRename();

    if (apply && text !== value) {
      ObjectStateService.rename(objectId, text);
    }

    // Back to the row (the field leaves the page)
    requestAnimationFrame(() => {
      row?.querySelector<HTMLElement>("[data-object-row]")?.focus();
    });
  };

  return (
    <input
      ref={input}
      type="text"
      defaultValue={value}
      maxLength={MAX_NAME_LENGTH}
      aria-label={label}
      data-name-field=""
      className="h-5 w-full min-w-0 rounded border border-ring bg-background px-1 text-xs text-foreground outline-none ring-2 ring-ring/50"
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          event.preventDefault();
          finish(true);
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          finish(false);
        }
      }}
      onBlur={() => finish(true)}
      onContextMenu={(event) => event.stopPropagation()}
    />
  );
}

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
  const renaming = useRenameStore((state) => state.objectId);
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

  /**
   * Left click in the panel, not on a row: nothing selected, as in the
   * Windows Explorer; with Ctrl or Shift, the selection stays (lot 106,
   * decision 114 of Noam, Q30 A)
   */
  const clearOnEmptyClick = (event: MouseEvent<HTMLElement>): void => {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      (event.target instanceof Element && event.target.closest("li"))
    ) {
      return;
    }

    selectObject(null);
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

  return (
    <div
      className="min-h-full"
      data-objects-empty-area=""
      onClick={clearOnEmptyClick}
      onContextMenu={openSceneMenu}
    >
      <ul className="py-1" aria-label={t("objects.title")}>
        {objects.map((object) => {
          const selected = selectedObjectIds.includes(object.objectId);
          const outside = reported.includes(object.objectId);
          const name = names.get(object.objectId) ?? object.fileName;
          const icon = outside ? (
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
            <Box
              className={`size-4 shrink-0 ${object.visible ? "" : "opacity-60"}`}
              aria-hidden="true"
            />
          );

          return (
            <li
              key={object.objectId}
              data-hidden={object.visible ? undefined : ""}
              data-locked={object.locked ? "" : undefined}
              className={`flex items-center gap-2 px-2 py-1 text-xs ${
                selected ? "bg-primary/20" : "hover:bg-accent"
              } ${object.visible ? "" : "text-muted-foreground"}`}
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
              {renaming === object.objectId ? (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {icon}
                  <NameField
                    objectId={object.objectId}
                    value={name}
                    label={t("objects.nameField")}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  data-object-row=""
                  className="flex min-w-0 flex-1 items-center gap-2 text-start"
                  aria-pressed={selected}
                  onClick={(event) => {
                    const add = event.ctrlKey || event.metaKey;

                    // Second click of a double-click: the selection stays
                    // (lot 106, Q2 A)
                    if (event.detail > 1) {
                      return;
                    }

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
                  onDoubleClick={() => {
                    // Rename (lot 106, Q2 A): this object only (Q6 A)
                    anchor.current = object.objectId;
                    selectObject(object.objectId);
                    startRename(object.objectId);
                  }}
                >
                  {icon}
                  <span className="truncate">{name}</span>
                </button>
              )}

              <button
                type="button"
                className={`rounded p-0.5 hover:bg-muted ${
                  object.visible ? "text-muted-foreground" : "text-foreground"
                }`}
                title={t(
                  object.visible ? "contextMenu.hide" : "contextMenu.show",
                )}
                aria-label={t("objects.visibility")}
                data-visibility-toggle=""
                onClick={() =>
                  ObjectStateService.setVisible(
                    [object.objectId],
                    !object.visible,
                  )
                }
              >
                {object.visible ? (
                  <Eye className="size-3.5" aria-hidden="true" />
                ) : (
                  <EyeOff className="size-3.5" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                className={`rounded p-0.5 hover:bg-muted ${
                  object.locked ? "text-foreground" : "text-muted-foreground"
                }`}
                title={t(
                  object.locked ? "contextMenu.unlock" : "contextMenu.lock",
                )}
                aria-label={t("objects.lock")}
                data-lock-toggle=""
                onClick={() =>
                  ObjectStateService.setLocked(
                    [object.objectId],
                    !object.locked,
                  )
                }
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
