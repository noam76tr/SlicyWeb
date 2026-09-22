# WICHY
# NAMING CONVENTIONS

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the official naming conventions used throughout the Wichy project.

The objective is to ensure:

- Consistency
- Readability
- Maintainability
- Predictability

All contributors, documentation authors, and AI systems must follow these conventions.

---

# General Principles

Names should be:

```text
Clear

Descriptive

Consistent

Predictable
```

Avoid:

```text
Abbreviations

Ambiguous Names

Single Letter Names
```

unless universally accepted.

---

# Language

All code, documentation, identifiers, and comments must use:

```text
English
```

---

# File Naming

---

## TypeScript Files

Format:

```text
PascalCase.ts
```

Examples:

```text
SceneManager.ts

PrinterRepository.ts

RecommendationEngine.ts
```

---

## React Components

Format:

```text
PascalCase.tsx
```

Examples:

```text
MainLayout.tsx

ObjectPanel.tsx

PrinterSelector.tsx
```

---

## Specification Documents

Format:

```text
UPPER_CASE_WITH_UNDERSCORES.md
```

Examples:

```text
PROJECT_SPEC.md

DATA_SCHEMA.md

PRINT_SETTINGS_SPEC.md
```

---

## JSON Files

Format:

```text
lowercase_with_underscores.json
```

Examples:

```text
pla_generic.json

bambu_x1c.json

quality_preset.json
```

---

# Directory Naming

Directory names must use:

```text
snake_case
```

Examples:

```text
object_manager

material_database

recommendation_engine
```

---

Avoid:

```text
ObjectManager

Object_Manager

object-manager
```

---

# Class Naming

Classes must use:

```text
PascalCase
```

Examples:

```text
SceneManager

PrinterRepository

ObjectValidator

RecommendationEngine
```

---

# Interface Naming

Interfaces must use:

```text
PascalCase
```

Examples:

```text
Printer

Material

Project

Analysis

Filament

PrintPreset

Recommendation
```

---

Avoid prefixes:

```text
IPrinter

IMaterial

IProject
```

---

# Enum Naming

Enums must use:

```text
PascalCase
```

Examples:

```text
PrinterType

MaterialCategory

SupportType
```

---

# Enum Values

Enum values must use:

```text
PascalCase
```

Examples:

```text
DirectDrive

TreeSupport

UltraQuality
```

---

# Type Naming

Custom types use:

```text
PascalCase
```

Examples:

```text
PrinterProfile

MaterialSettings

SupportStrategy

FilamentProfile

PrintPreset

ConfidenceScore
```

---

# Variable Naming

Variables use:

```text
camelCase
```

Examples:

```text
printerProfile

selectedMaterial

printSettings

supportDensity
```

---

Avoid:

```text
PrinterProfile

printer_profile

PRINTER_PROFILE
```

---

# Boolean Naming

Booleans should start with:

```text
is

has

can

should
```

Examples:

```text
isVisible

hasSupports

canPrint

shouldOptimize
```

---

# Constant Naming

Constants use:

```text
UPPER_SNAKE_CASE
```

Examples:

```text
DEFAULT_LAYER_HEIGHT

MAX_HISTORY_SIZE

MIN_NOZZLE_TEMP
```

---

# Function Naming

Functions use:

```text
camelCase
```

Examples:

```text
loadPrinterProfile()

analyzeModel()

generateRecommendation()

validateMaterial()
```

---

# Function Rules

Functions should start with an action verb.

Examples:

```text
get

set

load

save

create

update

delete

validate

generate

calculate
```

---

# React Hook Naming

Hooks must start with:

```text
use
```

Examples:

```text
useTheme()

useScene()

usePrinter()

useRecommendations()
```

---

# Event Naming

Events use:

```text
camelCase
```

Examples:

```text
objectImported

printerChanged

materialSelected
```

---

# React Component Props

Props interfaces use:

```text
ComponentNameProps
```

Examples:

```text
ObjectPanelProps

ViewportProps

PrinterSelectorProps
```

---

# Store Naming

State stores use:

```text
camelCase + Store
```

Examples:

```text
printerStore

sceneStore

materialStore
```

---

# Service Naming

Services use:

```text
Name + Service
```

Examples:

```text
PrinterService

MaterialService

AnalysisService
```

---

# Repository Naming

Repositories use:

```text
Name + Repository
```

Examples:

```text
PrinterRepository

MaterialRepository

ProjectRepository
```

---

# Validator Naming

Validators use:

```text
Name + Validator
```

Examples:

```text
ObjectValidator

MaterialValidator

SceneValidator
```

---

# Manager Naming

Managers use:

```text
Name + Manager
```

Examples:

```text
SceneManager

PrinterManager

CacheManager
```

---

# JSON Property Naming

JSON fields use:

```text
camelCase
```

Examples:

```json
{
  "layerHeight": 0.2,
  "printSpeed": 80,
  "supportType": "organic"
}
```

---

# Database Identifier Naming

IDs use:

```text
id
```

Examples:

```text
printerId

materialId

projectId

objectId
```

---

# Abbreviations

Allowed:

```text
API

GUI

STL

3MF

JSON

URL

UUID
```

---

Avoid creating custom abbreviations.

---

# Documentation Section Names

Use:

```text
Title Case
```

Examples:

```text
Project Structure

Material Profiles

Support Generation
```

---

# Git Branch Naming

Format:

```text
type/description
```

Examples:

```text
feature/viewport

feature/stl-import

fix/material-validation

docs/api-update
```

---

# Commit Naming

Format:

```text
type: description
```

Examples:

```text
feat: add support generation engine

fix: correct printer validation

docs: update architecture

refactor: simplify scene manager
```

---

# Forbidden Naming

Avoid:

```text
data1

tmpValue

test123

thing

stuff

manager2

newObject2
```

Names must describe their purpose.

---

# AI Naming Rule

AI-generated code must follow this document.

The AI must never introduce naming styles that conflict with these conventions.

---

# Golden Rule

A contributor should understand the purpose of a file, class, method, or variable from its name alone.

---

# End Of Document
