# Filament Profile Sources

Sources of the filament profiles of data/filaments/ (DECISIONS.md, ADR-033).

Rules:

- Every value comes from the technical data sheet (TDS) of the manufacturer, or from its official product page. No value is copied from a profile file of a slicer, even when the value is the same (ADR-033, D1).
- A value that the manufacturer does not publish is null, never guessed (DATA_SCHEMA.md 3.7.0).
- A shipped filament is a product line: color and pricePerKg are null (the user gives them for their own filaments).
- diameter: 1.75 mm, the diameter of the first list (ADR-033, D8).
- temperature: the nozzle and bed ranges of the sheet. A value written "X ± Y" gives the range X - Y to X + Y.
- manufacturerSettings: a single value of the sheet only. A value written "X ± Y" gives X (the value of the manufacturer). A range (retraction 0.8 - 1.4 mm, fan 0 - 80 %) is kept nowhere and the value is null: a range is never turned into a single value. A fan that is only "ON" or "Turn on" is null.
- Print speed, drying and the other values of the sheets have no field in the Filament Schema; they are not kept.

All the sheets below were read on 2026-10-30.

---

## Bambu Lab PLA Basic (bambu_pla_basic.json)

- https://cdn.shopify.com/s/files/1/0380/5149/files/Bambu_PLA_Basic_Technical_Data_Sheet.pdf (Bambu Filament Technical Data Sheet V2.0): density 1.24 g/cm³; nozzle temperature 190 - 230 °C; bed temperature 35 - 45 °C; cooling fan 100 %
- null: retractionDistance and retractionSpeed (ranges 0.6 - 1.0 mm, 20 - 40 mm/s), nozzleTemperature and bedTemperature (ranges only)

## Bambu Lab PLA Matte (bambu_pla_matte.json)

- https://cdn.shopify.com/s/files/1/0380/5149/files/Bambu_PLA_Matte_Technical_Data_Sheet.pdf (V2.0): density 1.31 g/cm³; nozzle temperature 190 - 230 °C; bed temperature 35 - 45 °C; cooling fan 100 %
- https://bambulab-us.myshopify.com/products/pla-matte (official Bambu Lab US store): the same density and temperatures
- null: retractionDistance and retractionSpeed (ranges 0.6 - 1.0 mm, 20 - 40 mm/s), nozzleTemperature and bedTemperature (ranges only)

## Bambu Lab PETG HF (bambu_petg_hf.json)

- https://store.bblcdn.com/3a230e260a3a47c2b0db0156e07eef91.pdf (Bambu Filament Technical Data Sheet V1.0, PETG HF, Bambu Lab store CDN): density 1.28 g/cm³; nozzle temperature 230 - 260 °C; bed temperature 65 - 75 °C
- null: fanSpeed (range 0 - 60 %), retractionDistance and retractionSpeed (ranges 0.8 - 1.4 mm, 30 - 60 mm/s), nozzleTemperature and bedTemperature (ranges only)

## Bambu Lab ABS (bambu_abs.json)

- https://cdn.shopify.com/s/files/1/0645/5876/0155/files/Bambu_ABS_Technical_Data_Sheet_V3.pdf (V3.0), linked by https://bambulab-us.myshopify.com/products/abs-filament: density 1.05 g/cm³; nozzle temperature 240 - 270 °C; bed temperature 80 - 100 °C
- null: fanSpeed (range 0 - 80 %), retractionDistance and retractionSpeed (ranges 0.8 - 1.4 mm, 20 - 40 mm/s), nozzleTemperature and bedTemperature (ranges only)

## Bambu Lab TPU 95A HF (bambu_tpu_95a_hf.json)

- https://cdn.shopify.com/s/files/1/0584/7236/6216/files/Bambu_TPU_95A_HF_Technical_Data_Sheet.pdf (V1.0), linked by https://bambulab-us.myshopify.com/products/tpu-95a-hf: density 1.22 g/cm³; nozzle temperature 220 - 240 °C; bed temperature 30 - 35 °C
- null: fanSpeed (only "Turn on"), retractionDistance and retractionSpeed (ranges 0.8 - 1.4 mm, 20 - 40 mm/s), nozzleTemperature and bedTemperature (ranges only)

