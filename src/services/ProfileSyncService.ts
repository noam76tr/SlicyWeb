/**
 * SlicyWeb
 * Profile Sync Service
 *
 * Synchronization of the Official printer profiles with the SlicyWeb
 * profile repository (ADR-032, D5; Phase 7 lot 62):
 * - check(): at most once every CHECK_INTERVAL_MS, unless forced
 *   (Printer > Refresh Profiles); downloads the profiles
 *   (PrinterRepositorySync), keeps them in the cache when index.json
 *   changed, then reloads the printers;
 * - a failed download or a cache not written changes nothing: the
 *   profiles in use are kept (offline use);
 * - each check is saved as the last check (RepositorySync Result
 *   Schema), success or failure;
 * - a cache lost or damaged after a successful check is rebuilt by the
 *   next check, without waiting a day;
 * - version rule: profiles of the repository older than the profiles of
 *   the application (tag vX.Y.Z, compareTags) are not kept, so that the
 *   list shipped with a new version of the application is never
 *   replaced by an older one.
 * status() gives the origin of the Official profiles in use (the
 * repository, through the cache, or the copy of the application), their
 * tag and the date of the last check.
 *
 * No dependency on Electron or Node.js (KI-024, option B): the cache is
 * a ProfileCacheStore (files in the user data folder for the desktop
 * application, IndexedDB for a future web version) and the reload is
 * given by the caller.
 *
 * Based on:
 * - DECISIONS.md (ADR-032, D5)
 * - DATA_SCHEMA.md (RepositorySync Result Schema, Cache Schema)
 * - SECURITY_SPEC.md (RepositorySync Security Rules)
 * - ERROR_CODES_SPEC.md (SYNC_001 to SYNC_004)
 */

import {
  PROFILE_REPOSITORY_URL,
  PrinterRepositorySync,
  sha256Hex,
} from "../repositories/PrinterRepositorySync";
import {
  PROFILE_REPOSITORY_NAME,
  compareTags,
} from "../schemas/ProfileRepositorySchema";
import type {
  LoadedProfiles,
  ProfileCacheStore,
  ProfilesStatus,
} from "../types/ProfileSync";

/** A check happens at most once a day, unless forced */
export const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type ProfileCheck =
  | { status: "skipped" | "upToDate" | "updated"; profiles: ProfilesStatus }
  | {
      status: "failed";
      profiles: ProfilesStatus;
      code: "SYNC_001" | "SYNC_002" | "SYNC_003" | "SYNC_004";
      reason: string;
    };

const ERROR_NAMES = {
  SYNC_001: "Repository Synchronization Failed",
  SYNC_002: "Remote Source Unavailable",
  SYNC_003: "Remote Source Timeout",
  SYNC_004: "Remote Data Validation Failed",
} as const;

/** Error of a failed check: "SYNC_00X Name" */
export function syncError(code: keyof typeof ERROR_NAMES): string {
  return `${code} ${ERROR_NAMES[code]}`;
}

export interface ProfileSyncOptions {
  /**
   * Tag of the profiles of the application (data/printers/index.json):
   * the repository is used only from this version on (the most recent
   * list wins).
   */
  applicationTag?: string | null;
  sync?: PrinterRepositorySync;
  now?: () => Date;
}

export class ProfileSyncService {
  private loaded: LoadedProfiles = { origin: "application", tag: null };
  private checkedAt: string | null = null;
  private running: Promise<ProfileCheck> | null = null;
  private readonly applicationTag: string | null;
  private readonly sync: PrinterRepositorySync;
  private readonly now: () => Date;

  public constructor(
    private readonly store: ProfileCacheStore,
    /**
     * Loads the printers again: from the cache when it is valid and not
     * older than the profiles of the application
     */
    private readonly reload: () => LoadedProfiles | Promise<LoadedProfiles>,
    options: ProfileSyncOptions = {},
  ) {
    this.applicationTag = options.applicationTag ?? null;
    this.sync = options.sync ?? new PrinterRepositorySync();
    this.now = options.now ?? (() => new Date());
  }

  /**
   * Loads the printers and reads the date of the last check. After a
   * successful check of a version that should be in use, profiles that
   * do not come from the repository mean a cache lost or damaged
   * (CACHE_001): the next check rebuilds it, even within
   * CHECK_INTERVAL_MS.
   */
  public async start(): Promise<ProfilesStatus> {
    this.loaded = await this.reload();
    const last = await this.store.readLastCheck();
    const cacheLost =
      last !== null &&
      last.success &&
      this.loaded.origin !== "repository" &&
      !this.olderThanApplication(last.version);
    this.checkedAt = last && !cacheLost ? last.synchronizedAt : null;
    return this.status();
  }

  /** True when a tag of the repository is older than the application */
  private olderThanApplication(tag: string): boolean {
    return (
      this.applicationTag !== null && compareTags(tag, this.applicationTag) < 0
    );
  }

  public status(): ProfilesStatus {
    return { ...this.loaded, checkedAt: this.checkedAt };
  }

  /**
   * Checks the repository; one check at a time.
   */
  public check(force: boolean): Promise<ProfileCheck> {
    this.running ??= this.run(force).finally(() => {
      this.running = null;
    });
    return this.running;
  }

  private async run(force: boolean): Promise<ProfileCheck> {
    const now = this.now();

    if (
      !force &&
      this.checkedAt !== null &&
      now.getTime() - Date.parse(this.checkedAt) < CHECK_INTERVAL_MS &&
      Date.parse(this.checkedAt) <= now.getTime()
    ) {
      return { status: "skipped", profiles: this.status() };
    }

    const download = await this.sync.download();

    if (!download.ok) {
      return this.failed(now, download.code, download.reason);
    }

    // The profiles of the application are more recent: kept, no cache
    if (this.olderThanApplication(download.index.tag)) {
      await this.saveCheck(now, download.index.tag, []);
      return { status: "upToDate", profiles: this.status() };
    }

    const checksum = await sha256Hex(
      new TextEncoder().encode(download.indexText),
    );

    try {
      if ((await this.store.readChecksum()) === checksum) {
        await this.saveCheck(now, download.index.tag, []);
        return { status: "upToDate", profiles: this.status() };
      }

      await this.store.write(download.profiles, download.indexText, {
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + CHECK_INTERVAL_MS).toISOString(),
        source: PROFILE_REPOSITORY_NAME,
        version: download.index.tag,
        checksum,
      });
    } catch (error) {
      return this.failed(
        now,
        "SYNC_001",
        error instanceof Error ? error.message : "Cache not written",
      );
    }

    this.loaded = await this.reload();
    await this.saveCheck(now, download.index.tag, []);

    return { status: "updated", profiles: this.status() };
  }

  private async failed(
    now: Date,
    code: "SYNC_001" | "SYNC_002" | "SYNC_003" | "SYNC_004",
    reason: string,
  ): Promise<ProfileCheck> {
    await this.saveCheck(now, this.loaded.tag ?? "", [
      `${syncError(code)}: ${reason}`,
    ]);
    return { status: "failed", profiles: this.status(), code, reason };
  }

  /** Saves the check as the last one; a save error is not fatal */
  private async saveCheck(
    now: Date,
    version: string,
    errors: string[],
  ): Promise<void> {
    this.checkedAt = now.toISOString();

    try {
      await this.store.writeLastCheck({
        success: errors.length === 0,
        source: PROFILE_REPOSITORY_NAME,
        repository: PROFILE_REPOSITORY_URL,
        version,
        data: {},
        errors,
        synchronizedAt: this.checkedAt,
      });
    } catch {
      // The next start checks again
    }
  }
}
