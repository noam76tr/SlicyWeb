/**
 * SlicyWeb
 * Rename, Hide and Lock Tests
 *
 * Lot 106 (decision 112 of Noam, Q1 to Q18 A):
 * - names: the name given, otherwise the file name; "(1)", "(2)" for all
 *   the names shown twice (Q4 A); rules of the name (Q3 A); the copy keeps
 *   the name, is not locked and is shown (Q5 A, Q13 A);
 * - hide: the object leaves the selection (Q10 A), Ctrl+A leaves it out,
 *   no off-plate warning, Arrange does not move it nor counts it (Q7 A);
 * - lock: no transform (TransformService refuses it, also for a group with
 *   one object locked; Q12 A, Q15 A); Arrange leaves it in place and puts
 *   the others around it, without touching it (Q12 A);
 * - history: RENAME, VISIBILITY and LOCK, undo and redo (Q17 A); the line
 *   of the menu for the selection (Q18 A).
 *
 * Based on:
 * - DATA_SCHEMA.md (3.14.0: Object Schema, name)
 * - UNDO_REDO_SPEC.md (2.6.0)
 * - GUI_SPEC.md (Object Panel, Object Context Menu, Arrange)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getDisplayNames } from "../../../src/gui/sidebar/objectNames";
import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import { objectBounds } from "../../../src/scene/ObjectBounds";
import {
  arrangeLayout,
  isOutsideBuildVolume,
  OBJECT_GAP_MM,
} from "../../../src/scene/PlateLayout";
import type { Bounds } from "../../../src/scene/ObjectTransform";
import { ArrangeService } from "../../../src/services/ArrangeService";
import { ObjectEditService } from "../../../src/services/ObjectEditService";
import {
  MAX_NAME_LENGTH,
  normalizeName,
  ObjectStateService,
} from "../../../src/services/ObjectStateService";
import { PlateCheckService } from "../../../src/services/PlateCheckService";
import { TransformService } from "../../../src/services/TransformService";
import { useHistoryStore } from "../../../src/state/historyStore";
import { useObjectStore } from "../../../src/state/objectStore";
import { usePlateCheckStore } from "../../../src/state/plateCheckStore";
import { usePrinterStore } from "../../../src/state/printerStore";

import type { Object3D } from "../../../src/types/Object3D";
import type { Printer } from "../../../src/types/Printer";

/** Cube of a size, local origin at its center (8 corners) */
function corners(size: number): number[] {
  const h = size / 2;
  const points: number[] = [];

  for (const x of [-h, h]) {
    for (const y of [-h, h]) {
      for (const z of [-h, h]) {
        points.push(x, y, z);
      }
    }
  }

  return points;
}

function addCube(id: string, x: number, y = 0, size = 10, file?: string): void {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(corners(size)), 3),
  );
  GeometryRegistry.set(id, geometry);

  const object = ObjectFactory.create(id, file ?? `${id}.stl`, "stl");
  object.geometry = {
    width: size,
    depth: size,
    height: size,
    volume: size ** 3,
    surfaceArea: 6 * size ** 2,
  };
  object.transform.position = { x, y, z: size / 2 };
  useObjectStore.getState().addObject(object);
}

function selectPrinter(x: number, y: number, z = 100): void {
  usePrinterStore.getState().setSelectedPrinter({
    id: `printer-${x}`,
    brand: "Test",
    model: `${x}`,
    buildVolume: { x, y, z },
  } as unknown as Printer);
}

function find(objectId: string): Object3D {
  return useObjectStore
    .getState()
    .objects.find((object) => object.objectId === objectId)!;
}

function names(): string[] {
  const { objects } = useObjectStore.getState();
  const shown = getDisplayNames(objects);
  return objects.map((object) => shown.get(object.objectId)!);
}

const store = () => useObjectStore.getState();
const history = () => useHistoryStore.getState();

/** Boxes seen from above at least gap apart */
function apart(a: Bounds, b: Bounds, gap = OBJECT_GAP_MM): boolean {
  const e = 0.001;
  return (
    a.min.x >= b.max.x + gap - e ||
    a.max.x <= b.min.x - gap + e ||
    a.min.y >= b.max.y + gap - e ||
    a.max.y <= b.min.y - gap + e
  );
}

