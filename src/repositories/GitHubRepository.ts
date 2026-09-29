/**
 * Wichy
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

export class GitHubRepository {*  private baseUrl = "";

  /**
   * Sets repository base URL.
   */
 *public setBaseUrl(
    url: string*
  ): void {
    this.baseUrl = ur*;
  }

  /**
   * Returns reposito*y base URL.
   */
  public getBase*rl(): string {
    return this.bas*Url;
  }

  /**
   * Fetches JSON *ata from repository.
   */
  publi* async fetch<T>(
    path: string,*  ): Promise<T> {
    const respon*e =
      await fetch(
        `${*his.baseUrl}/${path}`,
      );

 *  if (!response.ok) {
      throw *ew Error(
        `Repository requ*st failed: ${response.status}`,
  *   );
    }

    return response.j*on() as Promise<T>;
  }

  /**
   * Returns whether repository is rea*hable.
   */
  public async isAvai*able(): Promise<boolean> {
    try*{
      const response =
        a*ait fetch(
          this.baseUrl,*          {
            method: "H*AD",
          },
        );

    * return response.ok;
    } catch {*      return false;
    }
  }

  /**
   * Downloads raw text content.*   */
  public async fetchText(
  * path: string,
  ): Promise<string* {
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
}
