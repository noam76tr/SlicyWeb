/**
 * SlicyWeb
 * Plate Check Service
 *
 * Finds the objects that go out of the build volume of the selected
 * printer (lot 101, decision 103 of Noam: Q1 to Q4 A), as soon as it
 * happens, not only before an export:
 * - after every change of the objects (import, move, rotation, scale,
 *   Arrange, Delete, Duplicate, undo, redo) and of the selected printer;
 * - during a gesture (drag, gizmo), outsideObjectIds only (orange in the
 *   viewport); the message and the icon of the Object Panel follow at the
 *   end of the gesture (reportedObjectIds).
 * No printer selected (no plate): no object is out (Q9 A). A hidden object
 * is never out (lot 106, decision 112 of Noam, Q7 A).
 *
 * The rule (box seen from above out of the plate, or higher than the
 * build height) is PlateLayout.isOutsideBuildVolume; the box of an object
 * is kept between two moves (ObjectBounds).
 *
 * Domain: Service. Depends on the Scene Domain (ObjectBounds, PlateLayout)
 * and on State Management (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - GUI_SPEC.md (Plate Check)
 * - ERROR_CODES_SPEC.md (SCN_001)
 */

import { keepBoundsOf, objectBounds } from "../scene/ObjectBounds";
import { isOutsideBuildVolume } from "../scene/PlateLayout";
import { useObjectStore } from "../state/objectStore";
import { usePlateCheckStore } from "../state/plateCheckStore";
import { usePrinterStore } from "../state/printerStore";

import { TransformService } from "./TransformService";

/** The objects of the scene out of the build volume, in scene order */
export function outsideObjectIds(): string[] {
  const volume = usePrinterStore.getState().selectedPrinter?.buildVolume;
  const { objects } = useObjectStore.getState();

  keepBoundsOf(objects);

  if (!volume || !(volume.x > 0 && volume.y > 0 && volume.z > 0)) {
    return [];
  }

  // A hidden object is set aside: no warning (lot 106, Q7 A)
  return objects
    .filter((object) => {
      if (!object.visible) {
        return false;
      }

      const bounds = objectBounds(object);
      return bounds !== null && isOutsideBuildVolume(bounds, volume);
    })
    .map((object) => object.objectId);
}

function check(): void {
  usePlateCheckStore
    .getState()
    .setOutside(outsideObjectIds(), !TransformService.isGestureActive());
}

export const PlateCheckService = {
  /** Starts the check; returns the function that stops it */
  start(): () => void {
    check();

    const unsubscribeObjects = useObjectStore.subscribe((state, previous) => {
      if (state.objects !== previous.objects) {
        check();
      }
    });
    const unsubscribePrinter = usePrinterStore.subscribe((state, previous) => {
      if (state.selectedPrinter !== previous.selectedPrinter) {
        check();
      }
    });
    const unsubscribeGesture = TransformService.onGestureEnd(check);

    return () => {
      unsubscribeGesture();
      unsubscribePrinter();
      unsubscribeObjects();
    };
  },
};

export default PlateCheckService;
