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

---

# Profiles added in v1.0.1

All the pages below were read on 2026-10-28. The rules above apply, with these additions:

- defaultNozzle and supportedNozzles: when the manufacturer publishes no nozzle diameter, 0.4 and [0.4] are written (the Printer Schema needs a value) and the section of the printer says so.
- buildVolume of a printer with several nozzles or tool heads: the volume of one nozzle (the largest one when the left and right nozzles differ); extruder.count is the number of nozzles or tool heads.
- When two pages of the manufacturer give different values, the lower value is kept and the section of the printer says so.
- TPU grades (TPU95A, TPU-64D...) are written TPU, as in v1.0.0.
- A "short distance extrusion" of Anycubic is direct_drive: the Anycubic pages write "Direct Drive (short distance extrusion)".
- A jerk published in mm/s³ is not the maxJerk of the Printer Schema: maxJerk stays null.
- Pages of an official store of the manufacturer (store.creality.com, store.anycubic.com, ca.anycubic.com, us.store.bambulab.com, au.elegoo.com, us.elegoo.com, biqu.equipment) and blogs and guides of these stores are pages of the manufacturer.


## Anycubic Kobra 2 Max (anycubic_kobra2_max.json)

- https://store.anycubic.com/blogs/3d-printing-guides/anycubic-kobra-2-series-specs-and-features-comparison (official Anycubic store guide, comparison table, Kobra 2 Max): build volume 420 × 420 × 500 mm; max printing speed 500 mm/s; acceleration 10000 mm/s²; extruder direct drive + double gears; nozzle diameter 0.4 mm; max nozzle temperature 260 °C; max hotbed temperature 90 °C; supported filaments PLA/ABS/PETG/TPU
- https://store.anycubic.com/products/kobra-2-max (specifications): printing volume 420 × 420 × 500 mm; printing speed maximum 500 mm/s; acceleration maximum 10,000 mm/s²; nozzle max temperature 260 °C, diameter standard 0.4 mm; hotbed max temperature 90 °C; supporting filaments PLA/ABS/PETG/TPU; firmware solution Kobra OS
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no part cooling, auxiliary or chamber fan named

## Anycubic Kobra 2 Neo (anycubic_kobra2_neo.json)

- https://store.anycubic.com/blogs/3d-printing-guides/anycubic-kobra-2-series-specs-and-features-comparison (official Anycubic store guide, comparison table, Kobra 2 Neo): build volume 220 × 220 × 250 mm; max printing speed 250 mm/s; acceleration 2500 mm/s²; extruder direct drive; nozzle diameter 0.4 mm; max nozzle temperature 260 °C; max hotbed temperature 110 °C; supported filaments PLA/ABS/PETG/TPU
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no part cooling, auxiliary or chamber fan named

## Anycubic Kobra 2 Plus (anycubic_kobra2_plus.json)

- https://store.anycubic.com/blogs/3d-printing-guides/anycubic-kobra-2-series-specs-and-features-comparison (official Anycubic store guide, comparison table, Kobra 2 Plus): build volume 320 × 320 × 400 mm; max printing speed 500 mm/s; acceleration 10000 mm/s²; extruder direct drive + double gears; nozzle diameter 0.4 mm; max nozzle temperature 260 °C; max hotbed temperature 90 °C; supported filaments PLA/ABS/PETG/TPU
- https://store.anycubic.com/products/kobra-2-plus (tech specs): printing speed 500 mm/s (max.); extruder direct extruder + double gears; nozzle ≤ 260 °C, ø 0.4 mm; hotbed temperature ≤ 90 °C; printing material PLA/ABS/PETG/TPU
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no part cooling, auxiliary or chamber fan named

## Anycubic Kobra 2 Pro (anycubic_kobra2_pro.json)

- https://store.anycubic.com/blogs/3d-printing-guides/anycubic-kobra-2-series-specs-and-features-comparison (official Anycubic store guide, comparison table, Kobra 2 Pro): build volume 220 × 220 × 250 mm; max printing speed 500 mm/s; acceleration 20000 mm/s²; extruder direct drive + double gears; nozzle diameter 0.4 mm; max nozzle temperature 260 °C; max hotbed temperature 110 °C; supported filaments PLA/ABS/PETG/TPU
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no part cooling, auxiliary or chamber fan named

## Anycubic Kobra 3 (anycubic_kobra3.json)

- https://store.anycubic.com/products/anycubic-kobra-3 (official Anycubic store, specifications): printing volume 250 × 250 × 260 mm; printing speed recommended 300 mm/s, maximum 600 mm/s; acceleration recommended 10,000 mm/s², maximum 20,000 mm/s²; extrusion type direct drive; nozzle max temperature 300 °C, diameter standard 0.4 mm, expandable to 0.6 / 0.8 mm; hotbed max temperature 110 °C; supporting filaments PLA/PETG/TPU; firmware solution Kobra OS
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Anycubic Kobra 3 Max (anycubic_kobra3_max.json)

- https://store.anycubic.com/products/kobra-3-max (official Anycubic store, specifications): printing volume 420 × 420 × 500 mm; printing speed recommended 300 mm/s, maximum 600 mm/s; acceleration maximum 10,000 mm/s²; extruder type short distance extrusion; nozzle max temperature 300 °C, diameter standard 0.4 mm, expandable to 0.6 / 0.8 mm; hotbed max temperature 90 °C; supporting filaments PLA/PETG/TPU; firmware solution Kobra OS
- extruder.type direct_drive: the page says short distance extrusion, which the Anycubic pages of the Kobra 3 and Kobra X name "Direct Drive (short distance extrusion)"
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Anycubic Kobra 3 V2 (anycubic_kobra3_v2.json)

- https://ca.anycubic.com/products/kobra-3-v2 (official Anycubic store, Canada, specifications): printing volume 255 × 255 × 260 mm; printing speed recommended 300 mm/s, maximum 600 mm/s; acceleration recommended 10,000 mm/s², maximum 20,000 mm/s²; extrusion type direct drive (short distance extrusion); nozzle max temperature 300 °C, diameter standard 0.4 mm, expandable to 0.6 / 0.8 mm; hotbed max temperature 110 °C; supporting filaments PLA/PETG/TPU; firmware Kobra OS
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named in the specifications

## Anycubic Kobra S1 (anycubic_kobra_s1.json)

- https://store.anycubic.com/products/kobra-s1 (official Anycubic store, specifications): printing volume 250 × 250 × 250 mm; printing speed recommended 300 mm/s, maximum 600 mm/s; acceleration recommended 10,000 mm/s², maximum 20,000 mm/s²; extrusion type short distance extrusion; nozzle max temperature 320 °C, diameter standard 0.4 mm, expandable to 0.25 / 0.6 / 0.8 mm; hotbed max temperature 120 °C; supporting filaments PLA, PETG, TPU, ABS, ASA; firmware solution Kobra OS
- extruder.type direct_drive: the page says short distance extrusion, which the Anycubic pages of the Kobra 3 and Kobra X name "Direct Drive (short distance extrusion)"
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Anycubic Kobra S1 Max (anycubic_kobra_s1_max.json)

