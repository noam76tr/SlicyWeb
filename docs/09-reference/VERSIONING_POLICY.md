# WICHY
# VERSIONING POLICY

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the official versioning policy used throughout the Wichy project.

The objective is to ensure:

- Consistent Releases
- Clear Compatibility Rules
- Predictable Upgrades
- Change Traceability
- Stable Development Workflow

All software releases, documentation updates, schemas, profiles, and future APIs must follow this policy.

---

# Versioning Method

Wichy follows:

```text
Semantic Versioning
```

Format:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
1.0.0
```

---

# Version Components

Example:

```text
2.4.15
```

Meaning:

```text
2 = Major

4 = Minor

15 = Patch
```

---

# Major Version

Purpose:

```text
Breaking Changes
```

Increment:

```text
1.0.0

↓

2.0.0
```

---

# Examples

```text
Architecture Redesign

Schema Breaking Changes

Major API Changes

Plugin System Changes

Database Structure Changes
```

---

# Requirements

Major releases require:

```text
Migration Documentation

CHANGELOG Update

Architecture Review

Version Increase
```

---

# Minor Version

Purpose:

```text
New Features
```

Increment:

```text
1.0.0

↓

1.1.0
```

---

# Examples

```text
New AI Features

New Analysis Features

New Printer Profiles

New Material Support

New User Interface Components
```

---

# Requirements

Minor releases must:

```text
Remain Backward Compatible
```

---

# Patch Version

Purpose:

```text
Bug Fixes

Improvements

Documentation Updates
```

Increment:

```text
1.0.0

↓

1.0.1
```

---

# Examples

```text
Logic Fixes

Validation Improvements

Performance Improvements

README Corrections

Documentation Fixes
```

---

# Requirements

Patch releases must:

```text
Not Break Compatibility
```

---

# Release Examples

---

## Initial Stable Release

```text
1.0.0
```

Meaning:

```text
First Production Ready Version
```

---

## New Feature Release

```text
1.2.0
```

Meaning:

```text
Backward Compatible New Features
```

---

## Bug Fix Release

```text
1.2.1
```

Meaning:

```text
Corrections Only
```

---

## Major Upgrade

```text
2.0.0
```

Meaning:

```text
Breaking Changes Introduced
```

---

# Documentation Versioning

Every specification document may contain its own version.

Example:

```text
Version: 1.0.0
```

---

# Documentation Patch Update

Used For:

```text
Grammar Fixes

Formatting Improvements

Clarifications

Link Corrections
```

Example:

```text
1.0.0

↓

1.0.1
```

---

# Documentation Minor Update

Used For:

```text
New Sections

New Schemas

New Features

Additional Documentation
```

Example:

```text
1.0.0

↓

1.1.0
```

---

# Documentation Major Update

Used For:

```text
Document Restructuring

Breaking Specification Changes

Redesign of Core Concepts
```

Example:

```text
1.0.0

↓

2.0.0
```

---

# Data Schema Versioning

Applies To:

```text
DATA_SCHEMA.md

API_SPEC.md

Printer Profiles

Material Profiles

Filament Profiles
```

---

# Compatible Schema Change

Example:

```text
Adding Fields
```

Allowed:

```text
1.0.0

↓

1.1.0
```

---

# Breaking Schema Change

Examples:

```text
Removing Fields

Renaming Existing Fields

Changing Field Meanings
```

Requires:

```text
2.0.0
```

---

# Profile Versioning

Applies To:

```text
Printer Profiles

Material Profiles

Filament Profiles

Print Presets
```

---

# Example

```json
{
  "version": "1.0.0"
}
```

---

# Profile Compatibility

Profiles should remain:

```text
Backward Compatible
```

whenever possible.

---

# API Versioning

Future APIs must use:

```text
/api/v1/

/api/v2/

/api/v3/
```

Examples:

```text
/api/v1/printers

/api/v1/materials

/api/v1/recommendations
```

---

# Git Tag Policy

Every official release must create a tag.

Examples:

```text
v0.1.0

v1.0.0

v1.4.2

v2.0.0
```

---

# Release Categories

---

## Alpha

Purpose:

```text
Internal Development
```

Format:

```text
0.x.x-alpha
```

Examples:

```text
0.1.0-alpha

0.4.2-alpha
```

---

## Beta

Purpose:

```text
Public Testing
```

Format:

```text
0.x.x-beta
```

Examples:

```text
0.8.0-beta

0.9.5-beta
```

---

## Release Candidate

Purpose:

```text
Final Validation
```

Format:

```text
1.0.0-rc1
```

Examples:

```text
1.0.0-rc1

1.0.0-rc2
```

---

## Stable

Purpose:

```text
Production Use
```

Examples:

```text
1.0.0

1.2.5

2.0.0
```

---

# Changelog Requirements

Every release must update:

```text
CHANGELOG.md
```

Before:

```text
Tag Creation

Release Publication
```

---

# Release Validation Checklist

Before releasing:

Verify:

```text
Documentation Updated

Build Successful

Tests Passed

Version Updated

Changelog Updated
```

---

# Development Phase Versioning

Recommended progression:

```text
0.x.x

↓

Alpha
```

---

```text
0.x.x-beta

↓

Beta
```

---

```text
1.0.0-rc

↓

Release Candidate
```

---

```text
1.0.0

↓

Stable
```

---

# Future Versioning

Reserved For:

```text
Plugin Versioning

Marketplace Packages

Cloud Services

Profile Repositories

Machine Learning Models
```

---

# Compatibility Rules

Never:

```text
Remove Existing Public Features

Without Major Version Increment
```

---

Never:

```text
Modify Existing Schema Behavior

Without Documentation
```

---

Always:

```text
Document Breaking Changes
```

---

# Decision Matrix

Before increasing a version:

```text
Bug Fix?

↓

Patch
```

---

```text
New Feature?

↓

Minor
```

---

```text
Breaking Change?

↓

Major
```

---

# Golden Rule

The version number must allow contributors and users to immediately understand the scale, impact, and risk of an update.

Version numbers are a communication tool, not just a technical identifier.

---

# End Of Document
