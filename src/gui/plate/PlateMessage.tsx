/**
 * SlicyWeb
 * Plate Message
 *
 * Message over the viewport while objects go out of the build volume (lot
 * 101, decision 103 of Noam: Q2 A, Q4 A; SCN_001, warning, blocks
 * nothing): "cube is outside the build volume" for one object, "3 objects
 * are outside the build volume" for several. Shown like the messages of
 * the import and of the analysis, in the warning color, without a Close
 * button: it goes away by itself when every object is back inside (moved,
 * Arrange, undo, object deleted, other printer). Updated at the end of a
 * gesture only (reportedObjectIds), so that it does not blink while an
 * object is dragged.
 *
 * The message never stops the clicks in the viewport under it (lot 55).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Plate Check, Error Handling UI)
 * - ERROR_CODES_SPEC.md (SCN_001)
 */

import { useMemo } from "react";

import { useObjectStore } from "../../state/objectStore";
import { usePlateCheckStore } from "../../state/plateCheckStore";
import { useTranslation } from "../hooks/useTranslation";
import { getDisplayNames } from "../sidebar/objectNames";

/** Text of the warning for these objects (one name, or their number) */
export function usePlateWarningText(): (objectIds: string[]) => string {
  const { t } = useTranslation();
  const objects = useObjectStore((state) => state.objects);
  const names = useMemo(() => getDisplayNames(objects), [objects]);

  return (objectIds) => {
    if (objectIds.length === 1) {
      const object = objects.find((item) => item.objectId === objectIds[0]);

      return t("plate.outsideOne", {
        name: names.get(objectIds[0]) ?? object?.fileName ?? "",
      });
    }

    return t("plate.outsideMany", { count: objectIds.length });
  };
}

export default function PlateMessage(): JSX.Element | null {
  const reported = usePlateCheckStore((state) => state.reportedObjectIds);
  const text = usePlateWarningText();

  if (reported.length === 0) {
    return null;
  }

  return (
    <p
      role="status"
      aria-live="polite"
      data-plate-warning={reported.length}
      className="pointer-events-none rounded-md border border-warning bg-card px-3 py-2 text-xs break-words text-warning shadow-md"
    >
      {text(reported)}
    </p>
  );
}
