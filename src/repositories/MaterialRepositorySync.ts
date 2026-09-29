/**
 * Wichy
 * Material Repository Sync Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - MATERIAL_PROFILE_SPEC.md
 */

import { GitHubRepository } from "./GitHubRepository";

export class MaterialRepositorySync {
  private readonly repository =
    new GitHubRepository();

  public setRepositoryUrl(
    url: string
  ): void {
    this.repository.setBaseUrl(
      url
    );
  }

  public async sync():
    Promise<unknown> {
    return this.repository.fetch(
      "materials"
    );
  }

  public async exists():
    Promise<boolean> {
    return this.repository.exists(
      "materials"
    );
  }
}
