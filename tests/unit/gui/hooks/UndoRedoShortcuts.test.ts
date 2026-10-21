/**
 * SlicyWeb
 * Undo Redo Shortcuts Tests
 *
 * Keys of undo and redo (UNDO_REDO_SPEC.md, Keyboard Shortcuts), read the
 * same way by the window and by the fields of the Transform section:
 * Ctrl+Z (Cmd+Z) undo; Ctrl+Y, Ctrl+Shift+Z redo; the letter is read from
 * the key typed (AZERTY) or from its position (Hebrew layout).
 *
 * Based on:
 * - UNDO_REDO_SPEC.md (Keyboard Shortcuts)
 * - TEST_PLAN.md
 */

import { describe, expect, it } from "vitest";

import {
  undoRedoCommand,
  type ShortcutKeys,
} from "../../../../src/gui/hooks/useUndoRedoShortcuts";

function keys(
  key: string,
  code: string,
  modifiers: Partial<ShortcutKeys> = {},
): ShortcutKeys {
  return {
    key,
    code,
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    ...modifiers,
  };
}

describe("Undo and redo keys", () => {
  it("reads Ctrl+Z, Ctrl+Y and Ctrl+Shift+Z", () => {
    expect(undoRedoCommand(keys("z", "KeyZ"))).toBe("undo");
    expect(undoRedoCommand(keys("y", "KeyY"))).toBe("redo");
    expect(undoRedoCommand(keys("Z", "KeyZ", { shiftKey: true }))).toBe("redo");
    expect(
      undoRedoCommand(keys("z", "KeyZ", { ctrlKey: false, metaKey: true })),
    ).toBe("undo");
  });

  it("reads the letter typed on AZERTY and the key position in Hebrew", () => {
    // AZERTY: the Z key is where W is on QWERTY
    expect(undoRedoCommand(keys("z", "KeyW"))).toBe("undo");
    expect(undoRedoCommand(keys("w", "KeyZ"))).toBeNull();
    // Hebrew layout: no Latin letter, the position is read
    expect(undoRedoCommand(keys("ז", "KeyZ"))).toBe("undo");
  });

  it("ignores other keys, Alt and keys without Ctrl", () => {
    expect(undoRedoCommand(keys("z", "KeyZ", { ctrlKey: false }))).toBeNull();
    expect(undoRedoCommand(keys("z", "KeyZ", { altKey: true }))).toBeNull();
    expect(undoRedoCommand(keys("Y", "KeyY", { shiftKey: true }))).toBeNull();
    expect(undoRedoCommand(keys("a", "KeyA"))).toBeNull();
  });
});
