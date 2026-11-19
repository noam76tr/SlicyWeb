/**
 * SlicyWeb
 * Object3D Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md (Object Schema, 3.14.0: name)
 */

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Scale {
  x: number;
  y: number;
  z: number;
}

export interface Transform {
  position: Position;

  rotation: Rotation;

  scale: Scale;
}

export interface Geometry {
  width: number;
  depth: number;
  height: number;
  volume: number;
  surfaceArea: number;
}

export interface Mesh {
  vertices: number;
  triangles: number;
}

export interface Object3D {
  objectId: string;

  fileName: string;

  /**
   * Name given by the user (lot 106, decision 112 of Noam, Q1 A); null
   * when none was given: the name shown is then made from fileName
   * (IMPORT_EXPORT_SPEC.md, Object Naming). fileName never changes.
   */
  name: string | null;

  fileType: string;

  /** False: the object is hidden (lot 106, Q7 A: set aside) */
  visible: boolean;

  /** True: its position, rotation and scale cannot change (lot 106, Q12 A) */
  locked: boolean;

  transform: Transform;

  geometry: Geometry;

  mesh: Mesh;
}
