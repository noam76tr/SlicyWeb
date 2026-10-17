/**
 * SlicyWeb
 * Import Manager
 *
 * Responsible for:
 * - Import workflow (IMPORT_EXPORT_SPEC.md, Import Workflow):
 *   file validation, format detection, parser selection, geometry
 *   extraction and mesh validation, scene integration
 * - Import errors with their code (ImportError)
 *
 * Formats (IMPORT_EXPORT_SPEC.md, Supported Import Formats): STL and
 * 3MF. Each build item of a 3MF file becomes one object; the objects
 * keep their layout (ADR-030).
 *
 * Domain: Import. Depends on the Scene Domain (scene integration),
 * called by the Service Domain (ImportService), DOMAINS_DEPENDENCY_MATRIX.md.
 *
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - IMPORT_EXPORT_SPEC.md
 * - SECURITY_SPEC.md (File Import Security)
 * - DECISIONS.md (ADR-029, ADR-030)
 */

import {
  registerImportedObject,
  registerImportedObjects,
} from "../scene/SceneIntegration";

import { FileValidator } from "./FileValidator";
import { ImportError } from "./ImportError";
import { READ_SHARE, type ImportProgress } from "./ImportRunner";
import { STLImporter } from "./STLImporter";
import { ThreeMFImporter } from "./ThreeMFImporter";

export type ImportPhase = "reading" | "analyzing";

/** Progress of an import: phase and fraction from 0 to 1 */
export type ImportProgressListener = (
  phase: ImportPhase,
  fraction: number,
) => void;

export class ImportManager {
  private readonly fileValidator =
    new FileValidator();

  private readonly stlImporter =
    new STLImporter();

  private readonly threeMFImporter =
    new ThreeMFImporter();

  /**
   * Imports a file and registers its objects in the scene.
   * Returns the objectId of each imported object.
   * Throws an ImportError when the file is refused.
   */
  public async importFile(
    file: File,
    onProgress: ImportProgressListener = () => {},
  ): Promise<string[]> {
    const fileType = this.fileValidator.getExtension(file.name);

    if (!this.fileValidator.validateExtension(file)) {
      throw new ImportError(
        "IMP_001",
        `Unsupported file extension: ${fileType || "(none)"}`,
      );
    }

    if (file.size === 0) {
      throw new ImportError(
        fileType === "stl" ? "STL_002" : "MF_002",
        "Empty file.",
      );
    }

    if (!this.fileValidator.validateSize(file)) {
      throw new ImportError(
        "IMP_002",
        `File larger than ${FileValidator.getMaxFileSize()} bytes.`,
      );
    }

    const progress: ImportProgress = (fraction) => {
      onProgress(fraction < READ_SHARE ? "reading" : "analyzing", fraction);
    };

    if (fileType === "3mf") {
      const result = await this.threeMFImporter.import(file, progress);

      return registerImportedObjects(file.name, fileType, result.objects);
    }

    const result = await this.stlImporter.import(file, progress);

    return [registerImportedObject(file.name, fileType, result)];
  }

  /**
   * Returns whether a format is supported.
   */
  public isSupportedFormat(
    fileType: string,
  ): boolean {
    return this.fileValidator
      .getSupportedFormats()
      .includes(fileType.toLowerCase());
  }
}
