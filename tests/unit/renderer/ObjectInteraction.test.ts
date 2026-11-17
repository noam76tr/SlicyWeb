/**
 * SlicyWeb
 * Object Interaction Tests (right button)
 *
 * Context menu of the viewport (lot 105, decisions of Noam Q1, Q5, Q6 A):
 * - a right click released after less than 5 pixels opens the menu of the
 *   object under the pointer, or of the scene in the empty space;
 * - an object that is not selected becomes the only selected object
 *   first; an object already selected keeps the whole selection; the
 *   empty space keeps the selection;
 * - from 5 pixels, the drag turns the view: no menu, even when the drag
 *   started on an object and came back to its start;
 * - the left button still selects as before.
 *
 * The canvas is a small fake element (the tests run without a browser):
 * the object "a" is under the pointer when X < 100.
 *
 * Based on:
 * - GUI_SPEC.md (Viewport Controls, Object Context Menu)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";

import {
  ObjectInteraction,
  type ObjectInteractionOptions,
} from "../../../src/renderer/ObjectInteraction";

type Listener = (event: PointerEvent) => void;

/** Canvas of 200 × 200 pixels at the top left corner of the window */
function fakeCanvas() {
  const listeners = new Map<string, Listener>();
  const element = {
    style: {} as Record<string, string>,
    ownerDocument: {
      createElement: () => ({
        style: {},
        dataset: {},
        className: "",
        remove: () => undefined,
      }),
    },
    parentElement: { appendChild: () => undefined },
    addEventListener: (type: string, listener: Listener) => {
      listeners.set(type, listener);
    },
    removeEventListener: (type: string) => {
      listeners.delete(type);
    },
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      right: 200,
      bottom: 200,
    }),
    setPointerCapture: () => undefined,
    releasePointerCapture: () => undefined,
  };

  const fire = (
    type: string,
    button: number,
    clientX: number,
    clientY: number,
  ): void => {
    listeners.get(type)?.({
      type,
      button,
      buttons: type === "pointerup" ? 0 : button === 2 ? 2 : 1,
      pointerId: 1,
      clientX,
      clientY,
      ctrlKey: false,
      metaKey: false,
    } as unknown as PointerEvent);
  };

  return { element: element as unknown as HTMLElement, fire };
}

let selection: string[];
let menus: [string | null, number, number][];
let canvas: ReturnType<typeof fakeCanvas>;
let pointerX: number;

beforeEach(() => {
  selection = [];
  menus = [];
  canvas = fakeCanvas();

  const camera = new THREE.PerspectiveCamera();
  const options: ObjectInteractionOptions = {
    domElement: canvas.element,
    getCamera: () => camera,
    // The object "a" fills the left half of the canvas
    pick: () => (pointerX < 100 ? "a" : null),
    isGizmoActive: () => false,
    getGizmoHover: () => null,
    getObject: () => undefined,
    getSelection: () => selection,
    select: (objectId) => {
      selection = objectId ? [objectId] : [];
    },
    toggle: () => undefined,
    onMove: () => undefined,
    onGesture: () => undefined,
    selectInRect: () => undefined,
    onContextMenu: (objectId, clientX, clientY) => {
      menus.push([objectId, clientX, clientY]);
    },
  };

  new ObjectInteraction(options);
});

/** Right button pressed at (x1, y1), moved through points, released */
function rightClick(points: [number, number][]): void {
  const [first] = points;
  const last = points[points.length - 1];

  pointerX = first[0];
  canvas.fire("pointerdown", 2, first[0], first[1]);
  for (const [x, y] of points.slice(1)) {
    pointerX = x;
    canvas.fire("pointermove", 2, x, y);
  }
  pointerX = last[0];
  canvas.fire("pointerup", 2, last[0], last[1]);
}

describe("Right button: context menu", () => {
  it("on an object not selected: selected alone first, then its menu", () => {
    selection = ["b"];
    rightClick([[50, 50]]);

    expect(selection).toEqual(["a"]);
    expect(menus).toEqual([["a", 50, 50]]);
  });

  it("on an object already selected: the whole selection is kept", () => {
    selection = ["b", "a"];
    rightClick([[50, 50]]);

    expect(selection).toEqual(["b", "a"]);
    expect(menus).toEqual([["a", 50, 50]]);
  });

  it("in the empty space: menu of the scene, the selection is kept", () => {
    selection = ["a"];
    rightClick([[150, 50]]);

    expect(selection).toEqual(["a"]);
    expect(menus).toEqual([[null, 150, 50]]);
  });

  it("released less than 5 pixels away: still a click", () => {
    rightClick([
      [50, 50],
      [53, 53],
    ]);

    expect(menus).toEqual([["a", 53, 53]]);
  });

  it("dragged 5 pixels or more: rotation of the view, no menu, selection unchanged", () => {
    rightClick([
      [50, 50],
      [55, 50],
    ]);

    expect(menus).toEqual([]);
    expect(selection).toEqual([]);
  });

  it("a drag that starts on an object and comes back: no menu", () => {
    rightClick([
      [50, 50],
      [90, 80],
      [50, 50],
    ]);

    expect(menus).toEqual([]);
    expect(selection).toEqual([]);
  });

  it("the left button still selects, without a menu", () => {
    pointerX = 50;
    canvas.fire("pointerdown", 0, 50, 50);
    canvas.fire("pointerup", 0, 50, 50);

    expect(selection).toEqual(["a"]);
    expect(menus).toEqual([]);
  });
});
