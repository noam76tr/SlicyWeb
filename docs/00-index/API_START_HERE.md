# SlicyWeb SMART SLICER
# API START HERE

Version: 1.0.0

Status: Approved

Priority: Mandatory

---

# Purpose

This document is the entry point for developers and AI systems working with the API architecture of the project.

Before modifying any API, service, repository, event, IPC channel, or remote synchronization logic, this file must be read.

The objective is to:

- Prevent breaking changes
- Maintain API consistency
- Preserve backward compatibility
- Standardize communication patterns
- Reduce integration errors
- Keep internal services synchronized

---

# Scope

This document applies to:

```text
Internal APIs

Service APIs

Repository APIs

Electron IPC

State Updates

Event Communication

Future Cloud APIs
```

---

# Required Reading Order

Read documents in the exact order below.

---

# STEP 1

Read:

```text
docs/02-architecture/ARCHITECTURE.md
```

Purpose:

Understand the architecture layers and module responsibilities.

---

# STEP 2

Read:

```text
docs/02-architecture/API_SPEC.md
```

Purpose:

Understand official API contracts.

---

# STEP 3

Read:

```text
docs/02-architecture/DATA_SCHEMA.md
```

Purpose:

Understand all entities exchanged by APIs.

---

# STEP 4

Read:

```text
docs/02-architecture/FILE_STRUCTURE.md
```

Purpose:

Locate services, repositories, events, and state management systems.

---

# STEP 5

Read:

```text
docs/03-development/SYSTEM_RULES.md

docs/03-development/DEVELOPMENT_RULES.md
```

Purpose:

Understand mandatory modification policies.

---

# API Architecture

All system communications follow:

```text
GUI

↓

Application Layer

↓

Services

↓

Repositories

↓

Storage
```

---

# API Categories

The project contains several API categories.

---

## Service APIs

Used for:

```text
Business Logic

Workflow Control

System Coordination
```

Examples:

```text
AnalysisService

PrinterService

MaterialService

RecommendationService
```

---

## Repository APIs

Used for:

```text
Data Access

Data Storage

External Repositories
```

Examples:

```text
PrinterRepository

MaterialRepository

FilamentRepository
```

---

## Event APIs

Used for:

```text
Module Communication

Notifications

Background Updates
```

Examples:

```text
ObjectAdded

AnalysisFinished

RecommendationUpdated
```

---

## Electron IPC APIs

Used for:

```text
Renderer Process

Main Process

System Integration
```

Examples:

```text
loadProject

saveProject

openFile

exportProject
```

---

# API Modification Rules

Always:

```text
Read Existing Contract

↓

Evaluate Impact

↓

Patch Existing API

↓

Maintain Compatibility

↓

Update Documentation
```

---

# Forbidden Actions

Never:

```text
Break Existing APIs

Remove Public Fields

Rename Stable Contracts

Change Data Meaning

Change Event Names
```

without a documented version update.

---

# API Versioning

Follow:

```text
docs/09-reference/VERSIONING_POLICY.md
```

Format:

```text
v1

v2

v3
```

Example:

```text
/api/v1/printers

/api/v1/materials
```

---

# Source Of Truth

If conflicts exist, prioritize:

```text
API_SPEC.md

DATA_SCHEMA.md

ARCHITECTURE.md
```

---

# Golden Rule

An API should be predictable, documented, backward compatible, and easy to understand without reading implementation code.

---

# End Of Document
