/**
 * SlicyWeb
 * ZIP Reader
 *
 * Reads the parts of a ZIP archive (3MF package) from its central
 * directory, and decompresses only the parts asked for. Pure code
 * without DOM: it runs in the import Web Worker (ADR-030).
 *
 * Why not fflate unzipSync or Unzip (checked in 0.1.45):
 * - unzipSync stops writing at the declared size of a part, but still
 *   inflates the whole compressed data: a header that lies about the
 *   size keeps the worker busy for minutes or hours;
 * - the streaming Unzip of fflate reads the local headers; for a part
 *   with a data descriptor (flag bit 3, used by Bambu Studio), it looks
 *   for the bytes "PK\x07\x08" in the data, and cuts the part where these
 *   bytes appear by chance; terminate() does nothing in synchronous mode.
 *
 * This reader:
 * - reads the sizes from the central directory (correct with a data
 *   descriptor), including Zip64 sizes and offsets;
 * - checks the declared sizes before decompression (extraction limits);
 * - inflates with fflate (Inflate) by chunks of 16 kB and stops as soon
 *   as the output goes over the declared size: the work is limited by
 *   the declared size, whatever the compressed data contains;
 * - refuses encrypted parts, unknown compression methods, duplicate
 *   names, sizes that do not match, and any offset outside the file.
 *
 * Errors: MF_002 (not a ZIP archive), MF_003 (corrupted archive),
 * MF_004 (over the extraction limits).
 *
 * Based on:
 * - SECURITY_SPEC.md (3MF Validation, Archive Extraction Limits)
 * - ERROR_CODES_SPEC.md (3MF Errors)
 * - DECISIONS.md (ADR-030)
 * - ZIP File Format Specification (PKWARE APPNOTE): end of central
 *   directory, Zip64, central directory headers, local file headers
 */

import { Inflate } from "fflate";

import { ImportError } from "./ImportError";

/** One part of the archive, from the central directory */
export interface ZipEntry {
  name: string;
  /** 0: stored, 8: deflate */
  method: number;
  flags: number;
  compressedSize: number;
  size: number;
  localHeaderOffset: number;
}

export interface ZipLimits {
  /** Largest decompressed size of one part */
  maxPartBytes: number;
  /** Largest decompressed size of all the parts read */
  maxTotalBytes: number;
}

/** Progress callback: fraction from 0 to 1 */
export type ZipProgress = (fraction: number) => void;

const SIG_LOCAL = 0x04034b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_END = 0x06054b50;
const SIG_ZIP64_END = 0x06064b50;
const SIG_ZIP64_LOCATOR = 0x07064b50;

const END_SIZE = 22;
const MAX_COMMENT = 0xffff;

/** Compressed bytes given to the decompressor at a time */
const INFLATE_CHUNK = 16 * 1024;

const FLAG_ENCRYPTED = 0x0001;
const FLAG_UTF8 = 0x0800;

function corrupted(message: string): ImportError {
  return new ImportError("MF_003", `Corrupted archive: ${message}`);
}

class Bytes {
  private readonly view: DataView;

  constructor(readonly data: Uint8Array) {
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  }

  private check(offset: number, length: number): void {
    if (offset < 0 || offset + length > this.data.length) {
      throw corrupted(`read outside the file at offset ${offset}.`);
    }
  }

  u16(offset: number): number {
    this.check(offset, 2);
    return this.view.getUint16(offset, true);
  }

  u32(offset: number): number {
    this.check(offset, 4);
    return this.view.getUint32(offset, true);
  }

  u64(offset: number): number {
    this.check(offset, 8);
    const low = this.view.getUint32(offset, true);
    const high = this.view.getUint32(offset + 4, true);

    // Values up to 2^53 only (more than any file read here)
    if (high > 0x1fffff) {
      throw corrupted(`64-bit value too large at offset ${offset}.`);
    }

    return high * 0x100000000 + low;
  }

