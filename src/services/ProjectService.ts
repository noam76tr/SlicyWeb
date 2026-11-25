/**
 * SlicyWeb
 * Project Service
 *
 * The project of the window (Phase 13, lot 111, ADR-038; decision 119 of
 * Noam, Q1 to Q22 A):
 * - New and Close (Q14 A): empty scene, history cleared, "Untitled", not
 *   modified; the printer, the material and the filament stay;
 * - Open, a recent project, a .wyproj dropped (Q15 A): the project read
 *   and validated by the main process replaces the scene (not undoable,
 *   UNDO_REDO_SPEC.md); a file refused changes nothing (Q16 A);
 * - Save and Save As (Q10 A): the content of the window (objects, their
 *   triangles, analyses, recommendations, printer, material, filament)
 *   is sent to the main process, which writes the file (Q20 A);
 * - modified (Q11 A): place of the history at the save, and the changes
 *   outside the history (markChanged: import, printer, material,
 *   filament, type of object);
 * - "Save the changes?" (Q13 A) before New, Open, a recent project, a
 *   project dropped, Close, Quit and the close button of the window;
 * - automatic save (Q18 A): a copy of the project modified, every
 *   project.autoSaveInterval seconds (300), in the recovery folder of the
 *   main process; recovery at start (Q19 A);
 * - profiles of a project opened (Q3 A): the same profile of the lists is
 *   chosen; a profile changed since the save: the one of the lists, and
 *   the recommendations are made again; a profile not in the lists: the
 *   copy of the project, in the group "This project", for this project
 *   only. Opening never changes the choices saved in settings.json.
 *
 * The texts of the Windows dialogs are given by the GUI (setDialogTexts):
 * no text here.
 *
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md 3.16.0
 * - IMPORT_EXPORT_SPEC.md 3.2.0 (WYPROJ Project Lifecycle)
 * - GUI_SPEC.md (File Menu, Unsaved Changes Dialog, Recovery Dialog)
 * - UNDO_REDO_SPEC.md (Project Operations)
 * - API_SPEC.md (ProjectIPC Channels)
 */

import * as THREE from "three";
import { z } from "zod";

import { GeometryRegistry } from "../scene/GeometryRegistry";
import { AnalysisSchema } from "../schemas/AnalysisSchema";
import { FilamentSchema } from "../schemas/FilamentSchema";
import { MaterialSchema } from "../schemas/MaterialSchema";
import { PrinterSchema } from "../schemas/PrinterSchema";
import { ProjectObjectFieldsSchema } from "../schemas/ProjectSchema";
import { RecommendationSchema } from "../schemas/RecommendationSchema";
import { ProjectPreferencesSchema } from "../schemas/UserPreferencesSchema";
import { useAnalysisStore } from "../state/analysisStore";
import { useAnalysisTaskStore } from "../state/analysisTaskStore";
import { useFilamentStore } from "../state/filamentStore";
import { useHistoryStore } from "../state/historyStore";
import { useMaterialStore } from "../state/materialStore";
import { useObjectStore } from "../state/objectStore";
import { usePrinterStore } from "../state/printerStore";
import {
  isModified,
  topActionId,
  useProjectStore,
  type PendingAction,
  type ProjectIdentity,
} from "../state/projectStore";
import { useRecommendationStore } from "../state/recommendationStore";
import { useRecommendationTaskStore } from "../state/recommendationTaskStore";
import type { Analysis } from "../types/Analysis";
import type { Filament } from "../types/Filament";
import type { Material } from "../types/Material";
import type { Object3D } from "../types/Object3D";
import type { Printer } from "../types/Printer";
import type { Recommendation } from "../types/Recommendation";

import { RecommendationService } from "./RecommendationService";

type Bridge = Pick<Window["slicyWeb"], "invoke">;

/** Texts of the Windows dialogs, translated by the GUI */
export interface DialogTexts {
  openTitle: string;
  saveTitle: string;
  filterName: string;
}

const PROJECT_EXTENSION = ".wyproj";

/** "Project saved" stays this long in the status bar */
const SAVED_DISPLAY_MS = 3000;

