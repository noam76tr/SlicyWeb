/**
 * SlicyWeb
 * Printer Repository Sync
 *
 * RepositorySync of the printer profiles (DOMAINS_DEPENDENCY_MATRIX.md,
 * RepositorySync Domain): downloads and validates the printer profiles
 * of the SlicyWeb profile repository noam76tr/slicyweb-profiles
 * (ADR-032, D5):
 * 1. index.json is read on the default branch (main): it gives the tag
 *    of the published profiles and the SHA-256 of each file
 *    (ProfileIndexSchema);
 * 2. each profile file is read at that tag, checked with its SHA-256,
 *    then validated (Repository Data Schema envelope, PrinterSchema,
 *    source Official, id of the index).
 *
 * All or nothing: when one file fails, the whole download is refused and
 * nothing is returned, so the list in use is kept.
 *
 * Rules (SECURITY_SPEC.md, Printer Profile Download):
 * - only HTTPS addresses under PROFILE_REPOSITORY_URL; redirections are
 *   refused;
 * - each request stops after timeoutMs (SYNC_003);
 * - index.json and each profile: maxFileSize at most (1 MB), and
 *   maxDownloadSize (20 MB) for the whole download;
 * - no authentication, no token.
 *
 * Errors: SYNC_002 Remote Source Unavailable (network, HTTP status),
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
 * - PRINTER_PROFILE_SPEC.md
 * - DECISIONS.md (ADR-032, D5)
 * - DATA_SCHEMA.md (Profile Repository Index Schema, Repository Data
 *   Schema, Printer Schema)
 * - SECURITY_SPEC.md (RepositorySync Security Rules, Printer Profile
 *   Download)
 * - ERROR_CODES_SPEC.md (SYNC_002, SYNC_003, SYNC_004)
 */

import {
  PrinterProfileFileSchema,
  type PrinterProfileFile,
} from "../schemas/PrinterSchema";
import {
  MAX_DOWNLOAD_SIZE,
  ProfileIndexSchema,
  type ProfileIndex,
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
export interface DownloadedProfile {
  fileName: string;
  /** Exact text of the file, as checked with its SHA-256 */
  text: string;
  profile: PrinterProfileFile;
}

export type ProfileDownload =
  | {
      ok: true;
      index: ProfileIndex;
      /** Exact text of index.json */
      indexText: string;
      profiles: DownloadedProfile[];
    }
  | { ok: false; code: ProfileSyncErrorCode; reason: string };

export interface PrinterRepositorySyncOptions {
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

export class PrinterRepositorySync {
  private readonly fetch: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxFileSize: number;
  private readonly maxDownloadSize: number;
  /** Bytes read by the current download */
  private downloaded = 0;

  public constructor(options: PrinterRepositorySyncOptions = {}) {
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxFileSize = options.maxFileSize ?? MAX_REMOTE_FILE_SIZE;
    this.maxDownloadSize = options.maxDownloadSize ?? MAX_DOWNLOAD_SIZE;
  }

  /**
   * Downloads the index, then every profile at the tag of the index.
   */
  public async download(): Promise<ProfileDownload> {
    this.downloaded = 0;

    try {
      const indexBytes = await this.read(`${PROFILE_INDEX_BRANCH}/index.json`);
      const indexText = decode(indexBytes, "index.json");
      const index = parseIndex(indexText);

      const profiles: DownloadedProfile[] = [];

      for (const entry of index.profiles) {
        const bytes = await this.read(`${index.tag}/${entry.file}`);

        if ((await sha256Hex(bytes)) !== entry.sha256) {
          throw new SyncError("SYNC_004", `${entry.file}: SHA-256 differs`);
        }

        const text = decode(bytes, entry.file);
        const result = PrinterProfileFileSchema.safeParse(
          parseJson(text, entry.file),
        );

        if (!result.success) {
          const issue = result.error.issues[0];
          throw new SyncError(
            "SYNC_004",
            `${entry.file}: ${issue?.path.join(".") || "profile"}: ${issue?.message ?? "invalid"}`,
          );
        }

        if (result.data.source !== "Official" || result.data.id !== entry.id) {
          throw new SyncError(
            "SYNC_004",
            `${entry.file}: not the Official profile ${entry.id}`,
          );
        }

        profiles.push({ fileName: entry.file, text, profile: result.data });
      }

      return { ok: true, index, indexText, profiles };
    } catch (error) {
      if (error instanceof SyncError) {
        return { ok: false, code: error.code, reason: error.message };
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
        throw new SyncError("SYNC_002", `${path}: HTTP ${response.status}`);
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

/** Validates the text of index.json (ProfileIndexSchema) */
function parseIndex(text: string): ProfileIndex {
  const result = ProfileIndexSchema.safeParse(parseJson(text, "index.json"));

  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.join(".") || "index";
    throw new SyncError(
      "SYNC_004",
      `index.json: ${where}: ${issue?.message ?? "invalid"}`,
    );
  }

  return result.data;
}