  slice(offset: number, length: number): Uint8Array {
    this.check(offset, length);
    return this.data.subarray(offset, offset + length);
  }
}

/**
 * Reads the central directory. Throws MF_002 when the file is not a ZIP
 * archive, MF_003 when the directory is corrupted.
 */
export function readZipDirectory(data: Uint8Array): ZipEntry[] {
  // Local file header signature "PK\x03\x04" at the start
  if (
    data.length < 4 ||
    data[0] !== 0x50 ||
    data[1] !== 0x4b ||
    data[2] !== 0x03 ||
    data[3] !== 0x04
  ) {
    throw new ImportError("MF_002", "The file is not a ZIP archive.");
  }

  const bytes = new Bytes(data);
  const end = findEndOfCentralDirectory(bytes);

  let count = bytes.u16(end + 10);
  let directorySize = bytes.u32(end + 12);
  let directoryOffset = bytes.u32(end + 16);

  if (
    count === 0xffff ||
    directorySize === 0xffffffff ||
    directoryOffset === 0xffffffff
  ) {
    // Zip64 end of central directory, found with its locator
    const locator = end - 20;

    if (locator < 0 || bytes.u32(locator) !== SIG_ZIP64_LOCATOR) {
      throw corrupted("Zip64 locator missing.");
    }

    const zip64End = bytes.u64(locator + 8);

    if (bytes.u32(zip64End) !== SIG_ZIP64_END) {
      throw corrupted("Zip64 end of central directory missing.");
    }

    count = bytes.u64(zip64End + 32);
    directorySize = bytes.u64(zip64End + 40);
    directoryOffset = bytes.u64(zip64End + 48);
  }

  if (directoryOffset + directorySize > data.length) {
    throw corrupted("central directory outside the file.");
  }

  const entries: ZipEntry[] = [];
  let offset = directoryOffset;

  for (let i = 0; i < count; i += 1) {
    if (bytes.u32(offset) !== SIG_CENTRAL) {
      throw corrupted(`central directory header ${i + 1} not found.`);
    }

    const flags = bytes.u16(offset + 8);
    const method = bytes.u16(offset + 10);
    let compressedSize = bytes.u32(offset + 20);
    let size = bytes.u32(offset + 24);
    const nameLength = bytes.u16(offset + 28);
    const extraLength = bytes.u16(offset + 30);
    const commentLength = bytes.u16(offset + 32);
    let localHeaderOffset = bytes.u32(offset + 42);

    const nameBytes = bytes.slice(offset + 46, nameLength);
    const name = new TextDecoder(
      flags & FLAG_UTF8 ? "utf-8" : "latin1",
    ).decode(nameBytes);

    // Zip64 extended information: the fields set to 0xFFFFFFFF, in order
    const extra = offset + 46 + nameLength;
    let field = extra;

    while (field + 4 <= extra + extraLength) {
      const id = bytes.u16(field);
      const length = bytes.u16(field + 2);

      if (id === 0x0001) {
        let value = field + 4;

        if (size === 0xffffffff) {
          size = bytes.u64(value);
          value += 8;
        }

        if (compressedSize === 0xffffffff) {
          compressedSize = bytes.u64(value);
          value += 8;
        }

        if (localHeaderOffset === 0xffffffff) {
          localHeaderOffset = bytes.u64(value);
        }
      }

      field += 4 + length;
    }

    entries.push({
      name,
      method,
      flags,
      compressedSize,
      size,
      localHeaderOffset,
    });

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(bytes: Bytes): number {
  const last = bytes.data.length - END_SIZE;
  const first = Math.max(0, last - MAX_COMMENT);

  for (let offset = last; offset >= first; offset -= 1) {
    if (
      bytes.data[offset] === 0x50 &&
      bytes.data[offset + 1] === 0x4b &&
      bytes.u32(offset) === SIG_END
    ) {
      return offset;
    }
  }

  throw corrupted("end of central directory not found.");
}

/**
 * Decompresses the parts accepted by the filter, after checking the
 * extraction limits. Names are returned as stored in the archive.
 */
export function extractZipParts(
  data: Uint8Array,
  entries: ZipEntry[],
  wanted: (name: string) => boolean,
  limits: ZipLimits,
  onProgress: ZipProgress = () => {},
): Map<string, Uint8Array> {
  const bytes = new Bytes(data);
  const selected = entries.filter((entry) => wanted(entry.name));

  // Limits checked on the declared sizes, before any decompression
  let total = 0;
  const names = new Set<string>();

  for (const entry of selected) {
    const key = entry.name.toLowerCase();

    if (names.has(key)) {
      throw corrupted(`duplicate part ${entry.name}.`);
    }

    names.add(key);
    total += entry.size;

    if (entry.size > limits.maxPartBytes || total > limits.maxTotalBytes) {
      throw new ImportError(
        "MF_004",
        `Decompressed size over the limit (part ${entry.name}: ${entry.size} bytes).`,
      );
    }
  }

  const compressedTotal = selected.reduce(
    (sum, entry) => sum + entry.compressedSize,
    0,
  );
  let compressedDone = 0;
  const parts = new Map<string, Uint8Array>();

  for (const entry of selected) {
    if (entry.flags & FLAG_ENCRYPTED) {
      throw corrupted(`encrypted part ${entry.name}.`);
    }

    const local = entry.localHeaderOffset;

    if (bytes.u32(local) !== SIG_LOCAL) {
      throw corrupted(`local header of ${entry.name} not found.`);
    }

    const start = local + 30 + bytes.u16(local + 26) + bytes.u16(local + 28);
    const compressed = bytes.slice(start, entry.compressedSize);

    parts.set(
      entry.name,
      decompress(entry, compressed, (done) => {
        onProgress(
          compressedTotal === 0
            ? 1
            : (compressedDone + done) / compressedTotal,
        );
      }),
    );

    compressedDone += entry.compressedSize;
  }

  onProgress(1);

  return parts;
}

function decompress(
  entry: ZipEntry,
  compressed: Uint8Array,
  onProgress: (compressedBytes: number) => void,
): Uint8Array {
  if (entry.method === 0) {
    if (entry.compressedSize !== entry.size) {
      throw corrupted(`stored part ${entry.name} with two different sizes.`);
    }

    return compressed;
  }

  if (entry.method !== 8) {
    throw corrupted(
      `unknown compression method ${entry.method} for ${entry.name}.`,
    );
  }

  const output = new Uint8Array(entry.size);
  let produced = 0;
  let overflow = false;
  let ended = false;

  const inflate = new Inflate((chunk, final) => {
    if (produced + chunk.length > output.length) {
      overflow = true;
      return;
    }

    output.set(chunk, produced);
    produced += chunk.length;
    ended = final;
  });

  try {
    for (let offset = 0; offset < compressed.length; offset += INFLATE_CHUNK) {
      const next = Math.min(offset + INFLATE_CHUNK, compressed.length);
      inflate.push(compressed.subarray(offset, next), next === compressed.length);

      // Stop as soon as the part is larger than its declared size
      if (overflow) {
        throw corrupted(
          `part ${entry.name} larger than its declared size (${entry.size} bytes).`,
        );
      }

      onProgress(next);
    }

    if (compressed.length === 0) {
      inflate.push(new Uint8Array(0), true);
    }
  } catch (error) {
    if (error instanceof ImportError) {
      throw error;
    }

    throw corrupted(
      `${entry.name}: ${error instanceof Error ? error.message : String(error)}.`,
    );
  }

  if (!ended || produced !== entry.size) {
    throw corrupted(
      `part ${entry.name}: ${produced} bytes instead of ${entry.size}.`,
    );
  }

  return output;
}
