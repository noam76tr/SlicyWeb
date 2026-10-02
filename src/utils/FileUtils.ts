/**
 * SlicyWeb
 * File Utilities
 *
 * Responsible for:
 * - File helper functions
 * - File extension validation
 * - File path manipulation
 * - File type detection
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - UTILS_SPEC.md
 */

export class FileUtils {
  /**
   * Gets file extension from filename.
   */
  public static getExtension(
    filename: string
  ): string {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return "";
    }
    return filename.substring(lastDotIndex + 1).toLowerCase();
  }

  /**
   * Gets filename without extension.
   */
  public static getNameWithoutExtension(
    filename: string
  ): string {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return filename;
    }
    return filename.substring(0, lastDotIndex);
  }

  /**
   * Checks if file extension is valid.
   */
  public static isValidExtension(
    filename: string,
    allowedExtensions: string[]
  ): boolean {
    const extension = this.getExtension(filename);
    return allowedExtensions.includes(extension);
  }

  /**
   * Checks if file is 3D model file.
   */
  public static is3DModelFile(
    filename: string
  ): boolean {
    const modelExtensions = ["stl", "obj", "gltf", "glb", "ply", "3mf"];
    return this.isValidExtension(filename, modelExtensions);
  }

  /**
   * Checks if file is JSON file.
   */
  public static isJsonFile(
    filename: string
  ): boolean {
    return this.isValidExtension(filename, ["json"]);
  }

  /**
   * Generates safe filename from string.
   */
  public static sanitizeFilename(
    filename: string
  ): string {
    return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  }
}
