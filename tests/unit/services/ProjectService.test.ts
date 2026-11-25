/**
 * SlicyWeb
 * Project Service Tests
 *
 * The project of the window (Phase 13, lot 111; decision 119 of Noam):
 * - a project opened replaces the scene and gives back each object, its
 *   triangles, analysis, recommendation and the profiles; collected again,
 *   it is the same content (Q6 A);
 * - profiles at opening (Q3 A): the same profile of the lists; a profile
 *   changed (recommendations outdated, message); a profile missing (the
 *   copy of the project, "This project", message);
 * - modified (Q11 A): place of the history, changes outside the history;
 *   an empty project never saved is not modified (Q13 A);
 * - "Save the changes?" (Q13 A): Cancel, Don't Save, Save (Save As for a
 *   project never saved; nothing happens when it is cancelled);
 * - files dropped (Q15 A): a project alone is opened, a project with
 *   other files is refused, the others are imported.
 *
 * The main process is replaced by a test function (window.slicyWeb).
 *
 * Based on:
 * - GUI_SPEC.md (File Menu, Unsaved Changes Dialog)
 * - UNDO_REDO_SPEC.md (Project Operations)
 * - TEST_PLAN.md (Project Persistence)
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ProjectManager, withoutMeshData } from "../../../src/project/ProjectManager";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import {
  ProjectService,
  applyProject,
  collectContent,
  resolveProfile,
} from "../../../src/services/ProjectService";
import { useAnalysisStore } from "../../../src/state/analysisStore";
import { useFilamentStore } from "../../../src/state/filamentStore";
import { useHistoryStore } from "../../../src/state/historyStore";
import { useMaterialStore } from "../../../src/state/materialStore";
import { useObjectStore } from "../../../src/state/objectStore";
import { usePrinterStore } from "../../../src/state/printerStore";
import { isModified, useProjectStore } from "../../../src/state/projectStore";
import { useRecommendationStore } from "../../../src/state/recommendationStore";

import {
  content,
  filament,
  material,
  printer,
} from "../project/projectTestData";

interface Call {
  channel: string;
  payload: unknown;
}

let calls: Call[];
let answers: Record<string, unknown>;

function opened(
  saved = content(),
  projectName = "cube",
): Parameters<typeof applyProject>[0] {
  const imported = new ProjectManager().openText(
    JSON.stringify({
      format: "WYPROJ",
      version: "3.0.0",
      project: new ProjectManager().createProject(saved, null, projectName),
      metadata: { application: "SlicyWeb Smart Slicer" },
    }),
  );

  return {
    project: withoutMeshData(imported.project),
    meshes: imported.meshes,
    token: "token-1",
    projectName,
  } as Parameters<typeof applyProject>[0];
}

function modified(): boolean {
  return isModified(
    useProjectStore.getState(),
    useHistoryStore.getState().undoStack,
    useObjectStore.getState().objects.length,
  );
}

function record(actionId: string): void {
  useHistoryStore.getState().record({
    actionId,
    type: "MOVE",
    timestamp: new Date().toISOString(),
    before: {},
    after: {},
  });
}

beforeEach(() => {
  calls = [];
  answers = {};
  (globalThis as { window?: unknown }).window = {
    slicyWeb: {
      invoke: async (channel: string, payload?: unknown) => {
        calls.push({ channel, payload });
        return answers[channel] ?? { success: true, data: {} };
      },
      getPathForFile: (file: File) => `/drop/${file.name}`,
    },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    close: () => undefined,
  };

  useProjectStore.setState({
    token: null,
    identity: null,
    projectName: "",
    savedActionId: null,
    changed: false,
    messages: [],
    pending: null,
    busy: null,
  });
  useHistoryStore.getState().clear();
  useObjectStore.getState().clearObjects();
  GeometryRegistry.clear();
  useAnalysisStore.getState().clearAnalysis();
  useRecommendationStore.getState().clearRecommendations();
  usePrinterStore.setState({
    printers: [printer()],
    selectedPrinter: null,
    projectPrinter: null,
  });
  useMaterialStore.setState({
    materials: [material()],
    selectedMaterial: null,
    projectMaterial: null,
  });
  useFilamentStore.setState({
    filaments: [filament()],
    selectedFilament: null,
    projectFilament: null,
  });
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe("Profiles of a project opened (Q3 A)", () => {
  it("chooses the same profile, the profile of the list when it changed, the copy when it is missing", () => {
    const listed = printer();

    expect(resolveProfile(listed, [listed])).toEqual({
      selected: listed,
      projectOnly: null,
      changed: false,
    });

    const changed = { ...listed, model: "MK4S (modifiée)" };

    expect(resolveProfile(changed, [listed])).toEqual({
      selected: listed,
      projectOnly: null,
      changed: true,
    });

    const missing = { ...listed, id: "imprimante_du_projet" };

    expect(resolveProfile(missing, [listed])).toEqual({
      selected: missing,
      projectOnly: missing,
      changed: false,
    });

    expect(resolveProfile(null, [listed]).selected).toBeNull();
  });

  it("compares two profiles whatever the order of their fields", () => {
    const listed = printer();
    const reordered = Object.fromEntries(
      Object.entries(listed).reverse(),
    ) as typeof listed;

    expect(resolveProfile(reordered, [listed]).changed).toBe(false);
  });
});

describe("Opening a project (Q6, Q7 A)", () => {
  it("replaces the scene; collected again, the content is the same", () => {
    const saved = content();

    useObjectStore.getState().addObject({ ...saved.objects[0], objectId: "old" });
    record("before-opening");

    applyProject(opened(saved), false);

    const collected = collectContent() as unknown as typeof saved;

    expect(collected.objects).toEqual(saved.objects);
    expect(Array.from(collected.meshes.a)).toEqual(Array.from(saved.meshes.a));
    expect(Array.from(collected.meshes.b)).toEqual(Array.from(saved.meshes.b));
    expect(collected.analysis).toEqual(saved.analysis);
    expect(collected.recommendations).toEqual(saved.recommendations);
    expect(collected.printer).toEqual(saved.printer);
    expect(collected.material).toEqual(saved.material);
    expect(collected.filament).toEqual(saved.filament);

    // History cleared, nothing selected, not modified
    expect(useHistoryStore.getState().undoStack).toEqual([]);
    expect(useObjectStore.getState().selectedObjectIds).toEqual([]);
    expect(useProjectStore.getState()).toMatchObject({
      token: "token-1",
      projectName: "cube",
      changed: false,
    });
    expect(modified()).toBe(false);
    expect(useProjectStore.getState().messages).toEqual([]);
    expect(GeometryRegistry.has("old")).toBe(false);
  });

  it("a profile missing from the lists: the copy of the project, in This project, with a message", () => {
    usePrinterStore.setState({ printers: [] });

    applyProject(opened(), false);

    expect(usePrinterStore.getState().projectPrinter).toEqual(printer());
    expect(usePrinterStore.getState().selectedPrinter).toBe(
      usePrinterStore.getState().projectPrinter,
    );
    expect(useProjectStore.getState().messages.map((m) => m.key)).toEqual([
      "project.message.printerMissing",
    ]);
    expect(useProjectStore.getState().messages[0].params.name).toBe(
      "Prusa MK4S",
    );
  });

  it("a profile changed since the save: the one of the list, recommendations outdated, message", () => {
    const changed = { ...material(), name: "PLA (modifié)" };
    useMaterialStore.setState({ materials: [changed] });

    applyProject(opened(), false);

    expect(useMaterialStore.getState().selectedMaterial).toBe(changed);
    expect(useMaterialStore.getState().projectMaterial).toBeNull();
    expect(
      useRecommendationStore.getState().recommendations.a.status,
    ).toBe("outdated");
    expect(useProjectStore.getState().messages.map((m) => m.key)).toEqual([
      "project.message.materialChanged",
    ]);
  });

  it("a project recovered is modified (Q19 A)", () => {
    applyProject(opened(), true);

    expect(modified()).toBe(true);
  });
});

describe("Modified (Q11 A)", () => {
  it("an empty project never saved is not modified", () => {
    useProjectStore.getState().set({ changed: true });

    expect(modified()).toBe(false);
  });

  it("follows the place of the history saved: Undo back to it removes the mark", () => {
    applyProject(opened(), false);
    record("move-1");
    expect(modified()).toBe(true);

    useProjectStore.getState().set({ savedActionId: "move-1" });
    expect(modified()).toBe(false);

    const entry = useHistoryStore.getState().takeUndo()!;
    expect(modified()).toBe(true);

    useHistoryStore.getState().pushUndo(entry);
    expect(modified()).toBe(false);
  });

  it("a change outside the history stays until the save", () => {
    applyProject(opened(), false);

    ProjectService.markChanged();

    expect(modified()).toBe(true);
  });
});

describe("Save the changes? (Q13 A)", () => {
  beforeEach(() => {
    applyProject(opened(), false);
    record("move-1");
  });

  it("New asks first; Cancel changes nothing", async () => {
    await ProjectService.newProject();

    expect(useProjectStore.getState().pending).toEqual({ type: "new" });
    expect(useObjectStore.getState().objects).toHaveLength(2);

    await ProjectService.answer("cancel");

    expect(useProjectStore.getState().pending).toBeNull();
    expect(useObjectStore.getState().objects).toHaveLength(2);
  });

  it("Don't Save: the scene is emptied, the printer stays (Q14 A), the copy of the automatic save is removed", async () => {
    await ProjectService.newProject();
    await ProjectService.answer("discard");

    expect(useObjectStore.getState().objects).toEqual([]);
    expect(useHistoryStore.getState().undoStack).toEqual([]);
    expect(usePrinterStore.getState().selectedPrinter).toEqual(printer());
    expect(useProjectStore.getState()).toMatchObject({
      token: null,
      projectName: "",
      changed: false,
    });
    expect(calls.map((call) => call.channel)).toContain(
      "project:discardRecovery",
    );
  });

  it("Save writes the project through its token, then does what waited", async () => {
    answers["project:save"] = {
      success: true,
      data: {
        saved: {
          projectId: "p",
          createdAt: "2026-11-25T10:00:00.000Z",
          updatedAt: "2026-11-25T10:05:00.000Z",
          projectName: "cube",
        },
        token: "token-1",
        recentProjects: [],
      },
    };

    await ProjectService.closeProject();
    await ProjectService.answer("save");

    const save = calls.find((call) => call.channel === "project:save");

    expect(save?.payload).toMatchObject({ token: "token-1" });
    expect(useObjectStore.getState().objects).toEqual([]);
  });

  it("Save on a project never saved opens Save As; cancelled, nothing else happens", async () => {
    useProjectStore.getState().set({ token: null, projectName: "" });
    answers["project:saveAs"] = { success: true, data: { cancelled: true } };

    await ProjectService.newProject();
    await ProjectService.answer("save");

    const saveAs = calls.find((call) => call.channel === "project:saveAs");

    expect(saveAs?.payload).toMatchObject({ suggestedName: "Support gauche" });
    expect(useObjectStore.getState().objects).toHaveLength(2);
    expect(modified()).toBe(true);
  });

  it("a save that fails shows its message and keeps the scene (PROJ_004)", async () => {
    answers["project:save"] = {
      success: false,
      data: { code: "PROJ_004", params: {} },
      errors: ["PROJ_004 The project could not be written."],
    };

    expect(await ProjectService.save()).toBe(false);
    expect(useProjectStore.getState().messages.map((m) => m.key)).toEqual([
      "project.error.PROJ_004",
    ]);
    expect(modified()).toBe(true);
  });

  it("an error PROJ_003 of an older or newer format has its own message", async () => {
    answers["project:openRecent"] = {
      success: false,
      data: {
        code: "PROJ_003",
        params: { fileVersion: "2.0.0", supportedVersion: "3.0.0", newer: false },
      },
    };
    useProjectStore.getState().set({ changed: false, savedActionId: "move-1" });

    await ProjectService.openRecent(0);

    expect(useProjectStore.getState().messages.map((m) => m.key)).toEqual([
      "project.error.PROJ_003_older",
    ]);
  });
});

describe("Files dropped (Q15 A)", () => {
  it("a project alone is opened", async () => {
    const rest = ProjectService.dropFiles([new File(["{}"], "cube.wyproj")]);
    await Promise.resolve();

    expect(rest).toEqual([]);
    expect(calls).toContainEqual({
      channel: "project:openPath",
      payload: { filePath: "/drop/cube.wyproj" },
    });
  });

  it("a project with other files is refused; the others are imported", () => {
    const stl = new File(["solid"], "cube.stl");
    const rest = ProjectService.dropFiles([
      stl,
      new File(["{}"], "cube.WYPROJ"),
    ]);

    expect(rest).toEqual([stl]);
    expect(useProjectStore.getState().messages.map((m) => m.key)).toEqual([
      "project.dropAlone",
    ]);
    expect(calls).toEqual([]);
  });
});
