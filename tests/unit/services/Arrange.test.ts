/**
 * SlicyWeb
 * Arrange, Plate Check and Duplicate Place Tests
 *
 * Lot 101 (decision 103 of Noam, Q1 to Q10: A):
 * - PlateCheckService finds the objects out of the build volume after a
 *   move and a change of printer; during a gesture, only the live list
 *   changes, the reported list (message, icon) at the end of the gesture;
 *   no printer: nothing is out;
 * - ArrangeService moves all the objects (X and Y only), keeps the
 *   selection, records one action ARRANGE that undo and redo restore;
 * - Duplicate puts the copy at a free place inside the plate: to the right
 *   when free, otherwise elsewhere; to the right, with the warning, when
 *   no place is free.
 *
 * Based on:
 * - GUI_SPEC.md (Plate Check, Arrange, Edit Menu)
 * - UNDO_REDO_SPEC.md (2.5.0: Arrange Actions)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import { objectBounds } from "../../../src/scene/ObjectBounds";
import {
  isOutsideBuildVolume,
  OBJECT_GAP_MM,
} from "../../../src/scene/PlateLayout";
import { ArrangeService } from "../../../src/services/ArrangeService";
import { ObjectEditService } from "../../../src/services/ObjectEditService";
import { PlateCheckService } from "../../../src/services/PlateCheckService";
import { TransformService } from "../../../src/services/TransformService";
import { useHistoryStore } from "../../../src/state/historyStore";
import { useObjectStore } from "../../../src/state/objectStore";
import { usePlateCheckStore } from "../../../src/state/plateCheckStore";
import { usePrinterStore } from "../../../src/state/printerStore";

import type { Printer } from "../../../src/types/Printer";

/** Cube of 10 mm, local origin at its center (8 corners) */
const CUBE: number[] = [];
for (const x of [-5, 5]) {
  for (const y of [-5, 5]) {
    for (const z of [-5, 5]) {
      CUBE.push(x, y, z);
    }
  }
}

function addCube(id: string, x: number, y = 0): void {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(CUBE), 3),
  );
  GeometryRegistry.set(id, geometry);

  const object = ObjectFactory.create(id, `${id}.stl`, "stl");
  object.geometry = {
    width: 10,
    depth: 10,
    height: 10,
    volume: 1000,
    surfaceArea: 600,
  };
  object.transform.position = { x, y, z: 5 };
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

function find(objectId: string) {
  return useObjectStore
    .getState()
    .objects.find((object) => object.objectId === objectId)!;
}

function plate() {
  return usePlateCheckStore.getState();
}

let stop: () => void = () => {};

beforeEach(() => {
  useObjectStore.getState().clearObjects();
  GeometryRegistry.clear();
  TransformService.clearHistory();
  usePrinterStore.getState().setSelectedPrinter(null);
  stop = PlateCheckService.start();
});

afterEach(() => {
  stop();
});

describe("Plate check", () => {
  it("finds the objects out of the plate, and none without a printer", () => {
    addCube("a", 0);
    addCube("b", 60);

    expect(plate().outsideObjectIds).toEqual([]);

    selectPrinter(100, 100);
    expect(plate().outsideObjectIds).toEqual(["b"]);
    expect(plate().reportedObjectIds).toEqual(["b"]);

    TransformService.setPosition("b", "x", 40);
    expect(plate().outsideObjectIds).toEqual([]);
    expect(plate().reportedObjectIds).toEqual([]);

    usePrinterStore.getState().setSelectedPrinter(null);
    TransformService.setPosition("b", "x", 500);
    expect(plate().outsideObjectIds).toEqual([]);
  });

  it("finds an object higher than the build height", () => {
    selectPrinter(100, 100, 20);
    addCube("a", 0);
    expect(plate().outsideObjectIds).toEqual([]);

    TransformService.setScale("a", "z", 3, false);
    expect(plate().outsideObjectIds).toEqual(["a"]);
  });

  it("reports at the end of a gesture only", () => {
    selectPrinter(100, 100);
    addCube("a", 0);

    TransformService.beginGesture(["a"]);
    TransformService.apply(
      "a",
      { ...find("a").transform, position: { x: 80, y: 0, z: 5 } },
      { live: true },
    );
    expect(plate().outsideObjectIds).toEqual(["a"]);
    expect(plate().reportedObjectIds).toEqual([]);

    TransformService.endGesture();
    expect(plate().reportedObjectIds).toEqual(["a"]);
  });
});

