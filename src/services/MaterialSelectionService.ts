/**
 * SlicyWeb
 * Material Selection Service
 *
 * Materials and filaments of the window (renderer, Phase 8 lot 70):
 * - load(): reads the materials and filaments loaded by the main process
 *   (material:getAll, filament:getAll), validates them with
 *   MaterialSchema and FilamentSchema and puts them in the material and
 *   filament stores; then reads the material settings (settings:get).
 *   When autoloadLastMaterial is true, defaultMaterial and
 *   defaultFilament are selected again when they are still loaded; an id
 *   no longer loaded is ignored (DATA_SCHEMA.md 3.7.0, User Preferences
 *   Schema). A filament of another family than the material is ignored.
 * - selectMaterial(): selects a material (a family) or none. The selected
 *   filament is kept only when it belongs to the new family.
 * - selectFilament(): selects a filament or none; a filament also selects
 *   its family (ADR-033, D9).
 * Each choice is saved as the last choice (settings:update,
 * material.defaultMaterial and material.defaultFilament).
 *
 * The window never reads a profile file: materials and filaments come
 * only through the material:* and filament:* channels (ADR-033, D6).
 * Outside Electron (no window.slicyWeb), nothing is loaded or saved.
 *
 * Domain: Service. Depends on State Management and on the IPC bridge
 * (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DECISIONS.md (ADR-033, D6, D9)
 * - API_SPEC.md (MaterialIPC Channels, FilamentIPC Channels, SettingsIPC
 *   Channels)
 * - DATA_SCHEMA.md (Complete Material Schema, Filament Schema, User
 *   Preferences Schema 3.7.0)
 * - USER_SETTINGS_SPEC.md (Material Settings)
 */

import { z } from "zod";

import { FilamentSchema } from "../schemas/FilamentSchema";
import { MATERIAL_FAMILIES, MaterialSchema } from "../schemas/MaterialSchema";
import { MaterialPreferencesSchema } from "../schemas/UserPreferencesSchema";
import { useFilamentStore } from "../state/filamentStore";
import { useMaterialStore } from "../state/materialStore";
import type { Filament } from "../types/Filament";
import type { Material } from "../types/Material";
import type { MaterialPreferences } from "../types/UserPreferences";

type Bridge = Pick<Window["slicyWeb"], "invoke">;

const MaterialsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ materials: z.array(MaterialSchema) }),
});

const FilamentsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    filaments: z.array(FilamentSchema),
    userFilamentIds: z.array(z.string()).default([]),
  }),
});

const SettingsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    settings: z.object({ material: MaterialPreferencesSchema }),
  }),
});

function getBridge(): Bridge | null {
  return typeof globalThis.window?.slicyWeb?.invoke === "function"
    ? globalThis.window.slicyWeb
    : null;
}

async function readMaterialSettings(
  bridge: Bridge,
): Promise<MaterialPreferences | null> {
  const result = SettingsResponseSchema.safeParse(
    await bridge.invoke("settings:get"),
  );

  return result.success ? result.data.data.settings.material : null;
}

/**
 * Saves the last choice (settings:update). material is replaced as a
 * whole: autoloadLastMaterial keeps its saved value.
 */
async function saveSelection(
  bridge: Bridge,
  material: Material | null,
  filament: Filament | null,
): Promise<void> {
  try {
    const settings = await readMaterialSettings(bridge);
    const response = (await bridge.invoke("settings:update", {
      material: {
        defaultMaterial: material?.id ?? null,
        defaultFilament: filament?.id ?? null,
        autoloadLastMaterial: settings?.autoloadLastMaterial ?? true,
      },
    })) as { success?: boolean; errors?: unknown };

    if (response.success !== true) {
      console.error("Material settings could not be saved.", response.errors);
    }
  } catch (error) {
    console.error("Material settings could not be saved.", error);
  }
}

/**
 * Materials in the order of the reference list of the families
 * (MATERIAL_PROFILE_SPEC.md, Material Families: PLA, PETG, ABS…)
 */
function sortMaterials(materials: Material[]): Material[] {
  const rank = (material: Material): number =>
    (MATERIAL_FAMILIES as readonly string[]).indexOf(material.category);

  return [...materials].sort((a, b) => rank(a) - rank(b));
}

/** Filaments sorted by brand, then by name */
function sortFilaments(filaments: Filament[]): Filament[] {
  return [...filaments].sort(
    (a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name),
  );
}

/** Material of a family, among the loaded materials */
function materialOfFamily(family: string): Material | null {
  return (
    useMaterialStore
      .getState()
      .materials.find((material) => material.category === family) ?? null
  );
}

/** Selects a material and a filament, and saves them */
async function selectBoth(
  material: Material | null,
  filament: Filament | null,
): Promise<void> {
  useMaterialStore.getState().setSelectedMaterial(material);
  useFilamentStore.getState().setSelectedFilament(filament);

  const bridge = getBridge();

  if (bridge) {
    await saveSelection(bridge, material, filament);
  }
}

export const MaterialSelectionService = {
  async load(): Promise<void> {
    const bridge = getBridge();

    if (!bridge) {
      return;
    }

    try {
      const materials = MaterialsResponseSchema.safeParse(
        await bridge.invoke("material:getAll"),
      );
      const filaments = FilamentsResponseSchema.safeParse(
        await bridge.invoke("filament:getAll"),
      );

      if (!materials.success || !filaments.success) {
        console.error(
          "Materials could not be read.",
          materials.error?.issues ?? filaments.error?.issues,
        );
        return;
      }

      const materialStore = useMaterialStore.getState();
      const filamentStore = useFilamentStore.getState();
      materialStore.setMaterials(sortMaterials(materials.data.data.materials));
      filamentStore.setFilaments(sortFilaments(filaments.data.data.filaments));
      filamentStore.setUserFilamentIds(filaments.data.data.userFilamentIds);

      const settings = await readMaterialSettings(bridge);

      if (!settings?.autoloadLastMaterial) {
        return;
      }

      const material =
        useMaterialStore
          .getState()
          .materials.find((item) => item.id === settings.defaultMaterial) ??
        null;
      const filament =
        useFilamentStore
          .getState()
          .filaments.find((item) => item.id === settings.defaultFilament) ??
        null;

      materialStore.setSelectedMaterial(material);
      filamentStore.setSelectedFilament(
        filament && material && filament.material === material.category
          ? filament
          : null,
      );
    } catch (error) {
      console.error("Materials could not be read.", error);
    }
  },

  /**
   * Selects a material (a family) or none. The filament is kept only when
   * it belongs to this family.
   */
  async selectMaterial(materialId: string | null): Promise<void> {
    const material =
      materialId === null
        ? null
        : (useMaterialStore
            .getState()
            .materials.find((item) => item.id === materialId) ?? null);

    if (materialId !== null && !material) {
      return;
    }

    const filament = useFilamentStore.getState().selectedFilament;

    await selectBoth(
      material,
      filament && material && filament.material === material.category
        ? filament
        : null,
    );
  },

  /**
   * Selects a filament or none. A filament also selects its family; no
   * filament keeps the material.
   */
  async selectFilament(filamentId: string | null): Promise<void> {
    const material = useMaterialStore.getState().selectedMaterial;

    if (filamentId === null) {
      await selectBoth(material, null);
      return;
    }

    const filament = useFilamentStore
      .getState()
      .filaments.find((item) => item.id === filamentId);

    if (!filament) {
      return;
    }

    await selectBoth(materialOfFamily(filament.material), filament);
  },
};

export default MaterialSelectionService;
