/**
 * SlicyWeb
 * Optimization Service
 *
 * Orientation optimization at the request of the user (Phase 11 lot 98;
 * ADR-036 D4, D5, D6; GUI_SPEC.md, Tools Menu):
 * - Tools > Optimize Orientation and the toolbar button Optimize call
 *   optimizeOrientation(): the selected objects, all the objects when none
 *   is selected; never started by itself (ADR-036 D6);
 * - one search at a time (the menu and the button are disabled while it
 *   runs); the objects are searched one at a time, in the order of the
 *   scene, in a Web Worker (OptimizationRunner), on the triangle data of
 *   the object (GeometryRegistry) with its rotation and scale, and the
 *   build volume of the selected printer (no printer: no control of the
 *   size);
 * - the search of an object is dropped when the object is removed or
 *   turned or scaled meanwhile: no line in the message; an object turned
 *   or scaled after its search, before the end, is dropped too;
 * - each result is checked with OptimizationSchema (strict); a failure
 *   (OPT_002, or a result refused) leaves the orientation of the object
 *   unchanged, the others are applied;
 * - at the end, after any gesture in progress, the orientations found are
 *   applied together by TransformService, one history action OPTIMIZATION
 *   (UNDO_REDO_SPEC.md 2.3.0): the rotation becomes turn · R around the
 *   position of the object, position X and Y unchanged, the object placed
 *   back on the plate; the analysis and the recommendation become outdated
 *   and are computed again (Object Reference Rules 8 and 9);
 * - one message over the viewport, one line for each object searched, in
 *   the order of the scene (optimizationTaskStore).
 *
 * Nothing is stored (ADR-036 D5).
 *
 * Domain: Service. Depends on the Optimization Domain (OptimizationRunner),
 * the Scene Domain (GeometryRegistry, ObjectTransform), the Validation
 * Domain (OptimizationSchema) and State Management
 * (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DECISIONS.md (ADR-036 D4, D5, D6)
 * - DATA_SCHEMA.md (3.13.0: Optimization Result Rules; Transform Rules,
 *   Object Reference Rules)
 * - GUI_SPEC.md (Tools Menu, Toolbar Buttons, Status Bar, Error Handling
 *   UI: Optimization messages)
 * - UNDO_REDO_SPEC.md (2.3.0: Orientation Optimization)
 * - ERROR_CODES_SPEC.md (OPT_002)
 */

import * as THREE from "three";

import type { AnalysisTransform } from "../model_analysis/MeshAnalyzer";
import { OptimizationCancelledError } from "../optimization_engine/OptimizationError";
import { runOrientationSearch } from "../optimization_engine/OptimizationRunner";
import type {
  OrientationSearch,
  Turn,
} from "../optimization_engine/OrientationOptimizer";
import { GeometryRegistry } from "../scene/GeometryRegistry";
import { rotateAroundPoint } from "../scene/ObjectTransform";
import { OptimizationSchema } from "../schemas/RecommendationSchema";
import { useObjectStore } from "../state/objectStore";
import {
  useOptimizationTaskStore,
  type OptimizationLine,
} from "../state/optimizationTaskStore";
import { usePrinterStore } from "../state/printerStore";
import type { Object3D, Transform } from "../types/Object3D";
import type { BuildVolume } from "../types/Printer";

import { TransformService } from "./TransformService";

/** What the service needs from the rest of the application */
export interface OptimizationServiceDependencies {
  /** Search of one object (Web Worker) */
  run: (
    positions: Float32Array,
    transform: AnalysisTransform,
    buildVolume: BuildVolume | null,
    signal: AbortSignal,
  ) => Promise<OrientationSearch>;

  /** Triangle data of an object; null when it has none */
  positions: (objectId: string) => Float32Array | null;

  /** Build volume of the selected printer; null without a printer */
  buildVolume: () => BuildVolume | null;

  /** True during a gesture (drag, gizmo) */
  isGestureActive: () => boolean;

