/**
 * SlicyWeb
 * 3MF Object Names Tests
 *
 * KI-020 (lot 111, decision 119 of Noam, Q21 A): the name of the object
 * of each build item of a 3MF file (attribute name) becomes the name of
 * the object at import, as a name given by the user (trimmed, 100
 * characters at most); without a name, the name is made from the file
 * name. Entities of XML are decoded.
 *
 * Based on:
 * - IMPORT_EXPORT_SPEC.md 3.2.0 (3MF Import, Object Naming)
 * - TEST_PLAN.md (Project Persistence)
 */

import { strToU8, zipSync } from "fflate";
import { beforeEach, describe, expect, it } from "vitest";

import { parse3mf, xmlText } from "../../../src/importer/ThreeMFParser";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import {
  registerImportedObjects,
  type ImportedMesh,
} from "../../../src/scene/SceneIntegration";
import { useObjectStore } from "../../../src/state/objectStore";

/** A 3MF file: one box of 10 mm per name (undefined: no attribute) */
function threeMf(names: (string | undefined)[]): ArrayBuffer {
  const vertices = [
    [0, 0, 0],
    [10, 0, 0],
    [10, 10, 0],
    [0, 10, 0],
    [0, 0, 10],
    [10, 0, 10],
    [10, 10, 10],
    [0, 10, 10],
  ]
    .map(([x, y, z]) => `<vertex x="${x}" y="${y}" z="${z}"/>`)
    .join("");
  const triangles = [
    [0, 2, 1],
    [0, 3, 2],
    [4, 5, 6],
    [4, 6, 7],
    [0, 1, 5],
    [0, 5, 4],
    [1, 2, 6],
    [1, 6, 5],
    [2, 3, 7],
    [2, 7, 6],
    [3, 0, 4],
    [3, 4, 7],
  ]
    .map(([a, b, c]) => `<triangle v1="${a}" v2="${b}" v3="${c}"/>`)
    .join("");
  const objects = names
    .map(
      (name, index) =>
        `<object id="${index + 1}" type="model"${
          name === undefined ? "" : ` name="${name}"`
        }><mesh><vertices>${vertices}</vertices><triangles>${triangles}</triangles></mesh></object>`,
    )
    .join("");
  const items = names
    .map(
      (_name, index) =>
        `<item objectid="${index + 1}" transform="1 0 0 0 1 0 0 0 1 ${index * 20} 0 0"/>`,
    )
    .join("");
  const zip = zipSync({
    "[Content_Types].xml": strToU8(
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>',
    ),
    "_rels/.rels": strToU8(
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>',
    ),
    "3D/3dmodel.model": strToU8(
      `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources>${objects}</resources><build>${items}</build></model>`,
    ),
  });

  return zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength) as ArrayBuffer;
}

/** The objects of a 3MF file, as the import gives them to the scene */
function meshes(names: (string | undefined)[]): ImportedMesh[] {
  return parse3mf(threeMf(names)).objects.map((object) => ({
    positions: object.positions,
    normals: object.normals,
    triangleCount: object.triangleCount,
    vertexCount: object.vertexCount,
    min: object.min,
    max: object.max,
    volume: object.volume,
    surfaceArea: object.surfaceArea,
    name: object.name,
  }));
}

beforeEach(() => {
  useObjectStore.getState().clearObjects();
  GeometryRegistry.clear();
});

describe("Names of the objects of a 3MF file (KI-020, Q21 A)", () => {
  it("reads the attribute name of each object, null when there is none", () => {
    const objects = parse3mf(threeMf(["Support", undefined, "Base"])).objects;

    expect(objects.map((object) => object.name)).toEqual([
      "Support",
      null,
      "Base",
    ]);
  });

  it("gives the name to the object imported, trimmed and 100 characters at most", () => {
    registerImportedObjects(
      "plateau.3mf",
      "3mf",
      meshes(["  Support  ", undefined, "x".repeat(120), "   ", "plateau.3mf"]),
    );

    expect(useObjectStore.getState().objects.map((object) => object.name)).toEqual([
      "Support",
      null,
      "x".repeat(100),
      null,
      null,
    ]);
  });

  it("decodes the entities of XML and removes the control characters", () => {
    expect(xmlText("Pi&#232;ce &amp; &lt;b&gt; &#x5D0;&quot;")).toBe(
      'Pièce & <b> א"',
    );
    expect(xmlText("a&#9;b")).toBe("ab");
    expect(xmlText("&unknown;")).toBe("&unknown;");

    const [object] = parse3mf(threeMf(["Pi&#232;ce &amp; vis"])).objects;

    expect(object.name).toBe("Pièce & vis");
  });
});