- https://store.anycubic.com/products/kobra-s1-max-combo (official Anycubic store, specifications): printing volume 350 × 350 × 350 mm; printing speed recommended 300 mm/s, maximum 600 mm/s; acceleration recommended 10,000 mm/s², maximum 20,000 mm/s²; extrusion type short distance extrusion, hardened steel extrusion gears; nozzle max temperature 350 °C, diameter standard 0.4 mm, expandable to 0.25 / 0.6 / 0.8 mm; hotbed max temperature 120 °C; supporting filaments PLA, PETG, TPU (95A), PET, PLA-CF, PETG-CF, PVA, ABS, ASA, PC, PA, PA6-CF, PC-CF / GF, PET-CF; firmware solution Kobra OS
- extruder.type direct_drive: the page says short distance extrusion, which the Anycubic pages of the Kobra 3 and Kobra X name "Direct Drive (short distance extrusion)"
- supportedMaterials: "PC-CF / GF" is written as PC-CF and PC-GF
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Anycubic Kobra X (anycubic_kobra_x.json)

- https://store.anycubic.com/products/kobra-x (official Anycubic store, specifications): printing volume 260 × 260 × 260 mm; printing speed recommended 300 mm/s, maximum 600 mm/s; acceleration recommended 10,000 mm/s², maximum 20,000 mm/s²; extrusion type direct drive (short distance extrusion); nozzle max temperature 300 °C, diameter standard 0.4 mm, expandable to 0.25 / 0.6 / 0.8 mm; hotbed max temperature 100 °C; supporting filaments PLA / PETG / TPU / PVA / PLA-CF / PETG-CF / ASA; firmware solution Kobra OS
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Artillery Sidewinder X4 Plus (artillery_sidewinder_x4_plus.json)

- https://www.artillery3d.com/products/sidewinder-x4-plus (specifications): build volume 300 × 300 × 400 mm; max printing speed 500 mm/s; max acceleration 10000 mm/s² (the highlights say 12,000 mm/s²); extruder all metal dual gear direct drive; nozzle temp ≤ 300 °C; hotbed temp ≤ 100 °C; support filament PLA/TPU/PETG/ABS/PET/Carbon; Klipper firmware (description)
- maxAcceleration: the specifications table (10000 mm/s²) and the highlights (12,000 mm/s²) differ; the lower value is kept
- defaultNozzle 0.4 and supportedNozzles [0.4]: no nozzle diameter is published in the specifications (the schema needs a value)
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named in the specifications

## Artillery Sidewinder X4 Pro (artillery_sidewinder_x4_pro.json)

- https://www.artillery3d.com/products/sidewinder-x4-pro (specifications): printing size 240 × 240 × 260 mm; max printing speed 500 mm/s; acceleration 12000 mm/s²; dual-gear direct extruder; max nozzle temperature 300 °C; max hotbed temperature 100 °C; filament compatibility PLA/TPU/PETG/ABS/Nylon; motherboard quiet Klipper firmware
- defaultNozzle 0.4 and supportedNozzles [0.4]: no nozzle diameter is published in the specifications (the schema needs a value)
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named in the specifications

## Bambu Lab H2C (bambu_h2c.json)

- https://bambulab.com/en/h2c/specs (Technical Specifications): build volume single nozzle printing 325 × 320 × 320 mm (left), 305 × 320 × 325 mm (right), dual nozzle printing 300 × 320 × 320 mm, total volume for two nozzles 330 × 320 × 320 mm; max nozzle temperature 350 °C; supported nozzle diameter 0.2, 0.4, 0.6, 0.8 mm; max heatbed temperature 120 °C; max speed of toolhead 1000 mm/s; max acceleration of toolhead 20,000 mm/s²; active chamber heating, max temperature 65 °C; part cooling fan, auxiliary part cooling fan, chamber exhaust fan, chamber heat circulation fan (closed loop control); materials PLA, PETG, TPU, PVA, BVOH, ABS, ASA, PC, PA, PET, PPS; Carbon/Glass Fiber Reinforced PLA, PETG, PA, PET, PC, ABS, ASA, PPA, PPS
- buildVolume: single nozzle printing, left nozzle (the largest single-nozzle volume); extruder.count 2 (left and right nozzles)
- defaultNozzle 0.4: the included nozzle is not stated; 0.4 mm is in the supported list
- null: maxJerk
- extruder.type unknown (not stated)

## Bambu Lab P1P (bambu_p1p.json)

- https://us.store.bambulab.com/products/p1s (official Bambu Lab US store, comparison table, P1P column): build volume 256 × 256 × 256 mm; nozzle 0.4 mm stainless steel included, 0.2, 0.6, 0.8 mm optional; max hot end temperature 300 °C; max build plate temperature 100 °C; max speed of tool head 500 mm/s; max acceleration of tool head 20 m/s² (20000 mm/s²); control board fan, chamber temperature regulator fan and auxiliary part cooling fan optional; supported filament ideal PLA, PETG, TPU, PVA, PET, capable PA, PC, ABS, ASA
- cooling: the auxiliary and chamber fans are optional (left out); no page read names the part cooling fan of the P1P
- null: maxJerk, maxChamberTemp
- extruder.type unknown (not stated)

## BIQU B1 (biqu_b1.json)

- https://biqu.equipment/collections/3d-printer/products/biqu-b1-3d-printer-skr-v1-4-32bit-motherboard-tft35-b1-v3-0-dual-operation-system-fdm-impressora-3d-printer-beginner (official BIQU store, specifications): printing size 235 × 235 × 270 mm; max print speed 100 mm/s; metal extruder; dual fan cooling; filament PLA, ABS, PETG; control board BTT SKR V1.4
- defaultNozzle 0.4 and supportedNozzles [0.4]: no nozzle diameter of the printer is published on the page (the schema needs a value)
- null: maxNozzleTemp, maxBedTemp (not on the page), maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: "dual fan cooling" does not say which fans
- extruder.type unknown (not stated)

## BIQU BX (biqu_bx.json)

- https://www.biqu.equipment/collections/3d-printer/products/biqu-bx-3d-printer-fdm-3d-printer-with-32-bit-400mhz-motherboard-integrated-octoprint (official BIQU store, specifications): printing size 250 × 250 × 250 mm; max printing speed 100 mm/s; ultra-light H2 V2.0 direct extruder; nozzle diameter 0.4 mm (standard); max temp of nozzle 260 °C; max temp of hot bed 100 °C; filament PLA, PETG, TPU, TPE, ABS, Nylon
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: no fan named in the specifications

## BIQU Hurakan (biqu_hurakan.json)

- https://biqu3d.com/pages/biqu-hurakan-3d-printer (specifications): build volume 220 × 220 × 270 mm; suggested printing speed 60 mm/s; default speed limit (firmware) 180 mm/s; print head 1; nozzle diameter standard 0.4 mm; maximum temperature of nozzle 260 °C; maximum temperature of heated bed 100 °C; filament PLA / ABS / PETG... (any < 260 °C); firmware Klipper
- https://biqu.equipment/collections/3d-printer/products/biqu-hurakan-diy-3d-printer (official BIQU store): the same values
- maxPrintSpeed null: the page gives a suggested speed (60 mm/s) and the default limit of the firmware (180 mm/s), not a maximum speed of the printer
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- extruder.type unknown (not stated)
- cooling: no fan named in the specifications