  /** Calls the listener at the end of each gesture */
  onGestureEnd: (listener: () => void) => () => void;

  /** Applies the transforms as one history action OPTIMIZATION */
  apply: (transforms: Record<string, Transform>) => boolean;

  createId: () => string;
}

export interface OptimizationServiceInstance {
  /**
   * Searches and applies the best orientation of these objects; nothing
   * when a search already runs
   */
  optimize: (objectIds: string[]) => void;

  /** Closes a message shown over the viewport */
  dismiss: (messageId: string) => void;

  /** Promise of the search in progress (tests) */
  idle: () => Promise<void>;
}

/** Rotation and scale of an object: what the search depends on */
function orientationKey(object: Object3D): string {
  const { rotation, scale } = object.transform;

  return [rotation.x, rotation.y, rotation.z, scale.x, scale.y, scale.z].join(
    ";",
  );
}

function findObject(objectId: string): Object3D | undefined {
  return useObjectStore
    .getState()
    .objects.find((object) => object.objectId === objectId);
}

/**
 * Transform after the turn of the search: rotation turn · R around the
 * position of the object (position X and Y unchanged; Z computed again
 * when it is applied, Transform Rules)
 */
export function turnedTransform(transform: Transform, turn: Turn): Transform {
  return rotateAroundPoint(
    transform,
    new THREE.Quaternion(turn.x, turn.y, turn.z, turn.w),
    transform.position,
  );
}

/** Result of one object, before the application */
interface Found {
  objectId: string;

  /** Rotation and scale when the search started */
  key: string;

  result: OrientationSearch | null;
}

