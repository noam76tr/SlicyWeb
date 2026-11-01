/**
 * SlicyWeb
 * Material and Filament Repository Sync Tests
 *
 * Download of the materials and the filaments of the SlicyWeb profile
 * repository (ADR-033, D7; Phase 8 lot 72), with a fake network serving
 * the profiles of data/materials/ and data/filaments/ and their
 * index.json, with the rules of the printers:
 * - materials/index.json and filaments/index.json read on main, the
 *   profiles at the tag of the index, in the folder of the list;
 * - the index of another list (printer-index) or a profile of another
 *   type is refused (SYNC_004), all or nothing;
 * - HTTP 404 for an index not published yet: SYNC_002 with notPublished;
 * - the downloaded list is kept in its own cache (PrinterProfileCache
 *   with the schema of its index), which is valid again at the next
 *   start; the cache of another list is not valid.
 *
 * Based on:
 * - DATA_SCHEMA.md (Profile Repository Index Schema)
 * - DECISIONS.md (ADR-033, D7)
 * - SECURITY_SPEC.md (Material and Filament Profile Download)
 * - ERROR_CODES_SPEC.md (SYNC_002, SYNC_004)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FilamentRepositorySync } from "../../../src/repositories/FilamentRepositorySync";
import { MaterialRepositorySync } from "../../../src/repositories/MaterialRepositorySync";
import { PROFILE_REPOSITORY_URL } from "../../../src/repositories/ProfileRepositorySync";
import {
  FilamentIndexSchema,
  MaterialIndexSchema,
} from "../../../src/schemas/ProfileRepositorySchema";
import { ProfileSyncService } from "../../../src/services/ProfileSyncService";
import { PrinterProfileCache } from "../../../src/storage/PrinterProfileCache";
import type { LoadedProfiles } from "../../../src/types/ProfileSync";

const DATA = path.resolve(__dirname, "../../../data");

/** Files served for one list: path after the repository address → text */
function listFiles(list: "materials" | "filaments", tag = "v1.1.0") {
  const folder = path.join(DATA, list);
  const index = JSON.parse(
    fs.readFileSync(path.join(folder, "index.json"), "utf8"),
  ) as { tag: string; profiles: { file: string }[] };
  index.tag = tag;

  const files = new Map<string, string>([
    [`main/${list}/index.json`, JSON.stringify(index)],
  ]);
  for (const { file } of index.profiles) {
    files.set(
      `${tag}/${list}/${file}`,
      fs.readFileSync(path.join(folder, file), "utf8"),
    );
  }
  return files;
}