## Creality Ender-3 Neo (creality_ender3_neo.json)

- https://store.creality.com/blogs/all/ender-3-v2-3-neo-3-v2-neo-comparison-guide (official Creality store blog, comparison table, Ender-3 Neo): build volume 220 × 220 × 250 mm; printing speed max 120 mm/s; Bowden extruder; nozzle diameter standard 0.4 mm; max nozzle temperature 260 °C; max heatbed temperature 100 °C; supported filaments PLA, PETG, ABS
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality Ender-3 Pro (creality_ender3_pro.json)

- https://store.creality.com/blogs/all/creality-ender-3-pro-v2-s1-s1-pro-v3-ke-detailed-comparative-analysis (official Creality store blog, specification table, Ender-3 Pro): build volume 220 × 220 × 250 mm; printing speed max 100 mm/s; Bowden extruder; nozzle diameter 0.4 mm; max nozzle temperature 260 °C; max heatbed temperature 110 °C; supported filaments PLA, PETG, ABS, TPU, PLA-Wood
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality Ender-3 S1 (creality_ender3_s1.json)

- https://store.creality.com/blogs/all/creality-ender-3-pro-v2-s1-s1-pro-v3-ke-detailed-comparative-analysis (official Creality store blog, specification table, Ender-3 S1): build volume 220 × 220 × 270 mm; printing speed max 150 mm/s; direct drive extruder; nozzle diameter 0.4 mm; max nozzle temperature 260 °C; max heatbed temperature 100 °C; supported filaments PLA, TPU, PETG, ABS
- https://www.creality.com/blog/the-differences-of-ender-3-s1-ender-3-s1-pro-ender-3-s1-plus (official Creality blog, 2022-06-29): Sprite dual-gear direct extruder; nozzle 260 °C; heatbed 100 °C
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality Ender-3 S1 Pro (creality_ender3_s1_pro.json)

- https://store.creality.com/blogs/all/creality-ender-3-pro-v2-s1-s1-pro-v3-ke-detailed-comparative-analysis (official Creality store blog, specification table, Ender-3 S1 Pro): build volume 220 × 220 × 270 mm; printing speed max 150 mm/s; direct drive extruder; nozzle diameter 0.4 mm; max nozzle temperature 300 °C; max heatbed temperature 110 °C; supported filaments PLA, ABS, PLA-Wood, TPU, PETG, PA
- https://www.creality.com/blog/the-differences-of-ender-3-s1-ender-3-s1-pro-ender-3-s1-plus (official Creality blog, 2022-06-29): Sprite dual-gear direct extruder; nozzle 300 °C; heatbed 110 °C
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality Ender-3 V2 (creality_ender3_v2.json)

- https://store.creality.com/blogs/all/creality-ender-3-pro-v2-s1-s1-pro-v3-ke-detailed-comparative-analysis (official Creality store blog, specification table, Ender-3 V2): build volume 220 × 220 × 250 mm; printing speed max 100 mm/s; Bowden extruder; nozzle diameter 0.4 mm; max nozzle temperature 260 °C; max heatbed temperature 100 °C; supported filaments PLA, PETG, TPU
- https://store.creality.com/blogs/all/ender-3-v2-3-neo-3-v2-neo-comparison-guide (official Creality store blog, comparison table, Ender-3 V2): the same values
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality Ender-3 V2 Neo (creality_ender3_v2_neo.json)

- https://store.creality.com/blogs/all/ender-3-v2-3-neo-3-v2-neo-comparison-guide (official Creality store blog, comparison table, Ender-3 V2 Neo): build volume 220 × 220 × 250 mm; printing speed max 120 mm/s; Bowden extruder; nozzle diameter standard 0.4 mm; max nozzle temperature 260 °C; max heatbed temperature 100 °C; supported filaments PLA, PETG, ABS
- https://www.creality.com/products/ender-3-v2-neo-3d-printer: full-metal Bowden extruder
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality Ender-3 V3 (creality_ender3_v3.json)

- https://www.creality.com/compare/compare-ender-3-v3-series (Ender-3 V3): build volume 220 × 220 × 250 mm; max printing speed 600 mm/s; acceleration 20000 mm/s²; high-speed clog-free direct drive extruder; nozzle temperature ≤ 300 °C; firmware Creality OS (Klipper)
- https://www.creality.com/support/creality-ender-3-v3 (Specs): supported filaments PLA, TPU90A, PLA-CF, PETG-CF, PETG, ABS; heatbed temperature 110 °C; nozzle temperature 300 °C; nozzle diameter standard 0.4 mm; extruder direct; acceleration 20000 mm/s²; printing speed 600 mm/s
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality Ender-3 V3 KE (creality_ender3_v3_ke.json)

- https://www.creality.com/compare/compare-ender-3-v3-series (Ender-3 V3 KE): build volume 220 × 220 × 240 mm; max printing speed 500 mm/s; acceleration 8000 mm/s²; upgraded Sprite direct drive extruder; nozzle temperature ≤ 300 °C; firmware Creality OS (Klipper)
- https://www.creality.com/support/creality-ender-3-v3-ke (Parameters): supported filaments PLA, TPU95A, ASA, PETG, ABS; heatbed temperature 100 °C; nozzle temperature 300 °C; nozzle diameter 0.4 mm (default); extruder direct
- https://www.creality.com/products/creality-ender-3-v3-ke: each side of the printhead has a model cooling fan
- null: maxTravelSpeed, maxJerk, maxChamberTemp

## Creality Ender-3 V3 Plus (creality_ender3_v3_plus.json)

- https://www.creality.com/compare/compare-ender-3-v3-series (Ender-3 V3 Plus): build volume 300 × 300 × 330 mm; max printing speed 600 mm/s; acceleration 20000 mm/s²; high-speed clog-free direct drive extruder; nozzle temperature ≤ 300 °C; firmware Creality OS (Klipper)
- https://www.creality.com/support/creality-ender-3-v3-plus (Parameters): supported filaments PLA, TPU95A, PLA-CF, PETG-CF, PETG, ABS; heatbed temperature ≤ 100 °C; nozzle temperature ≤ 300 °C; nozzle diameter 0.4 mm; extruder direct
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality Ender-5 Max (creality_ender5_max.json)

- https://www.creality.com/products/creality-ender-5-max (Specifications): build volume 400 × 400 × 400 mm; printing speed ≤ 700 mm/s; acceleration ≤ 20000 mm/s²; direct drive extruder; nozzle diameter 0.4 mm (compatible with 0.6/0.8 mm nozzle); nozzle temperature ≤ 300 °C; heatbed temperature ≤ 100 °C; supported filaments Hyper PLA/PLA/PETG/TPU95A/ABS/ASA/PLA-CF/PA/PLA-Silk
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Creality Hi (creality_hi.json)

