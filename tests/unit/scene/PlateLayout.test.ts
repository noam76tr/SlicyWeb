/**
 * SlicyWeb
 * Plate Layout Tests
 *
 * Lot 101 (decision 103 of Noam, Q1 to Q10: A): an object is out of the
 * build volume when its box seen from above goes out of the plate or it
 * is higher than the build height; Arrange places the objects in rows,
 * the deepest first, OBJECT_GAP_MM apart, the block centered, the objects
 * that do not fit to the right of the plate; the copy of Duplicate goes
 * to the right of the original when that place is free, otherwise to the
 * nearest free place, and nowhere when none is free.
 *
 * Lot 106 (decision 113 of Noam, Q20 to Q26 A): OBJECT_GAP_MM is 10 mm;
 * after the optimization, an object turned that touches another, or is
 * too near it, goes to the nearest free place (separateLayout); the
 * others never move.
 *
 * Based on:
 * - GUI_SPEC.md (Plate Check, Arrange, Edit Menu)
 * - TEST_PLAN.md
 */

import { describe, expect, it } from "vitest";

import type { Bounds } from "../../../src/scene/ObjectTransform";
import {
  arrangeLayout,
  findFreePlace,
  isOutsideBuildVolume,
  OBJECT_GAP_MM,
  separateLayout,
  type Shift,
} from "../../../src/scene/PlateLayout";

const PLATE = { x: 200, y: 200, z: 200 };

/** Box of size w × d × h, its corner at x, y */
function box(x: number, y: number, w: number, d: number, h = 10): Bounds {
  return { min: { x, y, z: 0 }, max: { x: x + w, y: y + d, z: h } };
}

function moved(bounds: Bounds, shift: Shift): Bounds {
  return {
    min: {
      ...bounds.min,
      x: bounds.min.x + shift.dx,
      y: bounds.min.y + shift.dy,
    },
    max: {
      ...bounds.max,
      x: bounds.max.x + shift.dx,
      y: bounds.max.y + shift.dy,
    },
  };
}

/** Distance between two boxes seen from above (0 when they touch) */
function gapBetween(a: Bounds, b: Bounds): number {
  const dx = Math.max(b.min.x - a.max.x, a.min.x - b.max.x, 0);
  const dy = Math.max(b.min.y - a.max.y, a.min.y - b.max.y, 0);
  return Math.max(dx, dy);
}

describe("isOutsideBuildVolume", () => {
  it("is inside on the plate, also against an edge", () => {
    expect(isOutsideBuildVolume(box(-10, -10, 20, 20), PLATE)).toBe(false);
    expect(isOutsideBuildVolume(box(80, -100, 20, 20), PLATE)).toBe(false);
  });

  it("is outside when the box goes beyond an edge, in X or in Y", () => {
    expect(isOutsideBuildVolume(box(90, 0, 20, 20), PLATE)).toBe(true);
    expect(isOutsideBuildVolume(box(-101, 0, 20, 20), PLATE)).toBe(true);
    expect(isOutsideBuildVolume(box(0, 95, 20, 20), PLATE)).toBe(true);
    expect(isOutsideBuildVolume(box(0, -110, 20, 20), PLATE)).toBe(true);
  });

  it("is outside when the object is higher than the build height", () => {
    expect(isOutsideBuildVolume(box(0, 0, 20, 20, 200), PLATE)).toBe(false);
    expect(isOutsideBuildVolume(box(0, 0, 20, 20, 201), PLATE)).toBe(true);
  });
});

