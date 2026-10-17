/**
 * SlicyWeb
 * 3MF Parser
 *
 * Parses a 3MF file (IMPORT_EXPORT_SPEC.md, 3MF Import) into the
 * triangle data of each object to print. Pure code without DOM: it
 * runs in the import Web Worker (ADR-029, ADR-030) and in tests.
 *
 * Libraries (TECH_STACK.md, 3MF Support; ADR-030):
 * - fflate: reads the ZIP archive;
 * - fast-xml-parser: checks that each XML part is well-formed
 *   (XMLValidator), then reads it. Each tag is handled when it is opened
 *   (updateTag) and is not kept, so a large model never builds an XML
 *   tree in memory. An object ends where the next object, the build or
 *   the part begins.
 *
 * Package (3MF Core Specification, Open Packaging Conventions):
 * - [Content_Types].xml and _rels/.rels are required;
 * - _rels/.rels gives the root model part (relationship of type 3D model);
 * - a component may reference an object of another model part with the
 *   attribute path of the Production extension (3D/Objects/*.model,
 *   used by Bambu Studio and OrcaSlicer).
 *
 * Geometry:
 * - each build item becomes one object; the meshes of its components are
 *   merged into it, with their transforms (build item transform x
 *   component transforms);
 * - units (attribute unit of the root model) are converted to millimeters;
 * - the build item transforms are kept: the objects keep their layout.
 *
 * Security (SECURITY_SPEC.md, 3MF Validation, 3MF Rejection Conditions,
 * Archive Extraction Limits):
 * - only the parts needed (.rels, .model, [Content_Types].xml) are
 *   decompressed, each one limited in size before decompression (zip bomb);
 * - a DOCTYPE is refused (no entity expansion), entities are not processed;
 * - the number of triangles produced is limited (an object reused by
 *   many build items or components);
 * - references (objects, parts, vertex indices) are checked, component
 *   cycles are refused.
 *
 * Errors (ERROR_CODES_SPEC.md, 3MF Errors; IMPORT_EXPORT_SPEC.md, Import
 * Error Codes):
 * - MF_002 Invalid 3MF Package: not a ZIP archive, required part missing;
 * - MF_003 Corrupted 3MF File: corrupted archive, invalid XML or UTF-8,
 *   broken reference, invalid geometry or transform, unknown unit;
 * - MF_TOO_LARGE (no code, KI-018): extraction limits exceeded.
 *
 * Based on:
 * - IMPORT_EXPORT_SPEC.md (3MF Import, Units, Unit Conversion)
 * - SECURITY_SPEC.md
 * - ERROR_CODES_SPEC.md
 * - DATA_SCHEMA.md (Model Geometry Schema, Mesh Statistics Schema)
 * - DECISIONS.md (ADR-028, ADR-029, ADR-030)
 */

import { XMLParser, XMLValidator } from "fast-xml-parser";
import { unzipSync, type UnzipFileInfo } from "fflate";

import { ImportError } from "./ImportError";
import { TriangleCollector, type TriangleData } from "./StlParser";

/** One object of the 3MF file (one build item), millimeters */
export interface ThreeMFObject extends TriangleData {
  /** Vertices of the meshes used by the object (shared vertices counted once per mesh use) */
  vertexCount: number;
}

export interface ThreeMFParseResult {
  /** Objects in the order of the build items */
  objects: ThreeMFObject[];
}

/** Progress callback: fraction from 0 to 1 */
export type ParseProgress = (fraction: number) => void;

/** Largest decompressed size of one part (a JavaScript string must hold it) */
export const MAX_PART_BYTES = 500 * 1024 * 1024;

/** Largest decompressed size of all the parts read */
export const MAX_TOTAL_BYTES = 1024 * 1024 * 1024;

/** Largest number of triangles produced (all objects) */
export const MAX_TRIANGLES = 20_000_000;

/** Deepest component nesting */
const MAX_COMPONENT_DEPTH = 32;

const MODEL_RELATIONSHIP =
  "http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel";

/** Units of the 3MF Core Specification, in millimeters */
const UNIT_SCALE: Record<string, number> = {
  micron: 0.001,
  millimeter: 1,
  centimeter: 10,
  inch: 25.4,
  foot: 304.8,
  meter: 1000,
};

/** Share of the progress: archive, XML parts, geometry */
const UNZIP_SHARE = 0.1;
const XML_SHARE = 0.7;

/** Share of the progress of a part used by the XML validation */
const VALIDATION_SHARE = 0.3;

