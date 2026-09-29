// src/i18n/TranslationLoader.ts

export type SupportedLanguage =
  | "en"
  | "fr"
  | "he";

export type TranslationDictionary = Record<string, string>;

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

    const response = await fetch(
      `/locales/${language}.json`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load translations for language: ${language}`,
      );
    }

    const dictionary =
      (await response.json()) as TranslationDictionary;

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
