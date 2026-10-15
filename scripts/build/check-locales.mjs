/**
 * SlicyWeb
 * Locale Key Check
 *
 * Checks that the translation dictionaries of public/locales/
 * contain exactly the same keys as en.json (reference), and that
 * every value is a non-empty string.
 *
 * Usage (any platform, including Windows PowerShell):
 *   npm run check:locales
 *
 * Exit code 0 when all dictionaries match, 1 otherwise.
 *
 * Based on:
 * - GUI_SPEC.md (Localization)
 * - CLAUDE.md (Internationalization Rule)
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REFERENCE = "en";
const LANGUAGES = ["en", "fr", "he"];

const localesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "public",
  "locales",
);

function load(language) {
  const file = join(localesDir, `${language}.json`);

  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`${language}.json: cannot be read (${error.message})`);
    return null;
  }
}

let errors = 0;

const dictionaries = Object.fromEntries(
  LANGUAGES.map((language) => [language, load(language)]),
);

const reference = dictionaries[REFERENCE];

if (!reference) {
  process.exit(1);
}

const referenceKeys = new Set(Object.keys(reference));

for (const language of LANGUAGES) {
  const dictionary = dictionaries[language];

  if (!dictionary) {
    errors += 1;
    continue;
  }

  const keys = new Set(Object.keys(dictionary));

  for (const key of referenceKeys) {
    if (!keys.has(key)) {
      console.error(`${language}.json: missing key "${key}"`);
      errors += 1;
    }
  }

  for (const key of keys) {
    if (!referenceKeys.has(key)) {
      console.error(`${language}.json: key not in ${REFERENCE}.json "${key}"`);
      errors += 1;
    }

    const value = dictionary[key];

    if (typeof value !== "string" || value.trim() === "") {
      console.error(`${language}.json: empty or invalid value for "${key}"`);
      errors += 1;
    }
  }
}

if (errors > 0) {
  console.error(`Locale check failed: ${errors} error(s).`);
  process.exit(1);
}

console.log(
  `Locale check passed: ${LANGUAGES.join(", ")} share ${referenceKeys.size} keys.`,
);