- https://www.creality.com/products/creality-hi-combo (Specifications): build volume 260 × 260 × 300 mm; printing speed 300 mm/s typical, 500 mm/s max; acceleration ≤ 12000 mm/s²; direct drive extruder; nozzle diameter 0.4 mm, compatible with 0.6/0.8 mm; nozzle temperature ≤ 300 °C; heatbed temperature ≤ 100 °C; supported filaments Hyper-PLA/PLA/PETG/ABS/PLA-CF
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Creality K1 (creality_k1.json)

- https://www.creality.com/support/creality-k1-3d-printer (Core Specifications): supported filaments PLA, TPU95A, PA-CF, PLA-CF, PETG, ABS; heatbed temperature 100 °C; nozzle temperature 300 °C; nozzle diameter 0.4 mm (standard); extruder direct; acceleration ≤ 20000 mm/s²; printing speed 600 mm/s
- https://store.creality.com/blogs/all/k1c-vs-k1-vs-k1-se (official Creality store blog, comparison table): build volume 220 × 220 × 250 mm
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality K1 Max (creality_k1_max.json)

- https://store.creality.com/ca/products/k1-max-3d-printer-premium-combo (official Creality store): build volume 300 × 300 × 300 mm; printing speed ≤ 600 mm/s; acceleration ≤ 20000 mm/s²; dual-gear direct drive extruder; nozzle diameter 0.4 mm (compatible with 0.6/0.8 mm); nozzle temperature ≤ 300 °C; heatbed temperature ≤ 100 °C; supported filaments PLA, PETG, PET, TPU, PA, ABS, ASA, PC, PLA-CF, PA-CF, PET-CF
- https://www.creality.com/br/support/creality-k1-max-3d-printer (Portuguese support page): heatbed temperature ≤ 120 °C, other values the same
- maxBedTemp: the two pages differ (100 °C and 120 °C); the lower value is kept
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality K1 SE (creality_k1_se.json)

- https://www.creality.com/support/creality-k1-se-3d-printer (Core Specifications): supported filaments PLA, TPU95A, PLA-CF, PETG; heatbed temperature 100 °C; nozzle temperature 300 °C; nozzle diameter 0.4 mm; extruder direct; acceleration ≤ 20000 mm/s²; printing speed 600 mm/s
- https://store.creality.com/blogs/all/k1c-vs-k1-vs-k1-se (official Creality store blog, comparison table): build volume 220 × 220 × 250 mm
- https://www.creality.com/products/creality-k1-se-3d-printer: open-source Creality OS based on Klipper
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the pages read

## Creality K2 (creality_k2.json)

- https://www.creality.com/products/k2-series-3d-printer (comparison table, K2 column): build volume 260 × 260 × 260 mm; max print speed 600 mm/s, acceleration 20000 mm/s²; step-servo motors X/Y axes and extruder; max nozzle temperature 300 °C; max heatbed temperature 100 °C; max chamber temperature "-"; auxiliary cooling fan 1; compatible filaments PLA/PETG/PET/ABS/PLA-CF
- defaultNozzle 0.4 and supportedNozzles [0.4]: no nozzle diameter is published on the page (the schema needs a value)
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- extruder.type unknown (not stated)

## Creality K2 Plus (creality_k2_plus.json)

- https://www.creality.com/products/creality-k2-plus-cfs-combo (Specifications): build volume 350 × 350 × 350 mm; printing speed ≤ 600 mm/s; standard acceleration ≤ 30000 mm/s²; dual-gear direct drive extruder; nozzle diameter 0.4 mm; nozzle temperature ≤ 350 °C; heatbed temperature ≤ 120 °C; chamber temperature ≤ 60 °C; supported filaments PLA/ABS/PETG/PA-CF/PLA-CF/PET/ASA/PPA-CF
- https://www.creality.com/products/k2-series (comparison table, K2 Plus column): auxiliary cooling fan 2
- null: maxTravelSpeed, maxJerk

## Creality K2 Pro (creality_k2_pro.json)

- https://www.creality.com/products/k2-series (comparison table, K2 Pro column): build volume 300 × 300 × 300 mm; max print speed 600 mm/s, acceleration 20000 mm/s²; step-servo motors X/Y axes and extruder; max nozzle temperature 300 °C; max heatbed temperature 110 °C; max chamber temperature 60 °C; auxiliary cooling fan 1; compatible filaments PLA/PETG/PET/ABS/ASA/PLA-CF/PA-CF/PPA-CF
- defaultNozzle 0.4 and supportedNozzles [0.4]: no nozzle diameter is published on the page (the schema needs a value)
- null: maxTravelSpeed, maxJerk
- extruder.type unknown (not stated)

## Creality K2 SE (creality_k2_se.json)

- https://www.creality.com/products/k2-se (Specifications, K2 SE): build volume 220 × 215 × 245 mm; printing speed ≤ 500 mm/s; acceleration ≤ 20000 mm/s²; dual-gear direct drive extruder; nozzle diameter 0.4 mm; nozzle temperature ≤ 300 °C; heatbed temperature ≤ 100 °C; compatible filaments PLA/PETG/PLA-CF
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Creality SPARKX i7 (creality_sparkx_i7.json)

- https://www.creality.com/products/sparkx-i7 (Specifications): build volume 260 × 260 × 255 mm; printing speed ≤ 500 mm/s; acceleration ≤ 10000 mm/s²; direct drive extrusion; nozzle diameter 0.4 mm, compatible with 0.2/0.6/0.8 mm nozzle; nozzle temperature ≤ 300 °C; heatbed temperature ≤ 100 °C; filament compatibility PLA/PETG/PLA-CF/TPU (shore 64D or harder); firmware Creality OS
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Elegoo Centauri Carbon (elegoo_centauri_carbon.json)

- https://au.elegoo.com/pages/elegoo-centauri-carbon (official Elegoo store, Australia): build volume 256 × 256 × 256 mm; CoreXY 500 mm/s velocity; 20,000 mm/s² acceleration; 320 °C hotend, hardened steel nozzle; 110 °C heated bed; fully enclosed chamber; powerful auxiliary part cooling fan
- defaultNozzle 0.4 and supportedNozzles [0.4]: no nozzle diameter is published on the page (the schema needs a value)
- supportedMaterials empty: no list of materials published on the page
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- extruder.type unknown (not stated)

## Elegoo Neptune 4 (elegoo_neptune4.json)

- https://download.elegoo.com/06%20FDM%20Printer/02%20ELEGOO%20Neptune%20Series%20Files/Neptune%204/3.%20User's%20Guide/1.User%20Manual/NEPTUNE%204%20%20User%20Manual-English-V1.7.pdf (user manual V1.7, machine parameters): maximum build volume 225 × 225 × 265 mm; print speed 30~500 mm/s; nozzle diameter 0.4 mm; maximum temperature of nozzle 300 °C; maximum temperature of heated bed 110 °C; model fan, rear cooling fan, heat break cooling fan
- auxFan: the rear cooling fan, as for the Neptune 4 Pro in v1.0.0
- supportedMaterials empty: no list of materials published
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- extruder.type unknown (not stated in the manual)