/** Default interval of the automatic save, in seconds */
const DEFAULT_AUTOSAVE = { autoSave: true, autoSaveInterval: 300 };

const RecentProjectsSchema = z.array(
  z.object({ name: z.string(), path: z.string() }),
);

/** A project read, as the main process sends it */
const OpenedSchema = z.object({
  project: z.object({
    projectId: z.string().min(1),
    createdAt: z.string().min(1),
    scene: z.object({ objects: z.array(ProjectObjectFieldsSchema) }),
    analysis: z.record(z.string(), AnalysisSchema),
    recommendations: z.record(z.string(), RecommendationSchema),
    printer: PrinterSchema.nullable(),
    material: MaterialSchema.nullable(),
    filament: FilamentSchema.nullable(),
  }),
  meshes: z.record(z.string(), z.instanceof(Float32Array)),
  token: z.string().nullable(),
  projectName: z.string(),
  recentProjects: RecentProjectsSchema.optional(),
});

type Opened = z.infer<typeof OpenedSchema>;

const SavedSchema = z.object({
  saved: z.object({
    projectId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    projectName: z.string(),
  }),
  token: z.string(),
  recentProjects: RecentProjectsSchema,
});

const ErrorSchema = z.object({
  success: z.literal(false),
  data: z
    .object({
      code: z.string().optional(),
      params: z.record(z.union([z.string(), z.boolean()])).optional(),
    })
    .default({}),
});

const RecoveryCheckSchema = z.union([
  z.object({
    available: z.literal(true),
    projectName: z.string(),
    savedAt: z.string(),
  }),
  z.object({ available: z.literal(false), quarantined: z.boolean() }),
]);

/** Result of a channel: its data, cancelled, or failed (message shown) */
type ChannelResult =
  | { status: "ok"; data: Record<string, unknown> }
  | { status: "cancelled" }
  | { status: "failed" };

function getBridge(): Bridge | null {
  return typeof globalThis.window?.slicyWeb?.invoke === "function"
    ? globalThis.window.slicyWeb
    : null;
}

let dialogTexts: DialogTexts = {
  openTitle: "",
  saveTitle: "",
  filterName: "WYPROJ",
};

/** True while a project is put in the window (no "modified") */
let applying = false;

/** A change since the last copy of the automatic save */
let changedSinceAutoSave = false;

let autoSaveTimer: ReturnType<typeof setInterval> | null = null;
let savedTimer: ReturnType<typeof setTimeout> | null = null;

/** The window may close (the question was answered) */
let closeAllowed = false;

function message(key: string, params: Record<string, string> = {}, error = false): void {
  useProjectStore.getState().addMessage({
    messageId: crypto.randomUUID(),
    key,
    params,
    error,
  });
}

/** The message of an error PROJ_00x of a response */
function showError(response: unknown): void {
  const result = ErrorSchema.safeParse(response);
  const code = result.success ? result.data.data.code : undefined;
  const params = Object.fromEntries(
    Object.entries(result.success ? (result.data.data.params ?? {}) : {}).map(
      ([key, value]) => [key, String(value)],
    ),
  );

  console.error("Project operation failed.", response);
  // A version missing is a damaged file
  const known =
    code !== undefined &&
    /^PROJ_00[1-5]$/.test(code) &&
    !(code === "PROJ_003" && !params.fileVersion);

  message(
    known
      ? code === "PROJ_003" && params.newer === "false"
        ? "project.error.PROJ_003_older"
        : `project.error.${code}`
      : "project.error.PROJ_002",
    params,
    true,
  );
}

async function call(
  channel: string,
  payload?: unknown,
): Promise<ChannelResult> {
  const bridge = getBridge();

  if (!bridge) {
    return { status: "failed" };
  }

  try {
    const response = (await bridge.invoke(channel, payload)) as {
      success?: boolean;
      data?: Record<string, unknown>;
    } | null;

    if (response?.success !== true) {
      showError(response);
      return { status: "failed" };
    }

    if (response.data?.cancelled === true) {
      return { status: "cancelled" };
    }

    return { status: "ok", data: response.data ?? {} };
  } catch (error) {
    showError(error);
    return { status: "failed" };
  }
}

/** Name of a file without its extension */
function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");

  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

