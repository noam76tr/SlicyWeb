# SlicyWeb SMART SLICER

# PRINT PRESETS SPECIFICATION



Version: 1.3.1



Status: Approved

Priority: High


---



# Purpose



This document defines all print preset profiles available in SlicyWeb.



Print presets provide predefined configurations based on:



- Object Type

- Print Goal

- Material

- Printer Capabilities



The AI Engine may select presets automatically.



Users may also select presets manually.



Version 1.3.0 (ADR-035 D1): in Phase 10, the preset is selected automatically only; the manual choice of a preset and the Custom preset come in Phase 15.



---



# Preset Philosophy



Every preset prioritizes one primary objective.



Examples:



```text

Maximum Quality



Fast Prototyping



Mechanical Strength



Material Saving

```



---



# Preset Categories



```text

Ultra Quality



High Quality



Balanced



Draft



Fast Prototype



Structural



Functional



Engineering



Flexible



Miniature



Vase



Custom

```



---



# Preset Structure



```json

{

 "preset": "",

 "layerHeight": 0,

 "wallCount": 0,

 "topLayers": 0,

 "bottomLayers": 0,

 "infillDensity": 0,

 "infillPattern": "",

 "supports": {},

 "cooling": {},

 "speed": {},

 "confidenceScore": 0

}

```

Stored form (1.3.0): DATA_SCHEMA.md 3.10.0, Print Preset Schema and Preset Settings.



---



# ULTRA QUALITY



Purpose:



Highest visual quality.



---



# Intended Objects



```text

Miniatures



Figurines



Display Models



Decorative Parts

```



---



# Typical Settings



```text

Layer Height:

0.08



Walls:

3



Infill:

10%



Speed:

Slow



Supports:

Organic

```

Version 1.3.0: organic supports are stored as tree (Preset Values).



---



# Priority



```text

Visual Quality

```



---



# HIGH QUALITY



Purpose:



High quality while reducing print duration.



---



# Intended Objects



```text

Figurines



Decorative Models



Detailed Components

```



---



# Typical Settings



```text

Layer Height:

0.12



Walls:

3



Infill:

15%



Speed:

Moderate

```



---



# Priority



```text

Quality

```



---



# BALANCED



Purpose:



General purpose printing.



---



# Intended Objects



```text

Most Prints



General Models



Utility Parts

```



---



# Typical Settings



```text

Layer Height:

0.20



Walls:

3



Infill:

15%



Speed:

Standard

```



---



# Priority



```text

Balanced Result

```



---



# DRAFT



Purpose:



Quick visual validation.



---



# Intended Objects



```text

Concept Models



Visual Checks



Dimension Checks

```



---



# Typical Settings



```text

Layer Height:

0.28



Walls:

2



Infill:

5%

```



---



# Priority



```text

Speed

```



---



# FAST PROTOTYPE



Purpose:



Rapid iteration.



---



# Intended Objects



```text

Prototypes



Test Fits



Mockups

```



---



# Typical Settings



```text

Layer Height:

0.28



Walls:

2



Infill:

10%



Maximum Speed

```



---



# Priority



```text

Minimum Print Time

```



---



# FUNCTIONAL



Purpose:



General purpose functional parts.



---



# Intended Objects



```text

Mounts



Adapters



Tools

```



---



# Typical Settings



```text

Layer Height:

0.20



Walls:

4



Infill:

25%



Strength Oriented

```



---



# Priority



```text

Reliability

```



---



# STRUCTURAL



Purpose:



Load-bearing components.



---



# Intended Objects



```text

Reinforced Parts



Supports



Heavy Use Components

```



---



# Typical Settings



```text

Layer Height:

0.20



Walls:

5



Infill:

50%



Reduced Speed

```



---



# Priority



```text

Maximum Strength

```



---



# ENGINEERING



Purpose:



Precision engineering parts.



---



# Intended Objects



```text

Mechanical Components



Gears



Assemblies

```



---



# Typical Settings



```text

Layer Height:

0.16



Walls:

4



Infill:

35%



Controlled Speed

```



---



# Priority



```text

Dimensional Accuracy

```



---



# FLEXIBLE



Purpose:



Flexible filament printing.



---



# Intended Materials



```text

TPU



TPE

```



---



