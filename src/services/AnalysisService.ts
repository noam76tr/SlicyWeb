/**
 * SlicyWeb
 * Analysis Service
 *
 * Starts the analysis of the objects of the scene, validates each result
 * with AnalysisSchema and stores it in the analysis store (Phase 9 lot 80;
 * ADR-034 D7, D9).
 *
 * When (ADR-034 D7, GUI_SPEC.md Tools Menu):
 * - automatic: an object without analysis (after its import), or whose
 *   analysis became outdated (rotation or scale), is analyzed once the
 *   gesture is over or the value confirmed, never during a gesture;
 * - Tools > Analyze Models (analyzeModels): all the objects without an
 *   analysis up to date, including those whose analysis failed;
 * - Tools > Recompute Analysis (recompute): the selected objects, even
 *   when their analysis is up to date.
 *
 * How:
 * - one object at a time, in a Web Worker (AnalysisRunner, no Electron,
 *   KI-024), on the triangle data of the object (GeometryRegistry) with
 *   its rotation and scale (the position is ignored, ADR-034 D2);
 * - a computation no longer needed (object removed, or turned or scaled
 *   again) is dropped: its worker is terminated, the object is analyzed
 *   again later if needed;
 * - the result is the Complete Analysis Schema (DATA_SCHEMA.md 3.9.0):
 *   analysisId kept at each computation (Object Reference Rule 5),
 *   status "generated", classification null until Phase 10 (ADR-034 D1);
 * - a failure (ANA_001: mesh empty or unreadable, computation failed,
 *   result refused by AnalysisSchema) shows the message ANA_001; no
 *   analysis is stored (an outdated analysis stays outdated) and the
 *   object is not analyzed again by itself until its rotation or scale
 *   changes, or Analyze Models or Recompute Analysis is chosen;
 * - a mesh not closed (ANA_002, ADR-034 D6) does not block: the analysis
 *   is stored, the warning is kept for the Analysis section and shown
 *   over the viewport the first time for each object;
 * - the triangles beyond 45 degrees of each analysis stored are kept for
 *   the display in red in the 3D viewport (GUI_SPEC.md, Overhang Display,
 *   lot 82); they are never saved.
 *
 * The state of the computation (objects waiting, warnings, messages) is
 * published in analysisTaskStore for the GUI.
 *
 * Domain: Service. Depends on the Analysis Domain (AnalysisRunner), the
 * Scene Domain (GeometryRegistry), the Validation Domain (AnalysisSchema)
 * and State Management (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Complete Analysis Schema, Analysis Rules,
 *   Object Reference Rules)
 * - DECISIONS.md (ADR-034 D1, D2, D6, D7, D9)
 * - ERROR_CODES_SPEC.md (ANA_001, ANA_002)
 * - GUI_SPEC.md (Tools Menu, Analysis Section, Status Bar)
 */

import { AnalysisCancelledError } from "../model_analysis/AnalysisError";
import { runModelAnalysis } from "../model_analysis/AnalysisRunner";
import type { AnalysisTransform } from "../model_analysis/MeshAnalyzer";
import type { ModelAnalysisResult } from "../model_analysis/ModelAnalyzer";
import { GeometryRegistry } from "../scene/GeometryRegistry";
import { AnalysisSchema } from "../schemas/AnalysisSchema";
import { useAnalysisStore } from "../state/analysisStore";
import {
  useAnalysisTaskStore,
  type AnalysisMessageCode,
} from "../state/analysisTaskStore";
import { useObjectStore } from "../state/objectStore";
import type { Analysis } from "../types/Analysis";
import type { Object3D } from "../types/Object3D";

import { TransformService } from "./TransformService";

/** What the service needs from the rest of the application */
export interface AnalysisServiceDependencies {
  /** Computation of one object (Web Worker) */
  run: (
    positions: Float32Array,
    transform: AnalysisTransform,
    signal: AbortSignal,
  ) => Promise<ModelAnalysisResult>;

  /** Triangle data of an object; null when it has none */
  positions: (objectId: string) => Float32Array | null;

  /** True during a gesture (drag, gizmo) */
  isGestureActive: () => boolean;

  /** Calls the listener at the end of each gesture */
  onGestureEnd: (listener: () => void) => () => void;

  createId: () => string;
}

