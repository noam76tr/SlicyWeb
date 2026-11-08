/**
 * SlicyWeb
 * Analysis Task Store Definition
 *
 * State of the computation of the analyses, displayed by the GUI (Phase 9
 * lot 80; ADR-034 D6, D7). Not project data: nothing here is saved
 * (DATA_SCHEMA.md keeps only the analyses, in analysisStore).
 * - pendingObjectIds: objects being analyzed or waiting for their turn
 *   (status "Analyzing…" of the Analysis section and of the status bar);
 * - openMeshObjectIds: objects whose last analysis found a mesh not
 *   closed (warning ANA_002 in the Analysis section; found again at each
 *   computation, ERROR_CODES_SPEC.md);
 * - messages: messages ANA_001 and ANA_002 shown over the viewport, like
 *   the messages of the import, until closed;
 * - overhangTriangles: triangles beyond 45 degrees found by the last
 *   analysis of each object, drawn in red by the 3D viewport while that
 *   analysis is up to date (GUI_SPEC.md, Overhang Display, lot 82).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Analysis Section, Status Bar, Error Handling UI,
 *   Overhang Display)
 * - ERROR_CODES_SPEC.md (ANA_001, ANA_002)
 * - DECISIONS.md (ADR-034 D6, D7)
 */

import { create } from "zustand";

export type AnalysisMessageCode = "ANA_001" | "ANA_002";

export interface AnalysisMessage {
  messageId: string;

  objectId: string;

  /** File name of the object when the message was created */
  fileName: string;

  code: AnalysisMessageCode;
}

interface AnalysisTaskState {
  /** Objects being analyzed or waiting, in the order of computation */
  pendingObjectIds: string[];

  /** Objects whose last analysis found a mesh not closed (ANA_002) */
  openMeshObjectIds: string[];

  /**
   * Objects whose last analysis found a closed mesh with parts touching
   * along an edge (information ANA_005 in the Analysis section; lot 91)
   */
  nonManifoldObjectIds: string[];

  messages: AnalysisMessage[];

  /**
   * Triangles beyond 45 degrees of the last analysis, by objectId (index
   * in the triangle data of the object)
   */
  overhangTriangles: Record<string, Uint32Array>;

  setPending: (objectIds: string[]) => void;

  /** Keeps (true) or clears (false) the warning ANA_002 of an object */
  setOpenMesh: (objectId: string, open: boolean) => void;

  /** Keeps (true) or clears (false) the information ANA_005 of an object */
  setNonManifold: (objectId: string, nonManifold: boolean) => void;

  /** Keeps the triangles beyond 45 degrees of the last analysis */
  setOverhangTriangles: (objectId: string, triangles: Uint32Array) => void;

  addMessage: (message: AnalysisMessage) => void;

  removeMessage: (messageId: string) => void;

  /** Forgets an object removed from the scene (its messages stay) */
  forgetObject: (objectId: string) => void;
}

export const useAnalysisTaskStore = create<AnalysisTaskState>((set) => ({
  pendingObjectIds: [],

  openMeshObjectIds: [],

  nonManifoldObjectIds: [],

  messages: [],

  overhangTriangles: {},

  setPending: (objectIds) =>
    set({
      pendingObjectIds: [...objectIds],
    }),

  setOpenMesh: (objectId, open) =>
    set((state) => {
      const others = state.openMeshObjectIds.filter((id) => id !== objectId);

      return {
        openMeshObjectIds: open ? [...others, objectId] : others,
      };
    }),

  setNonManifold: (objectId, nonManifold) =>
    set((state) => {
      const others = state.nonManifoldObjectIds.filter((id) => id !== objectId);

      return {
        nonManifoldObjectIds: nonManifold ? [...others, objectId] : others,
      };
    }),

  setOverhangTriangles: (objectId, triangles) =>
    set((state) => ({
      overhangTriangles: {
        ...state.overhangTriangles,
        [objectId]: triangles,
      },
    })),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter(
        (message) => message.messageId !== messageId,
      ),
    })),

  forgetObject: (objectId) =>
    set((state) => {
      const overhangTriangles = { ...state.overhangTriangles };

      delete overhangTriangles[objectId];

      return {
        pendingObjectIds: state.pendingObjectIds.filter(
          (id) => id !== objectId,
        ),
        openMeshObjectIds: state.openMeshObjectIds.filter(
          (id) => id !== objectId,
        ),
        nonManifoldObjectIds: state.nonManifoldObjectIds.filter(
          (id) => id !== objectId,
        ),
        overhangTriangles,
      };
    }),
}));