/** Tags read between two progress reports */
const PROGRESS_TAGS = 100_000;

/** Affine transform of 3MF: m00 m01 m02 m10 m11 m12 m20 m21 m22 m30 m31 m32 */
type Matrix = number[];

const IDENTITY: Matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];

interface Reference {
  objectId: string;
  /** Model part (Production extension); undefined: same part */
  path?: string;
  transform: Matrix;
}

interface MeshData {
  vertices: Float32Array;
  vertexCount: number;
  triangles: Uint32Array;
  triangleCount: number;
}

interface ObjectDefinition {
  type: string;
  mesh?: MeshData;
  components: Reference[];
}

interface ModelPart {
  unit: string;
  objects: Map<string, ObjectDefinition>;
  build: Reference[];
}

function corrupted(message: string): ImportError {
  return new ImportError("MF_003", message);
}

/** Part name without leading slash, case-insensitive (OPC part names) */
function partKey(name: string): string {
  return name.replace(/^\/+/, "").toLowerCase();
}

export function parse3mf(
  buffer: ArrayBuffer,
  onProgress: ParseProgress = () => {},
): ThreeMFParseResult {
  const parts = unzip(new Uint8Array(buffer));
  onProgress(UNZIP_SHARE);

  if (!parts.has(partKey("[Content_Types].xml"))) {
    throw new ImportError("MF_002", "Missing part [Content_Types].xml.");
  }

  const rootName = findRootModel(parts);
  const xmlTotal = [...parts.entries()]
    .filter(([name]) => name.endsWith(".model"))
    .reduce((sum, [, bytes]) => sum + bytes.length, 0);
  let xmlDone = 0;

  const models = new Map<string, ModelPart>();

  const getModel = (name: string): ModelPart => {
    const key = partKey(name);
    const cached = models.get(key);

    if (cached) {
      return cached;
    }

    const bytes = parts.get(key);

    if (!bytes) {
      throw corrupted(`Referenced model part not found: ${name}.`);
    }

    const model = parseModelPart(key, bytes, (fraction) => {
      onProgress(
        UNZIP_SHARE +
          (XML_SHARE * (xmlDone + fraction * bytes.length)) /
            Math.max(xmlTotal, 1),
      );
    });

    xmlDone += bytes.length;
    models.set(key, model);

    return model;
  };

  const root = getModel(rootName);
  const scale = UNIT_SCALE[root.unit];

  if (scale === undefined) {
    throw corrupted(`Unknown unit: ${root.unit}.`);
  }

  if (root.build.length === 0) {
    throw corrupted("The model has no build item.");
  }

  // Parse every part referenced by the build (Production extension)
  const items = root.build.map((item) => ({
    item,
    triangles: countTriangles(
      getModel(item.path ?? rootName),
      item.objectId,
      item.path ?? rootName,
      getModel,
      [],
    ),
  }));

  const totalTriangles = items.reduce((sum, entry) => sum + entry.triangles, 0);

  if (totalTriangles > MAX_TRIANGLES) {
    throw new ImportError(
      "MF_TOO_LARGE",
      `The model produces ${totalTriangles} triangles (limit ${MAX_TRIANGLES}).`,
    );
  }

  onProgress(UNZIP_SHARE + XML_SHARE);

  const objects: ThreeMFObject[] = [];
  let built = 0;

  for (const { item, triangles } of items) {
    if (triangles === 0) {
      continue;
    }

    const collector = new TriangleCollector(triangles, "MF_003");
    const counter = { vertices: 0 };
    const matrix = multiply(item.transform, scaleMatrix(scale));

    emitObject(
      item.path ?? rootName,
      item.objectId,
      matrix,
      getModel,
      collector,
      counter,
    );

    objects.push({ ...collector.data(), vertexCount: counter.vertices });
    built += triangles;
    onProgress(
      UNZIP_SHARE + XML_SHARE + ((1 - UNZIP_SHARE - XML_SHARE) * built) /
        totalTriangles,
    );
  }

  if (objects.length === 0) {
    throw corrupted("The model contains no triangle.");
  }

  onProgress(1);

  return { objects };
}

/**
 * Decompresses the parts needed, after checking their declared sizes.
 * fflate never writes more than the declared size of a part.
 */
