/**
 * SlicyWeb
 * Project File Tests
 *
 * The WYPROJ project file (Phase 13, lot 111, ADR-038; decision 119 of
 * Noam, Q1 to Q22 A):
 * - the triangles of each object (meshData, base64 of 32-bit numbers,
 *   Q2 A), read back number by number;
 * - a project saved then opened gives back each object value by value,
 *   its analysis, its recommendation, the printer, the material and the
 *   filament (Q3, Q6 A);
 * - writing through a temporary file, the existing file left as it was
 *   when the writing fails (PROJ_004, Q10 and Q16 A);
 * - files refused: not found (PROJ_001), damaged (PROJ_002), other
 *   version (PROJ_003), too large (PROJ_005);
 * - author never written (Q21 A).
 *
 * Based on:
 * - DATA_SCHEMA.md 3.16.0 (Project Schema, Object Schema, Project File
 *   Schema)
 * - IMPORT_EXPORT_SPEC.md 3.2.0
 * - ERROR_CODES_SPEC.md 2.7.0 (PROJ_001 to PROJ_005)
 * - SECURITY_SPEC.md (Project Validation)
 * - TEST_PLAN.md (Project Persistence)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { MeshDataCodec } from "../../../src/project/MeshDataCodec";
import { ProjectError } from "../../../src/project/ProjectError";
import {
  ProjectManager,
  projectNameOf,
  withoutMeshData,
} from "../../../src/project/ProjectManager";
import { WYPROJExporter } from "../../../src/project/WYPROJExporter";

import { box, content, filament, material } from "./projectTestData";

/**
 * A project file read as JSON, to change it in the tests (any field may
 * be changed)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FileJson = Record<string, any>;

let folder: string;

beforeEach(() => {
  folder = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-project-"));
});

afterEach(() => {
  fs.rmSync(folder, { recursive: true, force: true });
});

/** The code of the error thrown by a promise */
async function codeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return error instanceof ProjectError ? error.code : "not a ProjectError";
  }

  return "no error";
}

/** The text of a saved project, changed by a function */
async function changedFile(
  change: (file: FileJson) => void,
): Promise<string> {
  const manager = new ProjectManager();
  const filePath = path.join(folder, "cube.wyproj");

  await manager.save(filePath, content(), null);

  const file = JSON.parse(fs.readFileSync(filePath, "utf8"));
  change(file);

  const target = path.join(folder, "changed.wyproj");
  fs.writeFileSync(target, JSON.stringify(file));

  return target;
}


/**
 * These tests read and write real files (projects of several MB, copies
 * of the automatic save): on a slower PC they can pass 5 s (Noam, lot
 * 111: 5.6 s). A longer delay only; what they check does not change.
 */
const FILE_TEST_TIMEOUT_MS = 30_000;

describe("MeshDataCodec (meshData, Q2 A)", () => {
  it("gives back the same numbers", () => {
    const positions = box(20, 10, 30);
    const text = MeshDataCodec.encode(positions);

    expect(text).toHaveLength(Math.ceil((12 * 36) / 3) * 4);
    expect(Array.from(MeshDataCodec.decode(text, 12))).toEqual(
      Array.from(positions),
    );
  });

  it("refuses a text of another length, not base64, or a value not finite", () => {
    const text = MeshDataCodec.encode(box(10, 10, 10));

    expect(() => MeshDataCodec.decode(text, 11)).toThrow();
    expect(() => MeshDataCodec.decode(`${text.slice(0, -4)}!!!!`, 12)).toThrow();

    const bad = box(10, 10, 10);
    bad[5] = Number.NaN;
    expect(() => MeshDataCodec.decode(MeshDataCodec.encode(bad), 12)).toThrow(
      /finite/,
    );
  });

  it("refuses triangle data that is not 9 numbers per triangle", () => {
    expect(() => MeshDataCodec.encode(new Float32Array(10))).toThrow();
    expect(() => MeshDataCodec.encode(new Float32Array(0))).toThrow();
  });
});

