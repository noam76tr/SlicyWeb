# SlicyWeb Smart Slicer

# OBJECT CLASSIFICATION SPECIFICATION

Version: 1.2.1

Status: Approved

Priority: Critical

---

# Purpose

This document defines how the AI Engine classifies 3D models.

The classification system allows the AI to understand the intended purpose of a model before generating recommendations.

Classification directly influences:

- Layer Height
- Infill
- Wall Count
- Supports
- Speeds
- Cooling
- Adhesion
- Optimization Strategy

---

# Objectives

The classification system must:

- Identify object categories
- Estimate object purpose
- Improve recommendation quality
- Improve print success rate
- Improve print optimization

---

# Classification Workflow

```text
Model Import

↓

Geometry Analysis

↓

Feature Detection

↓

Category Detection

↓

Confidence Score

↓

Recommendation Engine
```

---

# Classification Principles

The AI must classify objects using:

```text
Geometry

Dimensions

Topology

Features

Proportions

Printer Context

Material Context

Filament Context
```

Never use file names alone.

File names may assist classification but must never be considered authoritative.

Version 1.2.0 (ADR-035 D2): the file name is not used. The automatic classification uses the geometry only (Automatic Classification below); the printer, the material and the filament are taken into account by the confidence of the recommendation (RECOMMENDATION_RULES.md 1.1.0, Confidence), not by the confidence of the classification.

---

# Classification Output

```json
{
  "category": "",
  "subcategory": "",
  "confidenceScore": 0,
  "detectedFeatures": []
}
```

Stored form: DATA_SCHEMA.md 3.10.0, Object Classification Schema (with detectedTags, classificationVersion and source).

---

# Confidence Range

```text
0 - 100
```

---

# Confidence Levels

```text
90 - 100
Very High

75 - 89
High

60 - 74
Medium

40 - 59
Low

0 - 39
Unknown
```

---

# Supported Categories

```text
Figurine

Miniature

Mechanical Part

Gear

Bracket

Container

Vase

Enclosure

Tool

Articulated Model

Prototype

Structural Part

Decorative Object

Functional Part

Unknown
```

---

# Figurine

Characteristics:

```text
High Detail

Organic Shapes

Curves

Small Features

Complex Geometry
```

---

# Recommendation Priority

```text
Surface Quality

Detail Preservation
```

---

# Typical Settings

```text
Low Layer Height

Reduced Speed

Organic Supports
```

Version 1.2.0: organic supports are stored as tree (DATA_SCHEMA.md 3.10.0, Support Type values).

---

# Miniature

Characteristics:

```text
Small Size

Very Fine Details

Small Features
```

---

# Priority

```text
Maximum Quality
```

---

# Mechanical Part

Characteristics:

```text
Flat Surfaces

Precise Holes

Functional Geometry

Regular Shapes
```

---

# Priority

```text
Strength

Accuracy

Reliability
```

---

# Gear

Characteristics:

```text
Circular Shape

Repeated Teeth

Rotational Symmetry
```

---

# Priority

```text
Precision

Dimensional Accuracy

Strength
```

---

# Recommended Settings

```text
Low Layer Height

High Wall Count
```

---

# Bracket

Characteristics:

```text
Mounting Holes

Reinforcement Ribs

L-Shapes

Structural Features
```

---

# Priority

```text
Mechanical Strength
```

---

# Container

Characteristics:

```text
Internal Volume

Open Top

Storage Geometry
```

---

# Priority

```text
Leak Prevention

Wall Consistency
```

---

# Vase

Characteristics:

```text
Thin Walls

Vertical Geometry

Large Hollow Volume
```

---

# Priority

```text
Surface Finish
```

---

# Special Mode

Possible:

```text
Vase Mode
```

---

# Enclosure

Characteristics:

```text
Box Shape

Holes

Covers

Electronic Compartments
```

---

# Priority

```text
Dimensional Accuracy

Strength
```

---

# Tool

Characteristics:

```text
Grip Areas

Functional Features

Mechanical Loads
```

---

# Priority

```text
Strength

Durability
```

---

# Articulated Model

Characteristics:

```text
Multiple Moving Parts

Joints

Linked Sections
```

---

# Priority

```text
Clearances

Dimensional Accuracy
```

---

# Prototype

Characteristics:

```text
Simple Geometry

Concept Validation

Non-final Design
```

