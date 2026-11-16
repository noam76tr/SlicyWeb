/**
 * SlicyWeb
 * Arrange Service
 *
 * Arrange (lot 101, decision 103 of Noam: Q5 to Q9 A): Edit > Arrange,
 * the key A and the button Arrange of the toolbar place all the objects
 * of the scene on the build plate, without contact, the block centered
 * (PlateLayout.arrangeLayout):
 * - all the objects, always; the selection is not used and not changed
 *   (Q6 A);
 * - rows, the deepest object first, OBJECT_GAP_MM between two objects,
 *   the orientation never changed: only X and Y move (Q7 A);
 * - the objects that do not fit are put in a row to the right of the
 *   plate and keep the warning (Q8 A);
 * - without a printer, the block is centered on the origin (Q9 A).
 * One action ARRANGE of the history (UNDO_REDO_SPEC.md 2.5.0, Arrange
 * Objects); nothing is recorded when no object moves. A move does not
 * make the analysis outdated (ADR-026). Nothing is done during a gesture.
 *
 * Domain: Service. Depends on the Scene Domain (ObjectBounds, PlateLayout)
 * and on State Management (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - GUI_SPEC.md (Arrange, Edit Menu, Toolbar Buttons, Keyboard Shortcuts)
 * - UNDO_REDO_SPEC.md (Scene Actions: Arrange Objects; Arrange Actions)
 */

import { objectBounds } from "../scene/ObjectBounds";
import { arrangeLayout, type LayoutItem } from "../scene/PlateLayout";
import { useObjectStore } from "../state/objectStore";
import { usePrinterStore } from "../state/printerStore";

import type { Transform } from "../types/Object3D";

import { TransformService } from "./TransformService";

export const ArrangeService = {
  /**
   * Arranges all the objects of the scene; returns false when nothing was
   * done (no object, a gesture in progress, or no object moved).
   */
  arrange(): boolean {
    if (TransformService.isGestureActive()) {
      return false;
    }

    const { objects } = useObjectStore.getState();
    const items: LayoutItem[] = objects.flatMap((object) => {
      const bounds = objectBounds(object);
      return bounds ? [{ id: object.objectId, bounds }] : [];
    });

    if (items.length === 0) {
      return false;
    }

    const volume =
      usePrinterStore.getState().selectedPrinter?.buildVolume ?? null;
    const shifts = arrangeLayout(items, volume);
    const transforms: Record<string, Transform> = {};

    for (const object of objects) {
      const shift = shifts[object.objectId];

      if (!shift || (shift.dx === 0 && shift.dy === 0)) {
        continue;
      }

      const { position } = object.transform;
      transforms[object.objectId] = {
        ...object.transform,
        position: {
          x: position.x + shift.dx,
          y: position.y + shift.dy,
          z: position.z,
        },
      };
    }

    if (Object.keys(transforms).length === 0) {
      return false;
    }

    // The selection is kept (Q6 A); applyMany does not change it
    return TransformService.applyMany(transforms, { actionType: "ARRANGE" });
  },
};

export default ArrangeService;