describe("ProjectManager (save and open, Q6 A)", { timeout: FILE_TEST_TIMEOUT_MS }, () => {
  it("saves then opens a project: each object value by value, its triangles, analysis, recommendation and profiles", async () => {
    const manager = new ProjectManager();
    const filePath = path.join(folder, "Mon projet.wyproj");
    const saved = content();

    const result = await manager.save(filePath, saved, null);
    const opened = await manager.open(filePath);

    expect(result.projectName).toBe("Mon projet");
    expect(opened.project.projectName).toBe("Mon projet");
    expect(opened.project.projectId).toBe(result.projectId);
    expect(withoutMeshData(opened.project).scene.objects).toEqual(
      saved.objects,
    );

    for (const object of saved.objects) {
      expect(Array.from(opened.meshes[object.objectId])).toEqual(
        Array.from(saved.meshes[object.objectId]),
      );
    }

    expect(opened.project.analysis).toEqual(saved.analysis);
    expect(opened.project.recommendations).toEqual(saved.recommendations);
    expect(opened.project.printer).toEqual(saved.printer);
    expect(opened.project.material).toEqual(saved.material);
    expect(opened.project.filament).toEqual(saved.filament);
    expect(opened.project.preset).toBeNull();
    expect(opened.project.settings).toEqual({});
    expect(opened.project.version).toBe("3.0.0");
  });

  it("keeps projectId and createdAt at each save; updatedAt changes", async () => {
    const manager = new ProjectManager();
    const filePath = path.join(folder, "cube.wyproj");
    const first = await manager.save(filePath, content(), null);

    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await manager.save(filePath, content(), first);

    expect(second.projectId).toBe(first.projectId);
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.updatedAt > first.updatedAt).toBe(true);
  });

  it("writes the file, application in metadata, never author (Q21 A), no temporary file left", async () => {
    const manager = new ProjectManager();
    const filePath = path.join(folder, "cube.wyproj");

    await manager.save(filePath, content(), null);

    const file = JSON.parse(fs.readFileSync(filePath, "utf8"));

    expect(Object.keys(file)).toEqual(["format", "version", "project", "metadata"]);
    expect(file.metadata).toEqual({ application: "SlicyWeb Smart Slicer" });
    expect(Object.keys(file.project.scene)).toEqual(["objects"]);
    expect(fs.readdirSync(folder)).toEqual(["cube.wyproj"]);
  });

  it("keeps only the results of the objects of the scene (rules 4 and 5)", () => {
    const saved = content();
    const project = new ProjectManager().createProject(
      { ...saved, objects: [saved.objects[1]] },
      null,
      "",
    );

    expect(Object.keys(project.analysis)).toEqual(["b"]);
    expect(project.recommendations).toEqual({});
  });

  it("refuses a content that is not a valid project (PROJ_002)", () => {
    const saved = content();
    const manager = new ProjectManager();

    // Name not trimmed
    expect(() =>
      manager.createProject(
        { ...saved, objects: [{ ...saved.objects[0], name: " a " }] },
        null,
        "",
      ),
    ).toThrow(/PROJ_002/);

    // A filament of another family than the material
    expect(() =>
      manager.createProject(
        { ...saved, material: material("petg"), filament: filament() },
        null,
        "",
      ),
    ).toThrow(/PROJ_002/);

    // An object without triangles
    expect(() =>
      manager.createProject({ ...saved, meshes: { a: saved.meshes.a } }, null, ""),
    ).toThrow(/PROJ_002/);
  });

  it("a writing that fails gives PROJ_004 and leaves the existing file as it was", async () => {
    const manager = new ProjectManager();
    const filePath = path.join(folder, "cube.wyproj");

    await manager.save(filePath, content(), null);
    const before = fs.readFileSync(filePath, "utf8");

    // The target is a folder: the renaming fails
    const blocked = path.join(folder, "blocked.wyproj");
    fs.mkdirSync(blocked);

    expect(await codeOf(manager.save(blocked, content(), null))).toBe("PROJ_004");
    expect(fs.readFileSync(filePath, "utf8")).toBe(before);
    expect(fs.readdirSync(folder).sort()).toEqual(["blocked.wyproj", "cube.wyproj"]);
  });

  it("saves and opens a large object (500 000 triangles)", async () => {
    const manager = new ProjectManager();
    const filePath = path.join(folder, "large.wyproj");
    const saved = content();
    const triangles = 500_000;
    const positions = new Float32Array(triangles * 9);

    for (let index = 0; index < positions.length; index += 1) {
      positions[index] = Math.sin(index) * 50;
    }

    saved.objects[0] = {
      ...saved.objects[0],
      mesh: { vertices: triangles * 3, triangles },
    };
    saved.meshes.a = positions;

    await manager.save(filePath, saved, null);
    const opened = await manager.open(filePath);

    expect(
      Buffer.compare(
        Buffer.from(opened.meshes.a.buffer),
        Buffer.from(positions.buffer),
      ),
    ).toBe(0);
  });

  it("names a project after its file (Q9 A)", () => {
    expect(projectNameOf(path.join("C:", "Projets", "cube.wyproj"))).toBe("cube");
    expect(projectNameOf("/home/noam/Pièce.WYPROJ")).toBe("Pièce");
  });
});

