# SlicyWeb

AI-Assisted Smart Slicer Platform

## Status

🚧 Under Development

Current Phase:

```text
Phase 0 - Foundation
```

---

## About SlicyWeb

SlicyWeb is an AI-assisted 3D printing preparation platform designed to simplify and optimize print preparation workflows.

The platform combines:

- 3D Model Analysis
- Object Classification
- Printer Intelligence
- Material Knowledge
- Filament Profiles
- Print Presets
- Support Optimization
- AI-Powered Recommendations

Its objective is to help users generate safer, faster, and more reliable print configurations while maintaining full user control.

For a complete project overview:

```text
docs/01-project/PROJECT_DESCRIPTION.md
```

## Overview


SlicyWeb is a next-generation AI-assisted 3D printing preparation platform designed to simplify and optimize the process of preparing models for additive manufacturing.



The project combines:


- 3D Model Visualization

- Geometry Analysis

- Printer Management

- Material Management

- Intelligent Recommendation Systems

- Print Optimization Tools


The long-term objective is to provide an experience comparable to modern slicers such as:



- OrcaSlicer

- Bambu Studio

- PrusaSlicer

- Cura

while introducing advanced AI-powered assistance.


---


## Main Features


### Model Import



Supported formats:
- STL
- 3MF

Future formats:
- OBJ
- STEP
- AMF

\---

### 3D Workspace


Features:

- Build Plate Visualization

- Grid System

- XYZ Axis Display

- Camera Controls

- Multiple Object Support

- Transform Controls


\---


### Object Management


Supported operations:


- Move

- Rotate

- Scale

- Center on Bed

- Duplicate

- Delete


\---


### Printer Profiles


Manage:


- Printer Databases

- Manufacturer Profiles

- Community Profiles

- GitHub Repository Profiles


Supported categories:


- Consumer Printers

- Prosumer Printers

- Industrial Printers


---


### Material Profiles

Supported materials:

- PLA

- PLA+

- PETG

- ABS

- ASA

- TPU

- Nylon

- PC

- PP

- Custom Materials


---


### AI Recommendation Engine


The AI engine analyzes:

- Object Geometry
- Printability
- Stability
- Supports
- Bridges
- Overhangs
- Object Classification
- Filament Profiles
- Print Presets

and automatically recommends:

- Layer Height
- Speed Settings
- Supports
- Cooling
- Retraction
- Infill
- Adhesion
- Print Presets
- Confidence Score


---

### Optimization Engine


Provides:

- Orientation Optimization

- Support Reduction

- Material Optimization

- Print Time Optimization


\---


### Cost Estimation


Calculates:

- Filament Usage

- Filament Weight

- Material Cost

- Electricity Cost

- Total Cost

- Estimated Print Duration

\---

## Project Architecture


The project follows a modular architecture.

Main modules:


```text

GUI
Renderer
Importer
Printer Database
Material Database
Filament Database
Analysis Engine
Classification Engine
Recommendation Engine
Preset Engine
Optimization Engine
Cost Engine
Recovery System
Storage
Services

```


Detailed architecture:


```text

docs/02-architecture/ARCHITECTURE.md

```


---


## Technology Stack


### Core


```text

TypeScript

React

Electron

Three.js

```


### State Management



```text

Zustand

```


### Styling


```text

Tailwind CSS

shadcn/ui

```


### Testing


```text

Vitest

Testing Library

Playwright

```


\---


## Development Roadmap


Current Progress:

```text

Phase 0

Foundation

```

Planned Phases:

```text

Phase 5:   Printer Management
Phase 6:   Material Management
Phase 7:   Filament Management
Phase 8:   Model Analysis
Phase 9:   Classification Engine
Phase 10:  Recommendation Engine
Phase 11:  Preset Engine
Phase 12:  Optimization Engine

```

More details:


```text

docs/01-project/ROADMAP.md

```


---

## Documentation

Complete project documentation is available in:

```text

docs/

```

For AI Systems:

```text
CLAUDE.md

CLAUDE_PROJECT_CONTEXT.md

CLAUDE_DOCUMENT_READING_ORDER.md

docs/00-index/AI_START_HERE.md
```

For API Development:

```text
docs/00-index/API_START_HERE.md
```

Documentation Index:

```text
docs/00-index/PROJECT_DOCUMENTATION_INDEX.md
```

---


## Project Structure


```text

SlicyWeb/

├── CLAUDE.md
├── CLAUDE_PROJECT_CONTEXT.md
├── CLAUDE_DOCUMENT_READING_ORDER.md
├── CLAUDE_CHANGE_IMPACT_RULES.md
├── CLAUDE_FILE_UPDATE_RULES.md
├── docs/
├── src/
├── tests/
├── assets/
├── cache/
├── logs/
├── scripts/
├── plugins/
├── public/
└── .github/

```


Complete structure:



```text

docs/02-architecture/FILE\_STRUCTURE.md

```

---

## AI Governance

The project includes a dedicated AI governance layer.

Main governance documents:

- CLAUDE.md
- CLAUDE_PROJECT_CONTEXT.md
- CLAUDE_DOCUMENT_READING_ORDER.md
- CLAUDE_CHANGE_IMPACT_RULES.md
- CLAUDE_FILE_UPDATE_RULES.md
- docs/00-index/CLAUDE_GOVERNANCE_PROTOCOL.md
- docs/00-index/CLAUDE_READING_PRIORITY.md

These documents define:

- AI behavior
- Documentation reading order
- Impact analysis requirements
- Documentation update requirements
- File modification policies
- Governance workflows

---

## Development Rules


Key principles:

- Patch existing code

- Avoid full file rewrites

- Preserve backward compatibility

- Follow documented architecture

- Update only impacted sections

- Maintain modularity


Detailed rules:


```text

docs/03-development/DEVELOPMENT\_RULES.md

```

---


## Documentation Reading Order


Before contributing:

```text

1. CLAUDE.md
2. CLAUDE_PROJECT_CONTEXT.md
3. CLAUDE_DOCUMENT_READING_ORDER.md
4. docs/00-index/CLAUDE_GOVERNANCE_PROTOCOL.md
5. CLAUDE_CHANGE_IMPACT_RULES.md
6. CLAUDE_FILE_UPDATE_RULES.md
7. docs/00-index/CLAUDE_READING_PRIORITY.md
8. PROJECT_DOCUMENTATION_INDEX.md
9. AI_START_HERE.md

```


---


## Current Status


Project Status:


```text

Planning / Foundation Phase

```


The documentation, architecture, schemas, and specifications have been established before implementation begins.

---

## Long-Term Vision

Build a professional AI-powered ecosystem capable of:

- Assisting users with 3D printing decisions

- Reducing print failures

- Optimizing print quality

- Simplifying printer setup

- Supporting future G-Code generation

- Supporting plugins and extensions

- Supporting cloud and remote printing services

- Intelligent Object Classification

- Confidence-Based Recommendations

- Filament-Aware Optimization

---

## License

See the LICENSE file for details.

---

## Project

SlicyWeb

AI Smart Slicer Platform

---

## Motto

> Understand the model. Understand the printer. Understand the material. Then optimize the print.
