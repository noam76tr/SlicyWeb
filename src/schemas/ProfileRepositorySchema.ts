/**
 * SlicyWeb
 * Profile Repository Schema
 *
 * Runtime validation schemas of the SlicyWeb profile repository
 * noam76tr/slicyweb-profiles (ADR-032, D5) and of its local cache.
 *
 * ProfileIndexSchema: index.json of the repository (DATA_SCHEMA.md,
 * Profile Repository Index Schema):
 * - type "printer-index", version of the index format;
 * - tag: the Git tag where the profile files are read, "vX.Y.Z"
 *   (compareTags: the most recent list of profiles is used);
 * - profiles: one entry per profile file, with its file name, the id of
 *   its printer and the SHA-256 of the file (64 lowercase hexadecimal
 *   characters).
 * A file name has only letters, digits, "_" and "-", and ends with
 * .json (never a folder, never ".."); index.json is not a profile.
 * File names and ids are unique.
 *
 * CacheFileSchema: cache.json of the cache, { "cache": CacheMetadata }
 * (DATA_SCHEMA.md, Cache Schema). RepositorySyncResultSchema: the last
 * check (DATA_SCHEMA.md, RepositorySync Result Schema).
 *
 * Based on:
 * - DATA_SCHEMA.md (Profile Repository Index Schema, Cache Schema,
 *   RepositorySync Result Schema)
 * - DECISIONS.md (ADR-032, D5)
 * - SECURITY_SPEC.md (Printer Profile Download)
 */

import { z } from "zod";

/** Name of the SlicyWeb profile repository (source of the cache) */
export const PROFILE_REPOSITORY_NAME = "noam76tr/slicyweb-profiles";

/** Most profiles accepted in one index */
export const MAX_INDEX_PROFILES = 500;

/** Most bytes of one download: index.json and all the profiles */
export const MAX_DOWNLOAD_SIZE = 20 * 1024 * 1024;

const FILE_NAME = /^[A-Za-z0-9_-]+\.json$/;

/** Tag of a version of the profiles: "v" and three numbers, as v1.0.0 */
const TAG = /^v(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})$/;

/**
 * Order of two tags of profiles (vX.Y.Z): negative when a is older than
 * b, 0 when they are the same version, positive when a is more recent.
 * A tag that is not vX.Y.Z is older than any valid tag.
 */
export function compareTags(a: string, b: string): number {
  const numbers = (tag: string) => TAG.exec(tag)?.slice(1).map(Number) ?? null;
  const left = numbers(a);
  const right = numbers(b);

  if (!left || !right) {
    return (left ? 1 : 0) - (right ? 1 : 0);
  }

  for (let part = 0; part < 3; part++) {
    const difference = (left[part] ?? 0) - (right[part] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export const ProfileIndexEntrySchema = z
  .object({
    file: z
      .string()
      .regex(FILE_NAME)
      .refine((file) => file !== "index.json", "index.json is not a profile"),
    id: z.string().trim().min(1),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .strict();

export const ProfileIndexSchema = z
  .object({
    type: z.literal("printer-index"),
    version: z.string().trim().min(1),
    tag: z.string().regex(TAG, "The tag must be vX.Y.Z"),
    profiles: z.array(ProfileIndexEntrySchema).min(1).max(MAX_INDEX_PROFILES),
  })
  .strict()
  .refine(
    (index) =>
      new Set(index.profiles.map(({ file }) => file.toLowerCase())).size ===
      index.profiles.length,
    { message: "A file is listed twice", path: ["profiles"] },
  )
  .refine(
    (index) =>
      new Set(index.profiles.map(({ id }) => id)).size ===
      index.profiles.length,
    { message: "An id is listed twice", path: ["profiles"] },
  );

export type ProfileIndex = z.infer<typeof ProfileIndexSchema>;

export type ProfileIndexEntry = z.infer<typeof ProfileIndexEntrySchema>;

/** Cache Schema (DATA_SCHEMA.md): metadata of the cached profiles */
export const CacheMetadataSchema = z
  .object({
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
    source: z.literal(PROFILE_REPOSITORY_NAME),
    version: z.string(),
    checksum: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .strict();

export type CacheMetadata = z.infer<typeof CacheMetadataSchema>;

/** cache.json: the Cache Schema object, as in DATA_SCHEMA.md */
export const CacheFileSchema = z
  .object({ cache: CacheMetadataSchema })
  .strict();

/** RepositorySync Result Schema (DATA_SCHEMA.md) */
export const RepositorySyncResultSchema = z
  .object({
    success: z.boolean(),
    source: z.string(),
    repository: z.string(),
    version: z.string(),
    data: z.record(z.unknown()),
    errors: z.array(z.string()),
    synchronizedAt: z.string().datetime(),
  })
  .strict();

export type RepositorySyncResult = z.infer<typeof RepositorySyncResultSchema>;
