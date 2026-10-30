/**
 * SlicyWeb
 * Material Families
 *
 * Names of the materials of a printer (supportedMaterials, the words of
 * the page of its manufacturer) compared with the families of the
 * Material Database, with the aliases of MATERIAL_PROFILE_SPEC.md:
 * Flex is TPU, NYLON (and Nylon) is PA; a family name is its own family;
 * any other word (CPE, nGen, PVB, BVOH…) has no family and is not
 * compared. Case is ignored.
 *
 * A family not listed by a printer that lists materials gives a warning,
 * never a block; a printer that lists no material gives no warning
 * (ADR-033, D5).
 *
 * No file access: used by the renderer.
 *
 * Based on:
 * - MATERIAL_PROFILE_SPEC.md (Material Families 2.0.0, aliases)
 * - DECISIONS.md (ADR-033, D5)
 * - GUI_SPEC.md (Material Section)
 */

import { MATERIAL_FAMILIES } from "../schemas/MaterialSchema";

/** Words of the manufacturers that name a family by another name */
const ALIASES: Record<string, string> = {
  FLEX: "TPU",
  NYLON: "PA",
};

/**
 * Family named by a word of a manufacturer, or null when the word names
 * no family.
 */
export function familyOf(word: string): string | null {
  const name = word.trim().toUpperCase();

  if ((MATERIAL_FAMILIES as readonly string[]).includes(name)) {
    return name;
  }

  return ALIASES[name] ?? null;
}

/**
 * True when the printer lists materials and none of them is the family:
 * the Material section then shows "Not listed by the printer
 * manufacturer".
 */
export function isFamilyNotListed(
  supportedMaterials: string[],
  family: string,
): boolean {
  if (supportedMaterials.length === 0) {
    return false;
  }

  return !supportedMaterials.some((word) => familyOf(word) === family);
}
