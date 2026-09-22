\# AI SMART SLICER

\# SUPPORT GENERATION SPECIFICATION

Version: 1.0.0

Status: Approved

Priority: High



\---



\# Purpose



This document defines the complete support generation logic used by Wichy.



Support generation is responsible for:



\- Detecting unsupported geometry

\- Determining support necessity

\- Selecting support type

\- Optimizing support placement

\- Reducing support material usage

\- Preserving surface quality



This specification is used by:



```text

AI\_ENGINE\_SPEC.md



RECOMMENDATION\_RULES.md



OBJECT\_CLASSIFICATION\_SPEC.md



GCODE\_ENGINE\_SPEC.md

```



\---



\# Objectives



The support system must:



\- Prevent print failures

\- Minimize support material

\- Reduce support removal effort

\- Preserve surface quality

\- Improve print success rate



\---



\# Support Generation Workflow



```text

Model Analysis

↓

Overhang Detection

↓

Bridge Detection

↓

Risk Evaluation

↓

Support Strategy Selection

↓

Support Optimization

↓

Confidence Evaluation

↓

Recommendation

```



\---



\# Support Principles



Priority Order:



```text

1\. Print Success

2\. Surface Quality

3\. Support Reduction

4\. Material Reduction

5\. Print Time Reduction

```



\---



\# Support Decision Process



The AI evaluates:



```text

Overhangs

Bridges

Object Category

Material

Filament

Printer Capabilities

Orientation

Confidence Score

```



before generating supports.



\---



\# Support Categories



Supported Types:



```text

Organic



Tree



Standard



Interface Supports



Custom Supports (Future)

```



\---



\# Standard Supports



Characteristics:



```text

Fast Generation



Simple Geometry



High Stability

```



\---



\# Recommended For



```text

Mechanical Parts



Brackets



Functional Components

```



\---



\# Advantages



```text

Reliable



Predictable



Easy To Validate

```



\---



\# Disadvantages



```text

More Material



Longer Removal Time

```



\---



\# Tree Supports



Characteristics:



```text

Branch Structure



Reduced Contact



Adaptive Shape

```



\---



\# Recommended For



```text

Complex Shapes



Decorative Objects



Organic Objects

```



\---



\# Advantages



```text

Less Material



Reduced Contact Surface



Easier Removal

```



\---



\# Disadvantages



```text

More Complex Generation

```



\---



\# Organic Supports



Characteristics:



```text

Natural Growth Structure



Minimal Contact



Curved Branches

```



\---



\# Recommended For



```text

Figurines



Miniatures



Sculptures



Characters

```



\---



\# Advantages



```text

Excellent Surface Preservation



Low Support Material

```



\---



\# Disadvantages



```text

Longer Generation Time

```



\---



\# Interface Supports



Purpose:



Create a clean separation layer between:



```text

Object



and



Support

```



\---



\# Benefits



```text

Improved Bottom Surface Quality



Easier Removal

```



\---



\# Overhang Analysis



Definition:



An overhang exists when geometry extends beyond the printable angle limit.



\---



\# Overhang Thresholds



Safe:



```text

0° - 45°

```



\---



Moderate:



```text

46° - 60°

```



\---



High Risk:



```text

61° - 75°

```



\---



Critical:



```text

76° - 90°

```



\---



\# Overhang Strategy



Safe:



```text

No Supports

```



\---



Moderate:



```text

Evaluate Material

```



\---



High Risk:



```text

Supports Recommended

```



\---



Critical:



```text

Supports Required

```



\---



\# Bridge Analysis



Definition:



A bridge is geometry printed between two support points.



\---



\# Bridge Length Categories



Short:



```text

0 - 10 mm

```



\---



Medium:



```text

10 - 25 mm

```



\---



Long:



```text

25 - 50 mm

```



\---



Critical:



```text

50+ mm

```



\---



\# Bridge Strategy



Short:



```text

No Supports

```



\---



Medium:



```text

Evaluate Material

```



\---



Long:



```text

Reduce Speed



Increase Cooling

```



\---



Critical:



```text

Supports Recommended

```



\---



\# Material Influence


Different materials tolerate overhangs differently.
Filament manufacturer profiles may further modify support recommendations.

Examples:

- High-performance PLA may reduce support requirements.
- Flexible TPU may require additional stability supports.
- Carbon fiber materials may require reinforced support structures.


\---



