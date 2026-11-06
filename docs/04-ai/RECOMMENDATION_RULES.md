# SlicyWeb Smart Slicer

# RECOMMENDATION RULES

Version: 1.1.1

Status: Approved

Priority: High



---



# Purpose



This document defines the rule-based recommendation system used by the AI Engine.



This is the decision layer that transforms:



```text

Printer

+

Material

+

Filament

+

Model Analysis

+

User Constraints

```



into:



```text

Recommended Print Profile

```



The system is deterministic.



Given the same inputs, the same recommendations must always be generated.



---



# Recommendation Philosophy



Priority Order:



```text

1. Print Success



2. Reliability



3. Mechanical Strength



4. Surface Quality



5. Print Duration



6. Material Savings

```



The engine must never sacrifice reliability for speed.



---



# Recommendation Pipeline



```text

Collect Inputs



↓



Validate Inputs



↓



Classify Model



↓



Evaluate Risks



↓



Generate Settings



↓



Validate Settings



↓



Optimize Settings



↓



Generate Output

```



---



# Required Inputs



## Printer



```text

Printer Profile

```



---



## Material

Material Profile

---

## Filament

Filament Profile

---

## Print Preset

Print Preset

---


## Model Analysis



```text

Dimensions



Volume



Overhangs



Bridges



Thin Walls



Stability



Classification

```



---



# Rules Of Version 1.1.0 (Phase 10)

DECISIONS.md, ADR-035 (decisions D5 to D10 of Noam, 2026-11-05; analysis of lot 83).

The rules of this section give the numbers used by the recommendation engine of Phase 10. Where an older section of this document gives a range or a word, this section gives the value chosen inside it. Every value is deterministic: the same inputs always give the same recommendation.

---

## Inputs And Order

```text
Inputs:
  printer   (selected; required)
  material  (selected; required)
  filament  (selected; optional, null when none is selected)
  analysis  (up to date) and its classification
  presets   (PRINT_PRESETS_SPEC.md 1.3.0, Shipped Presets)

No printer or no material: no recommendation (ERROR_CODES_SPEC.md, REC_002)

Order:
  1. Preset: from the classification (PRINT_PRESETS_SPEC.md, Classification
     To Preset Mapping, Default Preset)
  2. Profile initialized from the preset and the engine defaults
     (PRINT_PRESETS_SPEC.md, Recommended Profile Initialization)
  3. Limits
  4. Temperature And Cooling
  5. Retraction
  6. Supports And Adhesion
  7. Recommendation Warnings
  8. Confidence
```

The family of the material is material.category (as "PLA", "TPU"; MATERIAL_PROFILE_SPEC.md, Material Families).

---

## Limits

ADR-035 D6, corrected by Noam (KI-008). Version 1.1.1: travel speed of a printer that does not publish maxTravelSpeed confirmed by Noam (2026-11-05, answer C): 150 mm/s, without warning.

```text
Print speed (speed.print):
  at most printer.motion.maxPrintSpeed
  at most 100 mm/s when maxPrintSpeed is null (not published: 15 printers
    of 79 on 2026-11-05, among them Ultimaker S5, S6, S7, Prusa MINI+,
    Raise3D Pro3, Flashforge Adventurer 5M)
  family TPU: at most 30 mm/s
  outer wall, inner wall and infill speeds: at most the print speed after
    these limits

Travel speed (speed.travel):
  at most printer.motion.maxTravelSpeed
  at most 150 mm/s when maxTravelSpeed is null (not published: 57 printers
    of 79 on 2026-11-05), without warning: the travel does not change the
    quality of the part (decision of Noam, 2026-11-05)

Layer height (quality.layerHeight):
  at most 75 % of printer.defaultNozzle (Nozzle Compatibility Rule),
    rounded down to 0.01 mm
  at least 0.08 mm and at most 0.28 mm; when 75 % of the nozzle is below
    0.08 mm, the nozzle rule wins

Temperatures: at most the maximum temperatures of the printer
  (Temperature And Cooling)
```

