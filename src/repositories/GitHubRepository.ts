/**
 * SlicyWeb
 * GitHub Repository
 *
 * Responsible for:
 * - Remote repository access
 * - Data retrieval
 * - Repository availability checks
 * - Repository URL management
 *
 * No business logic.
 * No rendering logic.
 * No AI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 * - TECH_STACK.md
 */

export class GitHubRepository {
  private baseUrl = "";

  /**
   * Sets repository base URL.
   */
  public setBaseUrl(
    url: string,
  ): void {
    this.baseUrl = url;
  }

  /**
   * Returns repository base URL.
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Fetches JSON data from repository.
   */
  public async fetch<T>(
    path: string,
  ): Promise<T> {
    const response =
      await fetch(
        `${this.baseUrl}/${path}`,
      );

    if (!response.ok) {
      throw new Error(
        `Repository request failed: ${response.status}`,
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Returns whether repository is reachable.
   */
  public async isAvailable(): Promise<boolean> {
    try {
      const response =
        await fetch(
          this.baseUrl,
          {
            method: "HEAD",
          },
        );

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Downloads raw text content.
   */
  public async fetchText(
    path: string,
  ): Promise<string> {
    const response =
      await fetch(
        `${this.baseUrl}/${path}`,
      );

    if (!response.ok) {
      throw new Error(
        `Repository request failed: ${response.status}`,
      );
    }

    return response.text();
  }

  /**
   * Checks whether a resource exists.
   */
  public async exists(
    path: string,
  ): Promise<boolean> {
    try {
      const response =
        await fetch(
          `${this.baseUrl}/${path}`,
          {
            method: "HEAD",
          },
        );

      return response.ok;
    } catch {
      return false;
    }
  }
}
