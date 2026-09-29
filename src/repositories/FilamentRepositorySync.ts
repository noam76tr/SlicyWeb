/**
 * Wichy
 * Filament Repository Sync Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - FILAMENT_SETTINGS_SPEC.md
 */

import { GitHubRepository } from "./GitHubRepository";

export class FilamentRepositorySync {
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
      "filaments"
    );
  }

  public async exists():
    Promise<boolean> {
    return this.repository.exists(
      "filaments"
    );
  }
}