VALUE_LIMITED (warning): given when a limit lowers the print speed, the travel speed, the layer height or a temperature by at least 10 % of the value before the limit. The limit of 100 mm/s (maxPrintSpeed null) always gives it when it lowers the print speed. The limit of 150 mm/s (maxTravelSpeed null) never gives it (1.1.1).

Example (test required by Noam): Ultimaker S5 (maxPrintSpeed and maxTravelSpeed null) with the preset Fast Prototype: print speed 250 lowered to 100 mm/s with the warning VALUE_LIMITED; travel 250 lowered to 150 mm/s without warning of its own.

---

## Temperature And Cooling

ADR-035 D7. The values are a choice of the recommendation, shown as such. The rule of the filament data (a range is never turned into a single value, DATA_SCHEMA.md, Filament rules) applies to the data, not to the recommendation.

```text
Nozzle (temperature.nozzle):
  1. filament.manufacturerSettings.nozzleTemperature, when not null
  2. otherwise the middle of filament.temperature (minNozzle, maxNozzle),
     rounded to 5 °C
  3. without a filament, or when a value of the range of the filament is
     null: the middle of material.temperature (minNozzle, maxNozzle),
     rounded to 5 °C
  then at most printer.thermal.maxNozzleTemp (no limit when null)

Bed (temperature.bed):
  the same rule with bedTemperature, minBed, maxBed and
  printer.thermal.maxBedTemp

Rounded to 5 °C:
  to the nearest multiple of 5; exactly between two multiples, the lower
  one; when the rounded value leaves the range, the nearest bound of the
  range

Examples:
  Bambu PLA Basic: nozzle 190-230 -> 210 °C; bed 35-45 -> 40 °C
  Polymaker PolyLite PLA: bed 25-60 (middle 42.5) -> 40 °C
  Prusament PLA: nozzle 210 °C (published), bed 40-60 -> 50 °C
  Prusament ASA: nozzle 260 °C and bed 110 °C (published)

TEMPERATURE_UNSUPPORTED (critical): the minimum of the range used (nozzle or
  bed) is above the maximum temperature of the printer; the value is then
  the maximum of the printer
```

```text
Fan (cooling.fanSpeed):
  1. filament.manufacturerSettings.fanSpeed, when not null
  2. otherwise by family, the middle of Cooling Rules rounded to 5 %:

     PLA   90 %
     PETG  50 %
     ABS   15 %
     ASA   15 %
     TPU   40 %

  A family without a value in this table, with no fan published by the
  filament: no recommendation (REC_002) until a value is added to this
  document (the shipped materials are the five families of the table)
  Material Cooling (fanMin, fanMax) is not used in Phase 10

Minimum layer time (cooling.minimumLayerTime): 5 s
```

---

## Retraction

ADR-035 D6.

```text
Distance and speed (retraction.distance, retraction.speed), each:
  1. filament.manufacturerSettings.retractionDistance or retractionSpeed,
     when not null (none is published on 2026-11-05)
  2. otherwise by printer.extruder.type (middle of Retraction Rules):
       direct_drive  0.8 mm  35 mm/s
       bowden        5 mm    40 mm/s
       unknown       0.8 mm  35 mm/s (values of the direct drive) and the
                     warning EXTRUDER_UNKNOWN (24 printers of 79, among
                     them every Bambu Lab printer)
  family TPU: the distance of step 2 is divided by two (a distance
  published by the filament is kept)
```

---

## Supports And Adhesion

ADR-035 D8 (SUPPORT_GENERATION_SPEC.md 1.1.0).

```text
supports.enabled: true when overhangs.maxAngle is above 60 degrees
  (start of High Risk; 46 to 60 degrees is Moderate, without support),
  or when bridges.longestBridge is above 50 mm (Critical bridge)
supports.type: the support type of the preset (tree, standard or none)
Vase preset: supports never enabled; warning VASE_SUPPORTS_IGNORED when
  the geometry would require them

adhesion:
  brim when stability.riskScore is at least 41 (Moderate), or the family is
    ABS or ASA (warp risk), or classification.detectedFeatures contains
    tall
  otherwise the adhesion of the preset (skirt)
  never a raft in Phase 10
```

---

## Recommendation Warnings

