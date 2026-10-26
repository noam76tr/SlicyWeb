# Printer Profile Sources

Sources of the printer profiles of data/printers/ (DECISIONS.md, ADR-032).

Rules:

- Every value comes from a page of the manufacturer (product page, technical specifications, official store, wiki, help center, blog or user manual). No value is copied from a profile file of a slicer, even when the value is the same (ADR-032, D2).
- A number of motion or thermal that the manufacturer does not publish is null (unknown), never guessed (DATA_SCHEMA.md 3.5.0).
- Fans: true when a page of the manufacturer names the fan; false when no page of the manufacturer names it.
- extruder.type: direct_drive or bowden when a page of the manufacturer says so; otherwise unknown.
- supportedNozzles: the diameters published by the manufacturer for this printer; [0.4] when only the default nozzle is published.
- Speed: a "max speed of the tool head" is the limit of every move, and gives maxPrintSpeed and maxTravelSpeed. A "printing speed" gives maxPrintSpeed only.
- Bed temperature: when the manufacturer gives two values by mains voltage, the lower one (valid on every voltage) is kept.
- supportedMaterials: the material names of the manufacturer, as written (PLA, PETG, Flex, PA-CF...), "ideal" and "capable" lists together; materials that the manufacturer marks "not recommended", or that need an option (enclosure, other hotend), are left out. The names are matched with the Material Database in Phase 8.
- supportedFilaments: empty (filament products, Phase 9).
- firmware and releaseDate: written only when a page of the manufacturer states them; otherwise "".

All the pages below were read on 2026-10-26.

---

## Bambu Lab X1 Carbon (bambu_x1c.json)

- https://bambulab-us.myshopify.com/products/x1-carbon (official Bambu Lab US store, X1C Tech Specs): build volume 256 × 256 × 256 mm; max hot end temperature 300 °C; max build plate temperature 110 °C at 220 V, 120 °C at 110 V (110 kept); max speed of tool head 500 mm/s; max acceleration of tool head 20 m/s² (20000 mm/s²); 0.4 mm nozzle included; supported filament PLA, PETG, TPU, ABS, ASA, PVA, PET, ideal for PA, PC
- https://us.store.bambulab.com/products/bambu-hotend-x1c: hotend of the X1 series with 0.2, 0.4, 0.6 and 0.8 mm nozzles
- https://wiki.bambulab.com/en/x1/manual/intro-x1: part cooling fan (5015 radial fan), auxiliary cooling fan on the left side (X1-Carbon), chamber temperature control fan
- null: maxJerk, maxChamberTemp (no value published)
- extruder.type unknown (not stated)

## Bambu Lab P1S (bambu_p1s.json)

- https://bambulab-us.myshopify.com/products/p1s (official Bambu Lab US store, Parameters Comparison, P1S column): build volume 256 × 256 × 256 mm; max hot end temperature 300 °C; nozzle 0.4 mm included, 0.2, 0.6, 0.8 mm optional; max build plate temperature 100 °C; max speed of tool head 500 mm/s; max acceleration of tool head 20 m/s²; auxiliary part cooling fan and chamber temperature regulator fan (closed loop control); supported filament ideal PLA, PETG, TPU, PVA, PET, ABS, ASA, capable PA, PC
- partFan: the page names the "Auxiliary Part Cooling Fan" (in addition to the part cooling of the tool head); no page read names the main part cooling fan of the P1S separately
- null: maxJerk, maxChamberTemp
- extruder.type unknown (not stated)

## Bambu Lab A1 (bambu_a1.json)

- https://bambulab.com/en/a1/tech-specs: build volume 256 × 256 × 256 mm; max hot end temperature 300 °C; nozzle 0.4 mm included, 0.2, 0.6, 0.8 mm optional; max build plate temperature 100 °C; max speed of tool head 500 mm/s; max acceleration 10000 mm/s²; part cooling fan and hot end fan (closed loop control); ideal PLA, PETG, TPU, PVA (ABS, ASA, PC, PA, PET and fiber reinforced polymers not recommended)
- null: maxJerk, maxChamberTemp
- extruder.type unknown (not stated)

## Bambu Lab A1 mini (bambu_a1_mini.json)

- https://bambulab-us.myshopify.com/products/a1-mini (official Bambu Lab US store, A1 mini Specification): build volume 180 × 180 × 180 mm; max hot end temperature 300 °C; nozzle 0.4 mm included, 0.2, 0.6, 0.8 mm; max build plate temperature 80 °C; max speed of tool head 500 mm/s; max acceleration of tool head 10000 mm/s²; supported filament PLA, PETG, TPU, PVA (ABS, ASA, PC, PA, PET ideal on other printers; fiber reinforced polymers not recommended)
- https://wiki.bambulab.com/en/a1-mini/maintenance/part-cooling-fan: part cooling fan of the A1 mini
- null: maxJerk, maxChamberTemp
- extruder.type unknown (not stated)

