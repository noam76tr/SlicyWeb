# SlicyWeb SMART SLICER

# ARCHITECTURAL DECISIONS RECORD

Version: 2.0.0

Status: Approved

Priority: Medium

---

# Purpose

This document records all major architectural, technical, and design decisions made throughout the project lifecycle.


Goals:

- Preserve decision history

- Explain why choices were made

- Avoid repeating discussions

- Simplify future maintenance

- Assist AI-driven development

- Assist future contributors



This document should only contain significant decisions.



---



# Decision Format



Each decision uses the following format:



```text

ADR-XXX

Title

Status

Date

Context

Decision

Consequences

Alternatives Considered

```



---



# Status Values



```text

Proposed

Accepted

Deprecated

Superseded

Rejected

```



---



# ADR-001


Title: Desktop Application First

Status: Accepted

Date: 2026-08-24


---


## Context


The application is intended to work with:



- STL files

- 3MF files

- WYPROJ files

- Large geometry files

- Local printer profiles



The application must also work offline.



---



## Decision



Build the software as a desktop application.



Technology:



```text

Electron

\+

React

\+

TypeScript

```



---



## Consequences



Advantages:

```text

Local File Access

Offline Operation

Cross Platform

Easy Future Expansion

```


Disadvantages:


```text

Larger Application Size

```



---



## Alternatives Considered


```text

Web Application

Rejected

```


Reason:


```text

Local file handling limitations.

Offline support required.

```


---


# ADR-002


Title: TypeScript As Primary Language

Status: Accepted

Date: 2026-08-24



---



## Context



Project complexity requires:



- strong typing

- maintainability

- refactoring safety



---



## Decision


Use:

```text

TypeScript

```



for all application code.


---



## Consequences



Advantages:


```text

Type Safety

Better Refactoring

Improved IDE Support

Reduced Bugs

```



---



## Alternatives Considered


```text

JavaScript

```


Rejected.



---



# ADR-003


Title: Three.js Rendering Engine

Status: Accepted

Date: 2026-08-24



---



## Context



Project requires:



```text

3D Viewport

STL Rendering

3MF Rendering

Transform Controls

Camera Controls

```



---



## Decision


Use:


```text

Three.js

```



---



## Consequences


Advantages:


```text

Mature Ecosystem

Excellent Documentation

Industry Proven

```



---



## Alternatives Considered


```text

Babylon.js

Custom Renderer

```


Rejected.



---



# ADR-004



Title: Rule Based AI Engine

Status: Accepted

Date: 2026-08-24



---



## Context



Version 1.x must produce:



```text

Reliable

Deterministic

Predictable

```



results.


---


## Decision



Use:


```text

Rule Based Recommendation Engine

```


instead of machine learning.


---



## Consequences



Advantages:


```text

Repeatable Results

Easy Validation

Low Risk

```



---



## Future


Machine Learning may be added later.


---


# ADR-005


Title: Local Data First

Status: Accepted

Date: 2026-08-24



---



## Context



External sources may be unavailable.



---



## Decision



Priority:


```text

Local Database

↓

Cache

↓

GitHub

↓

Other Sources

```



---



## Consequences


```text

Faster Startup

Offline Support

Improved Reliability

```



---



# ADR-006


Title: No G-Code Generation In Initial Releases

Status: Accepted

Date: 2026-08-24



---



## Context


Project scope is large.


---



## Decision



Focus first on:


```text

Visualization

Analysis

Recommendations

```



---


## Consequences


Simpler early development.

Reduced complexity.



---



# Future


G-Code planned for later phases.


---



# ADR-007


Title: Modular Architecture

Status: Accepted

Date: 2026-08-24



---



## Context



The project will continue to grow.



---



## Decision



Every major feature must be isolated:



```text

Importer

Renderer

Analysis

Recommendation

Optimization

```



---



## Consequences


Advantages:


```text

Scalable

Maintainable

Testable

```


---


# ADR-008


Title: State Management With Zustand

Status: Accepted

Date: 2026-08-24



---



## Decision



Use:


```text

Zustand

```


instead of:


```text

Redux

MobX

```


---


## Reason


Lower complexity.

Lower maintenance cost.



---



# ADR-009


Title: Formal Documentation Required

Status: Accepted

Date: 2026-08-24



---



## Decision


Every major system must have documentation.

Mandatory Documents:


```text

Architecture

Schema

Security

Performance

API

Testing

```


---


## Consequences


Improves consistency.

Improves AI-assisted development.



---



# ADR-010


Title: Patch-First Development

Status: Accepted

Date: 2026-08-24



---



## Context



Large AI-generated rewrites create bugs.


---


## Decision


Prefer:


```text

Patch Existing Code

```


instead of:


```text

Rewrite Entire Modules

```


---



## Consequences


Advantages:


```text

Reduced Regressions

Reduced Token Usage

Improved Stability

```



---



# ADR-011


Title: Single Source Of Truth

Status: Accepted

Date: 2026-08-24



