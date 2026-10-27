/**
 * SlicyWeb
 * Printer Profile Cache
 *
 * Cache of the printer profiles downloaded from the SlicyWeb profile
 * repository (ADR-032, D5), in the user data folder:
 *
 *   cache/printers/profiles/   the profile files and index.json, as read
 *                              at the tag of the index
 *   cache/printers/cache.json  Cache Schema (DATA_SCHEMA.md): "cache"
 *                              with createdAt, expiresAt (next check due; the cache stays
 *                              usable offline), source, version (tag),
 *                              checksum (SHA-256 of index.json)
 *   cache/printers/sync.json   last check, RepositorySync Result Schema
 *
 * The cache is validated again before use (readValid): cache.json,
 * index.json (ProfileIndexSchema, same checksum and tag), each file of the
 * index present, 1 MB at most, same SHA-256, and no other profile file.
 * A cache that fails is not used (CACHE_001): the profiles of the
 * application are loaded instead. The profile files are then validated
 * by the Printer Database when they are loaded (PrinterSchema).
 *
 * Writing: the new profiles are written in a temporary folder, then the
 * folder replaces the old one; files are written to a temporary file,
 * then renamed. Main process only (Node.js file system). It implements
 * ProfileCacheStore, the only contract the logic of the synchronization
 * uses (ProfileSyncService). Storage Domain: depends only on the
 * validation schemas.
 *
 * Based on:
 * - DECISIONS.md (ADR-032, D5)
 * - DATA_SCHEMA.md (Cache Schema, RepositorySync Result Schema,
 *   Profile Repository Index Schema)
 * - SECURITY_SPEC.md (Cache Security)
 * - ERROR_CODES_SPEC.md (CACHE_001)
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  CacheFileSchema,
  ProfileIndexSchema,
  RepositorySyncResultSchema,
  type CacheMetadata,
  type RepositorySyncResult,
} from "../schemas/ProfileRepositorySchema";
import type {
  CachedProfileFile,
  ProfileCacheStore,
} from "../types/ProfileSync";

import { MAX_PROFILE_FILE_SIZE } from "./PrinterProfileStorage";

export interface ValidCache {
  /** Folder of the profile files, to load as Official */
  folder: string;
  tag: string;
  checksum: string;
}

/** Name of a profile file: no folder, no ".." */
const PROFILE_FILE_NAME = /^[A-Za-z0-9_-]+\.json$/;

function sha256(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

/** Writes a file through a temporary file */
function writeFileSafely(file: string, text: string): void {
  const temporary = `${file}.tmp`;

  try {
    fs.writeFileSync(temporary, text, "utf8");
    fs.renameSync(temporary, file);
  } catch (error) {
    fs.rmSync(temporary, { force: true });
    throw error;
  }
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
}

/**
 * Tag of index.json of a folder of profiles (the copy of the
 * application, data/printers/), or null when it is missing or invalid.
 */
export function readIndexTag(folder: string): string | null {
  try {
    return ProfileIndexSchema.parse(readJson(path.join(folder, "index.json")))
      .tag;
  } catch {
    return null;
  }
}

export class PrinterProfileCache implements ProfileCacheStore {
  private readonly profilesFolder: string;
  private readonly metadataFile: string;
  private readonly syncFile: string;

  public constructor(private readonly folder: string) {
    this.profilesFolder = path.join(folder, "profiles");
    this.metadataFile = path.join(folder, "cache.json");
    this.syncFile = path.join(folder, "sync.json");
  }

  /** True when a cache was written before (valid or not) */
  public exists(): boolean {
    return (
      fs.existsSync(this.metadataFile) || fs.existsSync(this.profilesFolder)
    );
  }

  /**
   * The cache when it is complete and unchanged; null otherwise.
   */
  public readValid(): ValidCache | null {
    try {
      const metadata = CacheFileSchema.parse(readJson(this.metadataFile)).cache;
      const indexText = fs.readFileSync(
        path.join(this.profilesFolder, "index.json"),
        "utf8",
      );

      if (sha256(indexText) !== metadata.checksum) {
        return null;
      }

      const index = ProfileIndexSchema.parse(JSON.parse(indexText) as unknown);
      if (index.tag !== metadata.version) {
        return null;
      }

      const listed = new Set(index.profiles.map(({ file }) => file));
      const others = fs
        .readdirSync(this.profilesFolder)
        .filter(
          (name) =>
            name.toLowerCase().endsWith(".json") &&
            name !== "index.json" &&
            !listed.has(name),
        );
      if (others.length > 0) {
        return null;
      }

      for (const entry of index.profiles) {
        const file = path.join(this.profilesFolder, entry.file);
        const stat = fs.lstatSync(file);

        if (
          !stat.isFile() ||
          stat.size > MAX_PROFILE_FILE_SIZE ||
          sha256(fs.readFileSync(file)) !== entry.sha256
        ) {
          return null;
        }
      }

      return {
        folder: this.profilesFolder,
        tag: index.tag,
        checksum: metadata.checksum,
      };
    } catch {
      return null;
    }
  }

  public readChecksum(): Promise<string | null> {
    return Promise.resolve(this.readValid()?.checksum ?? null);
  }

  /**
   * Replaces the cache with a download already validated; an error
   * rejects the promise.
   */
  public write(
    files: CachedProfileFile[],
    indexText: string,
    metadata: CacheMetadata,
  ): Promise<void> {
    return new Promise((resolve) => {
      this.writeNow(files, indexText, metadata);
      resolve();
    });
  }

  private writeNow(
    files: CachedProfileFile[],
    indexText: string,
    metadata: CacheMetadata,
  ): void {
    const temporary = `${this.profilesFolder}.tmp`;
    const old = `${this.profilesFolder}.old`;

    fs.mkdirSync(this.folder, { recursive: true });
    fs.rmSync(temporary, { recursive: true, force: true });
    fs.mkdirSync(temporary);

    try {
      for (const { fileName, text } of files) {
        if (!PROFILE_FILE_NAME.test(fileName) || fileName === "index.json") {
          throw new Error("Invalid profile file name");
        }
        fs.writeFileSync(path.join(temporary, fileName), text, "utf8");
      }
      fs.writeFileSync(path.join(temporary, "index.json"), indexText, "utf8");

      fs.rmSync(old, { recursive: true, force: true });
      if (fs.existsSync(this.profilesFolder)) {
        fs.renameSync(this.profilesFolder, old);
      }
      fs.renameSync(temporary, this.profilesFolder);
      fs.rmSync(old, { recursive: true, force: true });
    } catch (error) {
      fs.rmSync(temporary, { recursive: true, force: true });
      if (!fs.existsSync(this.profilesFolder) && fs.existsSync(old)) {
        fs.renameSync(old, this.profilesFolder);
      }
      throw error;
    }

    writeFileSafely(
      this.metadataFile,
      `${JSON.stringify(CacheFileSchema.parse({ cache: metadata }), null, 2)}\n`,
    );
  }

  public readLastCheck(): Promise<RepositorySyncResult | null> {
    try {
      return Promise.resolve(
        RepositorySyncResultSchema.parse(readJson(this.syncFile)),
      );
    } catch {
      return Promise.resolve(null);
    }
  }

  public writeLastCheck(result: RepositorySyncResult): Promise<void> {
    fs.mkdirSync(this.folder, { recursive: true });
    writeFileSafely(
      this.syncFile,
      `${JSON.stringify(RepositorySyncResultSchema.parse(result), null, 2)}\n`,
    );
    return Promise.resolve();
  }
}
