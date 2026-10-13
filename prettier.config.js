/**
 * SlicyWeb
 * Prettier Configuration
 *
 * CommonJS syntax: package.json has no "type": "module" (ADR-025).
 *
 * endOfLine "auto" keeps the line ending of each file.
 * Git for Windows may convert LF to CRLF on checkout (core.autocrlf);
 * a fixed "lf" would then report every file.
 *
 * Based on:
 * - TECH_STACK.md (Formatting)
 */

module.exports = {
  endOfLine: "auto",
};