/** The content of the window, as the main process saves it */
export function collectContent(): Record<string, unknown> {
  const objects = useObjectStore.getState().objects.map(
    (object): Object3D => ({
      objectId: object.objectId,
      fileName: object.fileName,
      name: object.name,
      fileType: object.fileType,
      visible: object.visible,
      locked: object.locked,
      transform: object.transform,
      geometry: object.geometry,
      mesh: object.mesh,
    }),
  );
  const meshes: Record<string, Float32Array> = {};

  for (const object of objects) {
    const array =
      GeometryRegistry.get(object.objectId)?.getAttribute("position")?.array;

    if (array instanceof Float32Array) {
      meshes[object.objectId] = array;
    }
  }

  return {
    objects,
    meshes,
    analysis: useAnalysisStore.getState().analysis,
    recommendations: useRecommendationStore.getState().recommendations,
    printer: usePrinterStore.getState().selectedPrinter,
    material: useMaterialStore.getState().selectedMaterial,
    filament: useFilamentStore.getState().selectedFilament,
  };
}

/** Text of a value with its keys sorted (comparison of two profiles) */
function stable(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stable(
            (value as Record<string, unknown>)[key],
          )}`,
      )
      .join(",")}}`;
  }

  return JSON.stringify(value) ?? "null";
}

/** How a profile of a project is chosen at opening (Q3 A) */
export interface ResolvedProfile<T> {
  /** The profile chosen */
  selected: T | null;
  /** The copy of the project, not in the lists ("This project") */
  projectOnly: T | null;
  /** The profile of the lists differs from the copy of the project */
  changed: boolean;
}

export function resolveProfile<T extends { id: string }>(
  copy: T | null,
  list: T[],
): ResolvedProfile<T> {
  if (!copy) {
    return { selected: null, projectOnly: null, changed: false };
  }

  const listed = list.find((item) => item.id === copy.id);

  if (!listed) {
    return { selected: copy, projectOnly: copy, changed: false };
  }

  return {
    selected: listed,
    projectOnly: null,
    changed: stable(listed) !== stable(copy),
  };
}

/** Empties the scene (New, Close, Open) */
function clearScene(): void {
  useHistoryStore.getState().clear();
  useObjectStore.getState().clearObjects();
  GeometryRegistry.clear();
  useAnalysisStore.getState().clearAnalysis();
  useRecommendationStore.getState().clearRecommendations();
  useRecommendationTaskStore.getState().clearErrors();

  const task = useAnalysisTaskStore.getState();

  for (const objectId of new Set([
    ...task.openMeshObjectIds,
    ...task.nonManifoldObjectIds,
    ...Object.keys(task.overhangTriangles),
    ...Object.keys(task.faceAreas),
  ])) {
    useAnalysisTaskStore.getState().forgetObject(objectId);
  }
}

function forgetProjectProfiles(): void {
  const printers = usePrinterStore.getState();
  const materials = useMaterialStore.getState();
  const filaments = useFilamentStore.getState();

  // A profile of the project only is no longer offered
  if (printers.projectPrinter) {
    if (printers.selectedPrinter === printers.projectPrinter) {
      printers.setSelectedPrinter(null);
    }
    printers.setProjectPrinter(null);
  }

  if (materials.projectMaterial) {
    if (materials.selectedMaterial === materials.projectMaterial) {
      materials.setSelectedMaterial(null);
      filaments.setSelectedFilament(null);
    }
    materials.setProjectMaterial(null);
  }

  if (filaments.projectFilament) {
    if (filaments.selectedFilament === filaments.projectFilament) {
      filaments.setSelectedFilament(null);
    }
    filaments.setProjectFilament(null);
  }
}

/** Resets the project of the window (New, Close) */
function resetProject(): void {
  applying = true;

  try {
    clearScene();
    forgetProjectProfiles();
    RecommendationService.flush();
  } finally {
    applying = false;
  }

  changedSinceAutoSave = false;
  useProjectStore.getState().set({
    token: null,
    identity: null,
    projectName: "",
    savedActionId: null,
    changed: false,
    lastSavedAt: null,
  });
}