describe("arrangeLayout", () => {
  it("places the objects without contact, inside the plate, block centered", () => {
    const items = [
      { id: "a", bounds: box(0, 0, 30, 20) },
      { id: "b", bounds: box(0, 0, 30, 40) },
      { id: "c", bounds: box(5, 5, 50, 10) },
    ];
    const shifts = arrangeLayout(items, PLATE);
    const placed = items.map((item) => moved(item.bounds, shifts[item.id]));

    for (const bounds of placed) {
      expect(isOutsideBuildVolume(bounds, PLATE)).toBe(false);
    }
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        expect(gapBetween(placed[i], placed[j])).toBeGreaterThanOrEqual(
          OBJECT_GAP_MM - 1e-6,
        );
      }
    }

    // One row: deepest first (b, a, c), left to right, 10 mm apart
    expect(placed[1].min.x).toBeLessThan(placed[0].min.x);
    expect(placed[0].min.x).toBeLessThan(placed[2].min.x);
    expect(placed[0].min.x - placed[1].max.x).toBeCloseTo(OBJECT_GAP_MM);

    // Block centered: 30 + 10 + 30 + 10 + 50 = 130 wide, 40 deep
    expect(placed[1].min.x).toBeCloseTo(-65);
    expect(placed[2].max.x).toBeCloseTo(65);
    expect(placed[1].min.y).toBeCloseTo(-20);
    expect(placed[1].max.y).toBeCloseTo(20);
  });

  it("starts a new row toward the back when a row is full", () => {
    const items = ["a", "b", "c"].map((id) => ({
      id,
      bounds: box(0, 0, 90, 30),
    }));
    const shifts = arrangeLayout(items, PLATE);
    const placed = items.map((item) => moved(item.bounds, shifts[item.id]));

    // Two in the first row (90 + 10 + 90 = 190 ≤ 200), the third behind
    expect(placed[0].min.y).toBeCloseTo(placed[1].min.y);
    expect(placed[2].min.y - placed[0].max.y).toBeCloseTo(OBJECT_GAP_MM);
    expect(placed[0].min.y).toBeCloseTo(-35);
    expect(placed[2].max.y).toBeCloseTo(35);
  });

  it("puts the objects that do not fit in a row to the right of the plate", () => {
    const items = [
      { id: "big", bounds: box(0, 0, 250, 20) },
      { id: "tall", bounds: box(0, 0, 20, 20, 250) },
      { id: "small", bounds: box(0, 0, 20, 20) },
    ];
    const shifts = arrangeLayout(items, PLATE);
    const big = moved(items[0].bounds, shifts.big);
    const tall = moved(items[1].bounds, shifts.tall);
    const small = moved(items[2].bounds, shifts.small);

    expect(isOutsideBuildVolume(small, PLATE)).toBe(false);
    expect(small.min.x).toBeCloseTo(-10);
    expect(big.min.x).toBeCloseTo(100 + OBJECT_GAP_MM);
    expect(tall.min.x).toBeCloseTo(big.max.x + OBJECT_GAP_MM);
  });

  it("puts what no longer fits to the right when the plate is full", () => {
    const items = ["a", "b", "c", "d", "e"].map((id) => ({
      id,
      bounds: box(0, 0, 150, 60),
    }));
    const shifts = arrangeLayout(items, PLATE);
    const placed = items.map((item) => moved(item.bounds, shifts[item.id]));

    // Three rows of one (60 + 10 + 60 + 10 + 60 = 200 ≤ 200), then outside
    expect(
      placed.slice(0, 3).every((b) => !isOutsideBuildVolume(b, PLATE)),
    ).toBe(true);
    expect(placed[3].min.x).toBeCloseTo(110);
    expect(placed[4].min.x).toBeCloseTo(placed[3].max.x + OBJECT_GAP_MM);
  });

  it("centers the block on the origin without a printer", () => {
    const items = ["a", "b", "c", "d"].map((id) => ({
      id,
      bounds: box(300, 300, 20, 20),
    }));
    const shifts = arrangeLayout(items, null);
    const placed = items.map((item) => moved(item.bounds, shifts[item.id]));
    const minX = Math.min(...placed.map((b) => b.min.x));
    const maxX = Math.max(...placed.map((b) => b.max.x));
    const minY = Math.min(...placed.map((b) => b.min.y));
    const maxY = Math.max(...placed.map((b) => b.max.y));

    expect((minX + maxX) / 2).toBeCloseTo(0);
    expect((minY + maxY) / 2).toBeCloseTo(0);
    // Two rows of two (square block)
    expect(maxX - minX).toBeCloseTo(50);
    expect(maxY - minY).toBeCloseTo(50);
  });
});

