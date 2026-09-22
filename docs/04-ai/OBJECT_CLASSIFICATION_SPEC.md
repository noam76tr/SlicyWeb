# AI SMART SLICER
# OBJECT CLASSIFICATION SPECIFICATION

Version: 1.0.0

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

Classification may automatically select a preferred preset.

Example:

```text
Prototype
↓
Draft Preset
↓
Figurine
↓
Quality Preset

Mechanical Part
↓
Mechanical Preset

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