/** Geometry of the triangles of an object (normals computed again) */
function geometryOf(positions: Float32Array): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

/** Puts a project read in the window, in place of the scene */
export function applyProject(opened: Opened, recovered: boolean): void {
  const { project, meshes } = opened;

  applying = true;

  try {
    clearScene();
    forgetProjectProfiles();

    // Profiles (Q3 A); settings.json is not changed
    const printer = resolveProfile(
      project.printer,
      usePrinterStore.getState().printers,
    );
    const material = resolveProfile(
      project.material,
      useMaterialStore.getState().materials,
    );
    const filament = resolveProfile(
      project.filament,
      useFilamentStore.getState().filaments,
    );

    usePrinterStore.getState().setProjectPrinter(printer.projectOnly);
    usePrinterStore.getState().setSelectedPrinter(printer.selected);
    useMaterialStore.getState().setProjectMaterial(material.projectOnly);
    useMaterialStore.getState().setSelectedMaterial(material.selected);
    useFilamentStore.getState().setProjectFilament(filament.projectOnly);
    useFilamentStore.getState().setSelectedFilament(filament.selected);

    // The selection is taken by the recommendations before the
    // recommendations of the file are put (rule 11)
    RecommendationService.flush();

    for (const object of project.scene.objects) {
      GeometryRegistry.set(object.objectId, geometryOf(meshes[object.objectId]));
    }

    // The analyses before the objects: an analysis up to date is not
    // computed again (Q7 A)
    useAnalysisStore.setState({ analysis: project.analysis as Record<string, Analysis> });
    useRecommendationStore.setState({
      recommendations: project.recommendations as Record<string, Recommendation>,
    });

    if (printer.changed || material.changed || filament.changed) {
      const store = useRecommendationStore.getState();

      for (const objectId of Object.keys(store.recommendations)) {
        store.markRecommendationOutdated(objectId);
      }
    }

    useObjectStore.getState().setObjects(project.scene.objects as Object3D[]);
    useObjectStore.getState().selectObject(null);
    RecommendationService.flush();

    const profiles: [ResolvedProfile<Printer | Material | Filament>, string, string][] = [
      [printer, "printer", project.printer ? profileName(project.printer) : ""],
      [material, "material", project.material ? profileName(project.material) : ""],
      [filament, "filament", project.filament ? profileName(project.filament) : ""],
    ];

    for (const [resolved, kind, name] of profiles) {
      if (resolved.projectOnly) {
        message(`project.message.${kind}Missing`, { name });
      } else if (resolved.changed) {
        message(`project.message.${kind}Changed`, { name });
      }
    }
  } finally {
    applying = false;
  }

  changedSinceAutoSave = recovered;
  useProjectStore.getState().set({
    token: opened.token,
    identity: {
      projectId: project.projectId,
      createdAt: project.createdAt,
    },
    projectName: opened.projectName,
    savedActionId: null,
    // A project recovered is modified (Q19 A)
    changed: recovered,
    lastSavedAt: null,
    ...(opened.recentProjects
      ? { recentProjects: opened.recentProjects }
      : {}),
  });
}

function profileName(profile: Printer | Material | Filament): string {
  if ("model" in profile) {
    return `${profile.brand} ${profile.model}`;
  }

  if ("brand" in profile) {
    return `${profile.brand} ${profile.name}`;
  }

  return profile.name;
}

/** Opens a project through a channel; false when nothing was opened */
async function openWith(channel: string, payload: unknown): Promise<boolean> {
  const store = useProjectStore.getState();

  if (store.busy) {
    return false;
  }

  store.set({ busy: "opening" });

  try {
    const result = await call(channel, payload);

    if (result.status !== "ok") {
      // A recent project not found was removed from the list (PROJ_001)
      if (result.status === "failed") {
        void ProjectService.loadRecent();
      }
      return false;
    }

    const opened = OpenedSchema.safeParse(result.data);

    if (!opened.success) {
      console.error("Project refused by the window.", opened.error.issues);
      message("project.error.PROJ_002", {}, true);
      return false;
    }

    applyProject(opened.data, false);

    return true;
  } finally {
    useProjectStore.getState().set({ busy: null });
  }
}