describe("Arrange", () => {
  it("places all the objects on the plate without contact, one action", () => {
    selectPrinter(100, 100);
    addCube("a", 0);
    addCube("b", 0);
    addCube("c", 70, 70);
    useObjectStore.getState().selectObjects(["c"]);
    const rotation = { ...find("a").transform.rotation };

    expect(ArrangeService.arrange()).toBe(true);

    const boxes = ["a", "b", "c"].map((id) => objectBounds(find(id))!);
    for (const bounds of boxes) {
      expect(isOutsideBuildVolume(bounds, { x: 100, y: 100, z: 100 })).toBe(
        false,
      );
    }
    // One row: 10 + 10 + 10 + 10 + 10 = 50 wide, centered
    expect(boxes[0].min.x).toBeCloseTo(-25);
    expect(boxes[1].min.x - boxes[0].max.x).toBeCloseTo(OBJECT_GAP_MM);
    expect(boxes[2].max.x).toBeCloseTo(25);
    expect(boxes.every((b) => Math.abs(b.min.y + 5) < 1e-6)).toBe(true);
    expect(find("a").transform.position.z).toBeCloseTo(5);
    expect(find("a").transform.rotation).toEqual(rotation);
    expect(plate().outsideObjectIds).toEqual([]);

    // Selection kept
    expect(useObjectStore.getState().selectedObjectIds).toEqual(["c"]);

    const { undoStack } = useHistoryStore.getState();
    expect(undoStack.map((entry) => entry.type)).toEqual(["ARRANGE"]);

    expect(TransformService.undo()).toBe(true);
    expect(find("c").transform.position).toEqual({ x: 70, y: 70, z: 5 });
    expect(plate().outsideObjectIds).toEqual(["c"]);

    expect(TransformService.redo()).toBe(true);
    expect(objectBounds(find("c"))!.max.x).toBeCloseTo(25);
  });

  it("records nothing when no object moves, and nothing during a gesture", () => {
    selectPrinter(100, 100);
    addCube("a", 0);
    expect(ArrangeService.arrange()).toBe(false);
    expect(useHistoryStore.getState().undoStack).toEqual([]);

    TransformService.setPosition("a", "x", 30);
    TransformService.beginGesture(["a"]);
    expect(ArrangeService.arrange()).toBe(false);
    TransformService.endGesture();
    expect(find("a").transform.position.x).toBe(30);
  });

  it("works without a printer, block centered on the origin", () => {
    addCube("a", 300);
    addCube("b", -300, 40);

    expect(ArrangeService.arrange()).toBe(true);

    const a = objectBounds(find("a"))!;
    const b = objectBounds(find("b"))!;
    expect(
      (Math.min(a.min.x, b.min.x) + Math.max(a.max.x, b.max.x)) / 2,
    ).toBeCloseTo(0);
    expect(
      (Math.min(a.min.y, b.min.y) + Math.max(a.max.y, b.max.y)) / 2,
    ).toBeCloseTo(0);
  });
});

describe("Duplicate inside the plate", () => {
  it("puts the copy to the right when that place is free", () => {
    selectPrinter(100, 100);
    addCube("a", 0);

    const [copy] = ObjectEditService.duplicate(["a"]);

    expect(find(copy).transform.position).toEqual({
      x: 10 + OBJECT_GAP_MM,
      y: 0,
      z: 5,
    });
  });

  it("keeps the copy inside the plate when the original touches the right edge", () => {
    selectPrinter(100, 100);
    addCube("a", 45);

    const [copy] = ObjectEditService.duplicate(["a"]);
    const bounds = objectBounds(find(copy))!;

    expect(isOutsideBuildVolume(bounds, { x: 100, y: 100, z: 100 })).toBe(
      false,
    );
    expect(plate().outsideObjectIds).toEqual([]);
    // The nearest free place: 20 mm away (10 mm + 10 mm)
    const { x, y } = find(copy).transform.position;
    expect(Math.hypot(x - 45, y)).toBeCloseTo(20);
    expect(find("a").transform.position.x).toBe(45);
  });

  it("puts the copy to the right, with the warning, when no place is free", () => {
    selectPrinter(20, 20);
    addCube("a", 0);

    const [copy] = ObjectEditService.duplicate(["a"]);

    expect(find(copy).transform.position.x).toBeCloseTo(20);
    expect(plate().outsideObjectIds).toEqual([copy]);
    expect(plate().reportedObjectIds).toEqual([copy]);
  });

  it("copies a group as a block, the same layout between the copies", () => {
    selectPrinter(100, 100);
    addCube("a", 20);
    addCube("b", 35);

    const [copyA, copyB] = ObjectEditService.duplicate(["a", "b"]);
    const a = find(copyA).transform.position;
    const b = find(copyB).transform.position;

    expect(b.x - a.x).toBeCloseTo(15);
    expect(b.y - a.y).toBeCloseTo(0);
    for (const id of [copyA, copyB]) {
      expect(
        isOutsideBuildVolume(objectBounds(find(id))!, {
          x: 100,
          y: 100,
          z: 100,
        }),
      ).toBe(false);
    }
  });
});
