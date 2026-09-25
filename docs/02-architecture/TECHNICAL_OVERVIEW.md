# SlicyWeb SMART SLICER 

# AI Smart 3D Printing Platform

Version: 2.0.0

Status: Approved

Priority: High

**Philosophy:**  Documentation-First | Local-First | Rule-Based AI

---

## Governance Integration

This architecture overview must remain aligned with:

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md

CHANGE_CLASSIFICATION_RULES.md

CHANGE_VERIFICATION_CHECKLIST.md

DOCUMENT_UPDATE_MATRIX.md

CROSS_DOCUMENT_DEPENDENCIES.md

Purpose:

- Architecture Governance
- Dependency Governance
- Domain Ownership
- Documentation Governance
- Change Validation
- Impact Analysis

---

## 1. Executive Summary & Vision

SlicyWeb is a next-generation desktop application engineered to simplify, optimize, and secure the 3D print preparation workflow. Rather than serving as just another slicing utility, SlicyWeb acts as an intelligent engineering assistant that evaluates:

- **The Hardware:** Printer specifications, build volume, kinematics, and firmware limits.
- **The Material:** Polymer properties, thermal limits, and material-specific behavior.
- **The Filament:** Manufacturer-specific settings, color, diameter, thermal recommendations, and cost characteristics.
- **The Active Print Preset:** Quality objectives, speed targets, structural requirements, and optimization priorities.
- **The Geometry:** Spatial dimensions, wall thickness, bridge spans, overhang angles, and functional classification.
- **The User Objective:** Speed, visual surface finish, structural strength, reliability, or material economy.

The system combines deterministic rule-based AI, geometry analytics, object classification, and continuous hardware database synchronization to generate validated and optimized print configurations.
---

## 2. Core Feature Matrix

### 2.1 3D Workspace & Geometry Engine

- **Supported Model Formats:** STL, 3MF
- **Native Project Format:** WYPROJ (.wyproj)
- **Internal Data Format:** JSON
- **Future Formats:** STEP, OBJ, AMF
- **Interactive Scene (Three.js):** Custom build plate visualization, dynamic grid adaptivity, spatial axis indicators, multi-object handling.
- **Object Manipulation:** Precise Translation, Rotation, Uniform/Non-Uniform Scaling (with specialized Scale Gizmo), Duplication with automatic spacing, and Align-to-Bed.
- **Real-Time Collision Detection:** Instantaneous bounding-box and mesh intersection checks with visual status feedback (grayscale tinting during collision).

### 2.2 Hardware & Material Intelligence
- **Dynamic GitHub Sync:** Automated fetch from public open-source repositories Examples: (OrcaSlicer, PrusaSlicer, Cura, Manufacturer Repositories, Verified Community Repositories) for up-to-date printer/material definitions, with local JSON fallback.
- **Firmware Adaptivity:** Profile tuning tailored to specific printer firmwares (Klipper, Marlin, Bambu OS, RepRapFirmware), adjusting Pressure Advance, Acceleration, and Jerk constraints.
- **Tiered Material Profiles:**
  - *Generic Families:* PLA, PLA+, PETG, ABS, ASA, TPU, Nylon, PC, PP.
  - *Manufacturer Profiles:* Bambu Lab Basic, Prusament, eSUN, Polymaker, etc.

### 2.3 Rule-Based AI Analytics & Classification Engine
- **Mesh Inspection:** Real-time geometric analysis evaluating thin walls, overhang thresholds, bridge distances, volumetric distribution, and center of gravity.
- **Functional Object Categorization:** Automatic classification of models into functional domains:
  - *Miniatures & Figurines* (Focus: detail preservation, organic tree supports).
  - *Mechanical & Structural Parts* (Focus: layer adhesion, wall count, infill strength).
  - *Vases & Shells* (Focus: continuous extrusion path).
  - *Rapid Prototypes* (Focus: speed, minimal infill).
- **Automated Recommendation Generation:** Calculates layer height, wall perimeter count, infill density/pattern, cooling fans, retraction limits, print speeds, and brim/raft adhesion strategies.
- **Confidence Scoring:**  Every classification and recommendation is accompanied by a confidence score to indicate decision reliability.

### 2.4 Support & Optimization System
- **Support Strategy:** Evaluates overhang angles and surface accessibility to select between Tree/Organic supports and Standard grid supports.
- **Optimization Trade-Offs:** Minimizes support volume and print time while preserving structural integrity.
- **Orientation Optimization:** Searches multiple valid orientations to improve stability, reduce supports, lower print time, and improve surface quality.

### 2.5 Multi-Variable Cost & Duration Engine
- Real-time estimation before slicing:
  - Material Mass (grams) & Filament Length (meters).
  - Total Material Cost (based on spool pricing).
  - Electrical Power Consumption & Financial Cost.
  - Total Estimated Print Duration.
  - **Print Preset Integration:** Estimates are generated using the currently selected printer, material, filament profile, and print preset.

### 2.6 Internationalization
- Multi-language user interface
- English support
- French support
- Hebrew support
- External JSON translation dictionaries

---

## 3. System Architecture & Module Boundaries

The system follows a strict layered architecture with explicit ownership and mandatory data flow.

