/**
 * SlicyWeb
 * Printer Repository Sync
 *
 * RepositorySync of the printer profiles (DOMAINS_DEPENDENCY_MATRIX.md,
 * RepositorySync Domain): the list of the printers of the SlicyWeb
 * profile repository noam76tr/slicyweb-profiles (ADR-032, D5), read with
 * ProfileRepositorySync: index.json at the root of the repository (type
 * printer-index), profile files validated with PrinterProfileFileSchema.
 *
 * No dependency on Electron or Node.js (KI-024, option B).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PRINTER_PROFILE_SPEC.md
 * - DECISIONS.md (ADR-032, D5)
 * - DATA_SCHEMA.md (Profile Repository Index Schema, Repository Data
 *   Schema, Printer Schema)
 * - SECURITY_SPEC.md (Printer Profile Download)
 */

import {
  PrinterProfileFileSchema,
  type PrinterProfileFile,
} from "../schemas/PrinterSchema";
import { ProfileIndexSchema } from "../schemas/ProfileRepositorySchema";

import {
  ProfileRepositorySync,
  type DownloadedProfile as BaseDownloadedProfile,
  type ProfileDownload as BaseProfileDownload,
  type ProfileRepositorySyncOptions,
} from "./ProfileRepositorySync";

export {
  DEFAULT_TIMEOUT_MS,
  MAX_REMOTE_FILE_SIZE,
  PROFILE_INDEX_BRANCH,
  PROFILE_REPOSITORY_URL,
  sha256Hex,
  type ProfileSyncErrorCode,
} from "./ProfileRepositorySync";

/** A printer profile file downloaded and validated */
export type DownloadedProfile = BaseDownloadedProfile<PrinterProfileFile>;

/** Download of the list of the printers */
export type ProfileDownload = BaseProfileDownload<PrinterProfileFile>;

export type PrinterRepositorySyncOptions = ProfileRepositorySyncOptions;

export class PrinterRepositorySync extends ProfileRepositorySync<PrinterProfileFile> {
  public constructor(options: PrinterRepositorySyncOptions = {}) {
    super(
      {
        folder: "",
        indexSchema: ProfileIndexSchema,
        fileSchema: PrinterProfileFileSchema,
      },
      options,
    );
  }
}