export function createOptimizationService(
  dependencies: OptimizationServiceDependencies,
): OptimizationServiceInstance {
  let running: Promise<void> | null = null;

  /** Waits for the end of a gesture in progress */
  const afterGesture = (): Promise<void> =>
    dependencies.isGestureActive()
      ? new Promise((resolve) => {
          const stop = dependencies.onGestureEnd(() => {
            stop();
            resolve();
          });
        })
      : Promise.resolve();

  /** Search of one object; null result = OPT_002; undefined = dropped */
  const search = async (object: Object3D): Promise<Found | undefined> => {
    const { objectId } = object;
    const key = orientationKey(object);
    const controller = new AbortController();

    // Object removed, or turned or scaled meanwhile: search dropped
    const unsubscribe = useObjectStore.subscribe((state, before) => {
      if (state.objects === before.objects) {
        return;
      }

      const now = findObject(objectId);

      if (!now || orientationKey(now) !== key) {
        controller.abort();
      }
    });

    try {
      const positions = dependencies.positions(objectId);

      if (!positions) {
        throw new Error("The object has no geometry.");
      }

      const result = await dependencies.run(
        positions,
        {
          rotation: { ...object.transform.rotation },
          scale: { ...object.transform.scale },
        },
        dependencies.buildVolume(),
        controller.signal,
      );

      if (controller.signal.aborted) {
        return undefined;
      }

      const checked = OptimizationSchema.safeParse(result.optimization);

      if (!checked.success) {
        throw new Error(
          `The optimization result is not valid: ${checked.error.message}`,
        );
      }

      return { objectId, key, result };
    } catch (error) {
      if (
        error instanceof OptimizationCancelledError ||
        controller.signal.aborted
      ) {
        return undefined;
      }

      console.error(`Orientation search failed: ${object.fileName}`, error);

      return { objectId, key, result: null };
    } finally {
      unsubscribe();
    }
  };

  const run = async (objectIds: string[]): Promise<void> => {
    const wanted = new Set(objectIds);
    const objects = useObjectStore
      .getState()
      .objects.filter((object) => wanted.has(object.objectId));
    const found: Found[] = [];

    for (const object of objects) {
      // Removed or changed while the previous objects were searched
      const now = findObject(object.objectId);

      if (!now) {
        continue;
      }

      const entry = await search(now);

      if (entry) {
        found.push(entry);
      }
    }

    // Never during a gesture: applied once it is over
    await afterGesture();

    // Objects removed, or turned or scaled after their search: dropped
    const kept = found.filter((entry) => {
      const object = findObject(entry.objectId);
      return object !== undefined && orientationKey(object) === entry.key;
    });

    const transforms: Record<string, Transform> = {};

    for (const entry of kept) {
      const object = findObject(entry.objectId)!;

      if (entry.result?.turn) {
        transforms[entry.objectId] = turnedTransform(
          object.transform,
          entry.result.turn,
        );
      }
    }

    const applied =
      Object.keys(transforms).length === 0 || dependencies.apply(transforms);

    // Lines in the order of the scene
    const order = useObjectStore
      .getState()
      .objects.map((object) => object.objectId);
    const lines: OptimizationLine[] = kept
      .sort((a, b) => order.indexOf(a.objectId) - order.indexOf(b.objectId))
      .map((entry) => line(entry, applied));

    if (lines.length > 0) {
      useOptimizationTaskStore.getState().addMessage({
        messageId: dependencies.createId(),
        lines,
      });
    }
  };

  /** Line of the message for one object */
  const line = (entry: Found, applied: boolean): OptimizationLine => {
    const fileName = findObject(entry.objectId)?.fileName ?? "";
    const result = entry.result;

    if (!result || (result.turn && !applied)) {
      return {
        kind: "failed",
        objectId: entry.objectId,
        fileName,
        code: "OPT_002",
      };
    }

    if (!result.turn) {
      return {
        kind: "kept",
        objectId: entry.objectId,
        fileName,
        score: result.before.score,
      };
    }

    return {
      kind: "applied",
      objectId: entry.objectId,
      fileName,
      scoreBefore: result.before.score,
      scoreAfter: result.after.score,
      supportReduction: result.optimization.supportReduction,
      supportsRemoved:
        result.before.supportsNeeded && !result.after.supportsNeeded,
      riskBefore: result.before.riskScore,
      riskAfter: result.after.riskScore,
    };
  };

  return {
    optimize(objectIds) {
      if (running || objectIds.length === 0) {
        return;
      }

      const task = useOptimizationTaskStore.getState();

      task.setRunning(true);

      running = (async () => {
        // The rest runs after the caller has finished
        await Promise.resolve();

        try {
          await run(objectIds);
        } catch (error) {
          console.error("Orientation optimization failed.", error);
        } finally {
          running = null;
          useOptimizationTaskStore.getState().setRunning(false);
        }
      })();
    },

    dismiss(messageId) {
      useOptimizationTaskStore.getState().removeMessage(messageId);
    },

    async idle() {
      while (running) {
        await running;
      }
    },
  };
}

export const OptimizationService: OptimizationServiceInstance =
  createOptimizationService({
    run: (positions, transform, buildVolume, signal) =>
      runOrientationSearch(positions, transform, buildVolume, signal),
    positions: (objectId) => {
      const array =
        GeometryRegistry.get(objectId)?.getAttribute("position")?.array;

      return array instanceof Float32Array ? array : null;
    },
    buildVolume: () =>
      usePrinterStore.getState().selectedPrinter?.buildVolume ?? null,
    isGestureActive: () => TransformService.isGestureActive(),
    onGestureEnd: (listener) => TransformService.onGestureEnd(listener),
    apply: (transforms) =>
      TransformService.applyMany(transforms, { actionType: "OPTIMIZATION" }),
    createId: () => crypto.randomUUID(),
  });

/**
 * Tools > Optimize Orientation and the button Optimize: the selected
 * objects, all the objects when none is selected (ADR-036 D4)
 */
export function optimizeOrientation(): void {
  const { objects, selectedObjectIds } = useObjectStore.getState();

  OptimizationService.optimize(
    selectedObjectIds.length > 0
      ? [...selectedObjectIds]
      : objects.map((object) => object.objectId),
  );
}

export default OptimizationService;
