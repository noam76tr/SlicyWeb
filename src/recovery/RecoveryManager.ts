/**
 * SlicyWeb
 * Recovery Manager
 *
 * The copy of the automatic save after SlicyWeb did not close normally
 * (lot 111, decision 119 of Noam, Q19 A):
 * - check(): a copy is still there at start (crash, power cut, forced
 *   close): its description and the project are validated in full; a
 *   valid copy is offered (name, time); a copy damaged is set aside in
 *   recovery/quarantine/<time>/ and never opened (SECURITY_SPEC.md:
 *   corrupted local states quarantined);
 * - restore(): the project of the copy checked;
 * - discard(): removes the copy (Save, Don't Save, Ignore, normal close).
 *
 * Main process only (Node.js file system).
 *
 * Based on:
 * - SECURITY_SPEC.md (Recovery Security, Local Project Security Rules)
 * - PERFORMANCE_SPEC.md (Recovery Load < 3 seconds)
 * - UNDO_REDO_SPEC.md (Auto Save And Recovery: not undoable)
 */

import { promises as fs, rmSync } from "node:fs";
import path from "node:path";

import {
  QUARANTINE_FOLDER,
  RECOVERY_INFO_FILE,
  RECOVERY_PROJECT_FILE,
} from "../constants/ProjectConstants";
import type { ProjectManager } from "../project/ProjectManager";
import type { ImportedProject } from "../project/WYPROJImporter";

import { RecoveryValidator, type RecoveryInfo } from "./RecoveryValidator";

/** Result of the check at start */
export type RecoveryCheck =
  | { available: true; info: RecoveryInfo }
  | { available: false; quarantined: boolean };

export class RecoveryManager {
  /** Copy checked by the last check(), kept for restore() */
  private checked: { info: RecoveryInfo; project: ImportedProject } | null =
    null;

  public constructor(
    private readonly folder: string,
    private readonly projectManager: ProjectManager,
    private readonly validator: RecoveryValidator = new RecoveryValidator(),
  ) {}

  private get projectFile(): string {
    return path.join(this.folder, RECOVERY_PROJECT_FILE);
  }

  private get infoFile(): string {
    return path.join(this.folder, RECOVERY_INFO_FILE);
  }

  public async check(): Promise<RecoveryCheck> {
    this.checked = null;

    const [infoExists, projectExists] = await Promise.all([
      exists(this.infoFile),
      exists(this.projectFile),
    ]);

    if (!infoExists && !projectExists) {
      return { available: false, quarantined: false };
    }

    try {
      const info = this.validator.validate(
        JSON.parse(await fs.readFile(this.infoFile, "utf8")),
      );

      if (!info) {
        throw new Error("Invalid description of the copy.");
      }

      const project = await this.projectManager.open(this.projectFile);

      this.checked = { info, project };

      return { available: true, info };
    } catch (error) {
      console.warn("Recovery copy set aside (quarantine).", error);
      await this.quarantine();

      return { available: false, quarantined: true };
    }
  }

  /** The copy checked, or null (check() first) */
  public restore(): { info: RecoveryInfo; project: ImportedProject } | null {
    return this.checked;
  }

  public async discard(): Promise<void> {
    this.checked = null;

    await Promise.all([
      fs.rm(this.projectFile, { force: true }),
      fs.rm(this.infoFile, { force: true }),
    ]);
  }

  /**
   * Removes the copy at once (the window closed normally: the
   * application quits just after, an asynchronous removal could be cut)
   */
  public discardSync(): void {
    this.checked = null;
    rmSync(this.projectFile, { force: true });
    rmSync(this.infoFile, { force: true });
  }

  /** Moves the files of the copy to recovery/quarantine/<time>/ */
  private async quarantine(): Promise<void> {
    const target = path.join(
      this.folder,
      QUARANTINE_FOLDER,
      new Date().toISOString().replace(/[:.]/g, "-"),
    );

    await fs.mkdir(target, { recursive: true });

    for (const file of [this.projectFile, this.infoFile]) {
      if (await exists(file)) {
        await fs
          .rename(file, path.join(target, path.basename(file)))
          .catch(() => fs.rm(file, { force: true }));
      }
    }
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export default RecoveryManager;
