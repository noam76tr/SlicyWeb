/**
 * SlicyWeb
 * Recovery Tests
 *
 * The copy of the automatic save and the recovery (Phase 13, lot 111;
 * decision 119 of Noam, Q18 and Q19 A):
 * - AutoSaveService writes autosave.wyproj then autosave.json in the
 *   recovery folder, never in the file of the user;
 * - RecoveryManager offers a valid copy (name, time), gives its project,
 *   removes it (discard); a damaged copy is set aside in quarantine/ and
 *   never opened.
 *
 * Based on:
 * - SECURITY_SPEC.md (Auto Save Security, Recovery Security)
 * - USER_SETTINGS_SPEC.md 2.4.0 (Project Settings)
 * - TEST_PLAN.md (Project Persistence)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ProjectManager } from "../../../src/project/ProjectManager";
import { AutoSaveService } from "../../../src/recovery/AutoSaveService";
import { RecoveryManager } from "../../../src/recovery/RecoveryManager";

import { content } from "../project/projectTestData";

let folder: string;
let manager: ProjectManager;
let autoSave: AutoSaveService;
let recovery: RecoveryManager;

beforeEach(() => {
  folder = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-recovery-")),
    "recovery",
  );
  manager = new ProjectManager();
  autoSave = new AutoSaveService(folder, manager);
  recovery = new RecoveryManager(folder, manager);
});

afterEach(() => {
  fs.rmSync(path.dirname(folder), { recursive: true, force: true });
});


/**
 * These tests read and write real files (projects of several MB, copies
 * of the automatic save): on a slower PC they can pass 5 s (Noam, lot
 * 111: 5.6 s). A longer delay only; what they check does not change.
 */
const FILE_TEST_TIMEOUT_MS = 30_000;

describe("Automatic save and recovery (Q18, Q19 A)", { timeout: FILE_TEST_TIMEOUT_MS }, () => {
  it("nothing to recover when there is no copy", async () => {
    expect(await recovery.check()).toEqual({
      available: false,
      quarantined: false,
    });
    expect(recovery.restore()).toBeNull();
  });

  it("writes the copy, offers it with its name and time, gives its project, then removes it", async () => {
    const saved = content();
    const info = await autoSave.save(
      saved,
      null,
      "cube",
      path.join("C:", "Projets", "cube.wyproj"),
    );

    expect(fs.readdirSync(folder).sort()).toEqual([
      "autosave.json",
      "autosave.wyproj",
    ]);
    expect(info).toMatchObject({
      format: "SlicyWeb Recovery",
      version: 1,
      projectName: "cube",
      projectPath: path.join("C:", "Projets", "cube.wyproj"),
    });

    expect(await recovery.check()).toEqual({ available: true, info });

    const restored = recovery.restore();

    expect(restored?.info).toEqual(info);
    expect(restored?.project.project.scene.objects).toHaveLength(2);
    expect(Array.from(restored!.project.meshes.a)).toEqual(
      Array.from(saved.meshes.a),
    );

    await recovery.discard();
    expect(fs.readdirSync(folder)).toEqual([]);
    expect(await recovery.check()).toEqual({
      available: false,
      quarantined: false,
    });
  });

  it("a project never saved: no name, no path", async () => {
    const info = await autoSave.save(content(), null, "", null);

    expect(info.projectName).toBe("");
    expect(info.projectPath).toBeNull();
    expect((await recovery.check()).available).toBe(true);
  });

  it("removes the copy at once at a normal close (discardSync)", async () => {
    await autoSave.save(content(), null, "cube", null);
    recovery.discardSync();

    expect(fs.readdirSync(folder)).toEqual([]);
  });

  it("sets a damaged copy aside in quarantine, never offered", async () => {
    await autoSave.save(content(), null, "cube", null);
    fs.writeFileSync(path.join(folder, "autosave.wyproj"), "{ broken");

    expect(await recovery.check()).toEqual({
      available: false,
      quarantined: true,
    });
    expect(fs.readdirSync(folder)).toEqual(["quarantine"]);

    const [aside] = fs.readdirSync(path.join(folder, "quarantine"));

    expect(
      fs.readdirSync(path.join(folder, "quarantine", aside)).sort(),
    ).toEqual(["autosave.json", "autosave.wyproj"]);
    expect(await recovery.check()).toEqual({
      available: false,
      quarantined: false,
    });
  });

  it("a copy without its description, or with a description not valid, is set aside", async () => {
    await autoSave.save(content(), null, "cube", null);
    fs.rmSync(path.join(folder, "autosave.json"));

    expect((await recovery.check()).available).toBe(false);

    await autoSave.save(content(), null, "cube", null);
    fs.writeFileSync(
      path.join(folder, "autosave.json"),
      JSON.stringify({ format: "SlicyWeb Recovery", version: 2 }),
    );

    expect(await recovery.check()).toEqual({
      available: false,
      quarantined: true,
    });
  });
});