## Prusa MK4S (prusa_mk4s.json)

- https://www.prusa3d.com/product/original-prusa-mk4s-3d-printer-5/ (Technical Parameters): build volume 250 × 210 × 220 mm; nozzle High-flow Prusa Nozzle brass CHT 0.4 mm; max nozzle temperature 290 °C; max heatbed temperature 120 °C; extruder Nextruder, Direct Drive; cooling high-performance turbine, 360° cooling; materials PLA, PETG, Flex, PVA, PC, PP, CPE, PVB (ABS, ASA, HIPS, PA with the enclosure: left out)
- null: maxPrintSpeed, maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp (not published)
- supportedNozzles [0.4]: other diameters are not listed in the technical parameters

## Prusa CORE One+ (prusa_core_one_plus.json)

- https://www.prusa3d.com/en/produkt/prusa-core-one-kit/ (Technical Parameters, CORE One+ Gen 2): build volume 250 × 220 × 270 mm; nozzle 0.4 mm high-flow brass CHT; max nozzle temperature 290 °C; max heatbed temperature 120 °C; max chamber temperature 55 °C; extruder Nextruder, direct drive; cooling high-performance turbine, 360° cooling
- https://www.prusa3d.com/p/prusa-core-one-for-makers/: materials supported PLA, PETG, Flex, PVA, PC, PP, CPE, PVB, advanced ABS, ASA, HIPS, PA
- https://blog.prusa3d.com/introducing-prusa-core-one-fully-enclosed-corexy-3d-printer-with-active-temperature-control_105477/ (2024-11-19, CORE One): dual fans for active chamber temperature control (chamberFan)
- null: maxPrintSpeed, maxTravelSpeed, maxAcceleration, maxJerk

## Prusa MINI+ (prusa_mini_plus.json)

- https://www.prusa3d.com/product/original-prusa-mini-semi-assembled-3d-printer-9/ (Technical Parameters): build volume 180 × 180 × 180 mm; nozzle 0.4 mm default; max nozzle temperature 280 °C; max heatbed temperature 100 °C; extruder Bowden; materials PLA, PETG, ASA, ABS, PC, CPE, PVA/BVOH, PVB, HIPS, PP, Flex, nGen, PA
- https://help.prusa3d.com/fr/guide/comment-remplacer-un-ventilateur-dimpression-mini_118310: print fan (part cooling fan) of the MINI
- null: maxPrintSpeed, maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp

## Creality K1C (creality_k1c.json)

- https://www.creality.com/products/k1c-carbon-3d-printer (Specifications): build volume 220 × 220 × 250 mm; printing speed ≤ 600 mm/s; acceleration ≤ 20000 mm/s²; extruder dual-gear direct drive; nozzle diameter 0.4 mm; nozzle temperature ≤ 300 °C; heatbed temperature ≤ 100 °C; supported filaments ABS, PLA, PETG, PET, TPU, PA, ASA, PC, PLA-CF, PA-CF, PET-CF; fans: hotend fan, part cooling fan, auxiliary fan on the side of the chamber; "Open-source Creality OS Based on Klipper"
- null: maxTravelSpeed, maxJerk, maxChamberTemp

## Creality Ender-3 V3 SE (creality_ender3_v3_se.json)

- https://www.creality.com/compare/compare-ender-3-v3-series (Ender-3 V3 SE): build volume 220 × 220 × 250 mm; max printing speed 250 mm/s; acceleration 2500 mm/s²; nozzle temperature up to 260 °C; Sprite direct drive extruder; firmware Marlin
- https://www.creality.com/support/creality-ender-3-v3-se (Specs): nozzle diameter 0.4 mm; heatbed temperature 100 °C; extruder direct; supported filaments PLA, TPU95A, PETG
- https://store.creality.com/blogs/all/ender-3-v3-se-troubleshooting: model fan (part cooling fan)
- null: maxTravelSpeed, maxJerk, maxChamberTemp

## Elegoo Neptune 4 Pro (elegoo_neptune4_pro.json)

- https://download.elegoo.com/06%20FDM%20Printer/02%20ELEGOO%20Neptune%20Series%20Files/Neptune%204%20Pro/3.%20User's%20Guide/1.User%20Manual/V1.5-2/NEPTUNE%204%20RPO%20User%20Manual-English-V1.5.pdf (user manual V1.5, technical specifications): maximum build volume 225 × 225 × 265 mm; print speed 30 to 500 mm/s; nozzle diameter 0.4 mm; maximum temperature of nozzle 300 °C; maximum temperature of hotbed 110 °C; model fan; rear cooling fan (auxiliary fan)
- https://eu.elegoo.com/en-es/products/elegoo-neptune-4-pro-fdm-3d-printer: dual-gear direct extruder
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- supportedMaterials empty: no list of materials published on the pages read