ADR-035 D9. Warning Schema of DATA_SCHEMA.md 3.10.0: source "recommendation", recommendedAction "", message an English reference text (never shown; the interface shows the translation of the code, warning.<CODE>). A code appears at most once in a recommendation, with the highest severity reached.

| Code | When | Severity |
|------|------|----------|
| CLASSIFICATION_UNCERTAIN | category unknown or confidence below 40 (PRINT_PRESETS_SPEC.md, Default Preset) | info |
| EXPECTED_PRESET_UNAVAILABLE | preset of the mapping not available (PRINT_PRESETS_SPEC.md, Default Preset) | info |
| OVERHANG_HIGH | overhangs.maxAngle above 60 degrees (supports enabled); above 75 degrees: high | medium / high |
| LONG_BRIDGE | bridges.longestBridge above 25 mm; above 50 mm (supports enabled): high | medium / high |
| THIN_WALLS | thinWalls.minimumThickness above 0 and below printer.defaultNozzle (Thin Wall Warning; the analysis keeps its own fixed threshold of 0.8 mm) | high |
| LOW_STABILITY | stability.riskScore 41 to 60: low; 61 to 80: medium; 81 to 100: high (brim added) | low / medium / high |
| OBJECT_TOO_LARGE | dimensions.width above buildVolume.x, depth above buildVolume.y or height above buildVolume.z (object as placed) | critical |
| TEMPERATURE_UNSUPPORTED | minimum temperature of the range used above the maximum of the printer (nozzle or bed) | critical |
| MATERIAL_NOT_LISTED | the family is not among the materials listed by the printer (the rule of the Material section, never blocking) | low |
| ENCLOSURE_RECOMMENDED | family ABS or ASA | low |
| VASE_SUPPORTS_IGNORED | Vase preset and a geometry that would require supports | medium |
| EXTRUDER_UNKNOWN | extruder type unknown and a retraction value taken from the direct drive values | info |
| VALUE_LIMITED | a value lowered by a limit (Limits) | info |

Order of display: critical first, then high, medium, low, info; the same severity in the order of this table. A critical warning does not block the recommendation: it is shown first, in red; nothing is blocked before the export (Phase 14).

Overhang severity follows SUPPORT_GENERATION_SPEC.md (61 to 75 degrees High, 76 to 90 degrees Critical in its scale): Overhang Rules below is aligned (1.1.0).

---

## Confidence

ADR-035 D10 (KI-010). The confidence of the preset is no longer used.

```text
confidenceScore = 100 minus:
  no filament selected                                       15
  incomplete analysis (mesh not closed, ANA_002, or thin
    walls not measured: minimumThickness 0)                  20
  printer of the user (source Local Custom, not verified)    10
  filament of the user (source Local Custom, not verified)   10
  automatic classification Low (40 to 59)                    10
  automatic classification Unknown (below 40, or category
    unknown)                                                 20
limited to 0 and 100; a whole number

A category chosen by the user (source user) gives no reduction.
Unknown Printer (-30) and Unknown Material (-30) of Confidence Reduction
  never apply: no recommendation is generated without them (REC_002).

Levels (Confidence Scale): 90-100 Excellent, 75-89 High, 60-74 Moderate,
  40-59 Low, 0-39 Very Low
```

These levels are those of the recommendation; the levels of the classification (OBJECT_CLASSIFICATION_SPEC.md, Confidence Levels) have other names, and the interface shows both with distinct labels.

---


# Object Classification Rules



The engine attempts to classify the object.



---



## Figurine



Indicators:



```text

High Detail



Organic Shape



Many Curves



Many Small Features

```



Priority:



```text

Surface Quality

```



---



## Mechanical Part



Indicators:



```text

Flat Surfaces



Precise Features



Holes



Functional Geometry

```



Priority:



```text

Strength



Accuracy

```



---



## Gear



Indicators:



```text

Teeth



Circular Geometry



Repeated Profile

```



Priority:



```text

Precision



Strength

```



---



## Vase



Indicators:



```text

Thin Wall



Single Shell



Large Vertical Surfaces

```



Priority:



```text

Surface Finish

```



---



## Structural Part



