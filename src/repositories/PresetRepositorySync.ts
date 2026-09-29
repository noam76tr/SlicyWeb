/**
 * Wichy
 * Preset Repository Sync Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - PRINT_PRESETS_SPEC.md
 */

import { GitHubRepository } from "./GitHubRepository";

export class PresetRepositorySync {
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
      "presets"
    );
  }

  public async exists():
    Promise<boolean> {
    return this.repository.exists(
      "presets"
    );
  }
}