# Typical Settings



```text

Reduced Speed



Reduced Retraction



Controlled Cooling

```



---



# Priority



```text

Reliable Extrusion

```



---



# MINIATURE



Purpose:



Very small highly detailed models.



---



# Typical Settings



```text

Layer Height:

0.08



Fine Nozzle Recommended



Very Slow Speed

```



---



# Priority



```text

Maximum Detail

```



---



# VASE



Purpose:



Single-wall decorative objects.



---



# Typical Settings



```text

Vase Mode



No Infill



Continuous Wall

```



---



# Priority



```text

Surface Finish

```



---



# CUSTOM



Purpose:



User-defined profile.



---



# User Control



User controls all values.



---



# AI Behavior



AI may:



```text

Suggest Improvements



Validate Limits



Generate Warnings

```



---



# Material Overrides



Material profiles may alter preset values.



Example:



```text

PLA



Higher Cooling

```



---



Example:



```text

ABS



Lower Cooling



Enclosure Warning

```



---



# Printer Overrides



Printer limits always have priority.



Example:



```text

Preset Speed



↓



Exceeds Printer Limit



↓



Clamp To Valid Value

```



---



# AI Preset Selection



The AI Engine may automatically select presets based on:



```text

Object Classification
Material
Filament
Printer
User Goal

```



---



# Shipped Presets

Version 1.3.0 (DECISIONS.md, ADR-035 D4 and D5; decisions of Noam, 2026-11-05).

SlicyWeb ships 11 presets: one per preset category, except Custom (Phase 15). The values are written by SlicyWeb, not taken from a manufacturer or a slicer.

```text
Location: data/presets/, one JSON file per preset (as balanced.json)
Format: Repository Data Schema envelope, type "preset", source "Official";
  data is a Print Preset Schema (DATA_SCHEMA.md 3.10.0, Preset Settings)
Loading: by the main process (PresetLoader, Phase 10 lot 86), validated
  with PresetSchema (strict), served by the IPC channel preset:getAll; a
  file refused is not used (the other presets stay available) and is
  reported in the log with SCH_001 (ERROR_CODES_SPEC.md 2.4.1)
id of the envelope (1.3.1): the stored value of the category (as balanced),
  also the name of the file; a preset whose id is already loaded is refused
version of the envelope: 1.0.0
No synchronization with the profile repository in Phase 10
name: the English name of the category (as "Balanced"); the interface shows
  the translation of the category (preset.<category>)
confidenceScore: 100
```

---

# Preset Values

The layer height, walls and infill of 8 presets come from the Typical Settings of this document; the other values were proposed in lot 83 and validated by Noam (D5, corrected: one name for the tree supports).

| Preset | Layer (mm) | Walls | Top | Bottom | Infill | Pattern | Support type | Adhesion | Print speed (mm/s) |
|--------|------------|-------|-----|--------|--------|---------|--------------|----------|--------------------|
| Ultra Quality | 0.08 | 3 | 10 | 8 | 10 % | gyroid | tree | skirt | 60 |
| High Quality | 0.12 | 3 | 7 | 6 | 15 % | gyroid | tree | skirt | 100 |
| Balanced | 0.20 | 3 | 5 | 4 | 15 % | gyroid | tree | skirt | 150 |
| Draft | 0.28 | 2 | 4 | 3 | 5 % | lightning | standard | skirt | 200 |
| Fast Prototype | 0.28 | 2 | 4 | 3 | 10 % | lightning | standard | skirt | 250 |
| Functional | 0.20 | 4 | 6 | 5 | 25 % | gyroid | standard | skirt | 120 |
| Structural | 0.20 | 5 | 7 | 6 | 50 % | cubic | standard | skirt | 80 |
| Engineering | 0.16 | 4 | 7 | 6 | 35 % | cubic | standard | skirt | 80 |
| Flexible | 0.20 | 3 | 5 | 4 | 15 % | gyroid | standard | skirt | 30 |
| Miniature | 0.08 | 3 | 10 | 8 | 15 % | gyroid | tree | skirt | 40 |
| Vase | 0.20 | 1 | 0 | 4 | 0 % | gyroid | none | skirt | 80 |

Rules:

```text
Support type: the type used IF the geometry requires supports
  (RECOMMENDATION_RULES.md 1.1.0, Supports And Adhesion); supportEnabled is
  false for every preset: no preset enables supports by itself
  (AI_ENGINE_SPEC.md: supports only when justified)
tree: the only name of the tree supports (also called organic); the
  translation per target slicer is done by the export (Phase 14, KI-012)
Vase: never supports; the vase mode itself (continuous spiral wall) has no
  field in the recommended profile (Known Issue, Phase 14)
Fan: not a value of the preset (the field fanSpeed is removed); it comes
  from the filament or the family of the material
Flexible: not selected by the Classification To Preset Mapping in Phase 10;
  a TPU filament is handled by the limits of the recommendation
  (RECOMMENDATION_RULES.md 1.1.0, Limits); the preset is shipped for the
  manual choice (Phase 15)
Speeds in mm/s, then limited by the printer and the material
  (RECOMMENDATION_RULES.md 1.1.0, Limits): a fast printer is slowed down to
  the speed of the preset; reliability is never sacrificed to speed
```

---

# Classification To Preset Mapping

Each classification category (OBJECT_CLASSIFICATION_SPEC.md, Supported Categories) selects one preset category.

Stored values: DATA_SCHEMA.md, Classification Categories and Print Preset Categories.

| Classification Category | Preset Category |
|-------------------------|-----------------|
| Figurine | Ultra Quality |
| Miniature | Miniature |
| Mechanical Part | Engineering |
| Gear | Engineering |
| Bracket | Structural |
| Container | Balanced |
| Vase | Vase |
| Enclosure | Functional |
| Tool | Functional |
| Articulated Model | Engineering |
| Prototype | Fast Prototype |
| Structural Part | Structural |
| Decorative Object | High Quality |
| Functional Part | Functional |
| Unknown | Balanced |

---

# Default Preset

The default preset category is Balanced.

Rules:

```text
1. Classification Unknown, or confidence level Unknown (score below 40,
   OBJECT_CLASSIFICATION_SPEC.md, Confidence Levels):
   Balanced preset
   Warning CLASSIFICATION_UNCERTAIN (severity info)

2. The preset category given by the mapping is not available:
   Balanced preset
   Warning EXPECTED_PRESET_UNAVAILABLE (severity info)

3. No Balanced preset is available:
   No recommendation is generated (ERROR_CODES_SPEC.md, REC_002 Insufficient Data)
```

The first preset of a list is never used as a fallback.

When several available presets have the selected category, the first of them in the list is used.

---

# Preset Selection Warnings

| Code | Severity | Message |
|------|----------|---------|
| CLASSIFICATION_UNCERTAIN | info | Object classification uncertain. Balanced preset used. |
| EXPECTED_PRESET_UNAVAILABLE | info | Expected preset not available. Balanced preset used. |

These warnings are added to the warnings of the recommendation (DATA_SCHEMA.md, Recommendation Schema).

---

# Recommended Profile Initialization

The recommended profile is initialized from preset.settings, then adjusted (Golden Rule).

Values not defined by preset.settings keep the defaults of the recommendation engine.

The outer wall, inner wall and infill speeds never exceed preset.settings.printSpeed. The travel speed is not limited by it.

Engine defaults (1.3.0, ADR-035 D5): outer wall 40 mm/s, inner wall 80 mm/s, infill 120 mm/s (each at most printSpeed), travel 250 mm/s, minimum layer time 5 s. Then the limits, temperatures, cooling, retraction, supports and adhesion of RECOMMENDATION_RULES.md 1.1.0 are applied.

The target slicer export uses the recommended profile values (DATA_SCHEMA.md, Recommended Profile Schema, Export Values).

---

# User Objectives



Future Support



Users may select:



```text

Maximum Quality



Balanced



Fastest Print



Strongest Part



Lowest Cost

```



---



# Validation



Every preset must pass:



```text

Printer Validation



Material Validation



Geometry Validation

```



before becoming active.



---



# Future Presets



Reserved



```text

Carbon Fiber

High Temperature

Industrial

Toolhead Specific

Resin Comparison

Multi Material

Low Cost

Support Free

```



---



# Golden Rule



Presets are starting points.



Safety, printer limits, material limits, and geometry constraints always take priority over preset values.



---



# End Of Document

