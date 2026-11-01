/**
 * SlicyWeb
 * Profile Repository Sync
 *
 * Download of one list of profiles of the SlicyWeb profile repository
 * noam76tr/slicyweb-profiles (ADR-032, D5; ADR-033, D7): the printers
 * (index.json at the root), the materials (materials/index.json) or the
 * filaments (filaments/index.json). PrinterRepositorySync,
 * MaterialRepositorySync and FilamentRepositorySync give the list:
 * 1. the index.json of the list is read on the default branch (main): it
 *    gives the tag of the published profiles and the SHA-256 of each
 *    file (Profile Repository Index Schema, type of the list);
 * 2. each profile file is read at that tag, in the folder of the list,
 *    checked with its SHA-256, then validated (Repository Data Schema
 *    envelope, schema of the list, source Official, id of the index).
 *
 * All or nothing: when one file fails, the whole download of the list is
 * refused and nothing is returned, so the list in use is kept.
 *
 * Rules (SECURITY_SPEC.md, Printer Profile Download, Material and
 * Filament Profile Download):
 * - only HTTPS addresses under PROFILE_REPOSITORY_URL; redirections are
 *   refused;
 * - each request stops after timeoutMs (SYNC_003);
 * - index.json and each profile: maxFileSize at most (1 MB), and
 *   maxDownloadSize (20 MB) for the whole download of the list;
 * - no authentication, no token.
 *
 * Errors: SYNC_002 Remote Source Unavailable (network, HTTP status;
 * notPublished when the answer is HTTP 404: index.json or the tag does
 * not exist yet, the repository itself is reachable),
 * SYNC_003 Remote Source Timeout, SYNC_004 Remote Data Validation Failed
 * (schema, size, SHA-256). The reason names a file of the repository,
 * never a local path.
 *
 * No dependency on Electron or Node.js (KI-024, option B): it uses fetch,
 * Web Crypto and TextDecoder, available in Node.js and in browsers, so a
 * web version can reuse it. It never writes: the cache is kept by the
 * caller (ProfileSyncService, ProfileCacheStore).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DECISIONS.md (ADR-032, D5; ADR-033, D7)
 * - DATA_SCHEMA.md (Profile Repository Index Schema, Repository Data
 *   Schema)
 * - SECURITY_SPEC.md (RepositorySync Security Rules, Printer Profile
 *   Download)
 * - ERROR_CODES_SPEC.md (SYNC_002, SYNC_003, SYNC_004)
 */

import type { z } from "zod";

import {
  MAX_DOWNLOAD_SIZE,
  type ProfileIndex,
  type ProfileIndexParser,
} from "../schemas/ProfileRepositorySchema";

/** The only address the profiles are read from */
export const PROFILE_REPOSITORY_URL =
  "https://raw.githubusercontent.com/noam76tr/slicyweb-profiles/";

/** Branch where index.json is read */
export const PROFILE_INDEX_BRANCH = "main";

/** A profile is a few kilobytes; larger files are refused */
export const MAX_REMOTE_FILE_SIZE = 1024 * 1024;

export const DEFAULT_TIMEOUT_MS = 15_000;

export type ProfileSyncErrorCode = "SYNC_002" | "SYNC_003" | "SYNC_004";

/** A profile file downloaded and validated */
export interface DownloadedProfile<P = unknown> {
  fileName: string;
  /** Exact text of the file, as checked with its SHA-256 */
  text: string;
  profile: P;
}

export type ProfileDownload<P = unknown> =
  | {
      ok: true;
      index: ProfileIndex;
      /** Exact text of index.json */
      indexText: string;
      profiles: DownloadedProfile<P>[];
    }
  | {
      ok: false;
      code: ProfileSyncErrorCode;
      reason: string;
      /**
       * True when the repository answered "not found" (HTTP 404) for
       * index.json or a profile at the tag: no version is published yet
       * (or the tag is not created yet). The repository is reachable.
       */
      notPublished?: boolean;
    };

/** A profile file of the repository: its id and its source */
interface ProfileFile {
  id: string;
  source: string;
}

/** One list of profiles of the repository */
export interface ProfileList<P extends ProfileFile> {
  /** Folder of the list in the repository: "" (root) or "materials/" */
  folder: "" | "materials/" | "filaments/";
  /** Schema of its index.json */
  indexSchema: ProfileIndexParser;
  /** Schema of a profile file (Repository Data Schema envelope) */
  fileSchema: z.ZodType<P, z.ZodTypeDef, unknown>;
}

export interface ProfileRepositorySyncOptions {
  fetch?: typeof fetch;
  timeoutMs?: number;
  maxFileSize?: number;
  /** Most bytes of index.json and all the profiles together */
  maxDownloadSize?: number;
}

class SyncError extends Error {
  public constructor(
    public readonly code: ProfileSyncErrorCode,
    reason: string,
    public readonly notPublished = false,
  ) {
    super(reason);
  }
}

