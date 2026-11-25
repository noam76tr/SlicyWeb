/**
 * SlicyWeb
 * Unsaved Changes Dialog
 *
 * "Save the changes of “cube”?" (GUI_SPEC.md, Unsaved Changes Dialog; lot
 * 111, decision 119 of Noam, Q13 A): shown before New, Open, a recent
 * project, a project dropped, Close, Quit and the close button of the
 * window, when the project is modified. Three buttons: Save (has the
 * focus), Don't Save, Cancel; Escape is Cancel. Save on a project never
 * saved opens Save As first; when it is cancelled, nothing happens.
 *
 * The answer goes to ProjectService.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Unsaved Changes Dialog)
 */

import { ProjectService } from "../../services/ProjectService";
import { useProjectStore } from "../../state/projectStore";
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
import { projectDisplayName } from "../project/projectFormat";

/** Id of the Save button, which has the focus when the window opens */
const SAVE_BUTTON_ID = "unsaved-changes-save";

export default function UnsavedChangesDialog(): JSX.Element {
  const { t } = useTranslation();
  const pending = useProjectStore((state) => state.pending);
  const projectName = useProjectStore((state) => state.projectName);

  return (
    <Dialog
      open={pending !== null}
      onOpenChange={(next) => {
        if (!next) void ProjectService.answer("cancel");
      }}
    >
      <DialogContent
        data-unsaved-changes
        initialFocus={() => document.getElementById(SAVE_BUTTON_ID)}
      >
        <DialogHeader>
          <DialogTitle>
            {t("project.unsaved.title", {
              name: projectDisplayName(projectName, t("project.untitled")),
            })}
          </DialogTitle>
          <DialogDescription>{t("project.unsaved.description")}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void ProjectService.answer("cancel")}
          >
            {t("action.cancel")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void ProjectService.answer("discard")}
          >
            {t("project.unsaved.discard")}
          </Button>
          <Button
            id={SAVE_BUTTON_ID}
            size="sm"
            onClick={() => void ProjectService.answer("save")}
          >
            {t("action.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