function unzip(data: Uint8Array): Map<string, Uint8Array> {
  // Local file header signature "PK\x03\x04"
  if (
    data.length < 4 ||
    data[0] !== 0x50 ||
    data[1] !== 0x4b ||
    data[2] !== 0x03 ||
    data[3] !== 0x04
  ) {
    throw new ImportError("MF_002", "The file is not a ZIP archive.");
  }

  let total = 0;
  let tooLarge: ImportError | undefined;

  const wanted = (file: UnzipFileInfo): boolean => {
    const name = file.name.toLowerCase();

    if (
      !name.endsWith(".rels") &&
      !name.endsWith(".model") &&
      name !== "[content_types].xml"
    ) {
      return false;
    }

    const size = Math.max(file.originalSize, file.size);
    total += size;

    if (size > MAX_PART_BYTES || total > MAX_TOTAL_BYTES) {
      tooLarge ??= new ImportError(
        "MF_TOO_LARGE",
        `Decompressed size over the limit (part ${file.name}: ${size} bytes).`,
      );
    }

    return tooLarge === undefined;
  };

  let files: Record<string, Uint8Array>;

  try {
    files = unzipSync(data, { filter: wanted });
  } catch (error) {
    throw corrupted(
      `Corrupted archive: ${error instanceof Error ? error.message : String(error)}.`,
    );
  }

  if (tooLarge) {
    throw tooLarge;
  }

  const parts = new Map<string, Uint8Array>();

  for (const [name, bytes] of Object.entries(files)) {
    parts.set(partKey(name), bytes);
  }

  return parts;
}

function decode(name: string, bytes: Uint8Array): string {
  let text: string;

  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw corrupted(`Invalid UTF-8 text in ${name}.`);
  }

  if (text.includes("<!DOCTYPE")) {
    throw corrupted(`DOCTYPE not allowed in ${name}.`);
  }

  return text;
}

type TagHandler = (tag: string, attrs: Record<string, string> | undefined) => void;

/**
 * Reads an XML part; every tag is given to the handler, then dropped.
 * Throws MF_003 when the XML is invalid.
 */
function readXml(
  name: string,
  text: string,
  handler: TagHandler,
  onProgress: ParseProgress = () => {},
): void {
  const validation = XMLValidator.validate(text);

  if (validation !== true) {
    throw corrupted(
      `Invalid XML in ${name}: ${validation.err.msg} (line ${validation.err.line}).`,
    );
  }

  onProgress(VALIDATION_SHARE);

  // Estimated number of tags, for the progress
  let estimated = 0;
  for (let i = text.indexOf("<"); i !== -1; i = text.indexOf("<", i + 1)) {
    estimated += 1;
  }

  let seen = 0;

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    // Prefixes are removed below: faster than removeNSPrefix
    removeNSPrefix: false,
    parseAttributeValue: false,
    parseTagValue: false,
    processEntities: false,
    ignoreDeclaration: true,
    ignorePiTags: true,
    jPath: false,
    updateTag: (tag, _matcher, attrs) => {
      const colon = tag.indexOf(":");
      handler(colon === -1 ? tag : tag.slice(colon + 1), attrs);
      seen += 1;

      if (seen % PROGRESS_TAGS === 0) {
        onProgress(
          VALIDATION_SHARE +
            (1 - VALIDATION_SHARE) * Math.min(seen / Math.max(estimated, 1), 1),
        );
      }

      // The tag is not kept: no XML tree in memory
      return false;
    },
  });

  try {
    parser.parse(text);
  } catch (error) {
    if (error instanceof ImportError) {
      throw error;
    }

    throw corrupted(
      `Invalid XML in ${name}: ${error instanceof Error ? error.message : String(error)}.`,
    );
  }

  onProgress(1);
}

function findRootModel(parts: Map<string, Uint8Array>): string {
  const rels = parts.get(partKey("_rels/.rels"));

  if (!rels) {
    throw new ImportError("MF_002", "Missing part _rels/.rels.");
  }

  let target: string | undefined;

  readXml("_rels/.rels", decode("_rels/.rels", rels), (tag, attrs) => {
    if (
      tag === "Relationship" &&
      attrs?.Type === MODEL_RELATIONSHIP &&
      target === undefined
    ) {
      target = attrs.Target;
    }
  });

  if (!target) {
    throw new ImportError("MF_002", "No 3D model relationship in _rels/.rels.");
  }

  if (!parts.has(partKey(target))) {
    throw new ImportError("MF_002", `Root model part not found: ${target}.`);
  }

  return partKey(target);
}

/** Growable typed arrays */
class FloatList {
  data = new Float32Array(3 * 1024);
  length = 0;

