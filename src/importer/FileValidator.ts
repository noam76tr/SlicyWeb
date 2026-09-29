/**
 * Wichy
 * File Validator Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - SECURITY_SPEC.md
 * - PERFORMANCE_SPEC.md
 */

export class FileValidator {
  private static readonly SUPPORTED_FORMATS = [
    "stl",
    "3mf"
  ];

  private static readonly MAX_FILE_SIZE =
    1024 * 1024 * 1024;

  public validate(
    file: File
  ): boolean {
    return (
      this.validateName(file) &&
      this.validateSize(file) &&
      this.validateExtension(file)
    );
  }

  public validateName(
    file: File
  ): boolean {
    return (
      file.name.trim().length > 0
    );
  }

  public validateSize(
    file: File
  ): boolean {
    return (
      file.size > 0 &&
      file.size <=
        FileValidator.MAX_FILE_SIZE
    );
  }

  public validateExtension(
    file: File
  ): boolean {
    const extension =
      this.getExtension(file.name);

    return (
      FileValidator.SUPPORTED_FORMATS.includes(
        extension
      )
    );
  }

  public getExtension(
    fileName: string
  ): string {
    const parts =
      fileName.split(".");

    return (
      parts.pop()?.toLowerCase() ??
      ""
    );
  }

  public isStl(
    file: File
  ): boolean {
    return (
      this.getExtension(file.name) ===
      "stl"
    );
  }

  public is3mf(
    file: File
  ): boolean {
    return (
      this.getExtension(file.name) ===
      "3mf"
    );
  }

  public getSupportedFormats():
    readonly string[] {
    return FileValidator.SUPPORTED_FORMATS;
  }
}
