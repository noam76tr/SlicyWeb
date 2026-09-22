\# AI SMART SLICER

\# PRINT PRESETS SPECIFICATION



Version: 1.0.0



Status: Approved

Priority: High


\---



\# Purpose



This document defines all print preset profiles available in Wichy.



Print presets provide predefined configurations based on:



\- Object Type

\- Print Goal

\- Material

\- Printer Capabilities



The AI Engine may select presets automatically.



Users may also select presets manually.



\---



\# Preset Philosophy



Every preset prioritizes one primary objective.



Examples:



```text

Maximum Quality



Fast Prototyping



Mechanical Strength



Material Saving

```



\---



\# Preset Categories



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



\---



\# Preset Structure



```json

{

&#x20; "preset": "",

&#x20; "layerHeight": 0,

&#x20; "wallCount": 0,

&#x20; "topLayers": 0,

&#x20; "bottomLayers": 0,

&#x20; "infillDensity": 0,

&#x20; "infillPattern": "",

&#x20; "supports": {},

&#x20; "cooling": {},

&#x20; "speed": {},

&#x20; "confidenceScore": 0

}

```



\---



\# ULTRA QUALITY



Purpose:



Highest visual quality.



\---



\# Intended Objects



```text

Miniatures



Figurines



Display Models



Decorative Parts

```



\---



\# Typical Settings



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



\---



\# Priority



```text

Visual Quality

```



\---



\# HIGH QUALITY



Purpose:



High quality while reducing print duration.



\---



\# Intended Objects



```text

Figurines



Decorative Models



Detailed Components

```



\---



\# Typical Settings



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



\---



\# Priority



```text

Quality

```



\---



\# BALANCED



Purpose:



General purpose printing.



\---



\# Intended Objects



```text

Most Prints



General Models



Utility Parts

```



\---



\# Typical Settings



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



\---



\# Priority



```text

Balanced Result

```



\---



\# DRAFT



Purpose:



Quick visual validation.



\---



\# Intended Objects



```text

Concept Models



Visual Checks



Dimension Checks

```



\---



\# Typical Settings



```text

Layer Height:

0.28



Walls:

2



Infill:

5%

```



\---



\# Priority



```text

Speed

```



\---



\# FAST PROTOTYPE



Purpose:



Rapid iteration.



\---



\# Intended Objects



```text

Prototypes



Test Fits



Mockups

```



\---



\# Typical Settings



```text

Layer Height:

0.28



Walls:

2



Infill:

10%



Maximum Speed

```



\---



\# Priority



```text

Minimum Print Time

```



\---



\# FUNCTIONAL



Purpose:



General purpose functional parts.



\---



\# Intended Objects



```text

Brackets



Mounts



Adapters



Tools

```



\---



\# Typical Settings



```text

Layer Height:

0.20



Walls:

4



Infill:

25%



Strength Oriented

```



\---



\# Priority



```text

Reliability

```



\---



\# STRUCTURAL



Purpose:



Load-bearing components.



\---



\# Intended Objects



```text

Reinforced Parts



Supports



Heavy Use Components

```



\---



\# Typical Settings



```text

Layer Height:

0.20



Walls:

5



Infill:

50%



Reduced Speed

```



\---



\# Priority



```text

Maximum Strength

```



\---



\# ENGINEERING



Purpose:



Precision engineering parts.



\---



\# Intended Objects



```text

Mechanical Components



Gears



Assemblies

```



\---



\# Typical Settings



```text

Layer Height:

0.16



Walls:

4



Infill:

35%



Controlled Speed

```



\---



\# Priority



```text

Dimensional Accuracy

```



\---



\# FLEXIBLE



Purpose:



Flexible filament printing.



\---



\# Intended Materials



```text

TPU



TPE

```



\---



\# Typical Settings



```text

Reduced Speed



Reduced Retraction



Controlled Cooling

```



\---



\# Priority



```text

Reliable Extrusion

```



\---



\# MINIATURE



Purpose:



Very small highly detailed models.



\---



\# Typical Settings



```text

Layer Height:

0.08



Fine Nozzle Recommended



Very Slow Speed

```



\---



\# Priority



```text

Maximum Detail

```



\---



\# VASE



Purpose:



Single-wall decorative objects.



\---



\# Typical Settings



```text

Vase Mode



No Infill



Continuous Wall

```



\---



\# Priority



```text

Surface Finish

```



\---



\# CUSTOM



Purpose:



User-defined profile.



\---



\# User Control



User controls all values.



\---



\# AI Behavior



AI may:



```text

Suggest Improvements



Validate Limits



Generate Warnings

```



\---



\# Material Overrides



Material profiles may alter preset values.



Example:



```text

PLA



Higher Cooling

```



\---



Example:



```text

ABS



Lower Cooling



Enclosure Warning

```



\---



\# Printer Overrides



Printer limits always have priority.



Example:



```text

Preset Speed



↓



Exceeds Printer Limit



↓



Clamp To Valid Value

```



\---



\# AI Preset Selection



The AI Engine may automatically select presets based on:



```text

Object Classification
Material
Filament
Printer
User Goal

```



\---



\# Example Mapping



```text

Figurine



↓



Ultra Quality

```



\---



```text

Mechanical Part



↓



Engineering

```



\---



```text

Bracket



↓



Structural

```



\---



```text

Prototype



↓



Fast Prototype

```



\---



\# User Objectives



Future Support



Users may select:



```text

Maximum Quality



Balanced



Fastest Print



Strongest Part



Lowest Cost

```



\---



\# Validation



Every preset must pass:



```text

Printer Validation



Material Validation



Geometry Validation

```



before becoming active.



\---



\# Future Presets



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



\---



\# Golden Rule



Presets are starting points.



Safety, printer limits, material limits, and geometry constraints always take priority over preset values.



\---



\# End Of Document