Indicators:



```text

Large Mass



Load Bearing Shape

```



Priority:



```text

Strength

```



---

---

# Print Preset Selection Rules

## Draft

Recommended For:

```text
Rapid Prototypes
Large Simple Objects
Low Detail Models
```

---

## Balanced

Recommended For:

```text
General Purpose Models
Functional Parts
Mixed Use Objects
```

---

## Quality

Recommended For:

```text
Miniatures
Figurines
Decorative Models
High Detail Objects
```

---

## Strength

Recommended For:

```text
Mechanical Parts
Structural Components
Load Bearing Objects
```

# Layer Height Rules



---



## High Detail Objects



Examples:



```text

Miniatures



Figurines



Decorative Models

```



Recommended:



```text

0.08

0.10

0.12

```



---



## Standard Objects



Recommended:



```text

0.16

0.20

```



---



## Large Objects



Recommended:



```text

0.24

0.28

```



---



# Nozzle Compatibility Rule



Maximum Layer Height



```text

Nozzle × 75%

```



Example:



```text

0.4 nozzle



↓



Maximum 0.30 layer

```



---



# Wall Count Rules



---



## Decorative Models



```text

2 - 3 Walls

```



---



## Functional Parts



```text

4 - 5 Walls

```



---



## Structural Parts



```text

5 - 8 Walls

```



---



## Thin Wall Warning



If model wall thickness:



```text

< nozzle width

```



Generate Warning.



---



# Top And Bottom Layers Rules



---



## Decorative



```text

4 - 5 Layers

```



---



## Functional



```text

5 - 7 Layers

```



---



## Structural



```text

6 - 10 Layers

```



---



# Infill Rules



---



## Decorative



```text

5% - 15%

```



Pattern:



```text

Lightning



Gyroid

```



---



## Standard



```text

15% - 25%

```



Pattern:



```text

Gyroid

```



---



## Mechanical



```text

25% - 50%

```



Pattern:



```text

Cubic

```



---



## Structural



```text

50% - 100%

```



Pattern:



```text

Cubic



Honeycomb

```



---



# Material-Specific Rules



---



# PLA



Profile:



```text

Easy Material

```



Nozzle:



```text

190 - 220°C

```



Bed:



```text

50 - 65°C

```



Fan:



```text

80 - 100%

```



Default Speed:



```text

60 - 150 mm/s

```



---



# PLA+



Nozzle:



```text

200 - 230°C

```



Fan:



```text

70 - 100%

```



Supports:



```text

Normal Rules

```



---



# PETG



Nozzle:



```text

220 - 260°C

```



Fan:



```text

30 - 70%

```



Rules:



```text

Reduce Excessive Cooling



Increase Retraction Validation

```



---



# ABS



Nozzle:



```text

230 - 270°C

```



Fan:



```text

0 - 30%

```



Rules:



```text

Require Heated Bed



Recommend Enclosure

```



---



# ASA



Rules:



```text

Recommend Enclosure



Reduce Fan



Increase Warp Monitoring

```



---



# TPU



Rules:



```text

Reduce Speed



Reduce Retraction



Prefer Direct Drive

```



Speed:



```text

20 - 60 mm/s

```



---



# Nylon



Rules:



```text

Drying Required



Enclosure Recommended



Warp Monitoring Enabled

```



---



# Carbon Fiber Materials



Rules:



```text

Require Hardened Nozzle

```



Generate Warning if:



```text

Brass Nozzle Detected

```



---



# Support Generation Rules



---



## Support Not Required



When:



```text

Overhang Below Threshold



Bridge Acceptable



Stable Geometry

```



---



## Support Required



When:



```text

Large Unsupported Areas



Critical Overhangs



Bridge Failure Risk

```



---



# Overhang Rules



---



## Safe



```text

0° - 45°

```



---



## Moderate



```text

46° - 60°

```



---



## High Risk



```text

61° - 90°

```



Support evaluation required.

Version 1.1.0: supports are enabled above 60 degrees (Supports And Adhesion). The severity of the warning OVERHANG_HIGH follows SUPPORT_GENERATION_SPEC.md: 61 to 75 degrees medium, 76 to 90 degrees high (Recommendation Warnings).



