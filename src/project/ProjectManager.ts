/**
 * SlicyWeb
 * Project Manager
 *
 * Responsible for (Phase 13, lot 111, ADR-038; decision 119 of Noam, Q1 to
 * Q22 A):
 * - Project creation: the only creator of a project (PASSATION.md decision
 *   6). A project is created from the content of the window (objects with
 *   their triangles, analyses, recommendations, selected printer, material
 *   and filament) and its identity (projectId, createdAt), or a new
 *   identity for a project never saved.
 * - Project saving: the project is validated in full, serialized
 *   (WYPROJExporter), then written through a temporary file in the same
 *   folder, renamed at the end: an interruption never leaves a file half
 *   written; a failure (PROJ_004) leaves the existing file as it was
 *   (Q10 A, Q16 A).
 * - Project loading: WYPROJImporter (size, version, validation, triangles).
 *
 * The name of the project is the name of its file, without .wyproj
 * (Q9 A); "" for a copy of a project never saved (automatic save).
 *
 * Main process only (Node.js file system). The window never gives the
 * path of a file to write (Q20 A): ProjectIPC chooses it.
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PROJECT_SPEC.md
 * - IMPORT_EXPORT_SPEC.md 3.2.0 (WYPROJ Project Lifecycle, Save Operations)
 * - DATA_SCHEMA.md 3.16.0
 * - SECURITY_SPEC.md (Project Security)
 */

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { WYPROJ_FORMAT_VERSION } from "../constants/ApplicationConstants";
import { PROJECT_EXTENSION } from "../constants/ProjectConstants";
import type { Analysis } from "../types/Analysis";
import type { Filament } from "../types/Filament";
import type { Material } from "../types/Material";
import type { Object3D } from "../types/Object3D";
import type { Printer } from "../types/Printer";
import type { Project, ProjectObject } from "../types/Project";
import type { Recommendation } from "../types/Recommendation";

import { MeshDataCodec } from "./MeshDataCodec";
import { ProjectDeserializer } from "./ProjectDeserializer";
import { ProjectError } from "./ProjectError";
import { ProjectValidator } from "./ProjectValidator";
import { WYPROJExporter } from "./WYPROJExporter";
import { WYPROJImporter, type ImportedProject } from "./WYPROJImporter";

export { WYPROJ_FORMAT_VERSION };

/** What the window sends to save a project */
export interface ProjectContent {
  objects: Object3D[];
  /** Triangle data of each object, by objectId (9 numbers per triangle) */
  meshes: Record<string, Float32Array>;
  analysis: Record<string, Analysis>;
  recommendations: Record<string, Recommendation>;
  printer: Printer | null;
  material: Material | null;
  filament: Filament | null;
}

/** Identity of a project already saved */
export interface ProjectIdentity {
  projectId: string;
  createdAt: string;
}

/** A project written */
export interface SavedProject extends ProjectIdentity {
  projectName: string;
  updatedAt: string;
}

/** Name of a project: the name of its file, without .wyproj (Q9 A) */
export function projectNameOf(filePath: string): string {
  const base = path.basename(filePath);

  return base.toLowerCase().endsWith(PROJECT_EXTENSION)
    ? base.slice(0, -PROJECT_EXTENSION.length)
    : base;
}

/** A project without the text of its triangles (sent to the window) */
export type ProjectForWindow = Omit<Project, "scene"> & {
  scene: { objects: Object3D[] };
};

/** The project without the triangles (they travel as numbers) */
export function withoutMeshData(project: Project): ProjectForWindow {
  return {
    ...project,
    scene: {
      objects: project.scene.objects.map((object) => {
        const copy: Partial<ProjectObject> = { ...object };

        delete copy.meshData;

        return copy as Object3D;
      }),
    },
  };
}

export class ProjectManager {
  private readonly importer: WYPROJImporter;

  constructor(
    private readonly validator: ProjectValidator = new ProjectValidator(),
    deserializer: ProjectDeserializer = new ProjectDeserializer(),
    maxBytes?: number,
  ) {
    this.importer = new WYPROJImporter(deserializer, validator, maxBytes);
  }

  /**
   * Creates the project of a content: the only creator of a project. A
   * new projectId and createdAt when identity is null; updatedAt is now.
   * Throws PROJ_002 when the content is not a valid project.
   */
  public createProject(
    content: ProjectContent,
    identity: ProjectIdentity | null,
    projectName: string,
  ): Project {
    const timestamp = new Date().toISOString();
    const objectIds = new Set(content.objects.map((object) => object.objectId));

    const project: Project = {
      projectId: identity?.projectId ?? randomUUID(),
      projectName,
      projectFormat: "WYPROJ",
      createdAt: identity?.createdAt ?? timestamp,
      updatedAt: timestamp,
      version: WYPROJ_FORMAT_VERSION,
      scene: {
        objects: content.objects.map((object) => {
          const positions = content.meshes[object.objectId];

          if (!positions) {
            throw new ProjectError(
              "PROJ_002",
              `The object ${object.objectId} has no triangles.`,
            );
          }

          return {
            objectId: object.objectId,
            fileName: object.fileName,
            name: object.name,
            fileType: object.fileType,
            visible: object.visible,
            locked: object.locked,
            transform: object.transform,
            geometry: object.geometry,
            mesh: object.mesh,
            meshData: MeshDataCodec.encode(positions),
          };
        }),
      },
      settings: {},
      // Only the results of the objects of the scene (rule 4)
      analysis: Object.fromEntries(
        Object.entries(content.analysis).filter(([id]) => objectIds.has(id)),
      ),
      recommendations: Object.fromEntries(
        Object.entries(content.recommendations).filter(
          ([id]) =>
            objectIds.has(id) &&
            content.analysis[id]?.analysisId ===
              content.recommendations[id].analysisId,
        ),
      ),
      preset: null,
      printer: content.printer,
      material: content.material,
      filament: content.filament,
    };

    this.validator.validate(project);

    return project;
  }

  /**
   * Writes a project in a file (temporary file, then renamed): PROJ_004
   * when it cannot be written; the existing file is then not changed.
   */
  public async save(
    filePath: string,
    content: ProjectContent,
    identity: ProjectIdentity | null,
    projectName: string = projectNameOf(filePath),
  ): Promise<SavedProject> {
    const project = this.createProject(content, identity, projectName);

    await this.write(filePath, WYPROJExporter.serialize(project));

    return {
      projectId: project.projectId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      projectName: project.projectName,
    };
  }

  /** Reads and validates a project file (WYPROJImporter) */
  public open(filePath: string): Promise<ImportedProject> {
    return this.importer.importFromFile(filePath);
  }

  /** Reads and validates the text of a project file */
  public openText(content: string): ImportedProject {
    return this.importer.importFromString(content);
  }

  /** Writes a text through a temporary file of the same folder */
  public async write(filePath: string, text: string): Promise<void> {
    const temporaryPath = path.join(
      path.dirname(filePath),
      `.${path.basename(filePath)}.${randomUUID()}.tmp`,
    );

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(temporaryPath, text, "utf8");
      await fs.rename(temporaryPath, filePath);
    } catch (error) {
      await fs.rm(temporaryPath, { force: true }).catch(() => undefined);

      throw new ProjectError(
        "PROJ_004",
        `The project could not be written: ${filePath} (${
          error instanceof Error ? error.message : "Unknown error"
        })`,
        {},
        { cause: error },
      );
    }
  }
}

export default ProjectManager;
