# SYSTEM ARCHITECTURE

Version: 2.0.0

Status: Approved

Priority: Mandatory

---

# Purpose

This document defines the software architecture of the AI Smart Slicer project.

It describes:

- Modules

- Responsibilities

- Communication rules

- Dependencies

- Data flow

- Project structure

This document is the architectural reference for all future development.


---


# Architecture Goals


The architecture must be:


- Modular

- Maintainable

- Scalable

- Testable

- Extensible

- Token Efficient

- AI Friendly


The architecture must support incremental development without requiring major rewrites.


---


# Design Principles


The project follows:


## Separation Of Concerns


Each module must have one primary responsibility.

Avoid modules that perform multiple unrelated functions.

---

# Governance Principles

All architecture changes must follow the governance framework.

Reference Documents:

```text
/CLAUDE_GOVERNANCE_PROTOCOL.md

/CLAUDE_CHANGE_IMPACT_RULES.md

/CLAUDE_FILE_UPDATE_RULES.md

docs/03-development/DOMAIN_BOUNDARIES.md

docs/03-development/DOMAINS_DEPENDENCY_MATRIX.md

docs/03-development/FILE_OWNERSHIP_MATRIX.md

docs/03-development/PROJECT_IMPACT_MATRIX.md

docs/03-development/CHANGE_CLASSIFICATION_RULES.md

docs/03-development/CHANGE_VERIFICATION_CHECKLIST.md
```

Purpose:

```text
Prevent architecture drift

Maintain domain boundaries

Protect module ownership

Control dependencies

Reduce regressions

Standardize change validation
```

---

## Loose Coupling


Modules communicate through:


- Services

- Interfaces

- Events

- APIs



Direct access between unrelated modules is not allowed.



---



## High Cohesion



Each module should contain closely related functionality.



---



## Local First



Always use:

1. Local Data

2. Cache

3. Online Sources



in that order.



---



## Update Over Rewrite



New functionality must be added through:



- modules

- services

- interfaces



Avoid replacing existing systems.



---



# Architectural Overview


```text

+----------------------------------------------------+

|                    GUI LAYER                       |

+----------------------------------------------------+



&#x20;         ↓



+----------------------------------------------------+

|                  APPLICATION LAYER                 |

+----------------------------------------------------+



&#x20;         ↓


+----------------------------------------------------+

|                    IPC                             |

+----------------------------------------------------+



&#x20;         ↓



+----------------------------------------------------+

|                    CORE SERVICES                   |

+----------------------------------------------------+



&#x20;         ↓



+----------------------------------------------------+

|                 ANALYSIS SERVICES                  |

+----------------------------------------------------+



&#x20;         ↓



+----------------------------------------------------+

|                  DATA SERVICES                     |

+----------------------------------------------------+



&#x20;         ↓



+----------------------------------------------------+

|                 Repository Layer                   |

+----------------------------------------------------+



&#x20;         ↓



+----------------------------------------------------+

|                   Schema Layer                     |

+----------------------------------------------------+



&#x20;         ↓



+----------------------------------------------------+

|            STORAGE / CACHE / REMOTE                |

+----------------------------------------------------+

```


---


# Layer Architecture


## Layer 1


GUI Layer


Responsible for:


- Rendering

- Interaction

- Menus

- Panels

- User Input


No business logic allowed.

No analysis logic allowed.

No printer logic allowed.


---


## Layer 2

Application Layer

Coordinates all modules.

Responsibilities:

- Commands

- Workflow

- Event Routing

- State Management


---

## IPC Layer

Responsible for:

- Electron IPC communication
- Renderer to Main process communication
- Project requests
- Storage requests
- Import requests
- Settings requests

Folder:

```text
/electron/ipc
```

Components:

- ProjectIPC
- StorageIPC
- ImportIPC
- SettingsIPC
- PrinterIPC

---

## Layer 3

Core Services

Central project services.

Current Services:

- AnalysisService
- RecommendationService
- ProjectService
- StorageService
- PrinterService
- MaterialService
- FilamentService
- PresetService


---


## Layer 4

Analysis Services

Responsible for:

- Geometry calculations
- Model analysis
- Stability analysis
- Optimization analysis


---


## Layer 5

Data Services

Responsible for:

- Printer profiles
- Material profiles
- Filament profiles
- Print presets
- Cached repositories


---

## Repository Layer

Responsible for:

- Remote synchronization
- GitHub access
- Repository downloads
- Repository validation
- Printer repository synchronization
- Material repository synchronization
- Filament repository synchronization
- Preset repository synchronization

Folder:

```text
/repositories
```

Components:

