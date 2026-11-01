/**
 * SlicyWeb
 * Material Repository Sync
 *
 * RepositorySync of the material profiles (DOMAINS_DEPENDENCY_MATRIX.md,
 * RepositorySync Domain; Phase 8 lot 72): the list of the materials of the
 * SlicyWeb profile repository noam76tr/slicyweb-profiles (ADR-033, D7),
 * read with ProfileRepositorySync with the rules of the printers:
 * materials/index.json on main (type material-index), profile files of the
 * materials/ folder at its tag, validated with MaterialProfileFileSchema
 * (source Official, id of the index).
 *
 * Replaces the model of Phase 0, which read the repository through
 * GitHubRepository and was never used (ADR-033, D11).
 *
 * No dependency on Electron or Node.js (KI-024, option B).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - MATERIAL_PROFILE_SPEC.md
 * - DECISIONS.md (ADR-033, D7, D11)
 * - DATA_SCHEMA.md (Profile Repository Index Schema, Repository Data
 *   Schema, Material Schema)
 * - SECURITY_SPEC.md (Material and Filament Profile Download)
 */

import {
  MaterialProfileFileSchema,
  type MaterialProfileFile,
} from "../schemas/MaterialSchema";
import { MaterialIndexSchema } from "../schemas/ProfileRepositorySchema";

import {
  ProfileRepositorySync,
  type ProfileRepositorySyncOptions,
} from "./ProfileRepositorySync";

export class MaterialRepositorySync extends ProfileRepositorySync<MaterialProfileFile> {
  public constructor(options: ProfileRepositorySyncOptions = {}) {
    super(
      {
        folder: "materials/",
        indexSchema: MaterialIndexSchema,
        fileSchema: MaterialProfileFileSchema,
      },
      options,
    );
  }
}
