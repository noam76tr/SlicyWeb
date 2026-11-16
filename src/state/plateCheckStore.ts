/**
 * SlicyWeb
 * Plate Check Store Definition
 *
 * Objects that go out of the build volume (lot 101, decision 103 of
 * Noam), computed by PlateCheckService. Not project data: nothing here is
 * saved, it is computed again every time.
 * - outsideObjectIds: the objects out of the build volume now, also during
 *   a gesture; the viewport draws them in orange (Q2 A, Q3 A, Q4 A);
 * - reportedObjectIds: the same objects, updated at the end of a gesture
 *   only; the message over the viewport (SCN_001) and the warning icon of
 *   the Object Panel read them, so that the text does not blink while an
 *   object is dragged (Q4 A).
 * Both are in the order of the scene, empty without a printer.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Plate Check)
 * - ERROR_CODES_SPEC.md (SCN_001)
 */

import { create } from "zustand";

interface PlateCheckState {
  outsideObjectIds: string[];
  reportedObjectIds: string[];
  setOutside: (objectIds: string[], report: boolean) => void;
}

function same(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

export const usePlateCheckStore = create<PlateCheckState>((set, get) => ({
  outsideObjectIds: [],
  reportedObjectIds: [],

  setOutside: (objectIds, report) => {
    const state = get();
    const outside = same(state.outsideObjectIds, objectIds)
      ? state.outsideObjectIds
      : objectIds;
    const reported =
      report && !same(state.reportedObjectIds, objectIds)
        ? objectIds
        : state.reportedObjectIds;

    if (
      outside !== state.outsideObjectIds ||
      reported !== state.reportedObjectIds
    ) {
      set({ outsideObjectIds: outside, reportedObjectIds: reported });
    }
  },
}));