function fakeFetch(files: Map<string, string>, urls: string[] = []) {
  return (input: RequestInfo | URL) => {
    const url = String(input);
    urls.push(url);
    const content = url.startsWith(PROFILE_REPOSITORY_URL)
      ? files.get(url.slice(PROFILE_REPOSITORY_URL.length))
      : undefined;

    return Promise.resolve(
      content === undefined
        ? new Response("Not Found", { status: 404 })
        : new Response(content, { status: 200 }),
    );
  };
}

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-material-sync-"));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("Material and filament repository sync", () => {
  it("reads materials/index.json on main, then each material at its tag", async () => {
    const urls: string[] = [];
    const result = await new MaterialRepositorySync({
      fetch: fakeFetch(listFiles("materials"), urls),
    }).download();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.index).toMatchObject({
      type: "material-index",
      tag: "v1.1.0",
    });
    expect(result.profiles.map(({ fileName }) => fileName)).toEqual([
      "abs.json",
      "asa.json",
      "petg.json",
      "pla.json",
      "tpu.json",
    ]);
    expect(result.profiles[0]?.profile).toMatchObject({
      type: "material",
      source: "Official",
    });
    expect(urls[0]).toBe(`${PROFILE_REPOSITORY_URL}main/materials/index.json`);
    expect(urls[1]).toBe(`${PROFILE_REPOSITORY_URL}v1.1.0/materials/abs.json`);
  });

  it("reads the filaments in the filaments/ folder", async () => {
    const result = await new FilamentRepositorySync({
      fetch: fakeFetch(listFiles("filaments")),
    }).download();

    expect(result.ok && result.profiles).toHaveLength(11);
    expect(result.ok && result.index.type).toBe("filament-index");
  });

  it("refuses the index or a profile of another list (SYNC_004)", async () => {
    // A printer index in materials/
    const printerIndex = listFiles("materials");
    const index = JSON.parse(
      printerIndex.get("main/materials/index.json") ?? "",
    ) as Record<string, unknown>;
    printerIndex.set(
      "main/materials/index.json",
      JSON.stringify({ ...index, type: "printer-index" }),
    );
    expect(
      await new MaterialRepositorySync({
        fetch: fakeFetch(printerIndex),
      }).download(),
    ).toMatchObject({
      ok: false,
      code: "SYNC_004",
      reason: expect.stringMatching(/^materials\/index\.json: type: /),
    });

    // The materials served as filaments: refused by FilamentProfileFileSchema
    const materials = listFiles("materials");
    const asFilaments = new Map(
      [...materials].map(([key, text]) => [
        key.replace("materials/", "filaments/"),
        key.endsWith("index.json")
          ? text.replace('"material-index"', '"filament-index"')
          : text,
      ]),
    );
    expect(
      await new FilamentRepositorySync({
        fetch: fakeFetch(asFilaments),
      }).download(),
    ).toMatchObject({
      ok: false,
      code: "SYNC_004",
      reason: expect.stringMatching(/^filaments\/abs\.json: /),
    });

    // One SHA-256 differs: nothing is kept
    const changed = listFiles("filaments");
    changed.set(
      "v1.1.0/filaments/prusament_asa.json",
      `${changed.get("v1.1.0/filaments/prusament_asa.json")} `,
    );
    expect(
      await new FilamentRepositorySync({
        fetch: fakeFetch(changed),
      }).download(),
    ).toEqual({
      ok: false,
      code: "SYNC_004",
      reason: "filaments/prusament_asa.json: SHA-256 differs",
    });
  });

  it("reports a list not published yet (HTTP 404)", async () => {
    expect(
      await new MaterialRepositorySync({
        fetch: fakeFetch(new Map()),
      }).download(),
    ).toEqual({
      ok: false,
      code: "SYNC_002",
      reason: "main/materials/index.json: HTTP 404",
      notPublished: true,
    });
  });

  it("keeps the materials in their own cache, valid at the next start", async () => {
    const cache = new PrinterProfileCache(
      path.join(root, "cache", "materials"),
      MaterialIndexSchema,
    );
    const reload = (): LoadedProfiles => {
      const valid = cache.readValid();
      return valid
        ? { origin: "repository", tag: valid.tag }
        : { origin: "application", tag: "v1.1.0" };
    };
    const service = new ProfileSyncService(cache, reload, {
      applicationTag: "v1.1.0",
      sync: new MaterialRepositorySync({
        fetch: fakeFetch(listFiles("materials", "v1.1.1")),
      }),
    });
    await service.start();

    expect(await service.check(true)).toMatchObject({
      status: "updated",
      profiles: { origin: "repository", tag: "v1.1.1" },
    });
    expect(
      fs.readdirSync(path.join(root, "cache", "materials", "profiles")).sort(),
    ).toEqual([
      "abs.json",
      "asa.json",
      "index.json",
      "petg.json",
      "pla.json",
      "tpu.json",
    ]);

    // Read again as at the next start; never as a list of filaments
    expect(
      new PrinterProfileCache(
        path.join(root, "cache", "materials"),
        MaterialIndexSchema,
      ).readValid()?.tag,
    ).toBe("v1.1.1");
    expect(
      new PrinterProfileCache(
        path.join(root, "cache", "materials"),
        FilamentIndexSchema,
      ).readValid(),
    ).toBeNull();
  });
});
