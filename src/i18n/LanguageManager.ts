export type SupportedLanguage =
  | "en"
  | "fr"
  | "he";

export class LanguageManager {
  private static readonly DEFAULT_LANGUAGE: SupportedLanguage =
    "en";

  private currentLanguage: SupportedLanguage =
    LanguageManager.DEFAULT_LANGUAGE;

  private readonly supportedLanguages: SupportedLanguage[] =
    ["en", "fr", "he"];

  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  public setLanguage(
    language: SupportedLanguage
  ): void {
    if (!this.isSupported(language)) {
      throw new Error(
        `Unsupported language: ${language}`
      );
    }

    this.currentLanguage = language;
  }

  public getSupportedLanguages(): SupportedLanguage[] {
    return [...this.supportedLanguages];
  }

  public isSupported(
    language: string
  ): language is SupportedLanguage {
    return this.supportedLanguages.includes(
      language as SupportedLanguage
    );
  }

  public reset(): void {
    this.currentLanguage =
      LanguageManager.DEFAULT_LANGUAGE;
  }

  public isRTL(): boolean {
    return this.currentLanguage === "he";
  }

  public getDefaultLanguage(): SupportedLanguage {
    return LanguageManager.DEFAULT_LANGUAGE;
  }
}