## Prusament PLA (prusament_pla.json)

- https://prusament.com/wp-content/uploads/2022/10/PLA_Prusament_TDS_2021_10_EN.pdf (Technical datasheet, Prusament PLA by Prusa Polymers, version 1.1, 16-02-2022): density 1.24 g/cm³; nozzle temperature 210 ± 10 °C (200 - 220 °C, nozzleTemperature 210); heatbed temperature 40 - 60 °C; cooling fan speed 100 %
- null: retractionDistance, retractionSpeed (not given), bedTemperature (range only)
- The product pages of Prusa give other values (215 °C, bed 50 - 60 °C on prusa3d.com): the technical data sheet is kept (ADR-033, D1)

## Prusament PETG (prusament_petg.json)

- https://prusament.com/wp-content/uploads/2022/10/PETG_Prusament_TDS_2021_10_EN.pdf (version 1.1, 16-02-2022): density 1.27 g/cm³; nozzle temperature 250 ± 10 °C (240 - 260 °C, nozzleTemperature 250); heatbed temperature 80 ± 10 °C (70 - 90 °C, bedTemperature 80); cooling fan speed 50 %
- null: retractionDistance, retractionSpeed (not given)

## Prusament ASA (prusament_asa.json)

- https://prusament.com/wp-content/uploads/2022/10/ASA_Prusament_TDS_2022_16_EN.pdf (version 1.1, 16-02-2022): density 1.07 g/cm³; nozzle temperature 260 ± 10 °C (250 - 270 °C, nozzleTemperature 260); heatbed temperature 110 ± 5 °C (105 - 115 °C, bedTemperature 110); cooling fan speed 30 % ("0 - 50, depends on geometry of printed objects"; the value 30 of the sheet is kept)
- null: retractionDistance, retractionSpeed (not given)

## Polymaker PolyLite PLA (polymaker_polylite_pla.json)

- https://cdn.shopify.com/s/files/1/0548/7299/7945/files/PolyLite_PLA_TDS_EN_V5.4.pdf (TDS V5.4), linked by https://wiki.polymaker.com/polymaker-products/more-about-our-products/documents/technical-data-sheets/pla/polylite-tm-pla: density 1.17 g/cm³ at 23 °C; nozzle temperature 190 - 230 °C; build plate temperature 25 - 60 °C
- null: fanSpeed (only "ON"), retractionDistance and retractionSpeed (ranges 1 - 3 mm, 20 - 40 mm/s), nozzleTemperature and bedTemperature (ranges only)

## Polymaker PolyLite PETG (polymaker_polylite_petg.json)

- https://polymaker.com/wp-content/uploads/lana-downloads/PolyLite_PETG_TDS_EN_V5.4.pdf (TDS V5.4): density 1.25 g/cm³ at 23 °C; nozzle temperature 230 - 260 °C; build plate temperature 70 - 80 °C
- https://wiki.polymaker.com/polymaker-products/polymaker-filaments/prime-materials/petg/polylite-tm-petg: the same values; the page says that the product is being discontinued in favor of Polymaker PETG
- null: fanSpeed (range OFF - 20 %), retractionDistance and retractionSpeed (ranges 1 - 3 mm, 20 - 40 mm/s), nozzleTemperature and bedTemperature (ranges only)

## eSUN PLA+ (esun_pla_plus.json)

- https://www.esun3d.com/media/esun/catalog/certification/product/PLA_3KG1.75MM/PLA_-TDS-en.pdf (PLA+ Technical Data Sheet, Feb. 2026, version 1.0): density 1.24 g/cm³; print temperature 210 - 230 °C; bed temperature 45 - 60 °C; cooling fan 100 %
- family PLA (MATERIAL_PROFILE_SPEC.md, Material Families: a variant of a family is a filament of the family)
- null: retractionDistance, retractionSpeed (not given), nozzleTemperature and bedTemperature (ranges only)

---

## Not shipped

- Elegoo PLA: no technical data sheet found. The official product page (https://us.elegoo.com/products/pla-filament-1-75mm-colored-1kg) gives the nozzle temperature (190 - 230 °C) but no bed temperature, which is required for a shipped filament (ADR-033, D4 and D8).
