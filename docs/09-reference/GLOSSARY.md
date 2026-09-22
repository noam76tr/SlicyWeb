# WICHY
# GLOSSARY

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the official terminology used throughout the Wichy project.

All contributors, developers, documentation authors, and AI systems should use these definitions consistently.

---

# Build Plate

The virtual representation of the physical printer build surface.

Used as the reference area for model placement.

---

# Layer Height

The thickness of a single printed layer.

Unit:

```text
mm
```

Example:

```text
0.20 mm
```

---

# Nozzle

The printer component through which filament is extruded.

Common sizes:

```text
0.2 mm
0.4 mm
0.6 mm
0.8 mm
```

---

# Infill

Internal structure generated inside a model.

Purpose:

```text
Strength

Material Saving

Weight Reduction
```

---

# Infill Density

Percentage of internal material used inside a model.

Range:

```text
0% - 100%
```

---

# Infill Pattern

Geometric structure used to generate infill.

Examples:

```text
Gyroid

Grid

Honeycomb

Cubic

Lightning
```

---

# Support

Temporary printed structure used to support unsupported geometry.

Removed after printing.

---

# Organic Support

Support structure using natural branching shapes.

Primarily used for:

```text
Figurines

Miniatures

Decorative Models
```

---

# Tree Support

Hierarchical support structure with branching connections.

Used to reduce support material.

---

# Standard Support

Traditional vertical support structure.

Typically used for:

```text
Mechanical Parts

Functional Objects
```

---

# Overhang

Geometry extending beyond the printable angle limit.

May require supports.

---

# Bridge

Horizontal geometry printed between two supported areas.

---

# Mesh

Digital representation of a 3D model.

Usually composed of:

```text
Vertices

Edges

Triangles
```

---

# Triangle

Smallest geometric unit of a mesh.

---

# Vertex

Single point in 3D space.

Plural:

```text
Vertices
```

---

# STL

Standard Tessellation Language.

A common 3D printing file format based on triangular geometry.

---

# 3MF

3D Manufacturing Format.

Modern 3D printing format supporting additional metadata.

---

# WYPROJ

Native Wichy project file format.

Stores:

```text
Scene

Objects

Printer

Material

Filament

Print Preset

Analysis

Recommendations
```

---

# Object

A single model imported into the workspace.

---

# Scene

The complete workspace.

Contains:

```text
Objects

Printer

Material

Settings
```

---

# Printer Profile

Structured description of a printer.

Includes:

```text
Build Volume

Nozzle Support

Temperature Limits

Speed Limits
```

---

# Material Profile

Structured description of a printable material.

Includes:

```text
Temperatures

Cooling

Physical Properties
```

---

# Filament Profile

Configuration for a specific commercial filament.

Example:

```text
Bambu PLA Basic

Prusament PLA

eSUN PETG
```

---

# Print Preset

Predefined print configuration optimized for a specific goal.

Examples:

```text
Draft

Balanced

Quality

Mechanical

Miniature
```

---

# Preset

Predefined collection of print settings.

Examples:

```text
Draft

Balanced

Quality

Mechanical

Miniature
```

---

# Recommendation

Configuration proposed by the AI engine.

---

# Confidence Score

Numerical value indicating recommendation reliability.

Range:

```text
0 - 100
```

---

# Printability Score

Numerical estimation of the probability of a successful print.

Range:

```text
0 - 100
```

---

# Object Classification

Process of determining the likely purpose of a model.

Examples:

```text
Figurine

Mechanical Part

Gear

Prototype

Vase
```

---

# Classification Confidence

Confidence value associated with object classification.

Range:

```text
0 - 100
```

---

# Model Analysis

Process of evaluating:

```text
Geometry

Printability

Stability

Supports
```

before generating recommendations.

---

# Optimization

Process of improving print quality, reliability, or efficiency.

---

# Orientation Optimization

Finding the best model orientation.

Goals:

```text
Reduce Supports

Improve Stability

Reduce Print Time
```

---

# AI Engine

Rule-based recommendation system used by Wichy.

Responsible for:

```text
Analysis

Classification

Recommendations

Validation
```

---

# Validation Engine

Subsystem responsible for validating:

```text
Printer Limits

Material Limits

Filament Limits

Geometry Constraints
```

before recommendations are accepted.

---

# Recommendation Engine

Subsystem that converts analysis results into printing recommendations.

---

# Support Generation

Process used to determine:

```text
Support Need

Support Type

Support Placement

Support Density
```

for a specific model.

---


# Printability

Estimated ability of a model to print successfully.

---

# Stability

Measurement of how securely a model rests on the build plate.

---

# Wall

Perimeter shell printed around a model.

---

# Wall Count

Number of printed perimeter walls.

---

# Cooling

Control of airflow used to solidify printed layers.

---

# Retraction

Movement of filament backwards to reduce stringing.

---

# Stringing

Fine unwanted filament strands between printed regions.

---

# Adhesion

Ability of the first layer to remain attached to the build plate.

---

# Brim

Additional printed border surrounding a model.

Used to improve adhesion.

---

# Raft

Additional printed foundation placed under a model.

Used for difficult prints.

---

# Cost Estimation

Calculation of expected printing costs.

Includes:

```text
Material Cost

Electricity Cost

Total Cost
```

---

# Print Time Estimation

Predicted duration required to complete a print.

---

# Workspace

The complete active environment visible to the user.

Equivalent to:

```text
Scene
```

---

# Project

Saved Wichy workspace stored in a WYPROJ file.

Contains:

```text
Scene

Settings

Profiles

Analysis

Recommendations
```

---

# Validation

Process of verifying data, settings, or recommendations before use.

---

# Warning

Notification indicating a potential problem or risk.

---

# Error

Notification indicating a failure or invalid operation.

---

# Plugin

Optional extension that adds functionality without modifying the application core.

Examples:

```text
Import Plugins

Export Plugins

Analysis Plugins

AI Plugins

UI Plugins
```

---

# Golden Rule

All project terminology should use the definitions contained in this document.

If a term is not defined here, it should be added before becoming an official project term.

---

# End Of Document
