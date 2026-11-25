/**
 * SlicyWeb
 * Recent Projects Tests
 *
 * File > Recent Projects (Phase 13, lot 111; decision 119 of Noam, Q17
 * A): the 10 last projects opened or saved, the most recent first, kept
 * in settings.json (files.recentProjects); a project opened again moves
 * to the top; Clear List empties the list; paths without case on Windows.
 *
 * Based on:
 * - USER_SETTINGS_SPEC.md 2.4.0 (File Settings)
 * - DATA_SCHEMA.md 3.16.0 (User Preferences Schema)
 * - TEST_PLAN.md (Project Persistence)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { RecentProjectsStorage } from "../../../src/storage/RecentProjectsStorage";
import { SettingsStorage } from "../../../src/storage/SettingsStorage";

let folder: string;
let settings: SettingsStorage;

beforeEach(() => {
  folder = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-recent-"));
  settings = new SettingsStorage(path.join(folder, "settings.json"));
});

afterEach(() => {
  fs.rmSync(folder, { recursive: true, force: true });
});

describe("Recent projects (Q17 A)", () => {
  it("keeps the 10 last projects, the most recent first", () => {
    const recent = new RecentProjectsStorage(settings, "linux");

    for (let index = 1; index <= 12; index += 1) {
      recent.add(`/projets/p${index}.wyproj`);
    }

    expect(recent.list()).toHaveLength(10);
    expect(recent.list()[0]).toBe("/projets/p12.wyproj");
    expect(recent.list()[9]).toBe("/projets/p3.wyproj");

    // Kept in settings.json, read again at the next start
    expect(new SettingsStorage(settings.getFilePath()).load().files).toEqual({
      recentProjects: recent.list(),
    });
  });

  it("moves a project opened again to the top, removes one, clears the list", () => {
    const recent = new RecentProjectsStorage(settings, "linux");

    recent.add("/a.wyproj");
    recent.add("/b.wyproj");
    recent.add("/a.wyproj");
    expect(recent.list()).toEqual(["/a.wyproj", "/b.wyproj"]);

    recent.remove("/a.wyproj");
    expect(recent.list()).toEqual(["/b.wyproj"]);

    recent.clear();
    expect(recent.list()).toEqual([]);
  });

  it("compares the paths without case on Windows", () => {
    const recent = new RecentProjectsStorage(settings, "win32");

    recent.add("C:\\Projets\\Cube.wyproj");
    recent.add("c:\\projets\\cube.WYPROJ");

    expect(recent.list()).toEqual(["c:\\projets\\cube.WYPROJ"]);
  });

  it("keeps the other settings, and reads only valid paths of a damaged list", () => {
    settings.save({ ...settings.load(), language: "he" });
    fs.writeFileSync(
      settings.getFilePath(),
      JSON.stringify({
        version: 1,
        preferences: {
          ...JSON.parse(fs.readFileSync(settings.getFilePath(), "utf8"))
            .preferences,
          files: { recentProjects: ["/a.wyproj", 3, "", "/a.wyproj", "/b.wyproj"] },
        },
      }),
    );

    const recent = new RecentProjectsStorage(settings, "linux");

    expect(recent.list()).toEqual(["/a.wyproj", "/b.wyproj"]);
    recent.add("/c.wyproj");
    expect(settings.load().language).toBe("he");
  });
});
