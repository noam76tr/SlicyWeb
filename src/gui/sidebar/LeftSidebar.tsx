/**
 * SlicyWeb
 * Left Sidebar Component (Object Panel)
 *
 * List of the imported models (GUI_SPEC.md, Object Panel, Contents):
 * icon, object name, visibility toggle, lock toggle, selection state.
 *
 * Objects and selection come from the object store
 * (src/state/objectStore.ts). Clicking an object selects it.
 * The visibility and lock toggles show the state of the object;
 * changing them is not available yet (no store action exists).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import { Box, Eye, EyeOff, Lock, LockOpen } from "lucide-react";

import { useObjectStore } from "../../state/objectStore";
import { useTranslation } from "../hooks/useTranslation";

export default function LeftSidebar(): JSX.Element {
  const { t } = useTranslation();
  const objects = useObjectStore((state) => state.objects);
  const selectedObjectId = useObjectStore((state) => state.selectedObjectId);
  const selectObject = useObjectStore((state) => state.selectObject);

  if (objects.length === 0) {
    return (
      <p className="px-3 py-4 text-xs text-muted-foreground">
        {t("objects.empty")}
      </p>
    );
  }

  const notAvailable = t("app.notAvailable");

  return (
    <ul className="py-1" aria-label={t("objects.title")}>
      {objects.map((object) => {
        const selected = object.objectId === selectedObjectId;

        return (
          <li
            key={object.objectId}
            className={`flex items-center gap-2 px-2 py-1 text-xs ${
              selected ? "bg-primary/20" : "hover:bg-accent"
            }`}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-start"
              aria-pressed={selected}
              onClick={() => {
                selectObject(selected ? null : object.objectId);
              }}
            >
              <Box className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{object.fileName}</span>
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
  );
}
