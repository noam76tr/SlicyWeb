/**
 * SlicyWeb
 * Profile Sync Tests
 *
 * Synchronization of the Official printer profiles (ADR-032, D5; Phase 7
 * lot 62):
 * - ProfileSyncService: at most one check a day unless forced; an
 *   unchanged index.json keeps the cache; a new one is written, then the
 *   printers are reloaded; a failed download or a cache not written keeps
 *   the profiles in use; each check is saved;
 * - PrinterProfileCache: a cache written is used again only when it is
 *   complete and unchanged (CACHE_001 otherwise).
 *
 * Based on:
 * - DATA_SCHEMA.md (Cache Schema, RepositorySync Result Schema)
 * - SECURITY_SPEC.md (Printer Profile Download)
 * - ERROR_CODES_SPEC.md (SYNC_001, SYNC_002, CACHE_001)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PrinterRepositorySync,
  sha256Hex,
  type ProfileDownload,
} from "../../../src/repositories/PrinterRepositorySync";
import type { CacheMetadata } from "../../../src/schemas/ProfileRepositorySchema";
import {
  CHECK_INTERVAL_MS,
  ProfileSyncService,
} from "../../../src/services/ProfileSyncService";
import {
  PrinterProfileCache,
  readIndexTag,
} from "../../../src/storage/PrinterProfileCache";
import type { LoadedProfiles } from "../../../src/types/ProfileSync";

const FOLDER = path.resolve(__dirname, "../../../data/printers");
const START = new Date("2026-10-27T08:00:00.000Z");

/** A download of the profiles of data/printers/ */
function download(): Extract<ProfileDownload, { ok: true }> {
  const indexText = fs.readFileSync(path.join(FOLDER, "index.json"), "utf8");
  const index = JSON.parse(indexText) as {
    tag: string;
    profiles: { file: string }[];
  };

  return {
    ok: true,
    index: index as never,
    indexText,
    profiles: index.profiles.map(({ file }) => {
      const text = fs.readFileSync(path.join(FOLDER, file), "utf8");
      return { fileName: file, text, profile: JSON.parse(text) as never };
    }),
  };
}

