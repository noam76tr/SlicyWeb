# SlicyWeb SMART SLICER

# DEVELOPMENT RULES

Version: 2.0.0

Status: Approved

Priority: Mandatory

---



# Purpose


This document defines the mandatory development rules for the entire project.


These rules exist to:


- Prevent regressions

- Prevent unnecessary rewrites

- Reduce bug creation

- Reduce token consumption

- Improve maintainability

- Preserve compatibility

- Simplify future development


All contributors, tools and AI assistants must follow these rules.


---


# Development Philosophy

The project must evolve progressively.

The project must never be rebuilt from scratch without explicit approval.

Development should focus on:


- Stability

- Modularity

- Predictability

- Reusability


New functionality must extend the system rather than replace it.

---

# Governance Requirements

All modifications must comply with:

```text
DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md

CHANGE_CLASSIFICATION_RULES.md

CHANGE_VERIFICATION_CHECKLIST.md

CROSS_DOCUMENT_DEPENDENCIES.md

DOCUMENT_UPDATE_MATRIX.md

BUG_ANALYSIS_PROTOCOL.md

UPDATE_GOVERNANCE_PROTOCOL.md
```

Development must respect:

```text
Ownership Rules

Dependency Rules

Impact Analysis Rules

Documentation Governance Rules

Architecture Governance Rules
```

---


# Fundamental Rules

## Rule 1


Working code has value.

Never rewrite stable code simply because a better implementation exists.



---



## Rule 2


Modify only what is necessary.

Avoid touching unrelated files.



---



## Rule 3


Always prefer extension over replacement.


---


## Rule 4


Every modification must be traceable.


---



## Rule 5



Every modification must have a clear purpose.



---



# Project Development Strategy



Development follows:



```text

Analyze
↓
Understand
↓
Design
↓
Implement
↓
Test
↓
Validate
↓
Document
↓
Merge

```


Never skip steps.


---



# AI Development Rules


AI assistants must behave as maintainers.

Not as generators.


The AI must:


- read existing files

- understand project structure

- understand dependencies

- understand architecture



before making changes.



---



# AI Forbidden Actions



The AI must not:

- regenerate the entire project

- regenerate entire folders

- replace architecture

- rename modules unnecessarily

- duplicate existing functionality

- create alternative implementations of existing systems



---



# Preferred Modification Strategy



Priority order:



```text

Configuration Update
↓
Data Update
↓
Function Modification
↓
Class Modification
↓
Module Modification
↓
System Modification

```


Always modify the smallest possible scope.


---



# File Update Policy


Before modifying a file:



1. Read file

2. Identify impacted section

3. Update only impacted section

4. Verify compatibility

5. Update documentation if necessary



---



# Large File Rules



For files larger than:



```text

1000 lines

```



Never rewrite the entire file.


Use:

- patches

- isolated modifications

- targeted updates



---



# Patch First Rule



Preferred:



```diff

Update Section

+ Add new method

- Remove obsolete method

```


Avoid:



```text

Generate complete file again

```


unless specifically requested.


---


# Module Creation Rules



Create a new module only if:



- responsibility is clearly separate

- existing modules become overloaded

- feature is reusable



Do not create unnecessary modules.



---



# Single Responsibility Rule



Each module should have one primary purpose.



Examples:



```text

PrinterManager



Responsible for printers only.

```



```text

MaterialDatabase



Responsible for materials only.

```



Avoid mixed responsibilities.



---



# Dependency Rules



Dependencies should always point inward.



Allowed:



```text

GUI
↓
Application
↓
Services
↓
Storage

```



Forbidden:



```text

Storage → GUI

Database → Renderer

Renderer → Database

```



---



# Coupling Rules


Minimize coupling.


Use:

- APIs

- Services

- Interfaces

- Events



Avoid direct module access whenever possible.



---

# Repository Rules

Repository access must be centralized.

Use:

- Repository Services
- Repository Interfaces
- RepositorySync Modules

Preferred Flow:

GUI
↓
Service
↓
Repository
↓
RepositorySync
↓
Remote Source (GitHub, APIs, External Repositories)

Do not access remote repositories directly from:

- GUI
- Renderer
- Analysis Engines

---

# Code Reuse Rules



Before creating code:



Verify:



1. Existing implementation?

2. Existing utility?

3. Existing service?

4. Existing module?



