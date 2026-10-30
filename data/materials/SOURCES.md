# Material Profile Sources

Sources of the material profiles of data/materials/ (DECISIONS.md, ADR-033, D2).

Rules:

- A shipped material is a family (MATERIAL_PROFILE_SPEC.md, Material Families). Its values come from the shipped filaments of the family (data/filaments/, sources in data/filaments/SOURCES.md), never from a profile file of a slicer.
- temperature: the smallest minimum and the largest maximum of the ranges of the filaments of the family.
- density: the value of the filaments of the family when they all publish the same value; null when they differ.
- cooling, shrinkage, warpingRisk and recommended: null. The Filament Schema has no field for them (fan speed of a filament is a single value of the manufacturer, not a range of the family), so no value of the family is computed from the filaments.
- brand and description: not written (a family has no brand).
- A family without a shipped filament is not shipped (PA, PC and the others of the list).

Computed on 2026-10-30.

---

## PLA (pla.json)

- Filaments: bambu_pla_basic, bambu_pla_matte, prusament_pla, polymaker_polylite_pla, esun_pla_plus
- Nozzle 190 - 230 °C (190: Bambu Lab, Polymaker; 230: Bambu Lab, Polymaker, eSUN); bed 25 - 60 °C (25: Polymaker; 60: Prusament, Polymaker, eSUN)
- density null (1.24, 1.31 and 1.17 g/cm³)

## PETG (petg.json)

- Filaments: bambu_petg_hf, prusament_petg, polymaker_polylite_petg
- Nozzle 230 - 260 °C (230: Bambu Lab, Polymaker; 260: all three); bed 65 - 90 °C (65: Bambu Lab; 90: Prusament)
- density null (1.28, 1.27 and 1.25 g/cm³)

## ABS (abs.json)

- Filament: bambu_abs
- Nozzle 240 - 270 °C; bed 80 - 100 °C; density 1.05 g/cm³

## ASA (asa.json)

- Filament: prusament_asa
- Nozzle 250 - 270 °C; bed 105 - 115 °C; density 1.07 g/cm³

## TPU (tpu.json)

- Filament: bambu_tpu_95a_hf
- Nozzle 220 - 240 °C; bed 30 - 35 °C; density 1.22 g/cm³