describe("Files refused (Q16 A)", { timeout: FILE_TEST_TIMEOUT_MS }, () => {
  it("PROJ_001: the file does not exist", async () => {
    expect(
      await codeOf(new ProjectManager().open(path.join(folder, "none.wyproj"))),
    ).toBe("PROJ_001");
  });

  it("PROJ_002: not a .wyproj, not JSON, an unknown field, a damaged triangle, a reference to an object missing", async () => {
    const manager = new ProjectManager();
    const stl = path.join(folder, "cube.stl");
    fs.writeFileSync(stl, "solid cube");
    expect(await codeOf(manager.open(stl))).toBe("PROJ_002");

    const text = path.join(folder, "text.wyproj");
    fs.writeFileSync(text, "{ broken");
    expect(await codeOf(manager.open(text))).toBe("PROJ_002");

    const changes: ((file: FileJson) => void)[] = [
      (file) => {
        file.project.scene.objects[0].color = "red";
      },
      (file) => {
        file.project.extra = true;
      },
      (file) => {
        file.author = "Noam";
      },
      (file) => {
        const meshData: string = file.project.scene.objects[0].meshData;
        file.project.scene.objects[0].meshData = `${meshData.slice(0, -8)}AAAAAAA=`;
      },
      (file) => {
        // 0x7fc00000: NaN
        const bytes = Buffer.from(file.project.scene.objects[0].meshData, "base64");
        bytes.writeUInt32LE(0x7fc00000, 0);
        file.project.scene.objects[0].meshData = bytes.toString("base64");
      },
      (file) => {
        file.project.scene.objects.splice(1, 1);
      },
      (file) => {
        file.project.scene.objects[1].objectId = "a";
      },
    ];

    for (const change of changes) {
      expect(await codeOf(manager.open(await changedFile(change)))).toBe(
        "PROJ_002",
      );
    }
  });

  it("PROJ_003: a newer or an older format version, with the versions", async () => {
    const manager = new ProjectManager();

    for (const [version, newer] of [
      ["3.1.0", true],
      ["4.0.0", true],
      ["2.0.0", false],
    ] as const) {
      const filePath = await changedFile((file) => {
        file.version = version;
        file.project.version = version;
      });

      try {
        await manager.open(filePath);
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(ProjectError);
        expect((error as ProjectError).code).toBe("PROJ_003");
        expect((error as ProjectError).params).toEqual({
          fileVersion: version,
          supportedVersion: "3.0.0",
          newer,
        });
      }
    }
  });

  it("PROJ_005: a file larger than the limit is not read", async () => {
    const filePath = path.join(folder, "cube.wyproj");

    await new ProjectManager().save(filePath, content(), null);

    const size = fs.statSync(filePath).size;

    expect(
      await codeOf(new ProjectManager(undefined, undefined, size - 1).open(filePath)),
    ).toBe("PROJ_005");
    expect(
      await codeOf(new ProjectManager(undefined, undefined, size).open(filePath)),
    ).toBe("no error");
  });

  it("the text of a project is the same at each export (fields in order)", () => {
    const manager = new ProjectManager();
    const project = manager.createProject(content(), null, "cube");

    expect(WYPROJExporter.serialize(project)).toBe(
      WYPROJExporter.serialize(JSON.parse(JSON.stringify(project))),
    );
    expect(manager.openText(WYPROJExporter.serialize(project)).project).toEqual(
      project,
    );
  });
});