---



## Decision


Application state stored centrally.

Only services may update state.



---



## Consequences


Advantages:


```text

Predictable Behavior

Fewer Synchronization Bugs

```



---



# ADR-012


Title: Plugin System Reserved For Future

Status: Accepted

Date: 2026-08-24



---



## Decision


Do not implement plugins in early releases.


---


## Reason


Core stability has priority.


---


# Future


Plugin framework planned after stable releases.


---


# ADR-013


Title: Security By Validation

Status: Accepted

Date: 2026-08-24



---



## Decision


All imported content must be validated.


---


## Applies To



```text

STL

3MF

Printer Profiles

Material Profiles

Repositories

```


---


## Consequences

Improved stability.

Improved data integrity.



---



# ADR-014

Title: Performance Target

Status: Accepted

Date: 2026-08-24



---



## Decision


Performance goals:


```text

60 FPS Target

30 FPS Minimum

< 3 sec Startup

```


---


## Consequences


Performance considerations become mandatory.


---


# ADR-015


Title: AI Assists User

Status: Accepted

Date: 2026-08-24



---


## Decision


The AI provides:


```text

Recommendations

Warnings

Suggestions

```


The user remains in control.


---


## Consequences


Avoids overly aggressive automation.

Maintains user trust.


---

# ADR-016

Title: Governance Framework Adoption

Status: Accepted

Date: 2026-09-14

---

## Context

Project complexity increased with:

- Multiple domains
- AI-assisted development
- Architecture evolution
- Documentation growth

A formal governance framework became necessary.

---

## Decision

Adopt a structured governance framework composed of:

- Domain Governance
- Ownership Management
- Dependency Governance
- Impact Analysis
- Documentation Governance
- Update Governance

---

## Consequences

Advantages:

- Reduced regressions
- Controlled modifications
- Improved maintainability
- Better AI-assisted development
- Consistent documentation

---

## Related Documents

CLAUDE_GOVERNANCE_PROTOCOL.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md

DOCUMENT_UPDATE_MATRIX.md

CHANGE_CLASSIFICATION_RULES.md

CHANGE_VERIFICATION_CHECKLIST.md

---

# ADR-017

Title: Documentation First Development

Status: Accepted

Date: 2026-09-14

---

## Context

The project relies heavily on:

- AI-assisted development
- Long-term maintainability
- Architecture consistency

---

## Decision

Documentation must be created or updated before implementation.

---

## Consequences

Advantages:

- Better project understanding
- Reduced ambiguity
- Improved onboarding
- Safer implementation

---

# ADR-018

Title: Domain Ownership Enforcement

Status: Accepted

Date: 2026-09-14

---

## Context

Project growth introduced:

- Multiple domains
- Shared responsibilities
- Cross-domain dependencies

Ownership rules became necessary.

---

## Decision

Every file, module and document must have a designated ownership domain.

Ownership definitions are maintained in:

```text
FILE_OWNERSHIP_MATRIX.md
DOMAIN_BOUNDARIES.md
```

---

# ADR-019

Title: Documentation As Source Of Truth

Status: Accepted

Date: 2026-09-14

---

## Context

The project relies heavily on:

- AI-assisted development
- Long-term maintainability
- Documentation-driven architecture
- Multi-document governance
- Incremental development

As the project grows, implementation and documentation must remain synchronized.

Without a single authoritative source of truth, inconsistencies, regressions, architectural drift, and conflicting implementations become more likely.

---

## Decision

Project documentation is the official Source Of Truth.

Implementation must follow documented specifications.

When a project behavior, architecture, schema, workflow, or process changes:

- Documentation must be reviewed
- Documentation must be updated when affected
- Documentation consistency must be verified
- Cross-document dependencies must be evaluated

All implementation decisions must be traceable to documented specifications.

---

## Consequences

Advantages:

- Improved Consistency
- Improved Maintainability
- Reduced Ambiguity
- Reduced Regression Risk
- Safer AI-Assisted Development
- Better Onboarding
- Better Knowledge Preservation
- Improved Architecture Governance

---

## Related Documents

- PROJECT_SPEC.md
- ARCHITECTURE.md
- DATA_SCHEMA.md
- API_SPEC.md
- TECHNICAL_OVERVIEW.md
- SYSTEM_RULES.md
- DEVELOPMENT_RULES.md
- DECISIONS.md
- PROJECT_DOCUMENTATION_INDEX.md
- AI_START_HERE.md
- DOCUMENT_UPDATE_MATRIX.md
- CROSS_DOCUMENT_DEPENDENCIES.md
- PROJECT_IMPACT_MATRIX.md
- CLAUDE_FILE_UPDATE_RULES.md

---

## Alternatives Considered

Code As Source Of Truth

Rejected

Reason:

- Code Alone Does Not Explain Intent
- Difficult For AI Systems
- Higher Risk Of Knowledge Loss
- Reduced Architectural Traceability

---

## Governance Impact

The following principles become mandatory:

