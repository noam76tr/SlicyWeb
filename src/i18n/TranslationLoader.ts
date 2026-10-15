/**
 * SlicyWeb
 * Translation Loader
 *
 * Responsible for:
 * - Translation dictionary loading
 * - Translation caching
 * - Language fallback handling
 * - Translation file management
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECHNICAL_OVERVIEW.md
 * - DATA_SCHEMA.md
 * - GUI_SPEC.md (Localization)
 */

export type SupportedLanguage =
  | "en"
  | "fr"
  | "he";

export type TranslationDictionary = Record<string, string>;

/**
 * Dictionaries are read from public/locales/ with a path relative
 * to the page:
 * - development: page served by Vite over http, the path resolves
 *   to /locales/;
 * - built application: page loaded from disk with
 *   BrowserWindow.loadFile (src/electron/main.ts), the path resolves
 *   next to dist/renderer/index.html, where Vite copies public/.
 *
 * Chromium's fetch does not accept file: URLs, so XMLHttpRequest
 * is used when the page is loaded from disk.
 */
function isFileProtocol(): boolean {
  return window.location.protocol === "file:";
}

async function readWithFetch(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to load translation file: ${url} (HTTP ${response.status})`,
    );
  }

  return response.text();
}

function readWithXhr(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("GET", url);
    request.responseType = "text";

    request.onload = () => {
      // Status 0 is returned for a successful file: request.
      if (request.status === 0 || request.status === 200) {
        resolve(request.responseText);
      } else {
        reject(
          new Error(
            `Failed to load translation file: ${url} (status ${request.status})`,
          ),
        );
      }
    };

    request.onerror = () => {
      reject(new Error(`Failed to load translation file: ${url}`));
    };

    request.send();
  });
}

export class TranslationLoader {
  private static readonly DEFAULT_LANGUAGE: SupportedLanguage = "en";

  private static cache: Map<
    SupportedLanguage,
    TranslationDictionary
  > = new Map();

  /**
   * Returns true if language is supported
   */
  public static isSupportedLanguage(
    language: string,
  ): language is SupportedLanguage {
    return ["en", "fr", "he"].includes(language);
  }

  /**
   * Loads a translation dictionary
   */
  public static async load(
    language: SupportedLanguage,
  ): Promise<TranslationDictionary> {
    const cached = this.cache.get(language);

    if (cached) {
      return cached;
    }

    const url = `./locales/${language}.json`;

    const text = isFileProtocol()
      ? await readWithXhr(url)
      : await readWithFetch(url);

    let dictionary: TranslationDictionary;

    try {
      dictionary = JSON.parse(text) as TranslationDictionary;
    } catch (error) {
      throw new Error(
        `Invalid translation file for language: ${language}`,
        { cause: error },
      );
    }

    this.cache.set(language, dictionary);

    return dictionary;
  }

  /**
   * Attempts to load a language,
   * falling back to English when missing.
   */
  public static async loadWithFallback(
    language: string,
  ): Promise<TranslationDictionary> {
    try {
      if (!this.isSupportedLanguage(language)) {
        return this.load(this.DEFAULT_LANGUAGE);
      }

      return await this.load(language);
    } catch {
      return this.load(this.DEFAULT_LANGUAGE);
    }
  }

  /**
   * Clears all cached dictionaries
   */
  public static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Removes a specific language from cache
   */
  public static clearLanguage(
    language: SupportedLanguage,
  ): void {
    this.cache.delete(language);
  }

  /**
   * Returns loaded language count
   */
  public static getLoadedLanguageCount(): number {
    return this.cache.size;
  }

  /**
   * Indicates if a language is already cached
   */
  public static isLoaded(
    language: SupportedLanguage,
  ): boolean {
    return this.cache.has(language);
  }
}

export default TranslationLoader;
