\# AI SMART SLICER

\# PRINT SETTINGS SPECIFICATION



Version: 1.0.0



Status: Approved



Priority: Critical



\---



\# Purpose



This document defines all print settings managed by Wichy.



The objective is to standardize:



\- AI recommendations

\- Print profiles

\- Material settings

\- Optimization strategies

\- Future G-Code generation



This specification serves as the reference for all print configuration generation.



\---



\# Objectives



The print settings system must:



\- Produce reliable prints

\- Respect printer limits

\- Respect material limits

\- Adapt to model geometry

\- Support optimization workflows

\- Remain reproducible



\---



\# Settings Architecture



```text

Printer

\+

Material

\+

Filament

\+

Print Preset

\+

Model Analysis

\+

Object Classification

↓

Print Settings

↓

Validation

↓

Final Profile

```



\---



\# Settings Categories



```text

Quality

Shell

Infill

Support

Adhesion

Speed

Cooling

Retraction

Temperature

Advanced

```

\---

\# Quality Settings

Controls surface quality and detail level.

\---

\## Layer Height

Unit:



```text

mm

```



\---



\# Standard Values



```text

0.08



0.10



0.12



0.16



0.20



0.24



0.28

```



\---



\# Validation Rule



Maximum Layer Height:



```text

75% of nozzle diameter

```



Example:



```text

0.4 nozzle



↓



Maximum Layer Height



0.30 mm

```



\---



\# Initial Layer Height



Purpose:



Improve adhesion.



\---



\# Recommended Values



```text

0.20



0.24



0.28

```



depending on printer and material.



\---



\# Shell Settings



\---



\## Wall Count



Purpose:



Control part strength.



\---



\# Decorative



```text

2-3 Walls

```



\---



\# Functional



```text

4-5 Walls

```



\---



\# Structural



```text

5-8 Walls

```



\---



\## Wall Thickness



Derived from:



```text

Nozzle Size



Wall Count

```



\---



\# Top Layers



Purpose:



Close top surfaces.



\---



\# Recommended



```text

4 - 10 Layers

```



\---



\# Bottom Layers



Purpose:



Create stable foundations.



\---



\# Recommended



```text

4 - 10 Layers

```



\---



\# Infill Settings



Purpose:



Control internal structure.



\---



\## Density



Range:



```text

0 - 100%

```



\---



\# Decorative



```text

5 - 15%

```



\---



\# Standard



```text

15 - 25%

```



\---



\# Functional



```text

25 - 50%

```



\---



\# Structural



```text

50 - 100%

```



\---



\## Infill Patterns



Supported:



```text

Gyroid



Grid



Cubic



Honeycomb



Lightning



Lines



Triangles

```



\---



\# Pattern Selection



\---



\## Gyroid



Default recommendation.



\---



\## Lightning



Material-saving.



\---



\## Cubic



Mechanical strength.



\---



\## Honeycomb



Maximum rigidity.



\---



\# Support Settings



Reference:



```text

SUPPORT\_GENERATION\_SPEC.md

```



\---



\## Support Enabled



Values:



```text

true



false

```



\---



\## Support Type



```text

Organic



Tree



Standard

```



\---



\## Support Density



```text

5 - 35%

```



\---



\## Support Interface



```text

Enabled



Disabled

```



\---



\## Support Placement



```text

Build Plate Only



Everywhere

```



\---



\# Adhesion Settings



Purpose:



Improve first-layer success.



\---



\## Skirt



Default option.



\---



\## Brim



Recommended for:



```text

Small Footprint



Tall Objects



Warp Risk

```



\---



\## Raft



Recommended for:



```text

Extreme Adhesion Issues



Difficult Materials

```



\---



\# Speed Settings



Unit:



```text

mm/s

```



\---



\## Print Speed



Typical Range:



```text

20 - 300 mm/s

```



\---



\## Outer Wall Speed



Purpose:



Improve visual quality.



\---



Recommended:



```text

30 - 80% of print speed

```



\---



\## Inner Wall Speed



Recommended:



```text

80 - 100% of print speed

```



\---



\## Infill Speed



May exceed wall speed.



\---



\## Travel Speed



Purpose:



Reduce print duration.



\---



Range:



```text

100 - 500 mm/s

```



depending on printer capability.



\---



\# Cooling Settings



Purpose:



Control layer solidification.



\---



\## Fan Speed



Range:



```text

0 - 100%

```



\---



\# PLA



```text

80 - 100%

```



\---



\# PETG



```text

30 - 70%

```



\---



\# ABS



```text

0 - 30%

```



\---



\# ASA



```text

0 - 30%

```



\---



\# TPU



```text

20 - 60%

```



\---



\# Retraction Settings



Purpose:



Reduce stringing.



\---



\## Retraction Distance



Direct Drive:



```text

0.5 - 2 mm

```



\---



Bowden:



```text

3 - 8 mm

```



\---



\## Retraction Speed



Range:



```text

20 - 80 mm/s

```



\---



\## Z-Hop



Values:



```text

Disabled



Enabled

```



\---



Recommended when:



```text

Travel Collisions Possible

```



\---



\# Temperature Settings


\---


\## Nozzle Temperature


Derived from:


```text

Material Profile

---

Also influenced by:

```text
Filament Profile
```

\---

\## Bed Temperature

Derived from:

```text

Material Profile

```
---

Also influenced by:

```text
Filament Profile
```


\---


\## Chamber Temperature


Derived from:


```text

Printer Profile

```


and


```text

Material Requirements

```



\---



\# Advanced Settings



\---



\## Adaptive Layers



Future Feature.



\---



\## Ironing



Purpose:



Improve top surface finish.



\---



\## Variable Infill



Future Feature.



\---



\## Pressure Advance



Future Feature.



\---



\## Input Shaping



Future Feature.



\---



\# AI Modification Rules



The AI may modify:



```text

Layer Height

Walls

Infill

Supports

Cooling

Retraction

Adhesion

Print Preset

Orientation Recommendation
```



\---



The AI must NEVER exceed:



```text

Printer Limits

Material Limits

Filament Limits

```



\---



\# Profile Types



Supported Presets:



```text

Draft
Fast
Balanced
Quality
Ultra Quality
Mechanical
Prototype
Miniature
Support Free
Low Cost

```



\---



\# Settings Confidence


Every generated profile receives:


```text

Confidence Score

```


Range:


```text

0 - 100

Confidence is increased by:

Verified Printer Profile

Verified Material Profile

Verified Filament Profile

Complete Model Analysis

```


\---


\# Validation Engine


Before applying settings:


Verify:


```text

Printer Compatibility

Material Compatibility

Filament Compatibility

Geometry Compatibility

```



\---



\# Invalid Settings



Reject:



```text

Unsupported Temperatures



Excessive Speeds



Invalid Layer Heights



Invalid Retraction Values

```



\---



\# Future Features



Reserved:



```text

Machine Learning Tuning

Community Profiles

Cloud Profiles

Automatic Calibration

Print History Optimization

Filament Performance Learning

Vision Classification Integration

Community Recommendation Learning

```



\---



\# Integration Points



Used By:



```text

AI\_ENGINE\_SPEC.md



RECOMMENDATION\_RULES.md



OBJECT\_CLASSIFICATION\_SPEC.md



SUPPORT\_GENERATION\_SPEC.md



GCODE\_ENGINE\_SPEC.md

```



\---



\# Golden Rule



Every print setting must improve the probability of a successful print without violating printer, material, or geometry constraints.



\---



\# End Of Document