function fakeSync(...results: ProfileDownload[]) {
  const sync = new PrinterRepositorySync();
  const spy = vi.spyOn(sync, "download");
  for (const result of results) spy.mockResolvedValueOnce(result);
  return { sync, spy };
}

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-profile-sync-"));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("Profile sync service", () => {
  function setup(...results: ProfileDownload[]) {
    const cache = new PrinterProfileCache(path.join(root, "cache"));
    const reload = vi.fn((): LoadedProfiles => {
      const valid = cache.readValid();
      return valid
        ? { origin: "repository", tag: valid.tag }
        : { origin: "application", tag: "v1.0.0" };
    });
    let now = START;
    const { sync, spy } = fakeSync(...results);
    const service = new ProfileSyncService(cache, reload, {
      applicationTag: "v1.0.0",
      sync,
      now: () => now,
    });

    return {
      cache,
      reload,
      spy,
      service,
      later: (ms: number) => {
        now = new Date(now.getTime() + ms);
      },
    };
  }

  it("writes a new index.json, then reloads the printers", async () => {
    const { cache, reload, service } = setup(download());

    expect(await service.start()).toEqual({
      origin: "application",
      tag: "v1.0.0",
      checkedAt: null,
    });
    const result = await service.check(false);

    expect(result).toEqual({
      status: "updated",
      profiles: {
        origin: "repository",
        tag: "v1.0.1",
        checkedAt: START.toISOString(),
      },
    });
    expect(reload).toHaveBeenCalledTimes(2);
    expect(cache.readValid()?.tag).toBe("v1.0.1");
    expect(await cache.readLastCheck()).toMatchObject({
      success: true,
      version: "v1.0.1",
      errors: [],
      synchronizedAt: START.toISOString(),
    });
  });

  it("checks at most once a day, unless forced", async () => {
    const { service, spy, later } = setup(download(), download());
    await service.start();
    await service.check(false);

    later(CHECK_INTERVAL_MS - 1);
    expect((await service.check(false)).status).toBe("skipped");
    expect(spy).toHaveBeenCalledTimes(1);

    expect((await service.check(true)).status).toBe("upToDate");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("checks again after a day, also after a restart", async () => {
    const first = setup(download());
    await first.service.start();
    await first.service.check(false);

    const second = setup(download());
    await second.service.start();
    expect((await second.service.check(false)).status).toBe("skipped");
    second.later(CHECK_INTERVAL_MS);
    expect((await second.service.check(false)).status).toBe("upToDate");
  });

  it("rebuilds a damaged cache without waiting a day", async () => {
    const first = setup(download());
    await first.service.start();
    await first.service.check(false);
    fs.appendFileSync(
      path.join(root, "cache", "profiles", "bambu_a1.json"),
      " ",
    );

    const second = setup(download());
    expect((await second.service.start()).origin).toBe("application");
    expect((await second.service.check(false)).status).toBe("updated");
    expect(second.cache.readValid()?.tag).toBe("v1.0.1");
  });

  it("never keeps profiles older than those of the application", async () => {
    const older = download();
    older.index = { ...older.index, tag: "v0.9.0" };
    const { cache, reload, service } = setup(older);
    await service.start();

    expect((await service.check(true)).status).toBe("upToDate");
    expect(cache.exists()).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);

    // No check again at the next start: the cache is not lost
    const next = setup(download());
    await next.service.start();
    expect((await next.service.check(false)).status).toBe("skipped");
  });

  it("keeps the profiles in use when the download fails", async () => {
    const { cache, reload, service } = setup({
      ok: false,
      code: "SYNC_002",
      reason: "main/index.json: HTTP 404",
    });
    await service.start();

    expect(await service.check(false)).toEqual({
      status: "failed",
      code: "SYNC_002",
      reason: "main/index.json: HTTP 404",
      profiles: {
        origin: "application",
        tag: "v1.0.0",
        checkedAt: START.toISOString(),
      },
    });
    expect(reload).toHaveBeenCalledTimes(1);
    expect(cache.exists()).toBe(false);
    expect(await cache.readLastCheck()).toMatchObject({
      success: false,
      errors: ["SYNC_002 Remote Source Unavailable: main/index.json: HTTP 404"],
    });
  });

  it("reports a repository without a published version", async () => {
    const { cache, service } = setup({
      ok: false,
      code: "SYNC_002",
      reason: "main/index.json: HTTP 404",
      notPublished: true,
    });
    await service.start();

    expect(await service.check(true)).toEqual({
      status: "notPublished",
      profiles: {
        origin: "application",
        tag: "v1.0.0",
        checkedAt: START.toISOString(),
      },
    });
    expect(cache.exists()).toBe(false);
  });

  it("reports SYNC_001 when the cache cannot be written", async () => {
    const { cache, reload, service } = setup(download());
    vi.spyOn(cache, "write").mockRejectedValue(new Error("EACCES"));
    await service.start();

    expect(await service.check(true)).toMatchObject({
      status: "failed",
      code: "SYNC_001",
      reason: "EACCES",
    });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("runs one check at a time", async () => {
    const { service, spy } = setup(download());
    await service.start();

    const [first, second] = await Promise.all([
      service.check(true),
      service.check(true),
    ]);

    expect(first).toBe(second);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("Printer profile cache", () => {
  async function written(): Promise<PrinterProfileCache> {
    const cache = new PrinterProfileCache(path.join(root, "cache"));
    const { profiles, indexText } = download();
    const metadata: CacheMetadata = {
      createdAt: START.toISOString(),
      expiresAt: new Date(START.getTime() + CHECK_INTERVAL_MS).toISOString(),
      source: "noam76tr/slicyweb-profiles",
      version: "v1.0.1",
      checksum: await sha256Hex(new TextEncoder().encode(indexText)),
    };
    await cache.write(profiles, indexText, metadata);
    return cache;
  }

  it("uses a complete and unchanged cache", async () => {
    const cache = await written();
    const valid = cache.readValid();

    expect(valid?.tag).toBe("v1.0.1");
    expect(fs.readdirSync(valid?.folder ?? "")).toHaveLength(58);
    expect(await cache.readChecksum()).toBe(valid?.checksum);
  });

  it("refuses a changed, missing or extra profile file", async () => {
    const cache = await written();
    const folder = path.join(root, "cache", "profiles");

    fs.appendFileSync(path.join(folder, "bambu_a1.json"), " ");
    expect(cache.readValid()).toBeNull();

    fs.rmSync(path.join(folder, "bambu_a1.json"));
    expect(cache.readValid()).toBeNull();

    const other = await written();
    fs.writeFileSync(path.join(folder, "extra.json"), "{}");
    expect(other.readValid()).toBeNull();
    expect(other.exists()).toBe(true);
  });

  it("refuses a file name with a folder", async () => {
    const cache = new PrinterProfileCache(path.join(root, "cache"));

    await expect(
      cache.write([{ fileName: "../a.json", text: "{}" }], "{}", {
        createdAt: START.toISOString(),
        expiresAt: START.toISOString(),
        source: "noam76tr/slicyweb-profiles",
        version: "v1",
        checksum: "0".repeat(64),
      }),
    ).rejects.toThrow("Invalid profile file name");
    expect(fs.existsSync(path.join(root, "a.json"))).toBe(false);
    expect(cache.readValid()).toBeNull();
  });

  it("reads the tag of the profiles of the application", () => {
    expect(readIndexTag(FOLDER)).toBe("v1.0.1");
    expect(readIndexTag(root)).toBeNull();
  });
});
