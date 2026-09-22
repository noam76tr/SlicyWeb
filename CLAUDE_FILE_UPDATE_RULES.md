# CLAUDE FILE UPDATE RULES

Version: 1.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the mandatory file update rules Claude must follow before modifying, creating, moving, renaming, or removing any file.

The objective is to:

- Prevent incomplete updates
- Prevent forgotten dependencies
- Prevent documentation drift
- Prevent regressions
- Prevent architecture inconsistencies
- Prevent ownership violations
- Maintain project integrity
- Maintain long-term maintainability

These rules apply to:

- Documentation Files
- Source Files
- Configuration Files
- Specifications
- Schemas
- APIs
- Governance Files
- Project Structure Files

---

# Core Principle

A file must never be considered in isolation.

Before modifying any file determine:

```text
Who Owns The File

What Depends On The File

What References The File

Which Documents Must Be Reviewed

Which Documents May Require Updates
```

No file should be modified without verification.

---

# Mandatory Update Workflow

Before modifying any file:

```text
Identify File
↓
Identify Owner
↓
Identify Domain
↓
Identify Dependencies
↓
Identify References
↓
Perform Impact Analysis
↓
Verify Required Reviews
↓
Verify Required Updates
↓
Implement Changes
↓
Validate Consistency
```

No steps may be skipped.

---

# Ownership Verification Rule

Before modifying any file verify:

```text
File Owner

Owning Domain

Related Domains

Related Documents
```

Reference:

```text
FILE_OWNERSHIP_MATRIX.md
```

Ownership verification is mandatory.

---

# Dependency Verification Rule

Before modifying any file verify:

```text
Direct Dependencies

Indirect Dependencies

Document Dependencies

Domain Dependencies

Module Dependencies
```

Reference:

```text
CROSS_DOCUMENT_DEPENDENCIES.md
```

Dependency verification is mandatory.

---

# Impact Verification Rule

Before modifying any file verify:

```text
Affected Documents

Affected Domains

Affected Modules

Affected Schemas

Affected APIs

Affected Tests
```

Reference:

```text
PROJECT_IMPACT_MATRIX.md
```

Impact analysis is mandatory.

---

# Documentation Verification Rule

Before modifying any file determine:

```text
Required Documentation Updates

Optional Documentation Updates

Review Only Documents

No Action Documents
```

Reference:

```text
DOCUMENT_UPDATE_MATRIX.md
```

Only required updates should be applied.

---

# File Modification Rule

Whenever an existing file is modified:

Verify:

```text
Ownership

Dependencies

Documentation Impact

Compatibility Impact
```

Then determine:

```text
Files To Review

Files To Update

Files With No Required Changes
```

---

# New File Rule

When a new file is created:

Mandatory Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

Wichy files explication.txt
```

Evaluate Updates For:

```text
AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_READING_PRIORITY.md
```

Determine:

```text
New Owner

New Domain

New Dependencies

Documentation Requirements
```

---

# File Removal Rule

Before removing any file verify:

```text
Who References It

Who Depends On It

What Documentation References It
```

Mandatory Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

Wichy files explication.txt

CLAUDE_DOCUMENT_READING_ORDER.md
```

Removing a file without dependency analysis is prohibited.

---

# File Rename Rule

Before renaming a file determine:

```text
All References

All Links

All Documentation References

All Reading Lists
```

Mandatory Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_READING_PRIORITY.md

Wichy files explication.txt
```

All references must be updated.

---

# File Move Rule

Before moving a file determine:

```text
All Path References

All Documentation References

All Navigation References
```

Mandatory Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

FILE_STRUCTURE.md

Wichy files explication.txt
```

Path consistency must be preserved.

---

# Documentation File Rule

For documentation files determine:

```text
Documentation Dependencies

Referenced Documents

Reading Order Impact

Governance Impact
```

Documentation changes may require updates to:

```text
PROJECT_DOCUMENTATION_INDEX.md

AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_READING_PRIORITY.md

Wichy files explication.txt
```

---

# Architecture File Rule

Applicable Files:

```text
ARCHITECTURE.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md
```

Before modification verify:

```text
Architecture Impact

Domain Impact

Dependency Impact

Ownership Impact
```

Mandatory Review:

```text
PROJECT_IMPACT_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

CROSS_DOCUMENT_DEPENDENCIES.md
```

---

# Schema File Rule

Applicable Files:

```text
DATA_SCHEMA.md
```

Before modification verify:

```text
API Impact

AI Impact

Validation Impact

Storage Impact
```

