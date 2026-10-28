/**
 * SlicyWeb
 * Printer Repository Sync Tests
 *
 * Download of the profiles of the SlicyWeb profile repository (ADR-032,
 * D5; Phase 7 lot 62), with a fake network serving the profiles of
 * data/printers/ and their index.json:
 * - index.json read on main, the profiles at the tag of the index;
 * - only the allowed address, redirections refused;
 * - all or nothing: a wrong SHA-256, an invalid index or profile, a file
 *   too large, a download over 20 MB in all refuse the whole download
 *   (SYNC_004);
 * - HTTP error or network error: SYNC_002, with notPublished for HTTP
 *   404 (index.json or tag not published yet); no answer: SYNC_003.
 *
 * Based on:
 * - DATA_SCHEMA.md (Profile Repository Index Schema)
 * - SECURITY_SPEC.md (Printer Profile Download)
 * - ERROR_CODES_SPEC.md (SYNC_002, SYNC_003, SYNC_004)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  PROFILE_REPOSITORY_URL,
  PrinterRepositorySync,
  sha256Hex,
} from "../../../src/repositories/PrinterRepositorySync";
import { compareTags } from "../../../src/schemas/ProfileRepositorySchema";

const FOLDER = path.resolve(__dirname, "../../../data/printers");

/** Files served: path after the repository address → content */
function repositoryFiles(tag = "v1.0.0"): Map<string, string> {
  const index = JSON.parse(
    fs.readFileSync(path.join(FOLDER, "index.json"), "utf8"),
  ) as { tag: string; profiles: { file: string }[] };
  index.tag = tag;

  const files = new Map<string, string>([
    ["main/index.json", JSON.stringify(index)],
  ]);
  for (const { file } of index.profiles) {
    files.set(
      `${tag}/${file}`,
      fs.readFileSync(path.join(FOLDER, file), "utf8"),
    );
  }
  return files;
}

interface Call {
  url: string;
  init: RequestInit | undefined;
}

