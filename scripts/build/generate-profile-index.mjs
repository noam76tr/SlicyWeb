/**
 * SlicyWeb
 * Profile Index Generator
 *
 * Writes data/printers/index.json, the index of the SlicyWeb profile
 * repository noam76tr/slicyweb-profiles (DATA_SCHEMA.md, Profile
 * Repository Index Schema; ADR-032, D5): the tag of the release, then,
 * for each profile file of data/printers/, its file name, the id of its
 * printer and the SHA-256 of the file as it is on the disk.
 *
 * Usage (any platform, including Windows PowerShell), with the tag of
 * the release to create on GitHub:
 *   npm run profiles:index -- v1.0.0
 *
 * Then send the profile files and index.json to slicyweb-profiles, and
 * create the release with the same tag. Send the files exactly as they
 * are: a change after this script (even an end of line) changes the
 * SHA-256, and the application refuses the update.
 *
 * Checks each file: valid JSON, type "printer", source "Official", id of
 * the file = id of its printer = file name without .json, 1 MB at most;
 * 1 to 500 profiles, 20 MB at most in all; the tag is vX.Y.Z and never
 * older than the tag of the current index.json. Exit code 0
 * when index.json is written, 1 otherwise (nothing written).
 *
 * Based on:
 * - DATA_SCHEMA.md (Profile Repository Index Schema)
 * - DECISIONS.md (ADR-032, D5)
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const INDEX_VERSION = "1.0.0";
const TAG = /^v(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})$/;
const MAX_FILE_SIZE = 1024 * 1024;
const MAX_DOWNLOAD_SIZE = 20 * 1024 * 1024;
const MAX_PROFILES = 500;

/** Order of two tags vX.Y.Z (as compareTags of ProfileRepositorySchema) */
function compareTags(a, b) {
  const left = TAG.exec(a)?.slice(1).map(Number);
  const right = TAG.exec(b)?.slice(1).map(Number);
  if (!left || !right) return (left ? 1 : 0) - (right ? 1 : 0);
  for (let part = 0; part < 3; part++) {
    if (left[part] !== right[part]) return left[part] - right[part];
  }
  return 0;
}
const FILE_NAME = /^[A-Za-z0-9_-]+\.json$/;

const folder = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "data",
  "printers",
);

const tag = process.argv[2];

if (!tag || !TAG.test(tag)) {
  console.error(
    "Give the tag of the release, vX.Y.Z: npm run profiles:index -- v1.0.0",
  );
  process.exit(1);
}

// The applications keep the most recent list: a tag older than the
// current one would never be used
let previous = null;
try {
  previous = JSON.parse(readFileSync(join(folder, "index.json"), "utf8")).tag;
} catch {
  // No index.json yet
}
if (typeof previous === "string" && compareTags(tag, previous) < 0) {
  console.error(`The tag ${tag} is older than the current tag ${previous}.`);
  process.exit(1);
}

let errors = 0;
let total = 0;
const profiles = [];

const files = readdirSync(folder, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".json") &&
      entry.name.toLowerCase() !== "index.json",
  )
  .map((entry) => entry.name)
  .sort();

for (const file of files) {
  const bytes = readFileSync(join(folder, file));
  total += bytes.length;
  let profile;

  if (bytes.length > MAX_FILE_SIZE) {
    console.error(`${file}: more than 1 MB`);
    errors++;
    continue;
  }

  try {
    profile = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    console.error(`${file}: invalid JSON (${error.message})`);
    errors++;
    continue;
  }

  const id = file.slice(0, -".json".length);

  if (!FILE_NAME.test(file)) {
    console.error(`${file}: only letters, digits, "_" and "-" in a file name`);
    errors++;
  } else if (profile?.type !== "printer" || profile?.source !== "Official") {
    console.error(`${file}: not an Official printer profile`);
    errors++;
  } else if (profile.id !== id || profile.data?.id !== id) {
    console.error(`${file}: the id must be "${id}"`);
    errors++;
  } else {
    profiles.push({
      file,
      id,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
}

if (profiles.length === 0 || profiles.length > MAX_PROFILES) {
  console.error(`1 to ${MAX_PROFILES} profiles are needed in data/printers/`);
  errors++;
}

// index.json is about 150 bytes per profile
if (total + 1000 + profiles.length * 200 > MAX_DOWNLOAD_SIZE) {
  console.error("The profiles and index.json exceed 20 MB.");
  errors++;
}

if (errors > 0) {
  console.error(`index.json not written: ${errors} error(s).`);
  process.exit(1);
}

writeFileSync(
  join(folder, "index.json"),
  `${JSON.stringify({ type: "printer-index", version: INDEX_VERSION, tag, profiles }, null, 2)}\n`,
);

console.log(`index.json written: tag ${tag}, ${profiles.length} profiles.`);