- GitHubRepository
- PrinterRepositorySync
- MaterialRepositorySync
- FilamentRepositorySync
- PresetRepositorySync

---

## Schema Layer

Responsible for:

- Runtime validation
- Data validation
- Import validation
- API payload validation
- Recommendation validation

Folder:

```text
/schemas
```

Components:

- PrinterSchema
- MaterialSchema
- FilamentSchema
- PrintPresetSchema
- AnalysisSchema
- RecommendationSchema

---

## Layer 6

Storage Layer

Components:
- StorageManager
- ProjectStorage
- CacheStorage

Responsible for:
- Files
- Databases
- Cache
- Online repositories

---

# Module Structure

## GUI Module

Folder

```text

/gui

```

Responsibilities:
- Window management
- Menus
- Panels
- User Controls

Never performs calculations.


---


## Renderer Module

Folder

```text

/renderer

```

Responsibilities:

- Rendering 3D scene

- Rendering build plate

- Rendering transformations


Submodules:

```text

CameraManager

GridRenderer

AxisRenderer

ObjectRenderer

SelectionRenderer

```



---



## Scene Module


Folder


```text

/scene

```


Responsibilities:

- Scene management

- Object registration

- Selection state


---


## Object Module


Folder


```text

/object\_manager

```


Responsibilities:

- Create objects

- Delete objects

- Rename objects

- Duplicate objects


---


## Transform Module

Folder

```text

/transform

```

Responsibilities:

- Move
- Rotate
- Scale
- Reset
- Undo
- Redo
- History Tracking
- Transaction Management


---


## Import Module


Folder

```text
/importer
```


Responsibilities:

- STL Import
- 3MF Import
- Validation

Submodules


```text

STLImporter
ThreeMFImporter
FileValidator
```

---

## Project Module

Folder

```text
/project
```

Responsibilities:

- Project lifecycle management
- Project serialization
- Project deserialization
- Project validation
- WYPROJ import
- WYPROJ export
- Save operations
- Load operations

Submodules

ProjectManager
ProjectSerializer
ProjectDeserializer
ProjectValidator
WYPROJImporter
WYPROJExporter

---

## Printer Database Module

Folder

```text

/printer\_database

```

Responsibilities:

- Load printers

- Update printers

- Validate printers



Submodules

```text

PrinterRepository

PrinterCache

PrinterValidator

```


---


## Material Repository Module



Folder



```text

/material\_database

```



Responsibilities:



- Load materials

- Update materials

- Validate materials

- Material profile management

---



## Analysis Engine



Folder



```text

/model\_analysis

```



Responsibilities:


- Geometry analysis

- Stability analysis

- Printability analysis

---

## Classification Engine

Folder
```text
/classification_engine
```

Responsibilities:

- Object classification
- Confidence scoring
- Category detection
- Classification validation
---

# Analysis Engine Architecture



```text

Model

&#x20;↓

Geometry Analyzer

&#x20;↓

Printability Analyzer

&#x20;↓

Stability Analyzer

&#x20;↓

Result Generator

```



---



# Geometry Analyzer



Responsibilities:

- Dimensions

- Volume

- Surface Area

- Bounding Box



Output:

Geometry Report



---



# Printability Analyzer



Responsibilities:


- Overhangs

- Bridges

- Thin Walls

- Small Features


Output:

Printability Report


\---



# Stability Analyzer


Responsibilities:


- Contact Area

- Height Ratio

- Center Of Gravity



Output:



Stability Report



---



# Recommendation Engine


Folder


```text

/recommendation\_engine

```


Responsibilities:


- Generate print settings

- Generate warnings

- Generate recommendations



Input:


```text

Printer

+

Material

+

Filament

+

Analysis

+

Object Classification
```


Output:


```text

Recommended Profile

Print Preset

Support Strategy

Warnings

Confidence Score

```

---


# Recommendation Flow


```text

Printer

+

Material

+

Filament

+

Model Analysis

+

Object Classification

↓

Decision Engine

↓

Validation Engine

↓

Recommended Profile

↓

Print Preset

↓

Support Strategy

↓

Warnings

↓

Confidence Score

```


---


# Optimization Engine

Responsibilities:

- Orientation optimization
- Material optimization
- Speed optimization
- Support optimization


---


# Orientation Optimizer


Responsibilities:


Evaluate:

- Stability
- Overhangs
- Supports
- Surface Quality


Scoring: 0-100



---



# Cost Engine


Folder


```text

/cost\_engine

```

Responsibilities:


- Material cost calculation
- Electricity cost estimation
- Time estimation


---


# Notification System

Components:

- NotificationFactory
- NotificationManager
- NotificationService
- NotificationValidator

Responsibilities:

- Errors
- Warnings
- Information messages