- Documentation First
- Impact Analysis First
- Patch First
- Architecture Protection
- Cross-Document Consistency
- Documentation Maintenance

---

## Verification Requirements

Before approving a modification:

- Verify Documentation Impact
- Verify Cross-Document Dependencies
- Verify Ownership Requirements
- Verify Architecture Consistency
- Verify Source Of Truth Compliance

---

# ADR-020

Title: Native Project Format WYPROJ

Status: Accepted

Date: 2026-09-15

---

## Context

The application requires a native project format capable of storing:

- Scene Data
- Object Data
- Printer Selection
- Material Selection
- Filament Selection
- Print Presets
- Analysis Results
- Recommendations
- User Settings
- Metadata

The project format must support:

- Save
- Load
- Auto Save
- Recovery
- Future Version Migration

---

## Decision

Use WYPROJ as the native project format.

Project Extension:

.wyproj

Underlying Storage Format:

JSON

---

## Consequences

Advantages:

- Full Project Persistence
- Recovery Support
- Versioned Project Files
- Compatibility Validation
- Portable Storage
- Human Readable Structure

---

## Related Documents

- PROJECT_SPEC.md
- DATA_SCHEMA.md
- API_SPEC.md
- TECHNICAL_OVERVIEW.md
- IMPORT_EXPORT_SPEC.md
- USER_SETTINGS_SPEC.md

---

## Alternatives Considered

Multiple Separate Files

Rejected

Reason:

- Harder To Manage
- Increased Risk Of Missing Data
- More Complex Recovery Logic

---

# ADR-021

Title: JSON As Internal Storage Format

Status: Accepted

Date: 2026-09-15

---

## Context

The application requires a standard internal storage format for:

- Profiles
- Settings
- Cache
- Metadata
- Project Files
- Repository Data
- Future Extensions

The format must be:

- Human Readable
- Easy To Validate
- Cross Platform
- Easy To Maintain

---

## Decision

Use JSON as the internal storage format.

JSON is used by:

- WYPROJ Files
- Local Database
- Cache
- Settings
- Profile Storage
- Repository Imports

---

## Consequences

Advantages:

- Human Readable
- Cross Platform
- Easy Validation
- Schema Friendly
- Easy Backup
- Zod Compatible
- Easy Migration

---

## Alternatives Considered

- XML
- Binary Storage
- SQLite Only

Rejected

Reason:

- Higher Complexity
- Lower Portability
- Reduced Transparency

---

## Related Documents

- PROJECT_SPEC.md
- DATA_SCHEMA.md
- API_SPEC.md
- TECHNICAL_OVERVIEW.md

---

# ADR-022

Title: Impact Analysis Before Change

Status: Accepted

Date: 2026-09-15

---

## Context

Project complexity has increased significantly due to:

- Domain Ownership
- Dependency Governance
- Multi-Document Architecture
- AI-Assisted Development
- Cross-Domain Dependencies

Changes made without impact analysis increase the risk of:

- Regressions
- Documentation Drift
- Architecture Violations
- Compatibility Issues

---

## Decision

Impact analysis is mandatory before any significant modification.

Impact analysis applies to:

- Architecture Changes
- API Changes
- Schema Changes
- Documentation Changes
- Cross-Domain Changes
- Repository Changes
- Governance Changes

---

## Consequences

Advantages:

- Reduced Regression Risk
- Improved Change Visibility
- Better Dependency Control
- Safer Refactoring
- Improved Documentation Consistency
- Stronger Governance

---

## Related Documents

- PROJECT_IMPACT_MATRIX.md
- CHANGE_CLASSIFICATION_RULES.md
- CHANGE_VERIFICATION_CHECKLIST.md
- DOCUMENT_UPDATE_MATRIX.md
- CROSS_DOCUMENT_DEPENDENCIES.md

---

## Verification Requirements

Before approving a significant change:

- Identify Impacted Domains
- Identify Impacted Files
- Identify Impacted APIs
- Identify Impacted Schemas
- Validate Ownership
- Review Documentation
- Validate Dependencies
- Complete Impact Analysis

---

# ADR-023

Title: Externalized Internationalization System

Status: Accepted

Date: 2026-09-15

## Context

The application must support multiple languages.

Project files must remain language neutral.

Future languages must be added without modifying application logic.

## Decision

Use an externalized translation system.

Components:

- LanguageManager
- LocalizationService
- TranslationLoader

Languages:

- English
- French
- Hebrew

Translations are stored in language dictionaries.

Project files remain language independent.

## Consequences

Advantages:

- Easier localization
- Better maintainability
- Language-independent architecture
- Language-neutral WYPROJ files
- Simpler future expansion

---

# Future Decision Template

Copy and complete:

ADR-XXX

Title:

Status:

Date:

Context:

Decision:

Consequences:

Alternatives Considered:

---

# Golden Rule

Every major technical decision must be recorded here before implementation.

Future contributors should understand not only WHAT was decided, but WHY it was decided.

---

# End Of Document
