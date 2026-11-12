/**
 * SlicyWeb
 * Object Snapshots
 *
 * Takes objects out of the scene and puts them back as they were, for
 * Delete, Duplicate and their undo and redo (lot 100; UNDO_REDO_SPEC.md
 * 2.4.0, Delete Actions, Duplicate Actions):
 * - takeOut(): removes objects from the scene with their analysis and
 *   their recommendation (Object Reference Rule 6), their geometry and
 *   what their analysis left for the display (red triangles, ANA_002,
 *   ANA_005);
 *   returns what is needed to put each one back (ObjectSnapshot);
 * - putBack(): puts objects back at their place in the list, with their
 *   geometry and their analysis as it was (category chosen by the user,
 *   triangles beyond 45 degrees, ANA_002, ANA_005); no analysis is
 *   computed again. Their recommendation is not kept: the recommendation
 *   service generates it again at once, with the printer and the
 *   material selected at that time (Object Reference Rule 11).
 *
 * The geometry taken out is referenced, not copied (Geometry Storage
 * Rules); its graphics memory is freed, the viewport uploads it again
 * when the object comes back.
 *
 * Domain: Scene. Depends on State Management (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - UNDO_REDO_SPEC.md (2.4.0: Delete Actions, Duplicate Actions, Geometry
 *   Storage Rules, Validation Rules, Error Handling)
 * - DATA_SCHEMA.md (Object Reference Rules 6, 7, 11)
 */

import { useAnalysisStore } from "../state/analysisStore";
import { useAnalysisTaskStore } from "../state/analysisTaskStore";
import type { ObjectSnapshot, SceneHistoryEntry } from "../state/historyStore";
import { useObjectStore } from "../state/objectStore";

import { GeometryRegistry } from "./GeometryRegistry";

/**
 * Snapshot of objects of the scene, by objectId, in the order of the
 * scene; null when an object does not exist or has no geometry.
 */
export function snapshotObjects(
  objectIds: string[],
): Record<string, ObjectSnapshot> | null {
  const wanted = new Set(objectIds);
  const objects = useObjectStore.getState().objects;
  const analyses = useAnalysisStore.getState().analysis;
  const task = useAnalysisTaskStore.getState();
  const snapshots: Record<string, ObjectSnapshot> = {};

  objects.forEach((object, index) => {
    if (!wanted.has(object.objectId)) {
      return;
    }

    const geometry = GeometryRegistry.get(object.objectId);

    if (!geometry) {
      return;
    }

    snapshots[object.objectId] = {
      object,
      index,
      geometry,
      analysis: analyses[object.objectId] ?? null,
      overhangTriangles: task.overhangTriangles[object.objectId] ?? null,
      openMesh: task.openMeshObjectIds.includes(object.objectId),
      nonManifold: task.nonManifoldObjectIds.includes(object.objectId),
    };
  });

  return Object.keys(snapshots).length === new Set(objectIds).size
    ? snapshots
    : null;
}

/**
 * Removes objects from the scene; returns their snapshots, or null (and
 * nothing is changed) when one of them does not exist.
 */
export function takeOut(
  objectIds: string[],
): Record<string, ObjectSnapshot> | null {
  const snapshots = objectIds.length > 0 ? snapshotObjects(objectIds) : null;

  if (!snapshots) {
    return null;
  }

  const ids = Object.keys(snapshots);

  // Analysis and recommendation removed with the objects (rule 6)
  useObjectStore.getState().removeObjects(ids);

  for (const objectId of ids) {
    GeometryRegistry.remove(objectId);
    useAnalysisTaskStore.getState().forgetObject(objectId);
  }

  return snapshots;
}

/**
 * Puts objects back at their place, as they were; returns false (and
 * nothing is changed) when an object of the same objectId is already in
 * the scene.
 */
export function putBack(snapshots: Record<string, ObjectSnapshot>): boolean {
  const entries = Object.values(snapshots).sort((a, b) => a.index - b.index);
  const present = new Set(
    useObjectStore.getState().objects.map((object) => object.objectId),
  );

  if (
    entries.length === 0 ||
    entries.some((entry) => present.has(entry.object.objectId))
  ) {
    return false;
  }

  for (const entry of entries) {
    GeometryRegistry.set(entry.object.objectId, entry.geometry);
  }

  // The analysis first: an object put back with its analysis up to date
  // is not analyzed again
  for (const entry of entries) {
    if (entry.analysis) {
      useAnalysisStore.getState().setAnalysis(entry.analysis);
    }
  }

  useObjectStore
    .getState()
    .insertObjects(
      entries.map((entry) => ({ object: entry.object, index: entry.index })),
    );

  const task = useAnalysisTaskStore.getState();

  for (const entry of entries) {
    const { objectId } = entry.object;

    if (entry.overhangTriangles) {
      task.setOverhangTriangles(objectId, entry.overhangTriangles);
    }

    task.setOpenMesh(objectId, entry.openMesh);
    task.setNonManifold(objectId, entry.nonManifold);
  }

  return true;
}

/** Selects these objects (those put back are shown, Phase 6 rule) */
function select(objectIds: string[]): void {
  useObjectStore.getState().selectObjects(objectIds);
}

/**
 * Undoes a Delete (puts the objects back, selected) or a Duplicate (takes
 * the copies out, with what they got since: their analysis). Returns the
 * entry to put on the redo stack, or null when it cannot be restored
 * (nothing is changed, the error is logged: Error Handling).
 */
export function undoSceneEntry(
  entry: SceneHistoryEntry,
): SceneHistoryEntry | null {
  if (entry.type === "DELETE") {
    if (!putBack(entry.before)) {
      console.error("Undo: object already in the scene, action skipped.");
      return null;
    }

    select(Object.keys(entry.before));
    return entry;
  }

  const after = takeOut(Object.keys(entry.after));

  if (!after) {
    console.error("Undo: copy not found, action skipped.");
    return null;
  }

  return { ...entry, after };
}

/**
 * Redoes a Delete (takes the objects out again) or a Duplicate (puts the
 * copies back, selected). Returns the entry to put on the undo stack, or
 * null when it cannot be restored (nothing is changed, the error is
 * logged).
 */
export function redoSceneEntry(
  entry: SceneHistoryEntry,
): SceneHistoryEntry | null {
  if (entry.type === "DELETE") {
    const before = takeOut(Object.keys(entry.before));

    if (!before) {
      console.error("Redo: object not found, action skipped.");
      return null;
    }

    return { ...entry, before };
  }

  if (!putBack(entry.after)) {
    console.error("Redo: object already in the scene, action skipped.");
    return null;
  }

  select(Object.keys(entry.after));
  return entry;
}
