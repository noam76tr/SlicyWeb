/**
 * SlicyWeb
 * Plate Layout
 *
 * Place of the objects on the build plate (lot 101, decision 103 of Noam,
 * answers Q1 to Q10: A). Pure functions, on the boxes of the objects:
 *
 * - isOutsideBuildVolume(): the box of the object seen from above goes
 *   out of the rectangle of the plate (X or Y), or the object is higher
 *   than the build height (Z) (Q1 A). The origin is the center of the
 *   plate (ADR-028); the rounded corners of the sheet are not counted; an
 *   object that touches an edge without going beyond it is inside.
 *
 * - arrangeLayout(): Arrange (Q7 A): rows, the deepest object first; each
 *   row is filled from left to right, then the next row toward the back;
 *   OBJECT_GAP_MM between two objects; the whole block centered on the
 *   plate (on the origin without a printer, Q9 A, rows about as wide as
 *   the block is deep). The orientation never changes: only X and Y move.
 *   The objects that do not fit (too wide, too deep or too high for the
 *   plate, or no room left) are put in a row to the right of the plate,
 *   outside it (Q8 A).
 *
 * - findFreePlace(): place of a copy (Duplicate, Q10 A): first to the
 *   right of the original group (preferred place), otherwise the free
 *   place of the plate nearest to the original, the right side first on a
 *   tie; null when there is no free place. A place is free when the block
 *   is inside the plate and OBJECT_GAP_MM away from every other object.
 *
 * Domain: Scene. No dependency on the GUI.
 *
 * Based on:
 * - DECISIONS.md (ADR-028: origin at the center of the plate)
 * - GUI_SPEC.md (Plate Check, Arrange, Edit Menu: Duplicate)
 */

import type { BuildVolume } from "../types/Printer";
import type { Bounds } from "./ObjectTransform";

/** Space between two objects arranged or copied, in millimeters (Q7 A) */
export const OBJECT_GAP_MM = 5;

/** Rounding tolerance of the comparisons, in millimeters */
const TOLERANCE_MM = 0.001;

/** Shift of an object in X and Y, in millimeters */
export interface Shift {
  dx: number;
  dy: number;
}

/** An object to arrange: its id and its box on the plate */
export interface LayoutItem {
  id: string;
  bounds: Bounds;
}

function width(bounds: Bounds): number {
  return bounds.max.x - bounds.min.x;
}

function depth(bounds: Bounds): number {
  return bounds.max.y - bounds.min.y;
}

function height(bounds: Bounds): number {
  return bounds.max.z - bounds.min.z;
}

/** The object can stand on the plate when nothing else is on it */
function fitsAlone(bounds: Bounds, volume: BuildVolume): boolean {
  return (
    width(bounds) <= volume.x + TOLERANCE_MM &&
    depth(bounds) <= volume.y + TOLERANCE_MM &&
    height(bounds) <= volume.z + TOLERANCE_MM
  );
}

/**
 * The object goes out of the build volume: out of the plate in X or Y
 * (box seen from above), or higher than the build height (Q1 A).
 */
export function isOutsideBuildVolume(
  bounds: Bounds,
  volume: BuildVolume,
): boolean {
  const halfX = volume.x / 2 + TOLERANCE_MM;
  const halfY = volume.y / 2 + TOLERANCE_MM;

  return (
    bounds.min.x < -halfX ||
    bounds.max.x > halfX ||
    bounds.min.y < -halfY ||
    bounds.max.y > halfY ||
    height(bounds) > volume.z + TOLERANCE_MM
  );
}

interface Row {
  items: LayoutItem[];
  width: number;
  depth: number;
}

/**
 * Arrange: the shift of each object (by id), so that the objects stand in
 * rows without touching, the block centered on the plate (Q7, Q8, Q9: A).
 * volume: build volume of the selected printer, or null (no plate).
 */
