/**
 * SlicyWeb
 * Project IPC
 *
 * The project channels (Phase 13, lot 111, ADR-038; decision 119 of Noam,
 * Q1 to Q22 A). The Windows dialogs, the reading and the writing of the
 * files are done here only (Q20 A):
 * - the window never sends a path to write: an opened or saved project is
 *   known by a token, kept here with its path (new token at each opening
 *   and each Save As); the window keeps the token only;
 * - paths read: a number of the list of recent projects, and the path of
 *   a file dropped (.wyproj only);
 * - every file read is validated in full (ProjectManager, WYPROJImporter)
 *   before it is sent to the window.
 *
 * Channels (API_SPEC.md, ProjectIPC Channels):
 * - project:open          Open dialog, then the project read
 * - project:openRecent    { index }: project of the list of recent projects
 * - project:openPath      { filePath }: project dropped on the view
 * - project:save          { token, content, identity }: writes the file of
 *                         the token (Save)
 * - project:saveAs        { content, identity, suggestedName, dialog }:
 *                         Save As dialog, then writes
 * - project:recent        the list of recent projects
 * - project:clearRecent   empties the list
 * - project:autosave      { content, identity, token, projectName }:
 *                         writes the copy of the automatic save (Q18 A)
 * - project:recovery      { action: "check" | "restore" } (Q19 A)
 * - project:discardRecovery  removes the copy of the automatic save
 *
 * A project read is sent as { project, meshes, token, projectName,
 * recentProjects }: project without its meshData (the triangles travel as
 * numbers, meshes, by objectId).
 *
 * Errors: success false, errors [message], data { code, params } (PROJ_001
 * to PROJ_005, ERROR_CODES_SPEC.md 2.8.0); a dialog cancelled: success true,
 * data { cancelled: true }.
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md (IPC Layer, ProjectIPC Channels)
 * - IMPORT_EXPORT_SPEC.md 3.2.0
 * - SECURITY_SPEC.md (Project Security, IPC Security)
 * - DATA_SCHEMA.md 3.16.0 (IPC Payload Schema)
 */

import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";

import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  type IpcMainInvokeEvent,
  type OpenDialogOptions,
  type SaveDialogOptions,
} from "electron";
import { z } from "zod";

import { MAX_RECENT_PROJECTS } from "../../constants/ApplicationConstants";
import { PROJECT_EXTENSION } from "../../constants/ProjectConstants";
import {
  ProjectManager,
  projectNameOf,
  withoutMeshData,
  type ProjectContent,
  type ProjectIdentity,
} from "../../project/ProjectManager";
import { asProjectError } from "../../project/ProjectError";
import type { ImportedProject } from "../../project/WYPROJImporter";
import { AutoSaveService } from "../../recovery/AutoSaveService";
import { RecoveryManager } from "../../recovery/RecoveryManager";
import type { RecentProjectsStorage } from "../../storage/RecentProjectsStorage";