let stop: () => void = () => {};

beforeEach(() => {
  store().clearObjects();
  GeometryRegistry.clear();
  TransformService.clearHistory();
  usePrinterStore.getState().setSelectedPrinter(null);
  stop = PlateCheckService.start();
});

afterEach(() => {
  stop();
});

describe("Names (Q1 to Q6)", () => {
  it("shows the name given, otherwise the file name, numbered when shown twice", () => {
    addCube("a", 0, 0, 10, "cube.stl");
    addCube("b", 20, 0, 10, "cube.stl");
    addCube("c", 40, 0, 10, "base.stl");
    expect(names()).toEqual(["cube (1)", "cube (2)", "base.stl"]);

    expect(ObjectStateService.rename("a", "  Support  ")).toBe(true);
    expect(find("a").name).toBe("Support");
    expect(find("a").fileName).toBe("cube.stl");
    expect(names()).toEqual(["Support", "cube.stl", "base.stl"]);

    // Same name given twice: numbered, the extension kept for a name given
    ObjectStateService.rename("c", "Support");
    expect(names()).toEqual(["Support (1)", "cube.stl", "Support (2)"]);
    ObjectStateService.rename("b", "v1.2 pièce");
    expect(names()[1]).toBe("v1.2 pièce");
  });

  it("empty name or the file name: back to the file name; 100 characters at most", () => {
    expect(normalizeName("   ", "cube.stl")).toBeNull();
    expect(normalizeName("cube.stl", "cube.stl")).toBeNull();
    expect(normalizeName("מכסה", "cube.stl")).toBe("מכסה");
    expect([...normalizeName("é".repeat(150), "cube.stl")!]).toHaveLength(
      MAX_NAME_LENGTH,
    );

    addCube("a", 0);
    ObjectStateService.rename("a", "Base");
    ObjectStateService.rename("a", "");
    expect(find("a").name).toBeNull();
    expect(names()).toEqual(["a.stl"]);
  });

  it("Rename is possible with one object selected only", () => {
    addCube("a", 0);
    addCube("b", 20);
    store().selectObjects(["a", "b"]);
    expect(ObjectStateService.canRenameSelection()).toBe(false);
    store().selectObject("a");
    expect(ObjectStateService.canRenameSelection()).toBe(true);
  });

  it("the copy keeps the name, is not locked and is shown", () => {
    selectPrinter(200, 200);
    addCube("a", 0);
    ObjectStateService.rename("a", "Boîtier");
    ObjectStateService.setLocked(["a"], true);
    ObjectStateService.setVisible(["a"], false);

    const [copy] = ObjectEditService.duplicate(["a"]);

    expect(find(copy).name).toBe("Boîtier");
    expect(find(copy).locked).toBe(false);
    expect(find(copy).visible).toBe(true);
    expect(names()).toEqual(["Boîtier (1)", "Boîtier (2)"]);
  });
});

