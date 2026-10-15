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
 * Language persistence (USER_SETTINGS_SPEC.md, General Settings):
 * - at start, the language saved in the user settings is read
 *   through SettingsIPC ("settings:get"); without a valid saved
 *   language, the default language of LanguageManager (English)
 *   is used;
 * - a language change is saved through SettingsIPC
 *   ("settings:language"), so that it is kept at the next start.
 * Outside Electron (no window.slicyWeb), nothing is saved.
 *
 * If a dictionary cannot be loaded, English is used instead.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Localization, Accessibility)
 * - USER_SETTINGS_SPEC.md (General Settings, Storage Location)
 * - API_SPEC.md (IPC API, SettingsIPC)
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
 * Settings bridge exposed by the preload script, absent outside
 * Electron (for example a page opened in a browser).
 */
function getSettingsBridge(): Window["slicyWeb"] | null {
  return typeof window.slicyWeb?.invoke === "function"
    ? window.slicyWeb
    : null;
}

/**
 * Reads the language saved in the user settings.
 * Returns null when there is none, or when it cannot be read.
 */
async function readSavedLanguage(): Promise<SupportedLanguage | null> {
  const bridge = getSettingsBridge();

  if (!bridge) {
    return null;
  }

  try {
    const response = (await bridge.invoke("settings:get")) as {
      success?: boolean;
      data?: { settings?: { language?: unknown } };
    };

    const language = response.data?.settings?.language;
    const manager = new LanguageManager();

    return response.success === true &&
      typeof language === "string" &&
      manager.isSupported(language)
      ? language
      : null;
  } catch (error) {
    console.error("Saved language could not be read.", error);
    return null;
  }
}

/**
 * Saves the language in the user settings
 */
async function saveLanguage(language: SupportedLanguage): Promise<void> {
  const bridge = getSettingsBridge();

  if (!bridge) {
    return;
  }

  try {
    const response = (await bridge.invoke("settings:language", {
      language,
    })) as { success?: boolean; errors?: unknown };

    if (response.success !== true) {
      console.error("Language could not be saved.", response.errors);
    }
  } catch (error) {
    console.error("Language could not be saved.", error);
  }
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

    // The language actually displayed is saved (English when the
    // requested dictionary could not be loaded).
    await saveLanguage(next.language);
  }, []);

  // Initial load: saved language, or the default language
  useEffect(() => {
    let cancelled = false;

    readSavedLanguage()
      .then((saved) =>
        loadLanguage(saved ?? new LanguageManager().getDefaultLanguage()),
      )
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