// Zod schema for IPC payloads
const IPCResponseSchema = z.object({
  channel: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

type IPCResponse = z.infer<typeof IPCResponseSchema>;

const TokenSchema = z.string().uuid();

const IdentitySchema = z
  .object({
    projectId: z.string().min(1).max(200),
    createdAt: z.string().min(1).max(100),
  })
  .strict();

/**
 * The content sent by the window; each object, analysis, recommendation
 * and profile is validated in full by ProjectManager (ProjectSchema).
 */
const ContentSchema = z
  .object({
    objects: z.array(z.record(z.unknown())),
    meshes: z.record(z.string(), z.instanceof(Float32Array)),
    analysis: z.record(z.string(), z.unknown()),
    recommendations: z.record(z.string(), z.unknown()),
    printer: z.record(z.unknown()).nullable(),
    material: z.record(z.unknown()).nullable(),
    filament: z.record(z.unknown()).nullable(),
  })
  .strict();

/** Texts of the Windows dialogs, translated by the window */
const DialogTextSchema = z
  .object({
    title: z.string().max(200),
    filterName: z.string().min(1).max(200),
  })
  .strict();

const OpenSchema = z.object({ dialog: DialogTextSchema }).strict();

const OpenRecentSchema = z
  .object({ index: z.number().int().min(0).max(MAX_RECENT_PROJECTS - 1) })
  .strict();

const OpenPathSchema = z
  .object({
    filePath: z
      .string()
      .min(1)
      .max(4096)
      .refine(
        (filePath) =>
          path.isAbsolute(filePath) &&
          filePath.toLowerCase().endsWith(PROJECT_EXTENSION),
        "Only a .wyproj file can be opened.",
      ),
  })
  .strict();

const SaveSchema = z
  .object({
    token: TokenSchema,
    content: ContentSchema,
    identity: IdentitySchema.nullable(),
  })
  .strict();

const SaveAsSchema = z
  .object({
    content: ContentSchema,
    identity: IdentitySchema.nullable(),
    suggestedName: z.string().max(200),
    dialog: DialogTextSchema,
  })
  .strict();

const AutoSaveSchema = z
  .object({
    content: ContentSchema,
    identity: IdentitySchema.nullable(),
    token: TokenSchema.nullable(),
    projectName: z.string().max(1000),
  })
  .strict();

const RecoverySchema = z
  .object({ action: z.enum(["check", "restore"]) })
  .strict();

/** Characters a file name of Windows cannot hold (and control characters) */
const FORBIDDEN_FILE_CHARACTERS = /[<>:"/\\|?*]/g;

/** Windows dialogs; replaced in the tests */
export interface ProjectDialogs {
  showOpenDialog(
    window: BrowserWindow | null,
    options: OpenDialogOptions,
  ): Promise<{ canceled: boolean; filePaths: string[] }>;
  showSaveDialog(
    window: BrowserWindow | null,
    options: SaveDialogOptions,
  ): Promise<{ canceled: boolean; filePath?: string }>;
}

/** The Electron dialogs, read at each call (the e2e tests replace them) */
const electronDialogs: ProjectDialogs = {
  showOpenDialog: (window, options) =>
    window
      ? dialog.showOpenDialog(window, options)
      : dialog.showOpenDialog(options),
  showSaveDialog: (window, options) =>
    window
      ? dialog.showSaveDialog(window, options)
      : dialog.showSaveDialog(options),
};

export interface ProjectIPCOptions {
  /** Folder of the copy of the automatic save (<user data>/recovery) */
  recoveryFolder: string;
  recentProjects: RecentProjectsStorage;
  projectManager?: ProjectManager;
  dialogs?: ProjectDialogs;
  /** Folder proposed by the first dialog (Documents) */
  defaultFolder?: string;
}

/** Name of a file proposed by Save As, without forbidden characters */
export function suggestedFileName(name: string): string {
  const cleaned = [...name]
    .filter((character) => character.charCodeAt(0) >= 32)
    .join("")
    .replace(FORBIDDEN_FILE_CHARACTERS, "")
    .trim()
    .replace(/[. ]+$/, "");

  return `${cleaned || "project"}${PROJECT_EXTENSION}`;
}

export class ProjectIPC {
  private readonly projectManager: ProjectManager;
  private readonly autoSave: AutoSaveService;
  private readonly recovery: RecoveryManager;
  private readonly dialogs: ProjectDialogs;

  /** Path of each project opened or saved, by token */
  private readonly tokens = new Map<string, string>();

  /** Folder of the last project opened or saved */
  private lastFolder: string | null = null;

  public constructor(private readonly options: ProjectIPCOptions) {
    this.projectManager = options.projectManager ?? new ProjectManager();
    this.autoSave = new AutoSaveService(
      options.recoveryFolder,
      this.projectManager,
    );
    this.recovery = new RecoveryManager(
      options.recoveryFolder,
      this.projectManager,
    );
    this.dialogs = options.dialogs ?? electronDialogs;
  }

  /** Removes the copy of the automatic save (normal close) */
  public discardRecovery(): void {
    this.recovery.discardSync();
  }

  private createResponse(
    channel: string,
    requestId: string,
    success: boolean,
    data?: Record<string, unknown>,
    errors: string[] = [],
  ): IPCResponse {
    return {
      channel,
      requestId,
      success,
      data: data || {},
      errors,
    };
  }

  /** Registers a channel: its result, or its error (PROJ_00x) */
  private handle(
    channel: string,
    run: (
      payload: unknown,
      window: BrowserWindow | null,
    ) => Promise<Record<string, unknown>>,
  ): void {
    ipcMain.handle(
      channel,
      async (event: IpcMainInvokeEvent, requestId: string, payload: unknown) => {
        try {
          const window = event?.sender
            ? BrowserWindow.fromWebContents(event.sender)
            : null;
          const data = await run(payload, window);

          return IPCResponseSchema.parse(
            this.createResponse(channel, requestId, true, data),
          );
        } catch (error) {
          const projectError =
            error instanceof z.ZodError
              ? asProjectError(new Error(`Invalid payload: ${error.message}`))
              : asProjectError(error);

          return IPCResponseSchema.parse(
            this.createResponse(
              channel,
              requestId,
              false,
              { code: projectError.code, params: projectError.params },
              [projectError.message],
            ),
          );
        }
      },
    );
  }

  private defaultFolder(): string {
    if (this.lastFolder) {
      return this.lastFolder;
    }

    if (this.options.defaultFolder) {
      return this.options.defaultFolder;
    }

    try {
      return app.getPath("documents");
    } catch {
      return os.homedir();
    }
  }

  /** A new token for a path */
  private remember(filePath: string): string {
    const token = randomUUID();

    this.tokens.set(token, filePath);
    this.lastFolder = path.dirname(filePath);

    return token;
  }

  private recentList(): { name: string; path: string }[] {
    return this.options.recentProjects.list().map((entry) => ({
      name: projectNameOf(entry),
      path: entry,
    }));
  }

  /** Opens a file: the project for the window, and the recent list */
  private async openFile(filePath: string): Promise<Record<string, unknown>> {
    let imported: ImportedProject;

    try {
      imported = await this.projectManager.open(filePath);
    } catch (error) {
      const projectError = asProjectError(error);

      // A project not found is removed from the list (Q16 A)
      if (projectError.code === "PROJ_001") {
        this.options.recentProjects.remove(filePath);
      }

      throw projectError;
    }

    this.options.recentProjects.add(filePath);

    return {
      ...this.forWindow(imported),
      token: this.remember(filePath),
      projectName: projectNameOf(filePath),
      recentProjects: this.recentList(),
    };
  }

  private forWindow(imported: ImportedProject): Record<string, unknown> {
    return {
      project: withoutMeshData(imported.project),
      meshes: imported.meshes,
    };
  }

  private async write(
    filePath: string,
    content: ProjectContent,
    identity: ProjectIdentity | null,
    token: string,
  ): Promise<Record<string, unknown>> {
    const saved = await this.projectManager.save(filePath, content, identity);

    this.options.recentProjects.add(filePath);
    // The copy of the automatic save is no longer needed (Q18 A)
    await this.recovery.discard();

    return {
      saved,
      token,
      recentProjects: this.recentList(),
    };
  }

  public register(): void {
    this.handle("project:open", async (payload, window) => {
      const { dialog: text } = OpenSchema.parse(payload);
      const result = await this.dialogs.showOpenDialog(window, {
        title: text.title,
        defaultPath: this.defaultFolder(),
        filters: [{ name: text.filterName, extensions: ["wyproj"] }],
        properties: ["openFile"],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { cancelled: true };
      }

      return this.openFile(result.filePaths[0]);
    });

    this.handle("project:openRecent", async (payload) => {
      const { index } = OpenRecentSchema.parse(payload);
      const filePath = this.options.recentProjects.list()[index];

      if (!filePath) {
        throw new Error(`No recent project at ${index}.`);
      }

      return this.openFile(filePath);
    });

    this.handle("project:openPath", async (payload) => {
      const { filePath } = OpenPathSchema.parse(payload);

      return this.openFile(filePath);
    });

    this.handle("project:save", async (payload) => {
      const { token, content, identity } = SaveSchema.parse(payload);
      const filePath = this.tokens.get(token);

      if (!filePath) {
        throw new Error("Unknown project.");
      }

      return this.write(
        filePath,
        content as unknown as ProjectContent,
        identity,
        token,
      );
    });

    this.handle("project:saveAs", async (payload, window) => {
      const { content, identity, suggestedName, dialog: text } =
        SaveAsSchema.parse(payload);
      const result = await this.dialogs.showSaveDialog(window, {
        title: text.title,
        defaultPath: path.join(
          this.defaultFolder(),
          suggestedFileName(suggestedName),
        ),
        filters: [{ name: text.filterName, extensions: ["wyproj"] }],
        properties: ["showOverwriteConfirmation"],
      });

      if (result.canceled || !result.filePath) {
        return { cancelled: true };
      }

      const filePath = result.filePath.toLowerCase().endsWith(PROJECT_EXTENSION)
        ? result.filePath
        : `${result.filePath}${PROJECT_EXTENSION}`;

      return this.write(
        filePath,
        content as unknown as ProjectContent,
        identity,
        this.remember(filePath),
      );
    });

    this.handle("project:recent", async () => ({
      recentProjects: this.recentList(),
    }));

    this.handle("project:clearRecent", async () => {
      this.options.recentProjects.clear();

      return { recentProjects: this.recentList() };
    });

    this.handle("project:autosave", async (payload) => {
      const { content, identity, token, projectName } =
        AutoSaveSchema.parse(payload);

      const info = await this.autoSave.save(
        content as unknown as ProjectContent,
        identity,
        projectName,
        token ? (this.tokens.get(token) ?? null) : null,
      );

      return { savedAt: info.savedAt };
    });

    this.handle("project:recovery", async (payload) => {
      const { action } = RecoverySchema.parse(payload);

      if (action === "check") {
        const check = await this.recovery.check();

        return check.available
          ? {
              available: true,
              projectName: check.info.projectName,
              savedAt: check.info.savedAt,
            }
          : { available: false, quarantined: check.quarantined };
      }

      const restored = this.recovery.restore();

      if (!restored) {
        throw new Error("No copy of the automatic save checked.");
      }

      const { projectPath, projectName } = restored.info;

      return {
        ...this.forWindow(restored.project),
        token: projectPath ? this.remember(projectPath) : null,
        projectName,
      };
    });

    this.handle("project:discardRecovery", async () => {
      await this.recovery.discard();

      return {};
    });
  }
}

export default ProjectIPC;