---

# Priority

```text
Speed

Material Savings
```

---

# Structural Part

Characteristics:

```text
Large Volume

Load Bearing Design

Reinforced Sections
```

---

# Priority

```text
Strength

Reliability
```

---

# Decorative Object

Characteristics:

```text
Visual Focus

Aesthetic Shapes

Non Functional
```

---

# Priority

```text
Appearance

Surface Finish
```

---

# Functional Part

Characteristics:

```text
Engineering Features

Expected Usage

Mechanical Loads
```

---

# Priority

```text
Reliability

Strength
```

---

# Unknown Category

If confidence is low:

```text
Unknown
```

---

# Unknown Object Strategy

Applies when the category is Unknown or the confidence level is Unknown (section Confidence Levels).

Use:

```text
Balanced Profile

Balanced Print Preset
```

Generate:

```text
Information Warning
```

Example:

```text
Object Classification Uncertain
```

---

# Automatic Classification

Version 1.2.0 (DECISIONS.md, ADR-035 D2 and D3; decisions of Noam, 2026-11-05).

The automatic classification detects only what the geometry can show. Several categories depend on the intended use of the object (a bracket, a tool, an enclosure, an articulated model, a prototype, a structural or functional part can have exactly the same shape): they are chosen by the user only (User Choice below).

The classification is computed in the Web Worker of the analysis, at the same time as the analysis, on the object as placed on the build plate (DATA_SCHEMA.md, Analysis Rules). It is reproducible and deterministic: the same mesh, rotation and scale always give the same classification.

---

## Geometric Features

Stored in classification.detectedFeatures, with these fixed lowercase names, in this order, each at most once.

| Feature | Measure | Threshold |
|---------|---------|-----------|
| small | largest of dimensions.width, depth, height | at most 40 mm |
| large | largest of dimensions.width, depth, height | at least 150 mm |
| tall | dimensions.height divided by the smallest side of the base (smaller of width and depth) | at least 3 |
| flat | the same ratio | at most 0.2 |
| planar | planar share: area of the planar regions divided by geometry.surfaceArea | at least 70 % |
| curved | the same planar share | at most 30 % |
| holes | through holes: genus of the welded mesh | at least 1 |
| hollow | geometry.volume divided by the volume of the convex hull of the mesh | at most 0.35 |
| open_top | hollow open towards the top (definition below) | - |
| thin_walls | thinWalls.detected of the analysis (below 0.8 mm) | - |

Definitions:

```text
Planar region:
  triangles joined by their edges whose normals differ by at most 1 degree
  from the normal of the first triangle of the region; a region counts only
  when its area is at least 1 % of geometry.surfaceArea
  (a curved surface made of many small faces gives no planar region)

Genus (holes):
  computed on the welded mesh (vertices at the same position merged, as the
  analysis): genus = (2 x C - (V - E + F)) / 2, with C connected parts,
  V vertices, E edges, F triangles; holes when the genus is at least 1
  not computed (holes absent) when the mesh is not closed (ANA_002)

Convex hull (hollow):
  the convex hull of the vertices of the placed object, in 3D;
  hollow absent when the volume of the hull is 0

open_top:
  a vertical ray going down from above the object, at the center of its
  bounding box seen from above, first meets a triangle facing up whose
  height is below 50 % of dimensions.height (the inner bottom of a cup or
  of a vase); absent when the ray meets no triangle, or first meets a face
  higher than 50 % (a lid, a closed top)
  and the bottom met is surrounded by walls (1.2.1, remark of Noam,
  2026-11-05): from the point met, raised by 0.01 mm, four horizontal rays
  (+X, -X, +Y, -Y, axes of the build plate) each meet a triangle; absent
  when one of them meets nothing (an L bracket: its base is low and faces
  up, but it is open on three sides; a tray with three walls)
```

Version 1.2.1: the walls around the bottom are required for open_top. Without them, a thin L bracket (hollow, its base below 50 % of the height) was classified as a container. An L bracket is neither a container nor a vase (model built in the tests).

---

## Category Rules

Checked in this order; the first rule that matches gives the category and its confidence.

| Order | Category | Rule | Confidence |
|-------|----------|------|------------|
| 1 | vase | hollow and open_top and tall, without holes | 75 |
| 2 | container | hollow and open_top | 70 |
| 3 | miniature | small and curved | 70 |
| 4 | figurine | curved, without hollow and without holes | 65 |
| 5 | mechanical_part | planar and holes | 65 |
| - | unknown | no rule matches | 0 |

