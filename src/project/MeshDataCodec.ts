/**
 * SlicyWeb
 * Mesh Data Codec
 *
 * Triangles of an object in a WYPROJ file (DATA_SCHEMA.md 3.16.0, Object
 * Schema: meshData; lot 111, decision 119 of Noam, Q2 A):
 * - 9 numbers per triangle (the 3 vertices x, y, z), in millimeters, in
 *   the coordinate system of the object (relative to its local origin,
 *   Transform Rules), as the triangle data of the scene;
 * - 32-bit floating point numbers, little-endian, written in base64
 *   (RFC 4648, padded); the normals are not written (computed again at
 *   opening).
 *
 * decode() refuses a text that is not base64, a length that is not the
 * one of the triangles announced, and any value that is not a finite
 * number (SECURITY_SPEC.md, Project Validation).
 *
 * Main process only (Node.js Buffer).
 *
 * No business logic.
 *
 * Based on:
 * - DATA_SCHEMA.md (Object Schema, Transform Rules)
 * - SECURITY_SPEC.md (Project Security)
 */

import {
  base64Length,
  isBase64,
  MESH_BYTES_PER_TRIANGLE,
} from "../schemas/ProjectSchema";

const LITTLE_ENDIAN =
  new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

/** Bytes of the numbers, little-endian */
function littleEndianBytes(values: Float32Array): Uint8Array {
  const bytes = new Uint8Array(
    values.buffer,
    values.byteOffset,
    values.byteLength,
  );

  if (LITTLE_ENDIAN) {
    return bytes;
  }

  const copy = new Uint8Array(bytes.length);
  const view = new DataView(copy.buffer);

  values.forEach((value, index) => view.setFloat32(index * 4, value, true));

  return copy;
}

export const MeshDataCodec = {
  /** meshData of the triangle data of an object */
  encode(positions: Float32Array): string {
    if (positions.length === 0 || positions.length % 9 !== 0) {
      throw new Error("The triangle data must hold 9 numbers per triangle.");
    }

    return Buffer.from(littleEndianBytes(positions)).toString("base64");
  },

  /**
   * Triangle data of meshData; throws an error when the text is not the
   * triangles announced or holds a value that is not a finite number
   */
  decode(meshData: string, triangles: number): Float32Array {
    const bytes = triangles * MESH_BYTES_PER_TRIANGLE;

    if (
      !Number.isInteger(triangles) ||
      triangles < 1 ||
      meshData.length !== base64Length(bytes) ||
      !isBase64(meshData)
    ) {
      throw new Error("meshData does not hold the triangles of the object.");
    }

    const buffer = Buffer.from(meshData, "base64");

    if (buffer.length !== bytes) {
      throw new Error("meshData does not hold the triangles of the object.");
    }

    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);
    const positions = new Float32Array(triangles * 9);

    for (let index = 0; index < positions.length; index += 1) {
      const value = view.getFloat32(index * 4, true);

      if (!Number.isFinite(value)) {
        throw new Error("meshData holds a value that is not a finite number.");
      }

      positions[index] = value;
    }

    return positions;
  },
};

export default MeshDataCodec;