/** SHA-256 of bytes, as 64 lowercase hexadecimal characters */
export async function sha256Hex(
  bytes: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export class ProfileRepositorySync<P extends ProfileFile> {
  private readonly fetch: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxFileSize: number;
  private readonly maxDownloadSize: number;
  /** Bytes read by the current download */
  private downloaded = 0;

  public constructor(
    private readonly list: ProfileList<P>,
    options: ProfileRepositorySyncOptions = {},
  ) {
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxFileSize = options.maxFileSize ?? MAX_REMOTE_FILE_SIZE;
    this.maxDownloadSize = options.maxDownloadSize ?? MAX_DOWNLOAD_SIZE;
  }

  /**
   * Downloads the index, then every profile at the tag of the index.
   */
  public async download(): Promise<ProfileDownload<P>> {
    this.downloaded = 0;
    const { folder, indexSchema, fileSchema } = this.list;
    const indexName = `${folder}index.json`;

    try {
      const indexBytes = await this.read(
        `${PROFILE_INDEX_BRANCH}/${indexName}`,
      );
      const indexText = decode(indexBytes, indexName);
      const index = parseIndex(indexText, indexName, indexSchema);

      const profiles: DownloadedProfile<P>[] = [];

      for (const entry of index.profiles) {
        const name = `${folder}${entry.file}`;
        const bytes = await this.read(`${index.tag}/${name}`);

        if ((await sha256Hex(bytes)) !== entry.sha256) {
          throw new SyncError("SYNC_004", `${name}: SHA-256 differs`);
        }

        const text = decode(bytes, name);
        const result = fileSchema.safeParse(parseJson(text, name));

        if (!result.success) {
          const issue = result.error.issues[0];
          throw new SyncError(
            "SYNC_004",
            `${name}: ${issue?.path.join(".") || "profile"}: ${issue?.message ?? "invalid"}`,
          );
        }

        if (result.data.source !== "Official" || result.data.id !== entry.id) {
          throw new SyncError(
            "SYNC_004",
            `${name}: not the Official profile ${entry.id}`,
          );
        }

        profiles.push({ fileName: entry.file, text, profile: result.data });
      }

      return { ok: true, index, indexText, profiles };
    } catch (error) {
      if (error instanceof SyncError) {
        return error.notPublished
          ? {
              ok: false,
              code: error.code,
              reason: error.message,
              notPublished: true,
            }
          : { ok: false, code: error.code, reason: error.message };
      }

      return {
        ok: false,
        code: "SYNC_002",
        reason: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Reads one file of the repository: HTTPS, allowed address, no
   * redirection, size and time limits.
   */
  private async read(path: string): Promise<Uint8Array<ArrayBuffer>> {
    const url = new URL(path, PROFILE_REPOSITORY_URL);

    if (
      url.protocol !== "https:" ||
      !url.href.startsWith(PROFILE_REPOSITORY_URL)
    ) {
      throw new SyncError("SYNC_004", `${path}: address not allowed`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      let response: Response;

      try {
        response = await this.fetch(url.href, {
          redirect: "error",
          signal: controller.signal,
          credentials: "omit",
          cache: "no-store",
        });
      } catch (error) {
        throw controller.signal.aborted
          ? new SyncError("SYNC_003", `${path}: no answer`)
          : new SyncError(
              "SYNC_002",
              `${path}: ${error instanceof Error ? error.message : "not reachable"}`,
            );
      }

      if (!response.ok) {
        throw new SyncError(
          "SYNC_002",
          `${path}: HTTP ${response.status}`,
          response.status === 404,
        );
      }

      const length = Number(response.headers.get("content-length"));
      if (Number.isFinite(length) && length > this.maxFileSize) {
        throw new SyncError("SYNC_004", `${path}: file too large`);
      }
      if (
        Number.isFinite(length) &&
        this.downloaded + length > this.maxDownloadSize
      ) {
        throw new SyncError("SYNC_004", `${path}: download too large`);
      }

      let bytes: Uint8Array<ArrayBuffer>;
      try {
        bytes = new Uint8Array(await response.arrayBuffer());
      } catch {
        throw controller.signal.aborted
          ? new SyncError("SYNC_003", `${path}: no answer`)
          : new SyncError("SYNC_002", `${path}: not read`);
      }

      if (bytes.byteLength > this.maxFileSize) {
        throw new SyncError("SYNC_004", `${path}: file too large`);
      }

      this.downloaded += bytes.byteLength;
      if (this.downloaded > this.maxDownloadSize) {
        throw new SyncError("SYNC_004", `${path}: download too large`);
      }

      return bytes;
    } finally {
      clearTimeout(timer);
    }
  }
}

function decode(bytes: Uint8Array, file: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new SyncError("SYNC_004", `${file}: not UTF-8 text`);
  }
}

function parseJson(text: string, file: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new SyncError("SYNC_004", `${file}: invalid JSON`);
  }
}

/** Validates the text of an index.json with the schema of its list */
function parseIndex(
  text: string,
  name: string,
  schema: ProfileIndexParser,
): ProfileIndex {
  const result = schema.safeParse(parseJson(text, name));

  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.join(".") || "index";
    throw new SyncError(
      "SYNC_004",
      `${name}: ${where}: ${issue?.message ?? "invalid"}`,
    );
  }

  return result.data;
}