describe("Hide (Q7 to Q11)", () => {
  it("the object hidden stays selected (decision 114, Q27 A); Ctrl+A leaves it out", () => {
    addCube("a", 0);
    addCube("b", 20);
    store().selectObjects(["a", "b"]);

    ObjectStateService.setVisible(["a"], false);
    expect(store().selectedObjectIds).toEqual(["a", "b"]);

    store().selectAllObjects();
    expect(store().selectedObjectIds).toEqual(["b"]);

    // Selected from the Object Panel all the same (Q11 A)
    store().selectObject("a");
    expect(store().selectedObjectIds).toEqual(["a"]);
  });

  it("no off-plate warning for a hidden object", () => {
    selectPrinter(100, 100);
    addCube("a", 0);
    addCube("b", 80);
    expect(usePlateCheckStore.getState().outsideObjectIds).toEqual(["b"]);

    ObjectStateService.setVisible(["b"], false);
    expect(usePlateCheckStore.getState().outsideObjectIds).toEqual([]);
    expect(usePlateCheckStore.getState().reportedObjectIds).toEqual([]);

    ObjectStateService.showAll();
    expect(usePlateCheckStore.getState().outsideObjectIds).toEqual(["b"]);
  });

  it("Arrange does not move a hidden object and does not count it", () => {
    selectPrinter(100, 100);
    addCube("a", 30, 30);
    addCube("hidden", 0, 0, 20);
    addCube("b", -30, -30);
    ObjectStateService.setVisible(["hidden"], false);
    const before = find("hidden").transform;

    expect(ArrangeService.arrange()).toBe(true);

    expect(find("hidden").transform).toEqual(before);
    // The two others, as if it were not there: the same rows
    const alone = arrangeLayout(
      ["a", "b"].map((id) => ({ id, bounds: objectBounds(find(id))! })),
      { x: 100, y: 100, z: 100 },
    );
    expect(alone.a).toEqual({ dx: 0, dy: 0 });
    expect(alone.b).toEqual({ dx: 0, dy: 0 });
  });

  it("H on the selection: Hide when one is shown, Show when all are hidden", () => {
    addCube("a", 0);
    addCube("b", 20);
    store().selectObjects(["a", "b"]);
    expect(ObjectStateService.selectionVisibilityAction()).toBe("hide");

    ObjectStateService.toggleSelectionVisibility();
    expect(find("a").visible).toBe(false);
    expect(find("b").visible).toBe(false);
    // Still selected: H again shows them (decision 114, Q27 A)
    expect(store().selectedObjectIds).toEqual(["a", "b"]);
    expect(ObjectStateService.selectionVisibilityAction()).toBe("show");
    ObjectStateService.toggleSelectionVisibility();
    expect(find("a").visible).toBe(true);
    expect(find("b").visible).toBe(true);

    // As many times as wanted
    ObjectStateService.toggleSelectionVisibility();
    ObjectStateService.toggleSelectionVisibility();
    ObjectStateService.toggleSelectionVisibility();
    expect(find("a").visible).toBe(false);
    expect(store().selectedObjectIds).toEqual(["a", "b"]);
  });

  it("a hidden object selected, or a group with one, does not move (Q28 A)", () => {
    addCube("a", 0);
    addCube("b", 20);
    ObjectStateService.setVisible(["a"], false);
    const a = find("a").transform;
    const b = find("b").transform;
    const moved = (transform: typeof a) => ({
      ...transform,
      position: { ...transform.position, x: transform.position.x + 30 },
    });

    expect(TransformService.applyMany({ a: moved(a) })).toBe(false);
    expect(TransformService.applyMany({ a: moved(a), b: moved(b) })).toBe(
      false,
    );
    expect(find("a").transform).toEqual(a);
    expect(find("b").transform).toEqual(b);
    expect(TransformService.applyMany({ b: moved(b) })).toBe(true);
  });
});

describe("Lock (Q12 to Q16)", () => {
  it("no transform of a locked object, nor of a group with one", () => {
    addCube("a", 0);
    addCube("b", 20);
    ObjectStateService.setLocked(["a"], true);
    const before = find("a").transform;

    expect(TransformService.setPosition("a", "x", 50)).toBe(false);
    expect(TransformService.setRotation("a", "z", 45)).toBe(false);
    expect(TransformService.resetGroupRotationAndScale(["a"])).toBe(false);
    expect(TransformService.centerGroupOnBed(["a", "b"])).toBe(false);
    expect(TransformService.scaleGroup(["a", "b"], 2)).toBe(false);
    TransformService.beginGesture(["a", "b"]);
    expect(TransformService.isGestureActive()).toBe(false);

    expect(find("a").transform).toEqual(before);
    expect(find("b").transform.position.x).toBe(20);

    // Delete is allowed (Q13 A)
    expect(ObjectEditService.remove(["a"])).toBe(true);
  });

  it("Arrange leaves a locked object in place and puts the others around it", () => {
    selectPrinter(120, 120);
    addCube("locked", 0, 0, 30);
    for (const [index, id] of ["a", "b", "c", "d", "e"].entries()) {
      addCube(id, -50 + index * 25, 50, 15);
    }
    ObjectStateService.setLocked(["locked"], true);
    const before = find("locked").transform;
    const lockedBox = objectBounds(find("locked"))!;

    expect(ArrangeService.arrange()).toBe(true);

    expect(find("locked").transform).toEqual(before);

    const volume = { x: 120, y: 120, z: 100 };
    const boxes = ["a", "b", "c", "d", "e"].map((id) =>
      objectBounds(find(id))!,
    );

    for (const [index, box] of boxes.entries()) {
      expect(apart(box, lockedBox)).toBe(true);
      expect(isOutsideBuildVolume(box, volume)).toBe(false);

      for (const other of boxes.slice(index + 1)) {
        expect(apart(box, other)).toBe(true);
      }
    }
  });

  it("without obstacle, Arrange is the same as before (lot 101)", () => {
    const items = [
      {
        id: "a",
        bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 10, y: 10, z: 10 } },
      },
      {
        id: "b",
        bounds: { min: { x: 40, y: 0, z: 0 }, max: { x: 60, y: 20, z: 10 } },
      },
    ];
    const volume = { x: 100, y: 100, z: 100 };

    expect(arrangeLayout(items, volume, OBJECT_GAP_MM, [])).toEqual(
      arrangeLayout(items, volume),
    );
  });
});

