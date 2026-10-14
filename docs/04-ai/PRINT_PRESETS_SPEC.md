# SlicyWeb SMART SLICER

# PRINT PRESETS SPECIFICATION



Version: 1.1.0



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