  push3(a: number, b: number, c: number): void {
    if (this.length + 3 > this.data.length) {
      const next = new Float32Array(this.data.length * 2);
      next.set(this.data);
      this.data = next;
    }

    this.data[this.length] = a;
    this.data[this.length + 1] = b;
    this.data[this.length + 2] = c;
    this.length += 3;
  }
}

class IndexList {
  data = new Uint32Array(3 * 1024);
  length = 0;

  push3(a: number, b: number, c: number): void {
    if (this.length + 3 > this.data.length) {
      const next = new Uint32Array(this.data.length * 2);
      next.set(this.data);
      this.data = next;
    }

    this.data[this.length] = a;
    this.data[this.length + 1] = b;
    this.data[this.length + 2] = c;
    this.length += 3;
  }
}

/** Attribute of an extension (any prefix, for example p:path) */
function extensionAttribute(
  attrs: Record<string, string> | undefined,
  name: string,
): string | undefined {
  if (!attrs) {
    return undefined;
  }

  const key = Object.keys(attrs).find((attr) => attr.endsWith(`:${name}`));

  return key === undefined ? undefined : attrs[key];
}

function toNumber(value: string | undefined, what: string): number {
  const number = value === undefined ? NaN : Number(value);

  if (value === undefined || value.trim() === "" || !Number.isFinite(number)) {
    throw corrupted(`Invalid ${what}: ${value ?? "(missing)"}.`);
  }

  return number;
}

function toIndex(value: string | undefined): number {
  const index = value === undefined ? NaN : Number(value);

  if (!Number.isInteger(index) || index < 0) {
    throw corrupted(`Invalid vertex index: ${value ?? "(missing)"}.`);
  }

  return index;
}

function parseTransform(value: string | undefined): Matrix {
  if (value === undefined) {
    return IDENTITY;
  }

  const values = value.trim().split(/\s+/).map(Number);

  if (values.length !== 12 || !values.every(Number.isFinite)) {
    throw corrupted(`Invalid transform: ${value}.`);
  }

  return values;
}

function parseModelPart(
  name: string,
  bytes: Uint8Array,
  onProgress: ParseProgress,
): ModelPart {
  const model: ModelPart = {
    unit: "millimeter",
    objects: new Map(),
    build: [],
  };

  let modelFound = false;
  let vertices = new FloatList();
  let triangles = new IndexList();
  let components: Reference[] = [];

  /** Object being read: its tags follow its opening tag */
  let current: { id: string; type: string } | undefined;

  const finishObject = (): void => {
    if (!current) {
      return;
    }

    const { id, type } = current;
    const vertexCount = vertices.length / 3;
    let mesh: MeshData | undefined;

    if (vertices.length > 0 || triangles.length > 0) {
      for (let i = 0; i < triangles.length; i += 1) {
        if (triangles.data[i] >= vertexCount) {
          throw corrupted(
            `Object ${id}: vertex index ${triangles.data[i]} out of range.`,
          );
        }
      }

      mesh = {
        vertices: vertices.data,
        vertexCount,
        triangles: triangles.data,
        triangleCount: triangles.length / 3,
      };
    }

    model.objects.set(id, { type, mesh, components });

    current = undefined;
    vertices = new FloatList();
    triangles = new IndexList();
    components = [];
  };

  readXml(
    name,
    decode(name, bytes),
    (tag, attrs) => {
      switch (tag) {
        case "vertex":
          if (!current) {
            throw corrupted(`Vertex outside an object in ${name}.`);
          }

          vertices.push3(
            toNumber(attrs?.x, "vertex x"),
            toNumber(attrs?.y, "vertex y"),
            toNumber(attrs?.z, "vertex z"),
          );
          break;

        case "triangle":
          if (!current) {
            throw corrupted(`Triangle outside an object in ${name}.`);
          }

          triangles.push3(
            toIndex(attrs?.v1),
            toIndex(attrs?.v2),
            toIndex(attrs?.v3),
          );
          break;

        case "component":
          if (!current) {
            throw corrupted(`Component outside an object in ${name}.`);
          }

          components.push({
            objectId: attrs?.objectid ?? "",
            path: extensionAttribute(attrs, "path"),
            transform: parseTransform(attrs?.transform),
          });
          break;

        case "object": {
          finishObject();

          const id = attrs?.id;

          if (!id) {
            throw corrupted(`Object without id in ${name}.`);
          }

          if (model.objects.has(id)) {
            throw corrupted(`Duplicate object id ${id} in ${name}.`);
          }

          current = { id, type: attrs?.type ?? "model" };
          break;
        }

        case "build":
          finishObject();
          break;

        case "item":
          model.build.push({
            objectId: attrs?.objectid ?? "",
            path: extensionAttribute(attrs, "path"),
            transform: parseTransform(attrs?.transform),
          });
          break;

        case "model":
          modelFound = true;
          model.unit = attrs?.unit ?? "millimeter";
          break;

        default:
          break;
      }
    },
    onProgress,
  );

  finishObject();

  if (!modelFound) {
    throw corrupted(`No model element in ${name}.`);
  }

  return model;
}