function fakeFetch(files: Map<string, string>, calls: Call[] = []) {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
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

describe("Printer repository sync", () => {
  it("reads index.json on main, then each profile at its tag", async () => {
    const calls: Call[] = [];
    const sync = new PrinterRepositorySync({
      fetch: fakeFetch(repositoryFiles(), calls),
    });

    const result = await sync.download();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.index.tag).toBe("v1.0.0");
    expect(result.profiles).toHaveLength(57);
    expect(result.profiles[0]?.profile.source).toBe("Official");
    expect(calls[0]?.url).toBe(`${PROFILE_REPOSITORY_URL}main/index.json`);
    expect(calls[1]?.url).toBe(
      `${PROFILE_REPOSITORY_URL}v1.0.0/anycubic_kobra3.json`,
    );
    for (const { url, init } of calls) {
      expect(url.startsWith("https://raw.githubusercontent.com/")).toBe(true);
      expect(init).toMatchObject({ redirect: "error", credentials: "omit" });
    }
  });

  it("refuses everything when one SHA-256 differs (SYNC_004)", async () => {
    const files = repositoryFiles();
    files.set(
      "v1.0.0/prusa_mk4s.json",
      `${files.get("v1.0.0/prusa_mk4s.json")} `,
    );

    const result = await new PrinterRepositorySync({
      fetch: fakeFetch(files),
    }).download();

    expect(result).toEqual({
      ok: false,
      code: "SYNC_004",
      reason: "prusa_mk4s.json: SHA-256 differs",
    });
  });

  it("refuses an invalid index or a tag with a path (SYNC_004)", async () => {
    for (const index of [
      "{",
      JSON.stringify({
        type: "printer-index",
        version: "1",
        tag: "v1.0.0",
        profiles: [],
      }),
      JSON.stringify({
        type: "printer-index",
        version: "1",
        tag: "../main",
        profiles: [{ file: "a.json", id: "a", sha256: "0".repeat(64) }],
      }),
      JSON.stringify({
        type: "printer-index",
        version: "1",
        tag: "v1.0.0",
        profiles: [{ file: "../a.json", id: "a", sha256: "0".repeat(64) }],
      }),
    ]) {
      const result = await new PrinterRepositorySync({
        fetch: fakeFetch(new Map([["main/index.json", index]])),
      }).download();

      expect(result).toMatchObject({ ok: false, code: "SYNC_004" });
    }
  });

  it("accepts only vX.Y.Z tags and orders them", async () => {
    const files = repositoryFiles();
    const index = JSON.parse(files.get("main/index.json") ?? "") as {
      tag: string;
    };
    index.tag = "1.0";
    const result = await new PrinterRepositorySync({
      fetch: fakeFetch(new Map([["main/index.json", JSON.stringify(index)]])),
    }).download();
    expect(result).toMatchObject({ ok: false, code: "SYNC_004" });

    expect(compareTags("v1.0.10", "v1.0.9")).toBeGreaterThan(0);
    expect(compareTags("v1.2.0", "v2.0.0")).toBeLessThan(0);
    expect(compareTags("v1.0.0", "v1.0.0")).toBe(0);
    expect(compareTags("beta", "v0.0.1")).toBeLessThan(0);
  });

  it("refuses a profile that is not the Official profile of the index", async () => {
    const files = repositoryFiles();
    const profile = JSON.parse(files.get("v1.0.0/bambu_a1.json") ?? "") as {
      source: string;
    };
    profile.source = "Community";
    const text = JSON.stringify(profile);
    files.set("v1.0.0/bambu_a1.json", text);
    const index = JSON.parse(files.get("main/index.json") ?? "") as {
      profiles: { file: string; sha256: string }[];
    };
    const entry = index.profiles.find(({ file }) => file === "bambu_a1.json");
    if (entry) entry.sha256 = await sha256Hex(new TextEncoder().encode(text));
    files.set("main/index.json", JSON.stringify(index));

    const result = await new PrinterRepositorySync({
      fetch: fakeFetch(files),
    }).download();

    expect(result).toMatchObject({ ok: false, code: "SYNC_004" });
  });

  it("refuses a file too large (SYNC_004)", async () => {
    const result = await new PrinterRepositorySync({
      fetch: fakeFetch(repositoryFiles()),
      maxFileSize: 100,
    }).download();

    expect(result).toEqual({
      ok: false,
      code: "SYNC_004",
      reason: "main/index.json: file too large",
    });
  });

  it("refuses a download larger than the total limit (SYNC_004)", async () => {
    const result = await new PrinterRepositorySync({
      fetch: fakeFetch(repositoryFiles()),
      maxDownloadSize: 8000,
    }).download();

    expect(result).toMatchObject({ ok: false, code: "SYNC_004" });
    expect(result.ok ? "" : result.reason).toMatch(/download too large$/);
  });

  it("reports a missing tag or a network error (SYNC_002)", async () => {
    const files = repositoryFiles("v9.9.9");
    const index = files.get("main/index.json") ?? "";
    const missingTag = new Map([["main/index.json", index]]);

    expect(
      await new PrinterRepositorySync({
        fetch: fakeFetch(missingTag),
      }).download(),
    ).toEqual({
      ok: false,
      code: "SYNC_002",
      reason: "v9.9.9/anycubic_kobra3.json: HTTP 404",
      notPublished: true,
    });

    expect(
      await new PrinterRepositorySync({
        fetch: fakeFetch(new Map()),
      }).download(),
    ).toMatchObject({ code: "SYNC_002", notPublished: true });

    expect(
      await new PrinterRepositorySync({
        fetch: () => Promise.resolve(new Response("", { status: 503 })),
      }).download(),
    ).toEqual({
      ok: false,
      code: "SYNC_002",
      reason: "main/index.json: HTTP 503",
    });

    expect(
      await new PrinterRepositorySync({
        fetch: () => Promise.reject(new TypeError("fetch failed")),
      }).download(),
    ).toEqual({
      ok: false,
      code: "SYNC_002",
      reason: "main/index.json: fetch failed",
    });
  });

  it("stops when the repository does not answer (SYNC_003)", async () => {
    const neverAnswers = (_: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      });

    const result = await new PrinterRepositorySync({
      fetch: neverAnswers,
      timeoutMs: 20,
    }).download();

    expect(result).toEqual({
      ok: false,
      code: "SYNC_003",
      reason: "main/index.json: no answer",
    });
  });
});