```text
unknown: Balanced preset and warning CLASSIFICATION_UNCERTAIN
  (Unknown Object Strategy; PRINT_PRESETS_SPEC.md, Default Preset)
automatic confidence: never above 75 (High): the geometry alone does not
  allow more certainty
never chosen automatically: gear, bracket, enclosure, tool,
  articulated_model, prototype, structural_part, decorative_object,
  functional_part
subcategory: "" ; detectedTags: [] (no list is defined)
classificationVersion: "1.2.1"
source: "automatic"
```

The thresholds and the confidences are a first setting. They are checked on models built in the tests (cube, tower, sphere, open vase, open box, plate with holes, closed box, L bracket) and on the models of Noam during the manual controls, and can be adjusted before the closure of Phase 10 (a new version of this document).

---

## User Choice

ADR-035 D3 (GUI_SPEC.md, Rule 7: the AI helps the user, it does not decide for them).

```text
Recommendation section, list "Object type":
  "Automatic (<category>)" first: the automatic classification
  then the 15 categories (Supported Categories)

A category chosen by the user:
  belongs to this object only
  source = "user", confidenceScore = 100
  detectedFeatures stay the measured features
  is kept when the object is analyzed again (rotation, scale)
  is not part of Undo / Redo
  makes the recommendation of the object outdated, then generated again
    (DATA_SCHEMA.md, Object Reference Rules, rule 11)

Choosing "Automatic" again gives back the automatic classification
  (source = "automatic").
A duplicated object has no analysis and no classification (rule 7).
```

---

# Geometry Indicators

The AI should evaluate:

---

## Aspect Ratio

Used to identify:

```text
Tall Objects

Flat Objects

Structural Objects
```

---

## Hole Detection

Used to identify:

```text
Mechanical Parts

Brackets

Enclosures
```

---

## Curvature Analysis

Used to identify:

```text
Figurines

Decorative Objects
```

---

## Hollow Volume Detection

Used to identify:

```text
Containers

Vases

Enclosures
```

---

## Repeated Pattern Detection

Used to identify:

```text
Gears

Mechanical Components
```

---

## Thin Wall Detection

Used to identify:

```text
Miniatures
Functional Parts
Vases
```

---

# Classification Confidence

Version 1.2.0: the confidence of an automatic classification is the confidence of its category rule (Category Rules); a category chosen by the user has the confidence 100. The verified profiles below are counted in the confidence of the recommendation (RECOMMENDATION_RULES.md 1.1.0, Confidence).

Increase confidence when:

```text
Multiple Indicators Match

Verified Printer Profile

Verified Material Profile

Verified Filament Profile
```

---

Decrease confidence when:

```text
Conflicting Characteristics
```

---

# AI Integration

Output is consumed by:

```text
AI_ENGINE_SPEC.md

RECOMMENDATION_RULES.md

SUPPORT_GENERATION_SPEC.md

PRINT_PRESETS_SPEC.md

DATA_SCHEMA.md

API_SPEC.md
```

---

# Material Influence

Classification may modify material strategy.

Example:

```text
Mechanical Part

↓

Higher Infill

Higher Wall Count
```

---

# Support Influence

Classification may modify support strategy.

Example:

```text
Figurine

↓

Organic Supports
```

---

```text
Mechanical Part

↓

Standard Supports
```

---

# Optimization Influence

Classification changes optimization priorities.

Examples:

```text
Prototype

↓

Reduce Print Time
```

---

```text
Figurine

↓

Preserve Detail
```

---

```text
Structural Part

↓

Increase Reliability
```

---
# Print Preset Influence

Classification selects the preset category.

The mapping, the default preset and the related warnings are defined in PRINT_PRESETS_SPEC.md (Classification To Preset Mapping, Default Preset).

---

# Future Extensions

Reserved:

```text
Machine Learning Classification

Vision Analysis

Community Models

Classification Learning

Vision Classification Learning

Filament Performance Learning

Community Recommendation Learning
```

---

# Validation Rules

Classification must:

```text
Be Reproducible

Be Deterministic

Be Explainable
```

---

# Golden Rule

The AI must first understand what the object is intended to be before deciding how it should be printed.

---

# End Of Document