---



# Support Type Selection

Version 1.1.0: Organic and Tree below are one stored value, tree (DATA_SCHEMA.md 3.10.0, Support Type values; confirmed by Noam, 2026-11-05, answer A: tree only, organic removed, removed from the code in lot 86); the type used is the support type of the preset (PRINT_PRESETS_SPEC.md 1.3.0, Preset Values).



---



## Organic



Recommended:



```text

Figurines



Characters



Organic Assets

```



---



## Tree



Recommended:



```text

Complex Shapes



Decorative Models

```



---



## Standard



Recommended:



```text

Mechanical Parts



Functional Geometry

```



---



# Adhesion Rules



---



## Skirt



Default.



---



## Brim



Use When:



```text

Small Footprint



Tall Object



Warp Risk

```



---



## Raft



Use When:



```text

Critical Adhesion Risk



Very Difficult Materials

```



---



# Stability Rules



Evaluate:



```text

Object Height



Base Surface



Center Of Gravity

```



---



## Stable



```text

Wide Base



Low Height

```



---



## Medium Risk



Generate Advisory.



---



## High Risk



Recommend:



```text

Brim



Orientation Change

```



---



# Speed Rules



---



## High Detail



Reduce Speed.



---



## Thin Walls



Reduce Speed.



---



## Tall Objects



Reduce Speed.



---



## Large Flat Parts



Reduce Acceleration.



---



# Cooling Rules



---



# PLA



```text

80 - 100%

```



---



# PETG



```text

30 - 70%

```



---



# ABS



```text

0 - 30%

```



---



# ASA



```text

0 - 30%

```



---



# TPU



```text

20 - 60%

```



---



# Retraction Rules



---



# Direct Drive



Preferred:



```text

0.5 - 2 mm

```



---



# Bowden



Preferred:



```text

3 - 8 mm

```



---



# Bridge Rules



If bridge length increases:



```text

Increase Cooling



Reduce Bridge Speed

```



---



# Warp Risk Rules



Risk Factors:



```text

ABS



ASA



Nylon



Large Flat Surface



Small Contact Area

```



---



## High Warp Risk



Recommend:



```text

Brim



Enclosure



Higher Bed Temperature

```



---



# Confidence Rules



Confidence increases when:



```text

Verified Printer

Verified Material

Verified Filament

Complete Analysis

```


---


# Confidence Reduction


Unknown Printer


↓


-30


---


Unknown Material


↓


-30

---

Unknown Filament

↓

-15


---


Incomplete Analysis


↓


-20


---


Version 1.1.0: the complete list of reductions is in Confidence (Rules Of Version 1.1.0).


---


# Confidence Scale


```text

90-100

Excellent



75-89

High



60-74

Moderate



40-59

Low



0-39

Very Low

```



---



# Recommendation Validation



Before output:



Verify:



```text

Printer Limits



Material Limits



Geometry Limits

```



---



# Auto Correction Rules



If recommendation exceeds limits:



```text

Correct Automatically

```



---



Example:



```text

Recommended Speed



↓



Exceeds Printer



↓



Clamp To Printer Maximum

```



---



# Warning Rules



Critical Warning:



```text

Cannot Print

```



Examples:



```text

Object Too Large



Temperature Unsupported



Material Not Supported

```



---



# Warning



Examples:



```text

Warp Risk



Support Required



Tall Object

```



---



# Information



Examples:



```text

Suggestion



Optimization Opportunity



Alternative Orientation

```



---



# Optimization Rules



Only perform optimization if:



```text

Reliability Not Reduced

```



---



Optimization Priorities:



```text

Support Reduction



Time Reduction



Material Reduction

```



---



# Learning Rules



Version 1.x



```text

No Self Learning

```



Only deterministic rules.



---



# Future Rules



Reserved For:



```text

Machine Learning

Print History Analysis

Community Optimization

Failure Prediction

Vision Classification

Filament Performance Learning

Community Recommendation Learning

```



---



# Golden Rule



A successful print is always more important than an aggressive recommendation.



---



# End Of Document