## Elegoo Neptune 4 Max (elegoo_neptune4_max.json)

- https://download.elegoo.com/06%20FDM%20Printer/02%20ELEGOO%20Neptune%20Series%20Files/Neptune%204%20Max/3.%20User%27s%20Guide/1.User%20Manual/NEPTUNE%204%20MAX%20User%20Manual-English-V1.8.pdf (user manual V1.8, machine parameters): build volume 420 × 420 × 480 mm; print speed 30~500 mm/s; maximum acceleration 8000 mm/s²; nozzle diameter 0.4 mm; max nozzle temperature 300 °C; max heated bed temperature 85 °C (ambient 25 °C); rear cooling fan (model fan), heat break cooling fan
- supportedMaterials empty: no list of materials published in the manual
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- extruder.type unknown (not stated in the manual)

## Elegoo Neptune 4 Plus (elegoo_neptune4_plus.json)

- https://download.elegoo.com/06%20FDM%20Printer/02%20ELEGOO%20Neptune%20Series%20Files/Neptune%204%20Plus/3.%20User's%20Guide/1.User%20Manual/NEPTUNE%204%20PLUS%20User%20Manual-English-V1.6.pdf (user manual V1.6, machine parameters): build volume 320 × 320 × 385 mm; print speed 30~500 mm/s; maximum acceleration 12000 mm/s²; nozzle diameter 0.4 mm; max nozzle temperature 300 °C; max heated bed temperature 100 °C; rear cooling fan / model fan (FAN2), heat break cooling fan (FAN1)
- https://us.elegoo.com/products/neptune-4-plus-fdm-3d-printer: dual-gear direct extruder
- supportedMaterials empty: no list of materials published
- null: maxTravelSpeed, maxJerk, maxChamberTemp

## Flashforge AD5X (flashforge_ad5x.json)

- https://www.flashforge.com/products/flashforge-ad5x-3d-printer (specifications): build volume 220 × 220 × 220 mm; travel speed max 600 mm/s; print speed max 300 mm/s; acceleration max 20,000 mm/s²; extruder quantity 1; nozzle diameter 0.4 mm (default), 0.25/0.6/0.8 mm (optional); max extruder temp 300 °C; max bed temp 110 °C; supported filaments PETG/PLA/TPU95A (recommended for single-color printing)/TPU64D-75D/PLA-CF/PETG-CF
- supportedMaterials: the TPU grades are written TPU
- null: maxJerk, maxChamberTemp
- extruder.type unknown (not stated)
- cooling: no fan named on the page

## Flashforge Adventurer 5M (flashforge_adventurer_5m.json)

- https://www.flashforge.com/products/adventurer-5m-3d-printer (specifications): build volume 220 × 220 × 220 mm; max travel speed 600 mm/s; max acceleration 20000 mm/s²; extruder direct drive, quantity 1; nozzle diameter 0.4/0.6/0.8/0.25 mm; extruder temperature 280 °C; platform temperature 100 °C; filament PLA/PETG (0.4 mm nozzle), TPU/PLA-CF/PETG-CF (0.6 mm nozzle)
- supportedMaterials: TPU, PLA-CF and PETG-CF need a 0.6 mm nozzle instead of the default one: left out
- maxPrintSpeed null: the specifications give the travel speed only
- null: maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Flashforge Adventurer 5M Pro (flashforge_adventurer_5m_pro.json)

- https://www.flashforge.com/products/adventurer-5m-pro-3d-printer (specifications): build volume 220 × 220 × 220 mm; max travel speed 600 mm/s; max acceleration 20000 mm/s²; extruder direct drive, quantity 1; nozzle diameter 0.4/0.6/0.8/0.25 mm; extruder temperature 280 °C; platform temperature 100 °C; filament PLA/PETG (0.4 mm nozzle), ABS/ASA, TPU/PLA-CF/PETG-CF (0.6/0.8 mm nozzle); dual-fan cooling prevents warping at high speed (part cooling)
- supportedMaterials: TPU, PLA-CF and PETG-CF need a 0.6 or 0.8 mm nozzle instead of the default one: left out
- maxPrintSpeed null: the specifications give the travel speed only
- null: maxJerk, maxChamberTemp

## Flashforge Creator 5 (flashforge_creator_5.json)

- https://www.flashforge.com/products/flashforge-creator-5 (specifications): build volume 256 × 256 × 256 mm; travel speed max. 600 mm/s; print speed max. 300 mm/s; acceleration max. 30,000 mm/s²; extruder quantity 4 independent toolheads; nozzle diameter 0.4 mm (standard), 0.25 / 0.6 / 0.8 mm; max extruder temp 320 °C; max bed temp max. 120 °C; recommended filaments PLA, PETG, TPU-90A (top external mount), TPU-95A, TPU-64D, PLA-CF, PETG-CF, SILK, PVA, BVOH; FAQ: passive heat retention of the chamber (no active heating)
- supportedMaterials: the TPU grades are written TPU
- null: maxJerk, maxChamberTemp
- extruder.type unknown (not stated)
- cooling: no fan named on the page

## Flashforge Creator 5 Pro (flashforge_creator_5_pro.json)

- https://www.flashforge.com/products/flashforge-creator-5-pro (specifications): build volume 256 × 256 × 256 mm; travel speed max. 600 mm/s; print speed max. 300 mm/s; acceleration max. 30,000 mm/s²; extruder quantity 4 independent toolheads; nozzle diameter 0.4 mm (standard), 0.25 / 0.6 / 0.8 mm; max extruder temp 320 °C; max bed temp 120 °C; active chamber heating supported (max 65 °C); auxiliary cooling supported (auxiliary cooling fan); recommended filaments PLA, PETG, TPU-90A (top external mount), TPU-95A, TPU-64D, PLA-CF, PETG-CF, SILK, PVA, BVOH, S-Multi, S-PAHT, ABS, ASA, PA-CF, PET-CF, PAHT-CF, ASA-CF, ASA-GF, ABS-GF, PPA-CF, PPS-CF, HIPS
- supportedMaterials: the TPU grades (90A, 95A, 64D) are written TPU
- null: maxJerk
- extruder.type unknown (not stated)

## Flashforge Guider 3 Ultra (flashforge_guider_3_ultra.json)

- https://flashforge.com/products/flashforge-guider-3-ultra-3d-printer (specifications): build size single extruder 330 × 330 × 600 mm, dual extruders 300 × 330 × 600 mm; printing speed 10-500 mm/s; max acceleration 20000 mm/s²; extruder quantity 2; nozzle diameter 0.4 mm (default), 0.6/0.8 mm (optional); max extruder temperature 350 °C; heating bed setting support 120; filament type PLA / ABS / HIPS / ASA / PETG / CoPA / PLA-CF / PETG-CF / PAHT-CF / PAHT-GF / PET-CF / PET-GF / PA12-CF / PA-CF / PA-GF / NexPA-CF25
- buildVolume: single extruder
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- extruder.type unknown (not stated)
- cooling: no fan named on the page