```text
┌────────────────────────────────────────────────────────────────────┐
│                           GUI LAYER                                │
├────────────────────────────────────────────────────────────────────┤
│ React UI                                                           │
│ Renderer                                                           │
│ User Interaction                                                   │
│ UI State                                                           │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                            │
├────────────────────────────────────────────────────────────────────┤
│ Commands                                                           │
│ Workflow Coordination                                              │
│ Event Routing                                                      │
│ Application State Coordination                                     │
│ Notifications                                                      │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                           IPC LAYER                                │
├────────────────────────────────────────────────────────────────────┤
│ Renderer ↔ Main Communication                                      │
│ IPC Request Validation                                             │
│ IPC Response Serialization                                         │
│ Safe Error Propagation                                             │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                              │
├────────────────────────────────────────────────────────────────────┤
│ Project Service                                                    │
│ Printer Service                                                    │
│ Material Service                                                   │
│ Filament Service                                                   │
│ Preset Service                                                     │
│ Analysis Service                                                   │
│ Recommendation Service                                             │
│ Storage Service                                                    │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
┌────────────────────┐ ┌────────────────────┐ ┌──────────────────────┐
│ WORKSPACE MODULES  │ │ DOMAIN MODULES     │ │ SUPPORT MODULES      │
├────────────────────┤ ├────────────────────┤ ├───────────────────  ─┤
│ Project            │ │ Profiles           │ │ Internationalization │
│ Import             │ │ Presets            │ │ Notifications        │
│ Scene              │ │ Analysis           │ │ Validation           │
│ Object Management  │ │ Classification     │ │ Recovery             │
│ Transform          │ │ Recommendation     │ │ State Management     │
│ Renderer           │ │ Optimization       │ │ Error Handling       │
│                    │ │ Cost Estimation    │ │                      │
└──────────┬─────────┘ └──────────┬─────────┘ └──────────┬───────────┘
           │                      │                      │
           └──────────────────────└──────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                       REPOSITORY LAYER                             │
├────────────────────────────────────────────────────────────────────┤
│ Local Repository Access                                            │
│ Data Normalization                                                 │
│ Validation Coordination                                            │
│ Repository Contracts                                               │
│ RepositorySync Coordination                                        │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                LOCAL STORAGE / CACHE LAYER                         │
├────────────────────────────────────────────────────────────────────┤
│ Project Persistence                                                │
│ Local JSON Data                                                    │
│ Profile Storage                                                    │
│ Settings Storage                                                   │
│ Cache Storage                                                      │
│ Cache Invalidation                                                 │
│ Recovery Data                                                      │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                     REPOSITORYSYNC LAYER                           │
├────────────────────────────────────────────────────────────────────┤
│ Remote Profile Synchronization                                     │
│ Remote Data Retrieval                                              │
│ Remote Data Validation                                             │
│ Data Normalization                                                 │
│ Synchronization Error Handling                                     │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                         REMOTE SOURCES                             │
├────────────────────────────────────────────────────────────────────┤
│ Official Manufacturer Repositories                                 │
│ Verified GitHub Repositories                                       │
│ Verified Community Repositories                                    │
│ Future External Services                                           │
└────────────────────────────────────────────────────────────────────┘
```

Mandatory flow:

```text
GUI
↓
IPC
↓
Services
↓
Repositories
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources
```

Rules:

```text
GUI must not access repositories directly.
GUI must not access Remote Sources directly.
GUI must not access storage directly.
IPC handlers must validate payloads.
Services must orchestrate domain workflows.
Repositories must coordinate local and remote access.
RepositorySync is the only accepted layer for remote access.
Remote data must be validated before storage or use.
Storage and Cache are local-only layers.
```

### Architecture Ownership

All architectural components have designated ownership domains.

Ownership is defined in:

```text
DOMAIN_BOUNDARIES.md
DOMAINS_DEPENDENCY_MATRIX.md
FILE_OWNERSHIP_MATRIX.md
PROJECT_IMPACT_MATRIX.md
```

Cross-domain changes require:

```text
Impact analysis
Ownership verification
Documentation maintenance
Dependency validation
Governance approval
```

---

## 4. Technical Stack

| Layer                  | Technology                       |
|------------------------|----------------------------------|
| Runtime Container      | Electron                         |
| Language & Typing      | TypeScript                       |
| UI Framework           | React + shadcn/ui + Tailwind CSS |
| State Management       | Zustand                          |
| 3D Rendering           | Three.js                         |
| Validation             | Zod                              |
| Test Automation        | Vitest + Playwright              |
| GitHub Integration     | Octokit                          |
| Logging                | Electron Log                     |
| Geometry Acceleration  | three-mesh-bvh                   |

Additional Core Libraries:

- Lucide React
- Octokit
- three-mesh-bvh
- Electron Log

---

## Architecture Change Rules

Before modifying architecture:

1. Identify impacted domains

2. Identify impacted modules

3. Identify impacted schemas

4. Identify impacted APIs

5. Review ownership

6. Perform impact analysis

7. Update documentation

8. Update CHANGELOG.md

9. Validate compatibility

10. Validate governance requirements

---

## 5. Development Roadmap & Principles

### Development Hierarchy
`Documentation ➔ Architectural Contracts ➔ Modular Implementation ➔ Validation Testing ➔ Performance Optimization`

### Core Principles
1. **Local First:** Operates fully without active internet connectivity.
2. **Deterministic Security:** AI assists with transparent, rule-driven engineering parameters; it never hallucinates data.
3. **User Authority:** Recommendations are suggested; the user retains absolute override control over all parameters.
4. **Documentation First:** Architecture and specifications are defined before implementation.
5. **Backward Compatibility:** Existing project formats and schemas should remain compatible whenever possible.

---

## Architecture Governance Validation

Before accepting architecture changes:

Verify:

- Ownership respected

- Dependencies validated

- Documentation updated

- Impact analysis completed

- Compatibility maintained

- Governance requirements satisfied

Reference:

CHANGE_VERIFICATION_CHECKLIST.md