describe("History (Q17) and the lines of the menu (Q18)", () => {
  it("RENAME, VISIBILITY and LOCK: one action each, undo and redo", () => {
    addCube("a", 0);
    store().selectObject(null);

    ObjectStateService.rename("a", "Base");
    ObjectStateService.setVisible(["a"], false);
    ObjectStateService.setLocked(["a"], true);

    expect(history().undoStack.map((entry) => entry.type)).toEqual([
      "RENAME",
      "VISIBILITY",
      "LOCK",
    ]);

    TransformService.undo();
    expect(find("a").locked).toBe(false);
    TransformService.undo();
    expect(find("a").visible).toBe(true);
    // The object of the action: selected
    expect(store().selectedObjectIds).toEqual(["a"]);
    TransformService.undo();
    expect(find("a").name).toBeNull();

    TransformService.redo();
    expect(find("a").name).toBe("Base");
    TransformService.redo();
    expect(find("a").visible).toBe(false);
    // Hidden, and still selected (decision 114, Q27 A)
    expect(store().selectedObjectIds).toEqual(["a"]);
    TransformService.redo();
    expect(find("a").locked).toBe(true);
  });

  it("nothing recorded when nothing changes; Show All is one action", () => {
    addCube("a", 0);
    addCube("b", 20);
    addCube("c", 40);

    expect(ObjectStateService.rename("a", "a.stl")).toBe(false);
    expect(ObjectStateService.showAll()).toBe(false);
    expect(history().undoStack).toHaveLength(0);

    ObjectStateService.setVisible(["a"], false);
    ObjectStateService.setVisible(["b"], false);
    expect(ObjectStateService.hasHiddenObjects()).toBe(true);
    ObjectStateService.showAll();
    expect(history().undoStack).toHaveLength(3);
    expect(ObjectStateService.hasHiddenObjects()).toBe(false);

    TransformService.undo();
    expect(find("a").visible).toBe(false);
    expect(find("b").visible).toBe(false);
  });

  it("Lock when one object selected is not locked, otherwise Unlock", () => {
    addCube("a", 0);
    addCube("b", 20);
    ObjectStateService.setLocked(["a"], true);
    store().selectObjects(["a", "b"]);
    expect(ObjectStateService.selectionLockAction()).toBe("lock");

    ObjectStateService.toggleSelectionLock();
    expect(find("b").locked).toBe(true);
    expect(ObjectStateService.selectionLockAction()).toBe("unlock");

    ObjectStateService.toggleSelectionLock();
    expect(find("a").locked).toBe(false);
    expect(find("b").locked).toBe(false);
  });

  it("nothing during a gesture", () => {
    addCube("a", 0);
    TransformService.beginGesture(["a"]);
    expect(ObjectStateService.setLocked(["a"], true)).toBe(false);
    TransformService.endGesture();
    expect(ObjectStateService.setLocked(["a"], true)).toBe(true);
  });
});