## UltiMaker MakerBot Sketch Sprint (makerbot_sketch_sprint.json)

- https://ultimaker.com/3d-printers/sketch-series/makerbot-sketch-sprint/ (technical specifications): build volume 220 × 220 × 220 mm; speeds of 300 mm/s; direct drive single extrusion; single extrusion print head; nozzle diameter 0.4 mm; nozzle temperature max 280 °C; heated build plate able to reach 110 °C; uses PLA and Tough PLA
- null: maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Prusa CORE One L+ (prusa_core_one_l_plus.json)

- https://www.prusa3d.com/product/prusa-core-one-l/ (CORE One L+ technical specifications; the page of the CORE One L now shows the CORE One L+): build volume 300 × 300 × 330 mm; extruder Nextruder Direct Drive; nozzles included Prusa Brass High-Flow CHT 0.4 mm and Abrasive-Resistant 0.4 mm; max nozzle temperature 290 °C (400 °C with the optional HT Hotend upgrade: left out); max heatbed temperature 120 °C; max chamber temperature 60 °C (active convection chamber); supported materials PLA, PETG, Flex, PVA, PC, PP, CPE, PVB (ABS, ASA, HIPS, PA with the Advanced Filtration option: left out)
- null: maxPrintSpeed, maxTravelSpeed, maxAcceleration, maxJerk (not published)
- cooling: the page names only two fans under the heatbed (convection), no part cooling, auxiliary or chamber fan
- supportedNozzles [0.4]: only the 0.4 mm nozzles are listed

## Prusa XL+ (prusa_xl_plus.json)

- https://www.prusa3d.com/product/original-prusa-xl-semi-assembled-single-toolhead-3d-printer/ (Prusa XL+ Single-Tool, technical parameters; the page of the XL now shows the XL+, second generation): build volume 360 × 360 × 360 mm; up to 5 independent toolheads (the Single-Tool has one); extruder Nextruder, direct drive; max nozzle temperature 290 °C; heatbed segmented, 16 individually controlled tiles, up to 115 °C (the comparison section of the page says 120 °C); chamber temperature up to 50 °C with the Enclosure for Prusa XL+, up to 60 °C with the external heater (both optional); supported materials PLA, PETG, ASA, ABS, PC, PA (nylon), TPU, PVA, HIPS, PP, CPE, PVB, carbon-fiber composites
- maxBedTemp: the page gives 115 °C and 120 °C; the lower value is kept
- defaultNozzle 0.4 and supportedNozzles [0.4]: no nozzle diameter is published on the page (the schema needs a value)
- null: maxPrintSpeed, maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp (the enclosure and the heater are options)
- cooling: no fan named on the page

## QIDI Max4 (qidi_max4.json)

- https://us.qidi3d.com/pages/qidi-max4-techspecs (TechSpecs): print size 390 × 390 × 340 mm; max speed of tool head 800 mm/s; acceleration ≤ 30000 mm/s²; extruder gear direct extruder hardened steel dual gears; nozzle diameter 0.4 mm (0.2/0.6/0.8 mm optional); print head temperature ≤ 370 °C; hot bed temperature ≤ 120 °C; chamber temperature (PTC heater) up to 65 °C independent chamber heating; model cooling fan, auxiliary part cooling fan, hot end cooling fan; supported filament PLA, ABS, ASA, PETG, TPU, PA, PC, Carbon/Glass Fiber Reinforced Polymer, etc.
- https://us.qidi3d.com/pages/compare (QIDI comparison table): chamber circulation fan, closed loop control (Max4: high-power turbo)
- null: maxJerk

## QIDI Plus4 (qidi_plus4.json)

- https://us.qidi3d.com/pages/qidi-plus-4-techspecs (TechSpecs): print size 305 × 305 × 280 mm; max speed of tool head 600 mm/s; acceleration ≤ 20000 mm/s²; extruder gear direct extruder hardened steel gears; nozzle diameter 0.4 mm (0.2/0.6/0.8 mm optional); print head temperature ≤ 370 °C; hot bed temperature ≤ 120 °C; chamber temperature (PTC heater) up to 65 °C independent chamber heating; auxiliary part cooling fan yes; chamber circulation fan yes (with activated carbon air filter); supported filament PLA, ABS, ASA, PETG, TPU, PA, PC, Carbon/Glass Fiber Reinforced Polymer, etc.
- https://qidi3d.com/products/plus4-3d-printer: build size 305 × 305 × 280 mm; firmware open-source Klipper V0.12; the product is discontinued (successor Plus5); the page gives 370 °C and 360 °C for the nozzle and 65 °C and 55 °C for the chamber: the TechSpecs values are kept
- null: maxJerk
- cooling: the TechSpecs page names the auxiliary part cooling fan, not the main part cooling fan

## QIDI Plus5 (qidi_plus5.json)

- https://qidi3d.com/pages/qidi-plus5-techspecs (TechSpecs): print size 320 × 320 × 300 mm; max speed of tool head 600 mm/s; acceleration ≤ 20000 mm/s²; extruder gear direct extruder hardened steel gears; nozzle diameter 0.4 mm (0.2/0.6/0.8 mm optional); print head temperature ≤ 370 °C; hot bed temperature ≤ 120 °C; chamber temperature up to 65 °C, independent chamber heating; auxiliary part cooling fan, hot end cooling fan, model cooling fan; supported filament PLA, ABS, ASA, PETG, TPU, PA, PC, Carbon/Glass Fiber Reinforced Polymer, etc.
- https://us.qidi3d.com/pages/compare (QIDI comparison table): chamber circulation fan, closed loop control
- null: maxJerk

## QIDI Q1 Pro (qidi_q1_pro.json)

- https://us.qidi3d.com/products/q1-pro-3d-printer (TechSpecs): print size 245 × 245 × 240 mm; max speed of tool head 600 mm/s; acceleration ≤ 20000 mm/s²; extruder direct extruder / hardened steel gears; nozzle diameter 0.4 mm (0.2/0.6/0.8 mm optional); print head temperature ≤ 350 °C; hot bed temperature ≤ 120 °C; chamber temperature 60 °C independent chamber heating; auxiliary part cooling fan; chamber circulation fan; recommended filament PLA, ABS, ASA, PETG; compatible filament TPU, PA, PC, Carbon/Glass Fiber Reinforced Polymer; Klipper 64-bit processors; the product is discontinued (replacement Q2)
- null: maxJerk
- cooling: the page names the auxiliary part cooling fan, not the main part cooling fan

## QIDI Q2 (qidi_q2.json)

- https://eu.qidi3d.com/pages/qidi-q2-techspecs (TechSpecs): print size 270 × 270 × 256 mm; max speed of tool head 600 mm/s; acceleration ≤ 20000 mm/s²; extruder gear direct extruder hardened steel gears; nozzle diameter 0.4 mm (0.2/0.6/0.8 mm optional); print head temperature ≤ 370 °C; hot bed temperature ≤ 120 °C; chamber temperature (PTC heater) up to 65 °C independent chamber heating; auxiliary part cooling fan, hot end cooling fan, model cooling fan; supported filament PLA, ABS, ASA, PETG, TPU, PA, PC, Carbon/Glass Fiber Reinforced Polymer, etc.
- null: maxJerk

