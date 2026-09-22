# AI DEVELOPMENT PROTOCOL

Version: 2.0.0

Status: Approved

Priority: Mandatory

---

# Relationship With SYSTEM_RULES

This document supplements SYSTEM_RULES.md.

If any conflict exists:

SYSTEM_RULES.md takes precedence.

AI_DEVELOPMENT_PROTOCOL.md defines the recommended workflow.

SYSTEM_RULES.md defines mandatory project rules.

---

# Purpose

This document defines the mandatory workflow that any AI assistant must follow before creating, modifying, reviewing, or validating code within the SlicyWeb project.

The objective is to:

- preserve architecture consistency
- reduce regressions
- reduce token consumption
- prevent unnecessary rewrites
- maintain compatibility
- enforce documentation-first development

This protocol applies to:

- AI assistants
- code generation tools
- automated coding systems
- repository maintenance agents

---

# Core Principles

Priority Order:

1. Stability
2. Compatibility
3. Reliability
4. Performance
5. New Features

A working feature must never be broken to add a new feature.

---

# Documentation First Policy

Before analyzing code, the AI must read:

1. PROJECT_DOCUMENTATION_INDEX.md
2. CLAUDE_DOCUMENT_READING_ORDER.md
3. AI_START_HERE.md
4. PROJECT_SPEC.md
5. SYSTEM_RULES.md
6. AI_DEVELOPMENT_PROTOCOL.md
7. ARCHITECTURE.md
8. DATA_SCHEMA.md
9. FILE_STRUCTURE.md
10. ROADMAP.md
11. CHANGELOG.md
12. DOMAIN_BOUNDARIES.md
13. DOMAINS_DEPENDENCY_MATRIX.md
14. FILE_OWNERSHIP_MATRIX.md
15. PROJECT_IMPACT_MATRIX.md
16. DOCUMENT_UPDATE_MATRIX.md
17. CHANGE_VERIFICATION_CHECKLIST.md

Documentation has priority over assumptions.

Documentation has priority over generated code.

---

# Architecture First Policy

Before modifying any file:

1. Read architecture references
2. Read associated schema
3. Verify domain ownership
4. Verify allowed dependencies
5. Read related types
6. Read related services
7. Read existing implementation
8. Perform impact analysis

The AI must understand the surrounding system before making modifications.

---

# Governance Validation

Before modifying any file:

1. Verify ownership
2. Verify dependencies
3. Verify impact
4. Verify document updates
5. Verify change classification
6. Verify compatibility

Required References:

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md

DOCUMENT_UPDATE_MATRIX.md

CHANGE_CLASSIFICATION_RULES.md

CHANGE_VERIFICATION_CHECKLIST.md

---

# Project Systems

When project files are involved:

Read:

IMPORT_EXPORT_SPEC.md

DATA_SCHEMA.md

PROJECT_SPEC.md

Required Validation:

WYPROJ Compatibility

Serialization Compatibility

Version Compatibility

---

# Internationalization Rules

When localization is involved:

Read:

PROJECT_SPEC.md

TECHNICAL_OVERVIEW.md

DOMAIN_BOUNDARIES.md

Requirements:

No hardcoded UI text

All strings localizable

Language independence preserved

WYPROJ remains language neutral

---

# Modification Policy

Preferred Order:

1. Configuration update
2. Data update
3. Small function update
4. Module update
5. System update

Avoid large-scale rewrites.

---

# Mandatory Patch Rule

Whenever possible:

PATCH existing code.

DO NOT rewrite complete systems.

Prefer:

- extending existing modules
- improving existing code
- fixing existing implementations

Avoid:

- file recreation
- architecture rewrites
- large-scale refactoring without justification

---

# Validation Before Modification

Before modifying a file:

Step 1

Read the file.

Step 2

Identify dependencies.

Step 3

Identify consumers.

Step 4

Verify schema compatibility.

Step 5

Apply minimal modification.

Step 6

Validate compatibility.

---

# Type Safety Rules

Prefer explicit types.

Avoid:

```text
any
```

Prefer:

```ts
Analysis
Classification
Recommendation
Printer
Material
Filament
```

Strong typing is mandatory whenever possible.

---