function suggestedName(): string {
  const { projectName } = useProjectStore.getState();

  if (projectName) {
    return projectName;
  }

  const first = useObjectStore.getState().objects[0];

  return first ? (first.name ?? baseName(first.fileName)) : "";
}

/** Writes the project; false when it was not written */
async function writeProject(saveAs: boolean): Promise<boolean> {
  const store = useProjectStore.getState();

  if (store.busy) {
    return false;
  }

  const undoStack = useHistoryStore.getState().undoStack;
  const savedActionId = topActionId(undoStack);
  const content = collectContent();

  store.set({ busy: "saving" });

  try {
    const result =
      !saveAs && store.token
        ? await call("project:save", {
            token: store.token,
            content,
            identity: store.identity,
          })
        : await call("project:saveAs", {
            content,
            identity: store.identity,
            suggestedName: suggestedName(),
            dialog: {
              title: dialogTexts.saveTitle,
              filterName: dialogTexts.filterName,
            },
          });

    if (result.status !== "ok") {
      return false;
    }

    const saved = SavedSchema.safeParse(result.data);

    if (!saved.success) {
      console.error("Save answer refused.", saved.error.issues);
      return false;
    }

    const identity: ProjectIdentity = {
      projectId: saved.data.saved.projectId,
      createdAt: saved.data.saved.createdAt,
    };

    // A change made during the writing stays a change
    const changedDuring =
      topActionId(useHistoryStore.getState().undoStack) !== savedActionId;

    changedSinceAutoSave = changedDuring;
    useProjectStore.getState().set({
      token: saved.data.token,
      identity,
      projectName: saved.data.saved.projectName,
      savedActionId,
      changed: false,
      lastSavedAt: saved.data.saved.updatedAt,
      justSaved: true,
      recentProjects: saved.data.recentProjects,
    });

    if (savedTimer) {
      clearTimeout(savedTimer);
    }

    savedTimer = setTimeout(() => {
      useProjectStore.getState().set({ justSaved: false });
    }, SAVED_DISPLAY_MS);

    return true;
  } finally {
    useProjectStore.getState().set({ busy: null });
  }
}

function modified(): boolean {
  return isModified(
    useProjectStore.getState(),
    useHistoryStore.getState().undoStack,
    useObjectStore.getState().objects.length,
  );
}

/** Does what waited for the question, once answered */
async function run(action: PendingAction): Promise<void> {
  switch (action.type) {
    case "new":
    case "close":
      resetProject();
      await discardRecovery();
      return;
    case "quit":
      closeAllowed = true;
      globalThis.window?.close();
      return;
    case "open":
      await openWith("project:open", {
        dialog: {
          title: dialogTexts.openTitle,
          filterName: dialogTexts.filterName,
        },
      });
      return;
    case "openRecent":
      await openWith("project:openRecent", { index: action.index });
      return;
    case "openPath":
      await openWith("project:openPath", { filePath: action.filePath });
      return;
  }
}

/** Asks "Save the changes?" when the project is modified, then runs */
async function request(action: PendingAction): Promise<void> {
  if (useProjectStore.getState().busy) {
    return;
  }

  if (modified()) {
    useProjectStore.getState().set({ pending: action });
    return;
  }

  await run(action);
}

async function discardRecovery(): Promise<void> {
  changedSinceAutoSave = false;
  await call("project:discardRecovery");
}

async function readAutoSaveSettings(): Promise<{
  autoSave: boolean;
  autoSaveInterval: number;
}> {
  const bridge = getBridge();

  if (!bridge) {
    return DEFAULT_AUTOSAVE;
  }

  try {
    const result = z
      .object({
        data: z.object({
          settings: z.object({ project: ProjectPreferencesSchema }),
        }),
      })
      .safeParse(await bridge.invoke("settings:get"));

    return result.success ? result.data.data.settings.project : DEFAULT_AUTOSAVE;
  } catch {
    return DEFAULT_AUTOSAVE;
  }
}

