/**
 * SlicyWeb
 * ESLint Configuration (flat config)
 *
 * CommonJS syntax: package.json has no "type": "module",
 * so that the Electron main process is built as CommonJS (ADR-025).
 *
 * Based on:
 * - TECH_STACK.md (Code Quality, Linting Rules)
 * - DECISIONS.md (ADR-025)
 */

const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = [
  {
    ignores: ["dist/", "node_modules/", "src-electron/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