describe("findFreePlace", () => {
  const right = (bounds: Bounds): Shift => ({
    dx: bounds.max.x - bounds.min.x + OBJECT_GAP_MM,
    dy: 0,
  });
  const center = (bounds: Bounds) => ({
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
  });

  it("keeps the place to the right when it is free", () => {
    const original = box(-10, -10, 20, 20);
    const shift = findFreePlace(
      original,
      [original],
      PLATE,
      right(original),
      center(original),
    );

    expect(shift).toEqual(right(original));
  });

  it("finds a free place inside the plate when the right goes out of it", () => {
    // Against the right edge of the plate
    const original = box(80, -10, 20, 20);
    const shift = findFreePlace(
      original,
      [original],
      PLATE,
      right(original),
      center(original),
    )!;
    const copy = moved(original, shift);

    expect(isOutsideBuildVolume(copy, PLATE)).toBe(false);
    expect(gapBetween(copy, original)).toBeGreaterThanOrEqual(
      OBJECT_GAP_MM - 1e-6,
    );
    // The nearest place: right next to it (left, front or back), 30 mm
    expect(
      Math.hypot(
        center(copy).x - center(original).x,
        center(copy).y - center(original).y,
      ),
    ).toBeCloseTo(30);
  });

  it("goes past the objects that take the place to the right", () => {
    const original = box(-10, -10, 20, 20);
    const neighbour = box(15, -10, 20, 20);
    const others = [original, neighbour];
    const shift = findFreePlace(
      original,
      others,
      PLATE,
      right(original),
      center(original),
    )!;
    const copy = moved(original, shift);

    for (const other of others) {
      expect(gapBetween(copy, other)).toBeGreaterThanOrEqual(
        OBJECT_GAP_MM - 1e-6,
      );
    }
    expect(isOutsideBuildVolume(copy, PLATE)).toBe(false);
  });

  it("finds no place when the plate is full", () => {
    const small = { x: 50, y: 50, z: 100 };
    const original = box(-25, -25, 40, 40);

    expect(
      findFreePlace(
        original,
        [original],
        small,
        right(original),
        center(original),
      ),
    ).toBeNull();
  });
});

describe("separateLayout (lot 106, decision 113 of Noam)", () => {
  it("the gap is 10 mm (Q25 A)", () => {
    expect(OBJECT_GAP_MM).toBe(10);
  });

  it("an object with room around it does not move", () => {
    const items = [{ id: "turned", bounds: box(-50, -10, 100, 20) }];
    const others = [box(-10, 30, 20, 20)];

    expect(separateLayout(items, others, PLATE)).toEqual({});
  });

  it("an object on another, or too near it, goes to the nearest free place; the other stays", () => {
    const turned = box(-50, -10, 100, 20);
    const locked = box(30, -10, 20, 20);
    const near = box(-10, 15, 20, 20);
    const shifts = separateLayout(
      [{ id: "turned", bounds: turned }],
      [locked, near],
      PLATE,
    );
    const placed = moved(turned, shifts.turned);

    expect(isOutsideBuildVolume(placed, PLATE)).toBe(false);
    expect(gapBetween(placed, locked)).toBeGreaterThanOrEqual(
      OBJECT_GAP_MM - 1e-6,
    );
    expect(gapBetween(placed, near)).toBeGreaterThanOrEqual(
      OBJECT_GAP_MM - 1e-6,
    );
    // Nearest: toward the front (-Y), right under the two others
    expect(shifts.turned.dx).toBeCloseTo(0);
    expect(placed.max.y).toBeCloseTo(-10 - OBJECT_GAP_MM);
  });

  it("two objects turned onto each other: the second one moves", () => {
    const a = box(-30, -10, 60, 20);
    const b = box(-10, -30, 20, 60);
    const shifts = separateLayout(
      [
        { id: "a", bounds: a },
        { id: "b", bounds: b },
      ],
      [],
      PLATE,
    );
    const placedA = shifts.a ? moved(a, shifts.a) : a;
    const placedB = shifts.b ? moved(b, shifts.b) : b;

    expect(Object.keys(shifts)).toHaveLength(1);
    expect(gapBetween(placedA, placedB)).toBeGreaterThanOrEqual(
      OBJECT_GAP_MM - 1e-6,
    );
  });

  it("no free place: to the right of the plate, as Arrange", () => {
    const small = { x: 40, y: 40, z: 40 };
    const turned = box(-20, -20, 30, 30);
    const other = box(-5, -5, 25, 25);
    const shifts = separateLayout(
      [{ id: "turned", bounds: turned }],
      [other],
      small,
    );

    expect(moved(turned, shifts.turned).min.x).toBeCloseTo(20 + OBJECT_GAP_MM);
  });

  it("without a printer, every place is free", () => {
    const turned = box(-50, -10, 100, 20);
    const other = box(-10, -10, 20, 20);
    const shifts = separateLayout(
      [{ id: "turned", bounds: turned }],
      [other],
      null,
    );

    expect(
      gapBetween(moved(turned, shifts.turned), other),
    ).toBeGreaterThanOrEqual(OBJECT_GAP_MM - 1e-6);
  });
});
