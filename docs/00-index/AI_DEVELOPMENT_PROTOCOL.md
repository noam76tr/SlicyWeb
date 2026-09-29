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

1. docs/00-index/PROJECT_DOCUMENTATION_INDEX.md
2. CLAUDE_DOCUMENT_READING_ORDER.md
3. docs/00-index/AI_START_HERE.md
4. docs/01-project/PROJECT_SPEC.md
5. SYSTEM_RULES.md
6. AI_DEVELOPMENT_PROTOCOL.md
7. docs/02-architecture/ARCHITECTURE.md
8. docs/02-architecture/DATA_SCHEMA.md
9. docs/02-architecture/FILE_STRUCTURE.md
10. docs/01-project/ROADMAP.md
11. docs/01-project/CHANGELOG.md
12. docs/03-development/DOMAIN_BOUNDARIES.md
13. docs/03-development/DOMAINS_DEPENDENCY_MATRIX.md
14. docs/03-development/FILE_OWNERSHIP_MATRIX.md
15. docs/03-development/PROJECT_IMPACT_MATRIX.md
16. docs/03-development/DOCUMENT_UPDATE_MATRIX.md
17. docs/03-development/CHANGE_VERIFICATION_CHECKLIST.md
18. docs/03-development/CROSS_DOCUMENT_DEPENDENCIES.md
19. docs/03-development/BUG_ANALYSIS_PROTOCOL.md
20. docs/03-development/UPDATE_GOVERNANCE_PROTOCOL.md
21. docs/03-development/UPDATE_IMPACT_RULES.md
22. docs/03-development/CHANGE_CLASSIFICATION_RULES.md
23. docs/03-development/UPDATE_REPORT_TEMPLATE.md

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

# Local-First Architecture Rule

When working with Repository, Storage, or RepositorySync:

Verify:

1. Repository Domain owns local data access
2. Storage Domain owns persistence
3. RepositorySync Domain owns remote access
4. Remote access is ONLY through RepositorySync
5. Local data flows through Repository before Storage
6. Cache entries use Storage, not direct files

Required Flow:

GUI
↓
IPC
↓
Services
↓
Repository
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources

References:

docs/02-architecture/ARCHITECTURE.md
docs/03-development/DOMAIN_BOUNDARIES.md
docs/03-development/DOMAINS_DEPENDENCY_MATRIX.md
docs/02-architecture/TECHNICAL_OVERVIEW.md

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

docs/03-development/DOMAIN_BOUNDARIES.md

docs/03-development/DOMAINS_DEPENDENCY_MATRIX.md

docs/03-development/FILE_OWNERSHIP_MATRIX.md

docs/03-development/PROJECT_IMPACT_MATRIX.md

docs/03-development/DOCUMENT_UPDATE_MATRIX.md

docs/03-development/CHANGE_CLASSIFICATION_RULES.md

docs/03-development/CHANGE_VERIFICATION_CHECKLIST.md

---

# Security Validation

Before modifying API, IPC, or input handling:

1. Read SECURITY_SPEC.md
2. Verify input validation rules
3. Verify remote source validation
4. Verify credential protection
5. Verify error message safety
6. Verify that raw errors are never exposed

Required References:

docs/06-quality/SECURITY_SPEC.md

docs/02-architecture/ARCHITECTURE.md

docs/02-architecture/DATA_SCHEMA.md

---

# Project Systems

When project files are involved:

Read:

IMPORT_EXPORT_SPEC.md

docs/02-architecture/DATA_SCHEMA.md

docs/01-project/PROJECT_SPEC.md

Required Validation:

WYPROJ Compatibility

Serialization Compatibility

Version Compatibility

---

# Internationalization Rules

When localization is involved:

Read:

docs/01-project/PROJECT_SPEC.md

docs/02-architecture/TECHNICAL_OVERVIEW.md

docs/03-development/DOMAIN_BOUNDARIES.md

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

# Testing Requirements

Before approving any modification:

Required Test Coverage:

```text
Unit Tests
Integration Tests
Schema Validation Tests
API Validation Tests
Regression Tests
```

# Testing Reference

docs/06-quality/TEST_PLAN.md

docs/02-architecture/ARCHITECTURE.md


Backward Compatibility:

All tests must pass.

Existing functionality must continue to work.

New features must not break existing features.

---

# IPC Communication Rules

When implementing IPC handlers:

Verify:

1. Handler is needed (not already existing)
2. Payload follows API_SPEC.md
3. Validation is enforced
4. Errors are handled safely
5. Response format is documented

Required References:

docs/02-architecture/API_SPEC.md

src/electron/ipc/

docs/02-architecture/ARCHITECTURE.md

docs/03-development/DOMAINS_DEPENDENCY_MATRIX.md

---

# Error Handling Rules

All modifications must:

1. Define error cases
2. Provide meaningful error codes
3. Never expose stack traces to users
4. Never expose internal implementation details
5. Log errors securely

Reference:

docs/03-development/ERROR_CODES_SPEC.md

docs/06-quality/SECURITY_SPEC.md

---

# Documentation Update Rules

When modifying code:

Update documentation if:

Schema changes

API changes

Behavior changes

Architecture changes

Domain changes

Dependency changes

Do NOT update documentation if:

Internal implementation changes

Refactoring without behavior change

Performance optimization without API change

References:

docs/03-development/DOCUMENT_UPDATE_MATRIX.md

docs/03-development/CROSS_DOCUMENT_DEPENDENCIES.md

docs/03-development/CHANGE_CLASSIFICATION_RULES.md

---

# Bug Fix Protocol

For bug fixes:

Step 1

Read docs/03-development/BUG_ANALYSIS_PROTOCOL.md

Step 2

Identify root cause

Step 3

Analyze impact

Step 4

Review dependencies

Step 5

Implement minimal fix

Step 6

Verify regression risk

Step 7

Update documentation if affected

Step 8

Update docs/01-project/CHANGELOG.md

Reference:

docs/03-development/BUG_ANALYSIS_PROTOCOL.md

docs/03-development/PROJECT_IMPACT_MATRIX.md

docs/03-development/CHANGE_VERIFICATION_CHECKLIST.md

---

# External Update Protocol

For external updates (printer profiles, materials, presets):

Follow:

docs/03-development/UPDATE_GOVERNANCE_PROTOCOL.md

docs/03-development/UPDATE_IMPACT_RULES.md

docs/03-development/UPDATE_REPORT_TEMPLATE.md

Human approval is mandatory.

---

# Forbidden Actions

The AI must NEVER:

- Rewrite entire modules without justification
- Regenerate complete files unless explicitly requested
- Bypass the IPC architecture
- Bypass the Repository architecture
- Bypass RepositorySync for remote access
- Create duplicate functionality
- Ignore documentation
- Break backward compatibility
- Expose credentials or sensitive data
- Expose raw errors to users

---

# Preferred Workflow

Before implementing any change:

1. Read relevant documentation
2. Understand architecture
3. Identify ownership
4. Analyze dependencies
5. Assess impact
6. Plan minimal changes
7. Implement patches
8. Validate compatibility
9. Update documentation
10. Update CHANGELOG
11. Verify tests pass

---

# Success Criteria

A modification is successful when:

All tests pass

Backward compatibility maintained

Documentation updated

CHANGELOG updated

Architecture respected

Dependencies verified

Security validated

No regressions introduced

Code is maintainable

Governance rules respected

---

# Golden Protocol Rule

Understand before modifying.

Document before implementing.

Test before approving.

Follow protocol at all times.

---

# End Of Document