type ModelGetter = (name: string) => ModelPart;

function resolve(
  model: ModelPart,
  objectId: string,
  partName: string,
): ObjectDefinition {
  const object = model.objects.get(objectId);

  if (!object) {
    throw corrupted(`Object ${objectId} not found in ${partName}.`);
  }

  return object;
}

/** Triangles produced by an object, with its components */
function countTriangles(
  model: ModelPart,
  objectId: string,
  partName: string,
  getModel: ModelGetter,
  stack: string[],
): number {
  const key = `${partName}#${objectId}`;

  if (stack.includes(key)) {
    throw corrupted(`Component cycle at object ${objectId}.`);
  }

  if (stack.length >= MAX_COMPONENT_DEPTH) {
    throw corrupted("Components nested too deeply.");
  }

  const object = resolve(model, objectId, partName);

  if (object.type === "other") {
    return 0;
  }

  let count = object.mesh?.triangleCount ?? 0;

  for (const component of object.components) {
    const componentPart = component.path ? partKey(component.path) : partName;
    count += countTriangles(
      getModel(componentPart),
      component.objectId,
      componentPart,
      getModel,
      [...stack, key],
    );

    if (count > MAX_TRIANGLES) {
      throw new ImportError(
        "MF_TOO_LARGE",
        `The model produces more than ${MAX_TRIANGLES} triangles.`,
      );
    }
  }

  return count;
}

/** Writes the triangles of an object (and its components) with a transform */
function emitObject(
  partName: string,
  objectId: string,
  matrix: Matrix,
  getModel: ModelGetter,
  collector: TriangleCollector,
  counter: { vertices: number },
): void {
  const object = resolve(getModel(partName), objectId, partName);

  if (object.type === "other") {
    return;
  }

  if (object.mesh) {
    emitMesh(object.mesh, matrix, collector);
    counter.vertices += object.mesh.vertexCount;
  }

  for (const component of object.components) {
    emitObject(
      component.path ? partKey(component.path) : partName,
      component.objectId,
      multiply(component.transform, matrix),
      getModel,
      collector,
      counter,
    );
  }
}

function emitMesh(
  mesh: MeshData,
  m: Matrix,
  collector: TriangleCollector,
): void {
  // A mirror transform reverses the winding: keep normals outward
  const determinant =
    m[0] * (m[4] * m[8] - m[5] * m[7]) -
    m[1] * (m[3] * m[8] - m[5] * m[6]) +
    m[2] * (m[3] * m[7] - m[4] * m[6]);
  const mirrored = determinant < 0;
  const v = mesh.vertices;
  const t = mesh.triangles;
  const triangle = new Array<number>(9);

  for (let i = 0; i < mesh.triangleCount; i += 1) {
    for (let k = 0; k < 3; k += 1) {
      const corner = mirrored && k > 0 ? 3 - k : k;
      const index = t[i * 3 + corner] * 3;
      const x = v[index];
      const y = v[index + 1];
      const z = v[index + 2];

      triangle[k * 3] = x * m[0] + y * m[3] + z * m[6] + m[9];
      triangle[k * 3 + 1] = x * m[1] + y * m[4] + z * m[7] + m[10];
      triangle[k * 3 + 2] = x * m[2] + y * m[5] + z * m[8] + m[11];
    }

    collector.add(triangle);
  }
}

/** Transform a, then transform b (row vectors: p x a x b) */
function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
    a[9] * b[0] + a[10] * b[3] + a[11] * b[6] + b[9],
    a[9] * b[1] + a[10] * b[4] + a[11] * b[7] + b[10],
    a[9] * b[2] + a[10] * b[5] + a[11] * b[8] + b[11],
  ];
}

function scaleMatrix(scale: number): Matrix {
  return [scale, 0, 0, 0, scale, 0, 0, 0, scale, 0, 0, 0];
}
