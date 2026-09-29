import { promises as fs } from "fs";
import path from "path";

import { ProjectDeserializer } from "./ProjectDeserializer";
import { ProjectValidator } from "./ProjectValidator";
import { ProjectState } from "./ProjectManager";

export class WYPROJImporter {
  constructor(
    private readonly deserializer: ProjectDeserializer,
    private readonly validator: ProjectValidator
  ) {}

  public async importFromFile(
    filePath: string
  ): Promise<ProjectState> {
    await this.validateFilePath(filePath);

    const rawContent = await fs.readFile(filePath, "utf-8");

    return this.importFromString(rawContent);
  }

  public importFromString(
    content: string
  ): ProjectState {
    const container = JSON.parse(content);

    if (container.format !== "WYPROJ") {
      throw new Error(
        "Invalid WYPROJ format."
      );
    }

    if (!container.project) {
      throw new Error(
        "Project data is missing."
      );
    }

    const project = this.deserializer.deserialize(
      JSON.stringify(container.project)
    );

    this.validator.validate(project);
    return project;
  }
  private async validateFilePath(
    filePath: string
  ): Promise<void> {
    const extension = path.extname(filePath).toLowerCase();

    if (extension !== ".wyproj") {
      throw new Error(
        `Invalid project file format: '${extension}'. Expected '.wyproj'.`
      );
    }

    try {
      await fs.access(filePath);
    } catch {
      throw new Error(
        `Project file does not exist: ${filePath}`
      );
    }
  }
}