Reuse first.

Create second.



---



# Code Duplication Rules


Duplicate code is prohibited.

If logic is used multiple times:


Extract:


- helper

- service

- utility

- shared component



---



# Naming Rules



Use meaningful names.



Avoid abbreviations.



---



# Classes



Use PascalCase



Example:



```text

PrinterManager

MaterialProfile

GeometryAnalyzer

```



---



# Variables



Use camelCase



Example:



```text

printerProfile

selectedMaterial

analysisResult

```



---



# Constants



Use UPPER\_CASE



Example:



```text

MAX\_BUILD\_VOLUME

DEFAULT\_LAYER\_HEIGHT

```



---



# File Naming Rules



Examples:



```text

PrinterManager.ts

ModelAnalyzer.ts

RecommendationEngine.ts

```



Avoid:



```text

pm.ts

analyzer2.ts

tempFile.ts

```



---



# Folder Organization Rules



Every folder must have a purpose.



Allowed:



```text

gui/

renderer/

analysis/

database/

services/

```



Avoid:



```text

misc/

stuff/

temp/

new\_version/

```



---



# Documentation Rules

Documentation is mandatory.

Update documentation whenever:


- architecture changes

- schema changes

- module changes

- public APIs change

Follow:

CHANGE_IMPACT_RULES.md

and

DOCUMENT_UPDATE_MATRIX.md

before modifying project documentation.



---



# Comment Rules



Comments should explain:



WHY



not



WHAT



Bad:



```js

// increment x

x++

```



Good:



```js

// prevents division by zero later

x++

```



---



# Error Handling Rules



Every service must handle failures.



Never fail silently.



---



# Required Validation



Validate:



- user input

- imported files

- printer profiles

- material profiles

- repository data

- schema validation

All runtime validation must use the schemas defined in:
docs/02-architecture/DATA_SCHEMA.md

and implemented in:
src/schemas/

Never trust external data.



---



# Logging Rules



All errors must be logged.



Use levels:



```text

Debug

Info

Warning

Error

Critical

```



---



# Performance Rules



Avoid:



- unnecessary recalculations

- unnecessary rendering

- duplicated analysis



Cache whenever possible.



---



# State Management Rules

Single source of truth.

Data should not exist in multiple places.

Avoid state duplication.

Application state must be managed through:

src/state/

Only services may modify application state.

GUI components must never mutate state directly.



---



# GUI Rules



GUI responsibilities:



- display data

- collect user input

- show feedback



GUI must not:



- analyze models

- access databases directly

- generate recommendations



---



# Analysis Rules



Analysis modules must:



- be deterministic

- be reproducible

- be testable



Same input must generate same output.



---



# Recommendation Rules



Recommendations must always remain within:



- printer limits

- material limits

- geometry limits



Invalid recommendations are forbidden.



---



# Testing Rules



Every new feature requires:



## Unit Test



Tests isolated functionality.



---



## Integration Test



Tests module interaction.



---



## Regression Test



Protects existing functionality.



---



# Merge Rules



A feature is not complete until:



- implemented

- tested

- documented

- validated



---



# Versioning Rules



Format:



```text

MAJOR.MINOR.PATCH

```



Examples:



```text

1.0.0

1.1.0

1.1.1

```



---



# Major Update



Breaking change.



Examples:



- Architecture change

- Data schema change



---



# Minor Update



New feature.



Examples:



- Printer import

- Optimization engine



---



# Patch Update



Bug fix.



Examples:



- Calculation correction

- UI correction



---



# Release Rules



Release only if:



- tests pass

- documentation updated

- schema validated

- compatibility maintained



---

# Backward Compatibility Rules

Always preserve:

- WYPROJ project files
- printer profiles
- material profiles
- filament profiles
- APIs
- settings

When impossible:

Document the breaking change.

---

# Refactoring Rules


Refactor only when:


- measurable benefit exists

- risk is low

- tests exist


Refactoring must not change behavior.


---


# Emergency Rule



When multiple solutions exist:

Choose the solution that:


1. Modifies the least code

2. Introduces the fewest risks

3. Requires the fewest dependencies

4. Preserves compatibility

5. Consumes the fewest tokens



---



# Golden Development Rule


Improve the existing system.

Do not rebuild the existing system.

Evolution is preferred over reconstruction.



---

# End Of Document
