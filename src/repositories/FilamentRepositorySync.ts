/**
 * SlicyWeb
 * Filament Repository Sync
 *
 * RepositorySync of the filament profiles (DOMAINS_DEPENDENCY_MATRIX.md,
 * RepositorySync Domain; Phase 8 lot 72): the list of the filaments of the
 * SlicyWeb profile repository noam76tr/slicyweb-profiles (ADR-033, D7),
 * read with ProfileRepositorySync with the rules of the printers:
 * filaments/index.json on main (type filament-index), profile files of the
 * filaments/ folder at its tag, validated with FilamentProfileFileSchema
 * (source Official, id of the index).
 *
 * Replaces the model of Phase 0, which read the repository through
 * GitHubRepository and was never used (ADR-033, D11).
 *
 * No dependency on Electron or Node.js (KI-024, option B).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - FILAMENT_SETTINGS_SPEC.md
 * - DECISIONS.md (ADR-033, D7, D11)
 * - DATA_SCHEMA.md (Profile Repository Index Schema, Repository Data
 *   Schema, Filament Schema)
 * - SECURITY_SPEC.md (Material and Filament Profile Download)
 */

import {
  FilamentProfileFileSchema,
  type FilamentProfileFile,
} from "../schemas/FilamentSchema";
import { FilamentIndexSchema } from "../schemas/ProfileRepositorySchema";

import {
  ProfileRepositorySync,
  type ProfileRepositorySyncOptions,
} from "./ProfileRepositorySync";

export class FilamentRepositorySync extends ProfileRepositorySync<FilamentProfileFile> {
  public constructor(options: ProfileRepositorySyncOptions = {}) {
    super(
      {
        folder: "filaments/",
        indexSchema: FilamentIndexSchema,
        fileSchema: FilamentProfileFileSchema,
      },
      options,
    );
  }
}