## QIDI Q2C (qidi_q2c.json)

- https://us.qidi3d.com/pages/qidi-q2c-techspecs (TechSpecs): print size 270 × 270 × 256 mm; max speed of tool head 600 mm/s; acceleration ≤ 20000 mm/s²; extruder gear hardened steel dual gears; nozzle diameter 0.4 mm (0.2/0.6/0.8 mm optional); print head temperature ≤ 370 °C; hot bed temperature ≤ 120 °C; chamber temperature no; auxiliary part cooling fan, hot end cooling fan, model cooling fan; supported filament PLA, ABS, ASA, PETG, TPU, PA, PC, Carbon/Glass Fiber Reinforced Polymer, etc.
- https://us.qidi3d.com/pages/compare (QIDI comparison table): direct extruder, hardened steel dual gears
- null: maxJerk, maxChamberTemp (no chamber heating)

## Raise3D Pro3 (raise3d_pro3.json)

- https://s1.raise3d.com/2024/08/Raise3D_Pro3-Series-Technical-Specifications_V4.7.pdf (Raise3D Pro3 Series Technical Specifications V4.7, Pro3): build volume (single extruder) 300 × 300 × 300 mm; print head travel speed 15-350 mm/s; dual-head with electronic lifting system; nozzle diameter 0.4 mm (default), 0.2/0.6/0.8/1.0 mm (available); max nozzle temperature 300 °C; max build plate temperature 120 °C; supported filaments PLA/ABS/ASA/PETG/PC/PETG ESD/TPU 95A/PVA+
- buildVolume: single extruder
- null: maxPrintSpeed, maxAcceleration, maxJerk, maxChamberTemp
- extruder.type unknown (not stated)
- cooling: no fan named in the specifications

## Raise3D Pro3 Plus (raise3d_pro3_plus.json)

- https://s1.raise3d.com/2024/08/Raise3D_Pro3-Series-Technical-Specifications_V4.7.pdf (Raise3D Pro3 Series Technical Specifications V4.7, Pro3 Plus): build volume (single extruder) 300 × 300 × 605 mm; print head travel speed 15-350 mm/s; dual-head with electronic lifting system; nozzle diameter 0.4 mm (default), 0.2/0.6/0.8/1.0 mm (available); max nozzle temperature 300 °C; max build plate temperature 120 °C; supported filaments PLA/ABS/ASA/PETG/PC/PETG ESD/TPU 95A/PVA+
- buildVolume: single extruder
- null: maxPrintSpeed, maxAcceleration, maxJerk, maxChamberTemp
- extruder.type unknown (not stated)
- cooling: no fan named in the specifications

## Snapmaker J1 (snapmaker_j1.json)

- https://support.snapmaker.com/hc/en-us/articles/9773156785175-What-are-the-specs-of-J1 (Snapmaker support, specs of J1): build volume default mode & backup mode 300 × 200 × 200 mm, copy mode 160 × 200 × 200 mm, mirror mode 150 × 200 × 200 mm; independent dual extruders (IDEX); nozzle 0.4 mm (included), 0.2, 0.6, 0.8 mm, hardened (sold separately); max nozzle temperature 300 °C; max heated bed temperature 100 °C; supported filaments PLA, ABS, HIPS, PC, TPU, TPE, PETG, ASA, PP, PVA, PA, PA-GF, PA-CF
- buildVolume: default mode
- motion null: the max speed row gives five values that the page does not assign to a mode or an axis
- null: maxAcceleration, maxJerk, maxChamberTemp
- extruder.type unknown (not stated)
- cooling: no fan named on the page

## Snapmaker U1 (snapmaker_u1.json)

- https://www.snapmaker.com/snapmaker-u1/specs (specs): build volume 270 × 270 × 270 mm; max toolhead speed 500 mm/s; max acceleration 20,000 mm/s²; toolheads included 4; nozzle diameter 0.4 mm; max nozzle temperature 300 °C; max heated bed temperature 100 °C; part cooling main & auxiliary part cooling fans; basic material compatibility PLA, PETG, TPU, PVA, PCTG (PET, ABS, ASA, PA, PC with the optional top cover: left out); firmware Klipper
- null: maxJerk, maxChamberTemp
- extruder.type unknown (not stated); extruder.count 4 (toolheads included)

## Sovol SV06 ACE (sovol_sv06_ace.json)

- https://www.sovol3d.com/products/sovol-sv06-ace (product specification): build volume 220 × 220 × 250 mm; max printing speed 600 mm/s; max acceleration 20000 mm/s²; nozzle 0.4 mm (included), 0.2, 0.6, 0.8 mm; hot bed temperature 100 °C; nozzle cooling fan 4010 dual ball bearing; 4020 high-speed ball bearing fan for part cooling; 300 °C high-temperature nozzle; planetary dual gear extruder; FAQ: PLA, PETG, TPU, ABS (enclosure recommended)
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- extruder.type unknown (not stated)

## Sovol SV06 Plus ACE (sovol_sv06_plus_ace.json)

- https://www.sovol3d.com/products/sovol-sv06-plus-ace-3d-printer (product specification; the labels of the rows are not readable, the values are in the same order as on the SV06 ACE page): 300 × 300 × 350 mm³; 500 mm/s; 15000 mm/s²; planetary double gear, reduction ratio 1:7.5; nozzle ≤ 300 °C; nozzle 0.4 mm (included), 0.6 mm, 0.8 mm; bed 100 °C; Klipper (3308 chip); filaments PLA, PETG, TPU, PVA; powerful 4020 fan for quick cooling; FAQ: all-metal direct drive extruder
- null: maxTravelSpeed, maxJerk, maxChamberTemp

## Sovol SV08 (sovol_sv08.json)

- https://www.sovol3d.com/products/sovol-sv08-3d-printer (specifications): build volume 350 × 350 × 345 mm; max printing speed 700 mm/s; max acceleration 40000 mm/s²; planetary gear extruder; FAQ: dual-gear direct drive extruder; nozzle diameter 0.4 mm (included), 0.2, 0.6, 0.8 mm; nozzle temperature ≤ 300 °C; filaments PLA, PETG, TPU, PETG-CF, ABS, etc.
- maxBedTemp null: a value ≤ 100 °C is on the page without a readable label
- null: maxTravelSpeed, maxJerk, maxChamberTemp
- cooling: no fan named on the page

## Sovol SV08 MAX (sovol_sv08_max.json)

- https://www.sovol3d.com/products/sovol-sv08-max-3d-printer (product specification): build volume 500 × 500 × 500 mm (500 × 500 × 450 mm with the enclosure kit); max printing speed 700 mm/s; max acceleration 40000 mm/s²; nozzle temperature ≤ 300 °C; hotbed temperature ≤ 100 °C; nozzles standard 2 × 0.4 mm, optional 0.4 / 0.6 / 0.8 mm; filaments PLA/TPU/PETG/ABS/ASA/PA/PC/PLA-CF/PETG-CF/HP-PLA; chamber heating module optional (sold separately)
- null: maxTravelSpeed, maxJerk, maxChamberTemp (chamber heating is an option)
- extruder.type unknown (not stated)
- cooling: no fan named on the page

