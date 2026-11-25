/**
 * SlicyWeb
 * Auto Save Service
 *
 * Writes the copy of the automatic save (lot 111, decision 119 of Noam,
 * Q18 A): the project modified, every 5 minutes, in the folder recovery/
 * of the user data folder (Windows: %APPDATA%\SlicyWeb\recovery), never in
 * the file of the user (SECURITY_SPEC.md: isolated from the main project).
 * Two files, each written through a temporary file then renamed:
 * - autosave.wyproj: the project, as a project file (validated in full);
 * - autosave.json: its description (RecoveryValidator), written last: a
 *   copy without a valid description is never offered.
 *
 * When to write (modified, interval, setting project.autoSave) is decided
 * by the window (ProjectService); the copy is removed by RecoveryManager.
 *
 * Main process only (Node.js file system).
 *
 * Based on:
 * - SECURITY_SPEC.md (Auto Save Security)
 * - PERFORMANCE_SPEC.md (Auto Save Performance)
 * - USER_SETTINGS_SPEC.md 2.4.0 (Project Settings)
 */

import path from "node:path";

import {
  RECOVERY_INFO_FILE,
  RECOVERY_INFO_FORMAT,
  RECOVERY_INFO_VERSION,
  RECOVERY_PROJECT_FILE,
} from "../constants/ProjectConstants";
import type {
  ProjectContent,
  ProjectIdentity,
  ProjectManager,
} from "../project/ProjectManager";
import { WYPROJExporter } from "../project/WYPROJExporter";

import type { RecoveryInfo } from "./RecoveryValidator";

export class AutoSaveService {
  public constructor(
    private readonly folder: string,
    private readonly projectManager: ProjectManager,
  ) {}

  /** Writes the copy of a project; returns its description */
  public async save(
    content: ProjectContent,
    identity: ProjectIdentity | null,
    projectName: string,
    projectPath: string | null,
  ): Promise<RecoveryInfo> {
    const project = this.projectManager.createProject(
      content,
      identity,
      projectName,
    );

    await this.projectManager.write(
      path.join(this.folder, RECOVERY_PROJECT_FILE),
      WYPROJExporter.serialize(project),
    );

    const info: RecoveryInfo = {
      format: RECOVERY_INFO_FORMAT,
      version: RECOVERY_INFO_VERSION,
      projectName,
      projectPath,
      savedAt: project.updatedAt,
    };

    await this.projectManager.write(
      path.join(this.folder, RECOVERY_INFO_FILE),
      `${JSON.stringify(info, null, 2)}\n`,
    );

    return info;
  }
}

export default AutoSaveService;
