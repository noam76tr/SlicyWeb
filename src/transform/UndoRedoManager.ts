/**
 * Wichy
 * Undo Redo Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - DATA_SCHEMA.md
 */

export class UndoRedoManager<T> {
  private readonly undoStack: T[] = [];

  private readonly redoStack: T[] = [];

  public saveState(
    state: T
  ): void {
    this.undoStack.push(state);

    this.redoStack.length = 0;
  }

  public undo(
    currentState: T
  ): T | null {
    const previousState =
      this.undoStack.pop();

    if (!previousState) {
      return null;
    }

    this.redoStack.push(currentState);

    return previousState;
  }

  public redo(
    currentState: T
  ): T | null {
    const nextState =
      this.redoStack.pop();

    if (!nextState) {
      return null;
    }

    this.undoStack.push(currentState);

    return nextState;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack.length = 0;

    this.redoStack.length = 0;
  }
}
