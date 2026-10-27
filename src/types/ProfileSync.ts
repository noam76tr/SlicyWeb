/**
 * SlicyWeb
 * Profile Sync Type Definitions
 *
 * Types of the synchronization of the Official printer profiles with the
 * SlicyWeb profile repository (ADR-032, D5; Phase 7 lot 62).
 *
 * ProfileCacheStore is the cache of the downloaded profiles. It depends
 * on the platform: files in the user data folder for the desktop
 * application (PrinterProfileCache), IndexedDB for a future web version
 * (KI-024, option B). The logic of the download and of the check uses
 * only this contract.
 *
 * Based on:
 * - DECISIONS.md (ADR-032, D5)
 * - DATA_SCHEMA.md (Cache Schema, RepositorySync Result Schema)
 */

import type {
  CacheMetadata,
  RepositorySyncResult,
} from "../schemas/ProfileRepositorySchema";

/** Where the Official profiles in use come from */
export type ProfilesOrigin = "repository" | "application";

export interface LoadedProfiles {
  origin: ProfilesOrigin;
  /** Tag of the profiles in use, null when unknown */
  tag: string | null;
}

export interface ProfilesStatus extends LoadedProfiles {
  /** Date of the last check (ISO 8601), null before the first one */
  checkedAt: string | null;
}

/** A profile file to keep in the cache: name and exact text */
export interface CachedProfileFile {
  fileName: string;
  text: string;
}

export interface ProfileCacheStore {
  /** Checksum of the valid cache (SHA-256 of index.json), or null */
  readChecksum(): Promise<string | null>;
  /** Replaces the cache; throws when it cannot be written */
  write(
    files: CachedProfileFile[],
    indexText: string,
    metadata: CacheMetadata,
  ): Promise<void>;
  readLastCheck(): Promise<RepositorySyncResult | null>;
  writeLastCheck(result: RepositorySyncResult): Promise<void>;
}