\# PLA



Support Requirement:



```text

Low

```



Cooling Capability:



```text

High

```



\---



\# PETG



Support Requirement:



```text

Moderate

```



Cooling Capability:



```text

Medium

```



\---



\# ABS



Support Requirement:



```text

High

```



Cooling Capability:



```text

Low

```



\---



\# ASA



Support Requirement:



```text

High

```



Warp Consideration:



```text

High

```



\---



\# TPU



Support Requirement:



```text

Moderate

```



Print Stability:



```text

Reduced

```



\---



\# Object Classification Influence


Supports depend on object category.


\---


\# Figurine


Preferred:


```text

Organic Supports

```


Goal:


```text

Surface Preservation

```


\---


\# Miniature


Preferred:


```text

Organic


Tree

```


Goal:


```text

Maximum Detail

```


\---


\# Mechanical Part



Preferred:



```text

Standard Supports

```



Goal:



```text

Dimensional Accuracy

```



\---



\# Enclosure



Preferred:



```text

Standard Supports

```



Goal:



```text

Flat Surface Quality

```



\---



\# Tool



Preferred:



```text

Standard Supports

```



Goal:



```text

Mechanical Reliability

```



\---


# Prototype

Preferred:

```text
Standard Supports
```

Goal:

- Fast Printing
- Material Reduction

\# Support Density


Purpose:


Control support strength.


\---



\# Light



```text

5 - 10%

```



Use:



```text

Small Supports



Easy Removal

```



\---



\# Standard



```text

10 - 20%

```



Use:



```text

General Purpose

```



\---



\# Dense



```text

20 - 35%

```



Use:



```text

Large Overhangs



Heavy Loads

```



\---



\# Interface Density



Recommended:



```text

70 - 100%

```



Used only at support contact surfaces.



\---



\# Support Placement Modes



\---



\## Everywhere



Allow supports:



```text

Build Plate



Objects



Supports

```



\---



\## Build Plate Only



Allow supports only from:



```text

Build Plate

```



\---



\# Recommendation Rules



The AI should always prefer:



```text

Build Plate Only

```



when possible.



\---



\# Support Distance



Purpose:



Control separation from model.



\---



\# Z Distance



Recommended:



```text

0.15 - 0.30 mm

```



Depends on:



```text

Layer Height



Material

```



\---



\# XY Distance



Recommended:



```text

0.2 - 0.8 mm

```



Depends on:



```text

Nozzle Size



Object Detail

```



\---



\# Support Optimization



Objectives:



```text

Reduce Material



Reduce Print Time



Reduce Contact Surface

```



without reducing reliability.



\---



\# Orientation Integration



Before generating supports:



Evaluate:



```text

Alternative Orientations

```



\---



\# Priority



Preferred:



```text

Rotate Object



↓



Reduce Supports



↓



Generate Remaining Supports

```



\---



\# Support Score



Each support strategy receives:



```text

0 - 100

Higher scores indicate a better balance between:

Print Reliability

Surface Quality

Material Usage

Removal Difficulty

Print Duration

```



\---



\# Evaluation Factors



```text

Print Success



Surface Quality



Material Usage



Removal Difficulty



Print Duration

```



\---



\# Removal Difficulty Score



Scale:



```text

0 - 100

```



\---



Meaning:



```text

0 Easy



100 Very Difficult

```



\---



\# AI Warning Rules



Generate warnings when:



```text

Large Support Volume

Critical Overhangs

Extensive Interfaces

Support Material Excessive

Low Confidence Recommendation

Unsupported Material Profile

Unknown Filament Profile

```



\---



\# Examples



```text

Support Volume Exceeds 30% Of Model Volume

```



\---



```text

Critical Overhang Detected

```



\---



```text

Orientation Could Reduce Supports

```



\---



\# Future Features



Reserved:



```text

Custom Support Painting

Hybrid Supports

Multi-Material Supports

Dissolvable Supports

Adaptive AI Supports

Vision-Based Support Detection

Community Support Optimization

Filament-Specific Support Learning

```



\---



\# Validation Rules



Generated support strategy must:



```text

Be Reproducible

Be Explainable

Be Consistent

Respect Printer Limits

Respect Material Limits

Respect Filament Limits

```



\---



\# Support Generation Golden Rule



The best support is the one that prevents failure while using the minimum amount of material and creating the least damage to the printed part.



\---



\# End Of Document