## Sovol Zero (sovol_zero.json)

- https://www.sovol3d.com/products/sovol-zero-3d-printer (product specification): build volume 152.4 × 152.4 × 152.5 mm; max printing speed 1200 mm/s; max acceleration 40000 mm/s²; nozzle brass 0.4 mm (included), 0.2, 0.6, 0.8, 1.0 mm, hardened steel 0.4 mm (included), 0.2, 0.6, 0.8, 1.0 mm; nozzle temperature ≤ 350 °C; hot bed temperature ≤ 120 °C
- null: maxTravelSpeed, maxJerk, maxChamberTemp (chamber heating announced as an upcoming component)
- supportedMaterials empty: no list of materials published on the page
- extruder.type unknown (not stated)
- cooling: no fan named on the page

## UltiMaker Factor 4+ (ultimaker_factor_4_plus.json)

- https://ultimaker.com/3d-printers/factor-series/ultimaker-factor-4-plus/ (technical specifications): build volume 330 × 240 × 300 mm; dual-extrusion, direct drive print head and swappable print cores; nozzle diameters 0.25, 0.4, 0.6, 0.8 mm; nozzle temperature 180 - 340 °C; heated bed up to 120 °C; actively temperature controlled build volume up to 70 °C; 200+ materials including PPS CF, ABS, Nylon, PC, Tough PLA, PLA, PETG, CPE, CPE+, TPU 95A, PP
- supportedMaterials: the materials named on the page ("200+ materials including")
- null: maxPrintSpeed, maxTravelSpeed, maxAcceleration, maxJerk
- cooling: no fan named on the page

## UltiMaker S5 (ultimaker_s5.json)

- https://ultimaker.com/3d-printers/s-series/ultimaker-s5/ (technical specifications): build volume 330 × 240 × 300 mm; Bowden dual extrusion; dual-geared feeder; nozzle diameters 0.25, 0.4, 0.6, 0.8 mm; nozzle temperature 180 - 280 °C; partly enclosed, passively heated; 280+ materials
- maxBedTemp null: the page gives only the heat-up time (20 to 60 °C)
- null: maxPrintSpeed, maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp
- cooling: no fan named on the page
- supportedMaterials empty: the page gives "280+" materials, not a list

## UltiMaker S6 (ultimaker_s6.json)

- https://ultimaker.com/3d-printers/s-series/ultimaker-s6/ (technical specifications): build volume 330 × 240 × 300 mm; travel speed up to 500 mm/s; acceleration up to 50.000 mm/s²; jerk up to 100.000.000 mm/s³; dual-geared feeder; Bowden dual extrusion; nozzle diameters 0.25, 0.4, 0.6, 0.8 mm; nozzle temperature up to 340 °C with the CC+ print cores; partly enclosed, passively heated; 301+ materials
- maxBedTemp null: the page gives only the heat-up time (20 to 60 °C)
- maxJerk null: the jerk is published in mm/s³, not in the unit of the Printer Schema
- null: maxPrintSpeed, maxChamberTemp
- cooling: no fan named on the page
- supportedMaterials empty: the page gives "301+" materials, not a list

## UltiMaker S7 (ultimaker_s7.json)

- https://ultimaker.com/3d-printers/s-series/ultimaker-s7/ (technical specifications): build volume 330 × 240 × 300 mm; dual-geared feeder; Bowden dual extrusion; nozzle diameters 0.25, 0.4, 0.6, 0.8 mm; nozzle temperature 180 - 280 °C; fully enclosed, passively heated; air extraction by low-noise brushless fan
- https://um-support-files.ultimaker.com/manuals/user-manual/S7/EN-UltiMaker-S7-V1.2.pdf (user manual V1.2, specifications): build volume 330 × 240 × 300 mm; nozzle 0.4 mm included, 0.25, 0.6, 0.8 mm sold separately; heated flexible build plate 20 – 125 °C; dual-extrusion print head; Air Manager fan (air extraction)
- chamberFan: the air extraction fan of the Air Manager
- null: maxPrintSpeed, maxTravelSpeed, maxAcceleration, maxJerk, maxChamberTemp (passively heated chamber)
- supportedMaterials empty: the pages give "280+" materials, not a list

## UltiMaker S8 (ultimaker_s8.json)

- https://ultimaker.com/3d-printers/s-series/ultimaker-s8/ (technical specifications): build volume 330 × 240 × 300 mm; XY speed up to 500 mm/s (travel speed); acceleration up to 50.000 mm/s²; dual-geared feeder; dual extrusion print head; nozzle diameters 0.25, 0.4, 0.6, 0.8 mm; nozzle temperature up to 340 °C; fully enclosed build chamber; air extraction by low-noise brushless fan; 301+ materials
- https://um-support-files.ultimaker.com/manuals/user-manual/S8/EN-UltiMakerS8-V1.4-2025-07.pdf (user manual V1.4): speed up to 500 mm/s; acceleration up to 50 000 mm/s²; jerk up to 100 000 000 mm/s³; nozzle up to 340 °C; heated flexible build plate up to 120 °C; dual-extrusion printer; Bowden tubes between the feeders and the print head; Air Manager fan
- maxJerk null: the jerk is published in mm/s³, not in the unit of the Printer Schema
- chamberFan: the air extraction fan of the Air Manager
- null: maxChamberTemp
- supportedMaterials empty: the pages give "301+" materials, not a list

## Official sheet not found (fiche non trouvée)

These printers are on sale from the brands of v1.0.1, but no page of the manufacturer with their technical values could be read on 2026-10-28. They are not added: no value is taken from another source.

- Bambu Lab H2D, H2D Pro, H2S, P2S, X1E, X2D, A2L: the pages of technical specifications of bambulab.com refuse the reading; the store pages give only some values (for example the build volume and the nozzle temperature)
- Elegoo Centauri, Centauri 2, Centauri Carbon 2, OrangeStorm Giga: the product pages load their specifications by script; no user manual with the machine parameters found (Centauri Carbon 2: only the build volume, the speed and the acceleration are readable)
- Creality Ender-3 V4, Ender-3 S1 Plus, Ender-5 S1, CR-10 SE, CR-M4, Sermoon D3, Sermoon D3 Pro: the product pages load their specifications by script
- QIDI X-Plus 3, X-Max 3, X-Smart 3: the comparison page of QIDI mixes the columns (speed, nozzle and materials not attributable to one printer); X-Smart 5: no page of the manufacturer found
- Flashforge Guider4, Guider4 Pro: no page on the global site of Flashforge
- Prusa MK3.5: no page of technical parameters found
- Artillery Sidewinder X4 Max: the product page could not be read
- UltiMaker Method, Method X, Method XL, MakerBot Sketch, Sketch Large, Factor 4: no readable product page of the manufacturer with the technical values (only series pages)
