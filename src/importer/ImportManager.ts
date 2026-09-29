/**
 * Wichy
 * Import Manager
 *
 * Responsible for:
 * - Import coordination
 * - Import workflow management
 * - Format routing
 *
 * No business logic.
 * No AI logic.
 * No scene management.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - DATA_SCHEMA.md
 */

import type { Object3D } from "../types/Object3D";

import { ObjectFactory } from "../object_manager/ObjectFactory";
import { STLImporter } from "./STLImporter";
import { ThreeMFImporter } from "./ThreeMFImporter";
import { FileValidator } from "./FileValidator";

export class ImportManager {
  private readonly fileValidator =
    new FileValidator();

  private readonly stlImporter =
    new STLImporter();

  private readonly threeMFImporter =
    new ThreeMFImporter();

  /**
   * Imports a file and creates an Object3D.
   */
  public async importFile(
    file: File,
  ): Promise<Object3D | null> {
    if (
      !this.fileValidator.validate(
        file,
      )
    ) {
      return null;
    }

    const fileName = file.name;

    const fileType =
      this.getFileExtension(
        fileName,
      );

    switch (fileType) {
      case "stl":
        await this.stlImporter.import(
          file,
        );
        break;

      case "3mf":
        await this.threeMFImporter.import(
          file,
        );
        break;

      default:
        return null;
    }

    return ObjectFactory.create(
      crypto.randomUUID(),
      fileName,
      fileType,
    );
  }

  /**
   * Returns whether a format is supported.
   */
  public isSupportedFormat(
    fileType: string,
  ): boolean {
    return [
      "stl",
      "3mf",
    ].includes(
      fileType.toLowerCase(),
    );
  }

  /**
   * Extracts file extension.
   */
  private getFileExtension(
    fileName: string,
  ): string {
    const parts =
      fileName.split(".");

    return (
      parts.pop()?.toLowerCase() ??
      ""
    );
  }
}