export const ProjectService = {
  /** Texts of the Windows dialogs, in the language of the window */
  setDialogTexts(texts: DialogTexts): void {
    dialogTexts = texts;
  },

  /**
   * Starts the project of the window: list of recent projects, copy of
   * the automatic save left by a forced close (Q19 A), changes outside
   * the history, automatic save, close of the window. Returns the
   * function that stops it.
   */
  start(): () => void {
    const unsubscribes = [
      usePrinterStore.subscribe((state, before) => {
        if (state.selectedPrinter?.id !== before.selectedPrinter?.id) {
          ProjectService.markChanged();
        }
      }),
      useMaterialStore.subscribe((state, before) => {
        if (state.selectedMaterial?.id !== before.selectedMaterial?.id) {
          ProjectService.markChanged();
        }
      }),
      useFilamentStore.subscribe((state, before) => {
        if (state.selectedFilament?.id !== before.selectedFilament?.id) {
          ProjectService.markChanged();
        }
      }),
      // The type of object chosen by the user (Q11 A)
      useAnalysisStore.subscribe((state, before) => {
        for (const [objectId, analysis] of Object.entries(state.analysis)) {
          const previous = before.analysis[objectId]?.classification;
          const next = analysis.classification;

          if (
            previous &&
            next &&
            (previous.source === "user" || next.source === "user") &&
            (previous.source !== next.source ||
              previous.category !== next.category)
          ) {
            ProjectService.markChanged();
            return;
          }
        }
      }),
      useHistoryStore.subscribe((state, before) => {
        if (state.undoStack !== before.undoStack && !applying) {
          changedSinceAutoSave = true;
        }
      }),
    ];

    // The close button of the window, Alt+F4 (Q13 A): the close is
    // stopped while the project is modified, and the question is asked
    const beforeUnload = (event: BeforeUnloadEvent): void => {
      if (closeAllowed || !modified()) {
        return;
      }

      event.preventDefault();
      event.returnValue = false;
      void request({ type: "quit" });
    };

    globalThis.window?.addEventListener("beforeunload", beforeUnload);

    void ProjectService.loadRecent();
    void ProjectService.checkRecovery();
    void ProjectService.startAutoSave();

    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }

      globalThis.window?.removeEventListener("beforeunload", beforeUnload);

      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
      }
    };
  },

  /** A change outside the history: the project is modified (Q11 A) */
  markChanged(): void {
    if (applying) {
      return;
    }

    changedSinceAutoSave = true;

    if (!useProjectStore.getState().changed) {
      useProjectStore.getState().set({ changed: true });
    }
  },

  isModified(): boolean {
    return modified();
  },

  /** File > New Project (Ctrl+N) */
  newProject(): Promise<void> {
    return request({ type: "new" });
  },

  /** File > Close Project */
  closeProject(): Promise<void> {
    return request({ type: "close" });
  },

  /** File > Open Project (Ctrl+O) */
  open(): Promise<void> {
    return request({ type: "open" });
  },

  /** File > Recent Projects > a project */
  openRecent(index: number): Promise<void> {
    return request({ type: "openRecent", index });
  },

  /** File > Exit, and the close button of the window */
  quit(): Promise<void> {
    return request({ type: "quit" });
  },

  /** File > Save (Ctrl+S); false when it was not written */
  save(): Promise<boolean> {
    return writeProject(false);
  },

  /** File > Save As (Ctrl+Shift+S) */
  saveAs(): Promise<boolean> {
    return writeProject(true);
  },

  /**
   * Files dropped on the viewport (Q15 A): one .wyproj alone is opened; a
   * .wyproj with other files is refused ("Drop a project alone"), the
   * others are imported. Returns the files to import.
   */
  dropFiles(files: File[]): File[] {
    const projects = files.filter((file) =>
      file.name.toLowerCase().endsWith(PROJECT_EXTENSION),
    );
    const others = files.filter((file) => !projects.includes(file));

    if (projects.length === 0) {
      return others;
    }

    if (projects.length > 1 || others.length > 0) {
      message("project.dropAlone", {}, true);
      return others;
    }

    const filePath =
      globalThis.window?.slicyWeb?.getPathForFile?.(projects[0]) ?? "";

    if (!filePath) {
      message("project.error.PROJ_001", {}, true);
      return [];
    }

    void request({ type: "openPath", filePath });

    return [];
  },

  /** Answer to "Save the changes?" (Q13 A) */
  async answer(choice: "save" | "discard" | "cancel"): Promise<void> {
    const action = useProjectStore.getState().pending;

    useProjectStore.getState().set({ pending: null });

    if (!action || choice === "cancel") {
      return;
    }

    if (choice === "save") {
      // Save As cancelled, or failed: nothing else happens
      if (!(await writeProject(false))) {
        return;
      }
    } else {
      // "Don't save": the copy of the automatic save is removed (Q18 A)
      await discardRecovery();
    }

    await run(action);
  },

  /** Reads the list of recent projects */
  async loadRecent(): Promise<void> {
    const result = await callQuiet("project:recent");
    const list = RecentProjectsSchema.safeParse(result?.recentProjects);

    if (list.success) {
      useProjectStore.getState().set({ recentProjects: list.data });
    }
  },

  /** File > Recent Projects > Clear List */
  async clearRecent(): Promise<void> {
    const result = await call("project:clearRecent");

    if (result.status === "ok") {
      useProjectStore.getState().set({ recentProjects: [] });
    }
  },

  /** A copy left by a forced close is offered at start (Q19 A) */
  async checkRecovery(): Promise<void> {
    const data = await callQuiet("project:recovery", { action: "check" });
    const check = RecoveryCheckSchema.safeParse(data);

    if (!check.success) {
      return;
    }

    if (check.data.available) {
      useProjectStore.getState().set({
        recovery: {
          projectName: check.data.projectName,
          savedAt: check.data.savedAt,
        },
      });
    } else if (check.data.quarantined) {
      message("project.recovery.quarantined", {}, true);
    }
  },

  /** Answer to the recovery: Recover or Ignore */
  async recover(choice: "restore" | "ignore"): Promise<void> {
    useProjectStore.getState().set({ recovery: null });

    if (choice === "ignore") {
      await discardRecovery();
      return;
    }

    useProjectStore.getState().set({ busy: "opening" });

    try {
      const result = await call("project:recovery", { action: "restore" });

      if (result.status !== "ok") {
        return;
      }

      const opened = OpenedSchema.safeParse(result.data);

      if (!opened.success) {
        console.error("Recovery refused by the window.", opened.error.issues);
        message("project.error.PROJ_002", {}, true);
        return;
      }

      applyProject(opened.data, true);
    } finally {
      useProjectStore.getState().set({ busy: null });
    }
  },

  /** Starts the automatic save (setting project.autoSave) */
  async startAutoSave(): Promise<void> {
    const settings = await readAutoSaveSettings();

    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }

    if (!settings.autoSave) {
      return;
    }

    autoSaveTimer = setInterval(() => {
      void ProjectService.autoSave();
    }, settings.autoSaveInterval * 1000);
  },

  /** Writes the copy of the automatic save when the project changed */
  async autoSave(): Promise<boolean> {
    const store = useProjectStore.getState();

    if (
      store.busy ||
      store.recovery ||
      !changedSinceAutoSave ||
      !modified()
    ) {
      return false;
    }

    changedSinceAutoSave = false;

    const data = await callQuiet("project:autosave", {
      content: collectContent(),
      identity: store.identity,
      token: store.token,
      projectName: store.projectName,
    });

    if (!data) {
      changedSinceAutoSave = true;
      return false;
    }

    return true;
  },

  dismissMessage(messageId: string): void {
    useProjectStore.getState().removeMessage(messageId);
  },

  /** Name proposed by Save As (tests) */
  suggestedName,
};

/** A channel whose failure shows no message (background work) */
async function callQuiet(
  channel: string,
  payload?: unknown,
): Promise<Record<string, unknown> | null> {
  const bridge = getBridge();

  if (!bridge) {
    return null;
  }

  try {
    const response = (await bridge.invoke(channel, payload)) as {
      success?: boolean;
      data?: Record<string, unknown>;
      errors?: unknown;
    } | null;

    if (response?.success !== true) {
      console.error(`${channel} failed.`, response?.errors);
      return null;
    }

    return response.data ?? {};
  } catch (error) {
    console.error(`${channel} failed.`, error);
    return null;
  }
}

export default ProjectService;
