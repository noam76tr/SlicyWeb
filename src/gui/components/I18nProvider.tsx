/**
 * SlicyWeb
 * I18n Provider
 *
 * Loads the translation dictionary of the current language and
 * provides it to the GUI (useTranslation).
 *
 * Applies the language to the document:
 * - <html lang> follows the current language;
 * - <html dir> is "rtl" for Hebrew, "ltr" otherwise
 *   (LanguageManager.isRTL).
 *
 * Starts with the default language of LanguageManager (English).
 * If a dictionary cannot be loaded, English is used instead.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Localization, Accessibility)
 * - CLAUDE.md (Internationalization Rule)
 * - DOMAINS_DEPENDENCY_MATRIX.md (GUI Domain)
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  LanguageManager,
  type SupportedLanguage,
} from "../../i18n/LanguageManager";
import { LocalizationService } from "../../i18n/LocalizationService";
import {
  I18nContext,
  type I18nContextValue,
  type TextDirection,
} from "../hooks/useTranslation";

interface I18nProviderProps {
  children: ReactNode;
}

interface LoadedLanguage {
  language: SupportedLanguage;
  direction: TextDirection;
  service: LocalizationService;
}

/**
 * Loads a language; falls back to the default language when
 * its dictionary cannot be loaded.
 */
async function loadLanguage(
  language: SupportedLanguage,
): Promise<LoadedLanguage> {
  const manager = new LanguageManager();
  const service = new LocalizationService();

  try {
    manager.setLanguage(language);
    await service.loadLanguage(language);
  } catch (error) {
    const fallback = manager.getDefaultLanguage();

    if (language === fallback) {
      throw error;
    }

    console.error(
      `Translations for "${language}" could not be loaded; using "${fallback}".`,
      error,
    );

    manager.setLanguage(fallback);
    await service.loadLanguage(fallback);
  }

  return {
    language: manager.getCurrentLanguage(),
    direction: manager.isRTL() ? "rtl" : "ltr",
    service,
  };
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [loaded, setLoaded] = useState<LoadedLanguage | null>(null);
  const [failed, setFailed] = useState(false);

  const setLanguage = useCallback(async (language: SupportedLanguage) => {
    const next = await loadLanguage(language);
    setLoaded(next);
  }, []);

  // Initial load of the default language
  useEffect(() => {
    let cancelled = false;

    loadLanguage(new LanguageManager().getDefaultLanguage())
      .then((next) => {
        if (!cancelled) {
          setLoaded(next);
        }
      })
      .catch((error: unknown) => {
        console.error("Translations could not be loaded.", error);

        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Language and direction of the document
  useEffect(() => {
    if (!loaded) {
      return;
    }

    document.documentElement.lang = loaded.language;
    document.documentElement.dir = loaded.direction;
  }, [loaded]);

  const value = useMemo<I18nContextValue | null>(() => {
    if (loaded) {
      const { service } = loaded;

      return {
        language: loaded.language,
        direction: loaded.direction,
        languages: new LanguageManager().getSupportedLanguages(),
        t: (key: string, params?: Record<string, string | number>) =>
          params
            ? service.translateWithParams(key, params)
            : service.translate(key),
        setLanguage,
      };
    }

    if (failed) {
      // No dictionary at all: keys are displayed, so the
      // interface stays usable and the problem is visible.
      const manager = new LanguageManager();

      return {
        language: manager.getCurrentLanguage(),
        direction: "ltr",
        languages: manager.getSupportedLanguages(),
        t: (key: string) => key,
        setLanguage,
      };
    }

    return null;
  }, [loaded, failed, setLanguage]);

  // Nothing is displayed until the first dictionary is loaded,
  // so that untranslated keys never flash on screen.
  if (!value) {
    return null;
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export default I18nProvider;