Folder:

```text
/notifications
```

---

# Configuration System

Responsibilities:


- Application settings
- User settings
- Defaults

Folder:

```text
/config
```

---

## Internationalization Module

Folder

/i18n

```text
Responsibilities:
```

- Language management
- Translation loading
- Localization services
- Language switching
- Translation dictionary access

Submodules

LanguageManager
LocalizationService
TranslationLoader

Translation Files

Folder

```text
/public/locales
```

Files

- en.json
- fr.json
- he.json

Purpose

- User interface localization
- Language-independent architecture
- Externalized translations

---

# Cache System


Folder


```text

/cache

```

Responsibilities:

- Store downloaded profiles
- Reduce network requests
- Improve startup speed


---

# Event Architecture

Modules communicate through events.


Example:
```text

Object Imported
↓

Scene Updated

↓

Analysis Triggered

↓
Recommendation Updated

```

---

# Event Types

## Object Events



```text

ObjectAdded

ObjectRemoved

ObjectUpdated

ObjectSelected

```

---

## Transformation Events

```text

ObjectMoved

ObjectRotated

ObjectScaled

```



---



## Analysis Events



```text

AnalysisStarted

AnalysisFinished

AnalysisFailed

```



---



## Recommendation Events



```text

RecommendationGenerated

RecommendationUpdated

```



---



# Dependency Rules



Allowed



```text

GUI

↓

Application

↓

Services

↓

Data

```

---

# Domain Governance

Domain relationships must follow:

```text
DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md
```

File ownership must follow:

```text
FILE_OWNERSHIP_MATRIX.md
```

Architecture changes must be reviewed using:

```text
PROJECT_IMPACT_MATRIX.md

CHANGE_CLASSIFICATION_RULES.md

CHANGE_VERIFICATION_CHECKLIST.md
```

---

Forbidden



```text

GUI → Database

GUI → Repository

GUI → Analysis

GUI → AI Engine

```



---



# State Management



Single Source Of Truth


```text

Application State

```


Contains:

- Scene
- Objects
- Printer
- Material
- Filament
- Analysis
- Recommendations
- Print Presets

All modules read from state.

Only services may modify state.

---

# Persistence Architecture

Saved Project

WYPROJ File
↓
WYPROJImporter
↓
ProjectDeserializer
↓
ProjectValidator
↓
Application State

Contains:


```text

- Objects
- Transforms
- Printer
- Material
- Filament
- Settings
- Recommendations
- Print Presets

```

Does Not Contain:

```text

Temporary Cache

Downloaded Files

Logs

```

Application State
↓
ProjectValidator
↓
ProjectSerializer
↓
WYPROJExporter
↓
WYPROJ File

---

Project Format

WYPROJ

Extension

.wyproj

Components

- ProjectManager
- ProjectSerializer
- ProjectDeserializer
- ProjectValidator
- WYPROJImporter
- WYPROJExporter
  
---

# Logging Architecture


Levels


```text

Debug

Info

Warning

Error

Critical

```


Logs stored separately from project files.


---


# Security Principles


Never execute imported file content.


Always validate:

- STL
- 3MF
- Remote Data


Reject malformed files.


---



# Performance Principles


Large models must:

- load asynchronously
- be cached
- use optimized rendering

Avoid recalculating unchanged analyses.


---


# Testing Architecture


Every module requires:


## Unit Tests


Test isolated functionality.


---


## Integration Tests


Test communication between modules.


---


## Regression Tests


Verify previous functionality remains operational.

---

# Architecture Governance Workflow

Before modifying architecture:

```text
1. Identify impacted domains

2. Verify ownership

3. Review dependencies

4. Perform impact analysis

5. Update architecture documentation if required

6. Validate backward compatibility
```

Reference:

```text
PROJECT_IMPACT_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

DOCUMENT_UPDATE_MATRIX.md

CHANGE_VERIFICATION_CHECKLIST.md
```

---

# Future Architecture Extensions


Reserved Modules

```text

gcode\_engine

multi\_material

cloud

remote\_printer

webcam

machine\_learning

profile\_marketplace

filament_tracking

community_profiles

vision_classification

```

---


# Architectural Golden Rules

1. No module owns another module.
2. Communication occurs through interfaces.
3. Data flows downward.
4. Events flow upward.
5. New features must be added without rewriting existing systems.
6. Preserve backward compatibility whenever possible.
7. Every module must remain independently testable.
8. Stability has priority over complexity.
9. Respect domain boundaries.
10. Respect ownership definitions.
11. Respect dependency governance.
12. Perform impact analysis before architectural modifications.
13. Update architecture documentation whenever architecture changes.
---

# End Of Document