export function arrangeLayout(
  items: LayoutItem[],
  volume: BuildVolume | null,
  gap: number = OBJECT_GAP_MM,
): Record<string, Shift> {
  const shifts: Record<string, Shift> = {};

  if (items.length === 0) {
    return shifts;
  }

  // The deepest first, then the widest; same size: order of the scene
  const ordered = items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        depth(b.item.bounds) - depth(a.item.bounds) ||
        width(b.item.bounds) - width(a.item.bounds) ||
        a.index - b.index,
    )
    .map(({ item }) => item);

  // Without a plate: rows about as wide as the block is deep
  const area = items.reduce(
    (sum, item) =>
      sum + (width(item.bounds) + gap) * (depth(item.bounds) + gap),
    0,
  );
  const widest = Math.max(...items.map((item) => width(item.bounds)));
  const rowLimit = volume ? volume.x : Math.max(widest, Math.sqrt(area));
  const depthLimit = volume ? volume.y : Infinity;

  const rows: Row[] = [];
  const overflow: LayoutItem[] = [];
  let usedDepth = 0;

  for (const item of ordered) {
    const w = width(item.bounds);
    const d = depth(item.bounds);

    if (volume && !fitsAlone(item.bounds, volume)) {
      overflow.push(item);
      continue;
    }

    // First row with room left (its depth is set by its first object,
    // the deepest)
    const row = rows.find(
      (candidate) =>
        candidate.width + gap + w <= rowLimit + TOLERANCE_MM &&
        d <= candidate.depth + TOLERANCE_MM,
    );

    if (row) {
      row.items.push(item);
      row.width += gap + w;
      continue;
    }

    const needed = rows.length === 0 ? d : usedDepth + gap + d;

    if (needed > depthLimit + TOLERANCE_MM) {
      overflow.push(item);
      continue;
    }

    rows.push({ items: [item], width: w, depth: d });
    usedDepth = needed;
  }

  // The block of the rows, centered on the origin (center of the plate)
  const blockWidth = Math.max(0, ...rows.map((row) => row.width));
  let rowMinY = -usedDepth / 2;

  for (const row of rows) {
    let minX = -blockWidth / 2;

    for (const item of row.items) {
      shifts[item.id] = {
        dx: minX - item.bounds.min.x,
        dy: rowMinY - item.bounds.min.y,
      };
      minX += width(item.bounds) + gap;
    }

    rowMinY += row.depth + gap;
  }

  // The objects that do not fit: a row to the right of the plate (Q8 A)
  let minX = (volume ? volume.x / 2 : blockWidth / 2) + gap;

  for (const item of overflow) {
    shifts[item.id] = {
      dx: minX - item.bounds.min.x,
      dy: -depth(item.bounds) / 2 - item.bounds.min.y,
    };
    minX += width(item.bounds) + gap;
  }

  return shifts;
}

/** The block, moved to minX, minY, is OBJECT_GAP_MM away from the box */
function apart(
  minX: number,
  minY: number,
  w: number,
  d: number,
  other: Bounds,
  gap: number,
): boolean {
  return (
    minX >= other.max.x + gap - TOLERANCE_MM ||
    minX + w <= other.min.x - gap + TOLERANCE_MM ||
    minY >= other.max.y + gap - TOLERANCE_MM ||
    minY + d <= other.min.y - gap + TOLERANCE_MM
  );
}

/**
 * Free place of a block (copies of a group, Q10 A): the shift of the
 * block from its box, or null when no place of the plate is free.
 * block: box of the block before the shift; others: boxes of the objects
 * of the scene; preferred: shift tried first (to the right of the
 * original); origin: point the place is nearest to (center of the
 * original group).
 */
export function findFreePlace(
  block: Bounds,
  others: Bounds[],
  volume: BuildVolume,
  preferred: Shift,
  origin: { x: number; y: number },
  gap: number = OBJECT_GAP_MM,
): Shift | null {
  const w = width(block);
  const d = depth(block);

  if (!fitsAlone(block, volume)) {
    return null;
  }

  const plateMinX = -volume.x / 2;
  const plateMaxX = volume.x / 2;
  const plateMinY = -volume.y / 2;
  const plateMaxY = volume.y / 2;

  const free = (minX: number, minY: number): boolean =>
    minX >= plateMinX - TOLERANCE_MM &&
    minX + w <= plateMaxX + TOLERANCE_MM &&
    minY >= plateMinY - TOLERANCE_MM &&
    minY + d <= plateMaxY + TOLERANCE_MM &&
    others.every((other) => apart(minX, minY, w, d, other, gap));

  const preferredX = block.min.x + preferred.dx;
  const preferredY = block.min.y + preferred.dy;

  if (free(preferredX, preferredY)) {
    return preferred;
  }

  // Candidate corners: against an edge of the plate or next to an object
  // (a free place can always slide until it touches one of them)
  const xs = [
    preferredX,
    block.min.x,
    origin.x - w / 2,
    plateMinX,
    plateMaxX - w,
    ...others.flatMap((other) => [other.max.x + gap, other.min.x - gap - w]),
  ];
  const ys = [
    preferredY,
    block.min.y,
    origin.y - d / 2,
    plateMinY,
    plateMaxY - d,
    ...others.flatMap((other) => [other.max.y + gap, other.min.y - gap - d]),
  ];

  let best: { minX: number; minY: number; distance: number } | null = null;

  for (const minX of xs) {
    for (const minY of ys) {
      if (!free(minX, minY)) {
        continue;
      }

      const distance = Math.hypot(
        minX + w / 2 - origin.x,
        minY + d / 2 - origin.y,
      );

      // Nearest first; on a tie, the right side (greater X)
      if (
        !best ||
        distance < best.distance - TOLERANCE_MM ||
        (Math.abs(distance - best.distance) <= TOLERANCE_MM &&
          minX > best.minX + TOLERANCE_MM)
      ) {
        best = { minX, minY, distance };
      }
    }
  }

  return best
    ? { dx: best.minX - block.min.x, dy: best.minY - block.min.y }
    : null;
}
