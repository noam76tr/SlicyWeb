/**
 * SlicyWeb
 * Recovery Dialog
 *
 * At start, when a copy of the automatic save is still there (crash, power
 * cut, forced close; GUI_SPEC.md, Recovery Dialog; lot 111, decision 119
 * of Noam, Q19 A): "SlicyWeb did not close normally. Recover “cube”
 * (saved on 24/11 at 14:32)?" Recover (has the focus) opens the project,
 * marked modified; Ignore removes the copy. Escape is Ignore.
 *
 * The answer goes to ProjectService.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Recovery Dialog)
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
import {
  formatDay,
  formatTime,
  projectDisplayName,
} from "../project/projectFormat";

/** Id of the Recover button, which has the focus when the window opens */
const RECOVER_BUTTON_ID = "recovery-restore";

export default function RecoveryDialog(): JSX.Element {
  const { t, language } = useTranslation();
  const recovery = useProjectStore((state) => state.recovery);

  return (
    <Dialog
      open={recovery !== null}
      onOpenChange={(next) => {
        if (!next) void ProjectService.recover("ignore");
      }}
    >
      <DialogContent
        data-recovery
        initialFocus={() => document.getElementById(RECOVER_BUTTON_ID)}
      >
        <DialogHeader>
          <DialogTitle>{t("project.recovery.title")}</DialogTitle>
          {recovery && (
            <DialogDescription>
              {t("project.recovery.description", {
                name: projectDisplayName(
                  recovery.projectName,
                  t("project.untitled"),
                ),
                date: formatDay(recovery.savedAt, language),
                time: formatTime(recovery.savedAt, language),
              })}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void ProjectService.recover("ignore")}
          >
            {t("project.recovery.ignore")}
          </Button>
          <Button
            id={RECOVER_BUTTON_ID}
            size="sm"
            onClick={() => void ProjectService.recover("restore")}
          >
            {t("project.recovery.restore")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
