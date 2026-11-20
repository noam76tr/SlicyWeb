/**
 * SlicyWeb
 * Scene Integration Tests
 *
 * Lot 106 (decision 114 of Noam, Q31 to Q33 A): a new object goes to the
 * center of the plate when it is free, otherwise to the free place
 * nearest to it, OBJECT_GAP_MM from the others (as Arrange); the objects
 * of one 3MF keep their layout and move as a block; the objects already
 * on the plate never move; hidden objects are not counted; with no free
 * place, to the right of the plate.
 *
 * Based on:
 * - IMPORT_EXPORT_SPEC.md (Scene Integration)
 * - TEST_PLAN.md
 */

import { beforeEach, describe, expect, it } from "vitest";

import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import { objectBounds } from "../../../src/scene/ObjectBounds";
import type { Bounds } from "../../../src/scene/ObjectTransform";
import {
  isOutsideBuildVolume,
  OBJECT_GAP_MM,
} from "../../../src/scene/PlateLayout";
import {
  registerImportedObject,
  registerImportedObjects,
  type ImportedMesh,
} from "../../../src/scene/SceneIntegration";
import { useObjectStore } from "../../../src/state/objectStore";
import { usePrinterStore } from "../../../src/state/printerStore";
import type { Printer } from "../../../src/types/Printer";

/** Box of the file from min to max: 12 triangles */
function boxMesh(
  min: [number, number, number],
  max: [number, number, number],
): ImportedMesh {
  const corner = (index: number): number[] => [
    index & 4 ? max[0] : min[0],
    index & 2 ? max[1] : min[1],
    index & 1 ? max[2] : min[2],
  ];
  const faces = [
    [0, 1, 3, 2],
    [4, 6, 7, 5],
    [0, 4, 5, 1],
    [2, 3, 7, 6],
    [0, 2, 6, 4],
    [1, 5, 7, 3],
  ];
  const triangles: number[] = [];

  for (const [a, b, c, d] of faces) {
    triangles.push(...corner(a), ...corner(b), ...corner(c));
    triangles.push(...corner(a), ...corner(c), ...corner(d));
  }

  const [w, d, h] = [0, 1, 2].map((axis) => max[axis] - min[axis]);

  return {
    positions: new Float32Array(triangles),
    normals: new Float32Array(triangles.length),
    triangleCount: 12,
    min,
    max,
    volume: w * d * h,
    surfaceArea: 2 * (w * d + w * h + d * h),
  };
}

const cube = (size = 20): ImportedMesh =>
  boxMesh([0, 0, 0], [size, size, size]);

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

function boxOf(objectId: string): Bounds {
  return objectBounds(find(objectId))!;
}

function gapBetween(a: Bounds, b: Bounds): number {
  const dx = Math.max(b.min.x - a.max.x, a.min.x - b.max.x, 0);
  const dy = Math.max(b.min.y - a.max.y, a.min.y - b.max.y, 0);
  return Math.max(dx, dy);
}

beforeEach(() => {
  useObjectStore.getState().clearObjects();
  GeometryRegistry.clear();
  usePrinterStore.getState().setSelectedPrinter(null);
});

describe("Import at a free place (lot 106, decision 114, Q31 to Q33 A)", () => {
  it("one object on an empty plate: at the center", () => {
    selectPrinter(200, 200);
    const id = registerImportedObject("cube.stl", "stl", cube());

    expect(find(id).transform.position).toEqual({ x: 0, y: 0, z: 10 });
  });

  it("4 cubes imported one after the other: no contact, 10 mm apart at least, inside the plate", () => {
    selectPrinter(200, 200);
    const ids = [1, 2, 3, 4].map((n) =>
      registerImportedObject(`cube${n}.stl`, "stl", cube()),
    );
    const boxes = ids.map(boxOf);

    expect(find(ids[0]).transform.position).toEqual({ x: 0, y: 0, z: 10 });
    for (let i = 0; i < boxes.length; i += 1) {
      expect(isOutsideBuildVolume(boxes[i], { x: 200, y: 200, z: 100 })).toBe(
        false,
      );
      for (let j = i + 1; j < boxes.length; j += 1) {
        expect(gapBetween(boxes[i], boxes[j])).toBeGreaterThanOrEqual(
          OBJECT_GAP_MM - 1e-6,
        );
      }
    }
  });

  it("the objects already there never move", () => {
    selectPrinter(200, 200);
    const first = registerImportedObject("a.stl", "stl", cube());
    const before = find(first).transform;

    registerImportedObject("b.stl", "stl", cube(40));

    expect(find(first).transform).toEqual(before);
  });

  it("a 3MF keeps its layout: its objects move together", () => {
    selectPrinter(200, 200);
    registerImportedObject("a.stl", "stl", cube());
    const [left, right] = registerImportedObjects("pair.3mf", "3mf", [
      boxMesh([0, 0, 0], [20, 20, 20]),
      boxMesh([30, 0, 0], [50, 20, 20]),
    ]);

    const a = boxOf(left);
    const b = boxOf(right);
    expect(b.min.x - a.max.x).toBeCloseTo(10);
    expect(b.min.y - a.min.y).toBeCloseTo(0);
    expect(
      gapBetween(a, boxOf(useObjectStore.getState().objects[0].objectId)),
    ).toBeGreaterThanOrEqual(OBJECT_GAP_MM - 1e-6);
  });

  it("a hidden object is not counted (Q33 A)", () => {
    selectPrinter(200, 200);
    const hidden = registerImportedObject("a.stl", "stl", cube());
    useObjectStore
      .getState()
      .updateObjectStates({ [hidden]: { visible: false } });

    const id = registerImportedObject("b.stl", "stl", cube());

    expect(find(id).transform.position).toEqual({ x: 0, y: 0, z: 10 });
  });

  it("no free place: to the right of the plate", () => {
    selectPrinter(30, 30);
    registerImportedObject("a.stl", "stl", cube());

    const id = registerImportedObject("b.stl", "stl", cube());

    expect(boxOf(id).min.x).toBeCloseTo(15 + OBJECT_GAP_MM);
  });

  it("without a printer: the free place nearest to the center", () => {
    const first = registerImportedObject("a.stl", "stl", cube());
    const id = registerImportedObject("b.stl", "stl", cube());

    expect(gapBetween(boxOf(first), boxOf(id))).toBeCloseTo(OBJECT_GAP_MM);
  });
});