Mandatory Review:

```text
PROJECT_SPEC.md

API_SPEC.md

AI_ENGINE_SPEC.md

ARCHITECTURE.md
```

Schema modifications are high risk.

---

# API File Rule

Applicable Files:

```text
API_SPEC.md
```

Before modification verify:

```text
Schema Impact

IPC Impact

Validation Impact

Repository Impact
```

Mandatory Review:

```text
DATA_SCHEMA.md

ARCHITECTURE.md
```

---

# AI Specification Rule

Applicable Files:

```text
AI_ENGINE_SPEC.md

RECOMMENDATION_RULES.md

OBJECT_CLASSIFICATION_SPEC.md

PRINT_SETTINGS_SPEC.md

PRINT_PRESETS_SPEC.md
```

Before modification verify:

```text
Schema Impact

API Impact

Recommendation Impact

Classification Impact
```

Mandatory Review:

```text
DATA_SCHEMA.md

API_SPEC.md
```

---

# Profile Specification Rule

Applicable Files:

```text
PRINTER_PROFILE_SPEC.md

MATERIAL_PROFILE_SPEC.md

FILAMENT_SETTINGS_SPEC.md
```

Before modification verify:

```text
Schema Impact

Validation Impact

Recommendation Impact
```

Mandatory Review:

```text
DATA_SCHEMA.md

API_SPEC.md
```

---

# GUI Specification Rule

Applicable Files:

```text
GUI_SPEC.md
```

Before modification verify:

```text
User Impact

Workflow Impact

Architecture Impact
```

Mandatory Review:

```text
DOMAIN_BOUNDARIES.md
```

Never introduce business logic into GUI specifications.

---

# Structure File Rule

Applicable Files:

```text
FILE_STRUCTURE.md

DIRECTORY_PURPOSES.md
```

Before modification verify:

```text
Directory Impact

Ownership Impact

Documentation Impact
```

Mandatory Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

Wichy files explication.txt
```

---

# Governance File Rule

Applicable Files:

```text
SYSTEM_RULES.md
DEVELOPMENT_RULES.md
AI_DEVELOPMENT_PROTOCOL.md
CLAUDE_GOVERNANCE_PROTOCOL.md
CLAUDE_CHANGE_IMPACT_RULES.md
CLAUDE_FILE_UPDATE_RULES.md
DOCUMENT_UPDATE_RULES.md
DOCUMENT_UPDATE_MATRIX.md
```

Before modification verify:

```text
Governance Impact

Workflow Impact

Consistency Impact
```

Mandatory Review:

```text
CHANGE_VERIFICATION_CHECKLIST.md

CHANGE_CLASSIFICATION_RULES.md
```

Governance files affect the entire project.

---

# Changelog Verification Rule

Before closing a modification determine:

```text
Does This Require A Changelog Update?
```

Always evaluate:

```text
CHANGELOG.md
```

Mandatory evaluation for:

```text
Architecture Changes

Schema Changes

API Changes

Feature Changes

Domain Changes

Project Structure Changes

User Visible Changes
```

---

# External Update Rule

When the modification originates from:

```text
New Printer

New Material

New Filament

New Preset

Repository Update

External Source Update
```

Mandatory Review:

```text
UPDATE_GOVERNANCE_PROTOCOL.md

UPDATE_IMPACT_RULES.md

UPDATE_REPORT_TEMPLATE.md
```

Human approval is required before implementation.

---

# Compatibility Verification Rule

Before finalizing a modification verify:

```text
Existing Behavior Preserved

Existing Data Preserved

Existing APIs Preserved

Existing Workflows Preserved

Documentation Consistent
```

Compatibility must be evaluated.

---

# File Update Report Rule

For significant modifications generate:

```text
Modified File

Owner

Affected Domain

Dependencies

Related Files

Files Reviewed

Files Updated

Files Not Updated

Reasoning

Risk Level
```

---

# Stop Rule

Stop immediately if:

```text
Owner Unknown

Dependencies Unknown

Impact Unknown

Required Updates Unknown

Compatibility Unknown
```

Continue analysis before implementation.

---

# Final Verification Checklist

Before completing a file modification verify:

```text
Ownership Verified

Dependencies Verified

Impact Analyzed

Documentation Reviewed

Required Updates Identified

Changelog Evaluated

Compatibility Verified

Consistency Verified
```

All items must be completed.

---

# Golden Rule

Never update a file simply because it changed.

Update only after understanding:

Who owns it.

What depends on it.

What must remain consistent.

What truly requires updating.