export interface AnalysisServiceInstance {
  /**
   * Starts the automatic analysis (watches the objects and their
   * analyses); returns the function that stops it.
   */
  start: () => () => void;

  /** Tools > Analyze Models */
  analyzeModels: () => void;

  /** Tools > Recompute Analysis: these objects, even when up to date */
  recompute: (objectIds: string[]) => void;

  /** Closes a message shown over the viewport */
  dismiss: (messageId: string) => void;

  /** Promise of the computation in progress (tests) */
  idle: () => Promise<void>;
}

/** Rotation and scale of an object: what the analysis depends on */
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

/** The analysis of the object is up to date */
function isUpToDate(objectId: string): boolean {
  return useAnalysisStore.getState().analysis[objectId]?.status === "generated";
}

export function createAnalysisService(
  dependencies: AnalysisServiceDependencies,
): AnalysisServiceInstance {
  /** Objects waiting, in order; true = computed even when up to date */
  const queue = new Map<string, boolean>();

  /** Computation in progress */
  let current: {
    objectId: string;
    key: string;
    controller: AbortController;
    done: Promise<void>;
  } | null = null;

  /** Rotation and scale of each object whose last computation failed */
  const failedKeys = new Map<string, string>();

  /** Objects whose warning ANA_002 was already shown over the viewport */
  const warnedObjectIds = new Set<string>();

  let stopWatching: (() => void) | null = null;

  const publish = (): void => {
    const pending = [
      ...(current ? [current.objectId] : []),
      ...[...queue.keys()].filter((id) => id !== current?.objectId),
    ];
    const previous = useAnalysisTaskStore.getState().pendingObjectIds;

    if (
      pending.length !== previous.length ||
      pending.some((id, index) => id !== previous[index])
    ) {
      useAnalysisTaskStore.getState().setPending(pending);
    }
  };

  const message = (object: Object3D, code: AnalysisMessageCode): void => {
    useAnalysisTaskStore.getState().addMessage({
      messageId: dependencies.createId(),
      objectId: object.objectId,
      fileName: object.fileName,
      code,
    });
  };

  /** Objects to analyze by themselves (ADR-034 D7) */
  const collect = (): void => {
    for (const object of useObjectStore.getState().objects) {
      const { objectId } = object;

      if (
        isUpToDate(objectId) ||
        queue.has(objectId) ||
        failedKeys.get(objectId) === orientationKey(object)
      ) {
        continue;
      }

      queue.set(objectId, false);
    }
  };

  /** Drops what is no longer needed, then starts the next computation */
  const update = (): void => {
    const objects = useObjectStore.getState().objects;
    const ids = new Set(objects.map((object) => object.objectId));

    for (const objectId of [...queue.keys()]) {
      if (!ids.has(objectId)) {
        queue.delete(objectId);
      }
    }

    for (const objectId of [...failedKeys.keys()]) {
      if (!ids.has(objectId)) {
        failedKeys.delete(objectId);
      }
    }

    for (const objectId of [...warnedObjectIds]) {
      if (!ids.has(objectId)) {
        warnedObjectIds.delete(objectId);
      }
    }

    const task = useAnalysisTaskStore.getState();

    for (const objectId of new Set([
      ...task.openMeshObjectIds,
      ...Object.keys(task.overhangTriangles),
    ])) {
      if (!ids.has(objectId)) {
        useAnalysisTaskStore.getState().forgetObject(objectId);
      }
    }

    // Object removed, or turned or scaled again: computation dropped
    if (current) {
      const object = findObject(current.objectId);

      if (!object || orientationKey(object) !== current.key) {
        current.controller.abort();
        current = null;
      }
    }

    // Never during a gesture: the objects wait for its end
    if (!dependencies.isGestureActive()) {
      collect();

      if (!current) {
        next();
      }
    }

    publish();
  };

  const next = (): void => {
    for (const [objectId, force] of queue) {
      queue.delete(objectId);

      const object = findObject(objectId);

      if (!object || (!force && isUpToDate(objectId))) {
        continue;
      }

      compute(object);
      return;
    }
  };

  const compute = (object: Object3D): void => {
    const { objectId } = object;
    const key = orientationKey(object);
    const controller = new AbortController();
    const positions = dependencies.positions(objectId);
    const transform: AnalysisTransform = {
      rotation: { ...object.transform.rotation },
      scale: { ...object.transform.scale },
    };

    const entry = {
      objectId,
      key,
      controller,
      done: Promise.resolve(),
    };

    // Set before the computation starts: a failure found at once must
    // still find it
    current = entry;

    entry.done = (async () => {
      // The rest runs after the caller has finished (no nested update)
      await Promise.resolve();

      try {
        if (!positions) {
          throw new Error("The object has no geometry.");
        }

        const result = await dependencies.run(
          positions,
          transform,
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        store(object, result);
        failedKeys.delete(objectId);
      } catch (error) {
        if (
          error instanceof AnalysisCancelledError ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error(`Analysis failed: ${object.fileName}`, error);
        failedKeys.set(objectId, key);
        message(object, "ANA_001");
      } finally {
        if (current?.controller === controller) {
          current = null;
        }

        if (stopWatching) {
          update();
        } else {
          publish();
        }
      }
    })();
  };

  /** Complete Analysis Schema, validated, then stored */
  const store = (object: Object3D, result: ModelAnalysisResult): void => {
    const previous = useAnalysisStore.getState().analysis[object.objectId];
    const analysis: Analysis = {
      analysisId: previous?.analysisId ?? dependencies.createId(),
      objectId: object.objectId,
      status: "generated",
      dimensions: result.dimensions,
      geometry: result.geometry,
      mesh: result.mesh,
      stability: result.stability,
      overhangs: result.overhangs,
      bridges: result.bridges,
      thinWalls: result.thinWalls,
      classification: null,
    };

    const checked = AnalysisSchema.safeParse(analysis);

    if (!checked.success) {
      throw new Error(
        `The analysis result is not valid: ${checked.error.message}`,
      );
    }

    // Before the analysis: the viewport finds its triangles when the
    // analysis becomes up to date
    useAnalysisTaskStore
      .getState()
      .setOverhangTriangles(object.objectId, result.overhangTriangles);
    useAnalysisStore.getState().setAnalysis(analysis);
    useAnalysisTaskStore
      .getState()
      .setOpenMesh(object.objectId, !result.meshClosed);

    if (!result.meshClosed && !warnedObjectIds.has(object.objectId)) {
      warnedObjectIds.add(object.objectId);
      message(object, "ANA_002");
    }
  };

  return {
    start() {
      stopWatching?.();

      const unsubscribeObjects = useObjectStore.subscribe((state, before) => {
        if (state.objects !== before.objects) {
          update();
        }
      });
      const unsubscribeAnalyses = useAnalysisStore.subscribe(
        (state, before) => {
          if (state.analysis !== before.analysis) {
            update();
          }
        },
      );
      const unsubscribeGesture = dependencies.onGestureEnd(update);

      const stop = (): void => {
        unsubscribeObjects();
        unsubscribeAnalyses();
        unsubscribeGesture();
        current?.controller.abort();
        current = null;
        queue.clear();
        publish();

        if (stopWatching === stop) {
          stopWatching = null;
        }
      };

      stopWatching = stop;
      update();

      return stop;
    },

    analyzeModels() {
      for (const object of useObjectStore.getState().objects) {
        failedKeys.delete(object.objectId);

        if (!isUpToDate(object.objectId) && !queue.has(object.objectId)) {
          queue.set(object.objectId, false);
        }
      }

      update();
    },

    recompute(objectIds) {
      for (const objectId of objectIds) {
        if (!findObject(objectId)) {
          continue;
        }

        failedKeys.delete(objectId);

        // Already computed now with the same rotation and scale
        if (current?.objectId === objectId) {
          continue;
        }

        queue.set(objectId, true);
      }

      update();
    },

    dismiss(messageId) {
      useAnalysisTaskStore.getState().removeMessage(messageId);
    },

    async idle() {
      while (current) {
        await current.done;
      }
    },
  };
}

export const AnalysisService: AnalysisServiceInstance = createAnalysisService({
  run: (positions, transform, signal) =>
    runModelAnalysis(positions, transform, signal),
  positions: (objectId) => {
    const array =
      GeometryRegistry.get(objectId)?.getAttribute("position")?.array;

    return array instanceof Float32Array ? array : null;
  },
  isGestureActive: () => TransformService.isGestureActive(),
  onGestureEnd: (listener) => TransformService.onGestureEnd(listener),
  createId: () => crypto.randomUUID(),
});

export default AnalysisService;
