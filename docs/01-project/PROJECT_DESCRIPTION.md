# SlicyWeb SMART SLICER

# AI SMART SLICER PLATFORM

Version: 2.0.0

Status: Approved

Priority: Medium

---

# Introduction

SlicyWeb is a next-generation AI-assisted 3D printing preparation platform designed to simplify, optimize, and improve the entire print preparation workflow.


The project combines geometry analysis, printer intelligence, material knowledge, and rule-based artificial intelligence to help users generate safer, faster, and more reliable print configurations.


The goal is not simply to create another slicer.


The goal is to create a smart decision-making platform capable of understanding:


- The printer

- The material

- The filament

- The model

- The user's objective


before generating optimized recommendations.

---

# Vision


The long-term vision of SlicyWeb is to become a complete 3D printing ecosystem that assists users from model import to final print preparation.


SlicyWeb aims to:


- Reduce print failures

- Improve print quality

- Simplify configuration

- Improve learning for beginners

- Accelerate workflows for professionals

- Centralize printer and material knowledge


The system should help users make better printing decisions without removing their control.


---


# Main Objectives

## Reliability


Recommendations must prioritize successful prints.


---


## Simplicity

Complex printing concepts should be translated into understandable recommendations.


---


## Performance

The platform must remain responsive while handling large and complex models.


---


## Scalability

The architecture must support future extensions including:


- G-Code generation

- Multi-material printing

- Plugins

- Cloud services

- Machine Learning

---

# Core Features

## 3D Model Import


Supported formats:

```text
STL

3MF
```

Native Project Format:

```text
WYPROJ (.wyproj)
```


Future support:

```text

OBJ

STEP

AMF

```

---


## 3D Workspace

Interactive workspace including:


```text

Build Plate

Grid

Axis System

Camera Controls

Multiple Objects

Transform Tools

```

---

## Object Manipulation

Supported operations:

```text

Move

Rotate

Scale

Duplicate

Delete

Center On Bed

```

---


## Printer Management

Maintain a database of:


```text

Consumer Printers

Professional Printers

Custom Printers

```

including:


```text

Build Volume

Nozzle Types

Speed Limits

Temperature Limits

Hardware Capabilities

```


---


## Material Management

Supported material families:


```text

PLA

PLA+

PETG

ABS

ASA

TPU

Nylon

PC

PP

Custom Materials

```


---


## Filament Profiles

Support manufacturer-specific filament profiles.


Examples:

```text

Bambu PLA Basic

Prusament PLA

eSUN PETG

Polymaker ASA

```


---

# Artificial Intelligence


The AI system is based on deterministic engineering rules.

The AI does not guess.

The AI evaluates validated information and generates recommendations accordingly.



---


## Model Analysis

The engine analyzes:


```text

Dimensions

Volume

Surface Area

Mesh Quality

Thin Walls

Overhangs

Bridges

Stability

```


---


## Object Classification


The system classifies models into categories such as:


```text

Miniature

Figurine

Mechanical Part

Gear

Prototype

Vase

Tool

Structural Part

```


to improve recommendations.


---


## Intelligent Recommendations

The AI generates recommendations for:


```text

Layer Height

Infill

Wall Count

Support Strategy

Cooling

Retraction

Print Speeds

Adhesion

```


---

# Support Generation

The support engine evaluates:


```text

Overhangs

Bridges

Geometry

Object Classification

Material Constraints

```


and recommends:


```text

Organic Supports

Tree Supports

Standard Supports

```


while minimizing support material usage.


---


# Optimization Engine

The optimization system helps users:


```text

Reduce Supports

Reduce Print Time

Reduce Material Usage

Improve Stability

Improve Surface Quality

```


while preserving print reliability.


---

## Internationalization

Supported Languages:

```text
English
French
Hebrew
```

The platform supports multilingual user interfaces through an externalized translation system.

---

# Cost Estimation


SlicyWeb estimates:


```text

Filament Usage

Filament Weight

Material Cost

Electricity Cost

Total Cost

Print Duration

```


before printing begins.


---


# Architecture

The project follows a modular architecture.


Core systems include:


```text

GUI

Renderer

Importer

Printer Database

Material Database

Filament System

Analysis Engine

Recommendation Engine

Optimization Engine

Cost Engine

```


Each module is isolated and independently maintainable.


---


# Technology Stack

Core technologies:


```text

TypeScript

React

Electron

Three.js

```


Additional technologies:


```text

Zustand

Tailwind CSS

shadcn/ui

Zod

Vitest

Playwright

```


---

# Project Governance

The project follows a structured governance model.

Reference:

```text
1. CLAUDE.md
2. CLAUDE_GOVERNANCE_PROTOCOL.md
3. CLAUDE_CHANGE_IMPACT_RULES.md
4. CLAUDE_FILE_UPDATE_RULES.md
5. DOMAIN_BOUNDARIES.md
6. DOMAINS_DEPENDENCY_MATRIX.md
7. PROJECT_IMPACT_MATRIX.md
8. FILE_OWNERSHIP_MATRIX.md
9. CHANGE_CLASSIFICATION_RULES.md
10. CHANGE_VERIFICATION_CHECKLIST.md
11. DOCUMENT_UPDATE_MATRIX.md
```

Purpose:

```text
Protect architecture

Control dependencies

Prevent regressions

Govern modifications

Maintain documentation consistency
```

---


# Development Philosophy

SlicyWeb follows a documentation-first approach.


Development order:

```text

Documentation
↓

Architecture

↓

Implementation

↓

Validation

↓

Optimization

```

The project prioritizes:

```text

Stability

Compatibility

Reliability

Performance

Features

```


---


# Future Roadmap


Planned future features include:


```text

G-Code Generation

Printer Communication

Plugin Marketplace

Multi-Material Support

Cloud Synchronization

Remote Printing

Machine Learning Assistance

Advanced Simulation

```


---


# Project Principles


The project's core principles are:


```text

Local First

Security First

Performance First

Documentation First

User Control First

Governance First

```


The AI assists the user.

The AI never replaces the user.



---



# Mission


Enable every maker, hobbyist, engineer, and professional to prepare better prints with less effort, fewer failures, and greater confidence.


---


# Motto


Understand the printer.

Understand the material.

Understand the model.

Then optimize the print.


---


# End Of Document
