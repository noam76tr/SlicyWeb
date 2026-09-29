import { SupportedLanguage } from "./LanguageManager";
import { TranslationLoader } from "./TranslationLoader";

export class LocalizationService {
  private translations: Record<string, string> = {};

  constructor(
    private readonly translationLoader: TranslationLoader
  ) {}

  public async loadLanguage(
    language: SupportedLanguage
  ): Promise<void> {
    this.translations =
      await this.translationLoader.load(language);
  }

  public translate(
    key: string,
    fallback?: string
  ): string {
    if (key in this.translations) {
      return this.translations[key];
    }

    return fallback ?? key;
  }

  public hasTranslation(
    key: string
  ): boolean {
    return key in this.translations;
  }

  public getTranslations(): Record<string, string> {
    return { ...this.translations };
  }

  public translateWithParams(
    key: string,
    params: Record<string, string | number>,
    fallback?: string
  ): string {
    let value = this.translate(key, fallback);

    Object.entries(params).forEach(([param, paramValue]) => {
      value = value.replaceAll(
        `{${param}}`,
        String(paramValue)
      );
    });

    return value;
  }

  public clear(): void {
    this.translations = {};
  }
}
