/**
 * SlicyWeb
 * Project IPC Tests
 *
 * The project channels (Phase 13, lot 111; decision 119 of Noam, Q20 A):
 * the window never sends a path to write (a token stands for the file);
 * Save As adds .wyproj; a file dropped is opened only when it is a
 * .wyproj; a recent project not found is removed from the list; the copy
 * of the automatic save is offered, restored with its file, removed at a
 * save; a dialog cancelled changes nothing; an invalid payload is refused
 * without throwing.
 *
 * The Windows dialogs are replaced by test functions.
 *
 * Based on:
 * - API_SPEC.md (ProjectIPC Channels)
 * - SECURITY_SPEC.md (Project Security, IPC Security)
 * - ERROR_CODES_SPEC.md 2.8.0 (PROJ_001, PROJ_002)
 * - TEST_PLAN.md (Project Persistence)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (
  event: unknown,
  requestId: string,
  payload?: unknown,
) => Promise<unknown>;

const handlers = new Map<string, Handler>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: (channel: string, handler: Handler) =>
      handlers.set(channel, handler),
  },
  BrowserWindow: { fromWebContents: () => null },
  dialog: {},
  app: { getPath: () => os.tmpdir() },
}));

const { ProjectIPC, suggestedFileName } = await import(
  "../../../src/electron/ipc/ProjectIPC"
);
const { RecentProjectsStorage } = await import(
  "../../../src/storage/RecentProjectsStorage"
);
const { SettingsStorage } = await import(
  "../../../src/storage/SettingsStorage"
);
const { content } = await import("../project/projectTestData");

interface Response {
  success: boolean;
  // The data of each channel, read by the tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  errors: string[];
}

let folder: string;
let openPaths: string[];
let savePath: string | undefined;
let recent: InstanceType<typeof RecentProjectsStorage>;

const DIALOG = { title: "Open", filterName: "SlicyWeb project" };

async function invoke(channel: string, payload?: unknown): Promise<Response> {
  return (await handlers.get(channel)!({}, "request-1", payload)) as Response;
}

beforeEach(() => {
  handlers.clear();
  folder = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-project-ipc-"));
  openPaths = [];
  savePath = undefined;
  recent = new RecentProjectsStorage(
    new SettingsStorage(path.join(folder, "settings.json")),
  );

  new ProjectIPC({
    recoveryFolder: path.join(folder, "recovery"),
    recentProjects: recent,
    defaultFolder: folder,
    dialogs: {
      showOpenDialog: async () => ({
        canceled: openPaths.length === 0,
        filePaths: openPaths,
      }),
      showSaveDialog: async () => ({
        canceled: savePath === undefined,
        filePath: savePath,
      }),
    },
  }).register();
});

afterEach(() => {
  fs.rmSync(folder, { recursive: true, force: true });
});

describe("ProjectIPC (Q20 A)", () => {
  it("registers the 10 project channels", () => {
    expect([...handlers.keys()].sort()).toEqual([
      "project:autosave",
      "project:clearRecent",
      "project:discardRecovery",
      "project:open",
      "project:openPath",
      "project:openRecent",
      "project:recent",
      "project:recovery",
      "project:save",
      "project:saveAs",
    ]);
  });

  it("Save As writes the file chosen, with .wyproj; Save writes it again through its token", async () => {
    savePath = path.join(folder, "cube");

    const first = await invoke("project:saveAs", {
      content: content(),
      identity: null,
      suggestedName: "cube",
      dialog: DIALOG,
    });

    expect(first.success).toBe(true);
    expect(first.data.saved.projectName).toBe("cube");
    expect(fs.existsSync(path.join(folder, "cube.wyproj"))).toBe(true);
    expect(first.data.recentProjects).toEqual([
      { name: "cube", path: path.join(folder, "cube.wyproj") },
    ]);

    const second = await invoke("project:save", {
      token: first.data.token,
      content: content(),
      identity: {
        projectId: first.data.saved.projectId,
        createdAt: first.data.saved.createdAt,
      },
    });

    expect(second.success).toBe(true);
    expect(second.data.saved.projectId).toBe(first.data.saved.projectId);
    expect(second.data.token).toBe(first.data.token);
  });

  it("a Save As cancelled writes nothing", async () => {
    const response = await invoke("project:saveAs", {
      content: content(),
      identity: null,
      suggestedName: "",
      dialog: DIALOG,
    });

    expect(response).toMatchObject({ success: true, data: { cancelled: true } });
    expect(fs.readdirSync(folder)).toEqual([]);
  });

  it("refuses a token not known, and a path sent by the window", async () => {
    const unknown = await invoke("project:save", {
      token: "6f1c2b8e-1d2a-4b7e-9c3d-2a1b0c9d8e7f",
      content: content(),
      identity: null,
    });

    expect(unknown.success).toBe(false);
    expect(unknown.data.code).toBe("PROJ_002");

    const withPath = await invoke("project:save", {
      token: path.join(folder, "x.wyproj"),
      content: content(),
      identity: null,
      filePath: path.join(folder, "x.wyproj"),
    });

    expect(withPath.success).toBe(false);
    expect(fs.existsSync(path.join(folder, "x.wyproj"))).toBe(false);
  });

  it("opens a project: the project without meshData, the triangles as numbers, a new token", async () => {
    savePath = path.join(folder, "cube.wyproj");
    const saved = await invoke("project:saveAs", {
      content: content(),
      identity: null,
      suggestedName: "cube",
      dialog: DIALOG,
    });

    openPaths = [savePath];
    const opened = await invoke("project:open", { dialog: DIALOG });

    expect(opened.success).toBe(true);
    expect(opened.data.projectName).toBe("cube");
    expect(opened.data.token).not.toBe(saved.data.token);
    expect(opened.data.project.scene.objects[0]).not.toHaveProperty("meshData");
    expect(opened.data.meshes.a).toBeInstanceOf(Float32Array);
    expect(Array.from(opened.data.meshes.a as Float32Array)).toEqual(
      Array.from(content().meshes.a),
    );
  });

  it("an Open cancelled changes nothing", async () => {
    expect(await invoke("project:open", { dialog: DIALOG })).toMatchObject({
      success: true,
      data: { cancelled: true },
    });
  });

  it("opens a .wyproj dropped; refuses another file or a relative path", async () => {
    savePath = path.join(folder, "cube.wyproj");
    await invoke("project:saveAs", {
      content: content(),
      identity: null,
      suggestedName: "cube",
      dialog: DIALOG,
    });

    expect((await invoke("project:openPath", { filePath: savePath })).success).toBe(true);

    const stl = path.join(folder, "cube.stl");
    fs.writeFileSync(stl, "solid cube");

    for (const filePath of [stl, "cube.wyproj"]) {
      const refused = await invoke("project:openPath", { filePath });

      expect(refused.success).toBe(false);
      expect(refused.data.code).toBe("PROJ_002");
    }
  });

  it("a recent project not found gives PROJ_001 and leaves the list", async () => {
    recent.add(path.join(folder, "gone.wyproj"));

    const response = await invoke("project:openRecent", { index: 0 });

    expect(response.success).toBe(false);
    expect(response.data.code).toBe("PROJ_001");
    expect((await invoke("project:recent")).data.recentProjects).toEqual([]);
  });

  it("Clear List empties the recent projects", async () => {
    recent.add(path.join(folder, "a.wyproj"));

    expect((await invoke("project:clearRecent")).data.recentProjects).toEqual([]);
    expect(recent.list()).toEqual([]);
  });

  it("the copy of the automatic save: offered, restored with the file of the project, removed at a save", async () => {
    savePath = path.join(folder, "cube.wyproj");
    const saved = await invoke("project:saveAs", {
      content: content(),
      identity: null,
      suggestedName: "cube",
      dialog: DIALOG,
    });

    const copy = await invoke("project:autosave", {
      content: content(),
      identity: null,
      token: saved.data.token,
      projectName: "cube",
    });

    expect(copy.success).toBe(true);

    const check = await invoke("project:recovery", { action: "check" });

    expect(check.data).toMatchObject({ available: true, projectName: "cube" });

    const restored = await invoke("project:recovery", { action: "restore" });

    expect(restored.data.projectName).toBe("cube");
    expect(restored.data.meshes.b).toBeInstanceOf(Float32Array);

    // The token of the copy writes in the file of the project
    const again = await invoke("project:save", {
      token: restored.data.token,
      content: content(),
      identity: null,
    });

    expect(again.success).toBe(true);
    expect(again.data.recentProjects[0].path).toBe(savePath);
    // A save removes the copy
    expect(fs.readdirSync(path.join(folder, "recovery"))).toEqual([]);
  });

  it("discardRecovery removes the copy", async () => {
    await invoke("project:autosave", {
      content: content(),
      identity: null,
      token: null,
      projectName: "",
    });

    await invoke("project:discardRecovery");

    expect(
      (await invoke("project:recovery", { action: "check" })).data,
    ).toEqual({ available: false, quarantined: false });
  });

  it("refuses an invalid payload without throwing", async () => {
    for (const [channel, payload] of [
      ["project:openRecent", { index: 10 }],
      ["project:recovery", { action: "delete" }],
      ["project:autosave", { content: {}, identity: null, token: null, projectName: "" }],
      ["project:open", {}],
    ] as const) {
      const response = await invoke(channel, payload);

      expect(response.success).toBe(false);
      expect(response.errors[0]).toMatch(/^PROJ_002/);
    }
  });

  it("proposes a file name without the characters Windows refuses", () => {
    expect(suggestedFileName("cube")).toBe("cube.wyproj");
    expect(suggestedFileName('a<b>:c"d/e\\f|g?h*i\u0001')).toBe("abcdefghi.wyproj");
    expect(suggestedFileName(" ... ")).toBe("project.wyproj");
    expect(suggestedFileName("תושבת")).toBe("תושבת.wyproj");
  });
});
