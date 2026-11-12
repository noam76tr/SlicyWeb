/**
 * SlicyWeb
 * Delete Objects Dialog
 *
 * Edit > Delete and the Delete key (lot 100; GUI_SPEC.md, Edit Menu,
 * Delete Confirmation): deleteSelectedObjects() deletes the selected
 * object at once; with several objects selected, it asks first:
 * "Delete 3 objects?", with Cancel and Delete. Delete has the focus when
 * the window opens (lot 100, Q4: Delete then Enter is enough; Ctrl+Z puts
 * the objects back). Escape or Cancel deletes nothing. The objects
 * deleted are those selected when the question was asked.
 *
 * No business logic: the deletion is ObjectEditService.remove().
 *
 * Based on:
 * - GUI_SPEC.md (Edit Menu, Keyboard Shortcuts, Delete Confirmation)
 * - UNDO_REDO_SPEC.md (2.4.0: Delete Actions)
 * - CLAUDE.md (Internationalization Rule)
 */

import { create } from "zustand";

import { formatNumber } from "../../i18n/NumberFormatter";
import { ObjectEditService } from "../../services/ObjectEditService";
import { useObjectStore } from "../../state/objectStore";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useTranslation } from "../hooks/useTranslation";

/** Objects waiting for the confirmation; empty when the window is closed */
const useConfirmStore = create<{ objectIds: string[] }>(() => ({
  objectIds: [],
}));

/**
 * Deletes the selected objects: at once for one object, after the
 * confirmation for several.
 */
export function deleteSelectedObjects(): void {
  const objectIds = [...useObjectStore.getState().selectedObjectIds];

  if (objectIds.length === 1) {
    ObjectEditService.remove(objectIds);
  } else if (objectIds.length > 1) {
    useConfirmStore.setState({ objectIds });
  }
}

/** True while the confirmation is shown */
export function isDeleteConfirmationOpen(): boolean {
  return useConfirmStore.getState().objectIds.length > 0;
}

/** Id of the Delete button, which has the focus when the window opens */
const DELETE_BUTTON_ID = "delete-objects-confirm";

function close(): void {
  useConfirmStore.setState({ objectIds: [] });
}

export default function DeleteObjectsDialog(): JSX.Element {
  const { t, language } = useTranslation();
  const objectIds = useConfirmStore((state) => state.objectIds);

  return (
    <Dialog
      open={objectIds.length > 0}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent
        initialFocus={() => document.getElementById(DELETE_BUTTON_ID)}
      >
        <DialogHeader>
          <DialogTitle>
            {t("edit.deleteConfirmTitle", {
              count: formatNumber(objectIds.length, language),
            })}
          </DialogTitle>
          <DialogDescription>{t("edit.deleteConfirmUndo")}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={close}>
            {t("action.cancel")}
          </Button>
          <Button
            id={DELETE_BUTTON_ID}
            variant="destructive"
            size="sm"
            onClick={() => {
              const ids = useConfirmStore.getState().objectIds;
              close();
              ObjectEditService.remove(ids);
            }}
          >
            {t("action.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
