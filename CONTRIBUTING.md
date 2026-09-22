# CONTRIBUTING

Thank you for your interest in contributing to SlicyWeb.

This document explains how contributors, developers, and AI assistants should work within the project.

The primary goals are:

- Maintain stability

- Preserve architecture

- Reduce regressions

- Reduce technical debt

- Keep documentation aligned with implementation

---

# Before Contributing

All contributors must read the following documents before making changes:

```text
docs/00-index/AI\_START\_HERE.md

docs/00-index/PROJECT\_DOCUMENTATION\_INDEX.md

docs/01-project/PROJECT\_SPEC.md

docs/03-development/SYSTEM\_RULES.md

docs/02-architecture/ARCHITECTURE.md

docs/03-development/DEVELOPMENT\_RULES.md
```

---

# Core Development Philosophy

SlicyWeb follows a:



```text

Patch First

Modular

Documentation Driven

```
approach.

We prefer:

```text

Small Safe Changes

```

instead of:

```text

Large Rewrites

```

---



# Contribution Workflow



```text

Read Documentation

↓

Understand Impact

↓

Implement Change

↓

Test Change

↓

Update Documentation

↓

Submit Contribution

```

---


# Documentation First


Before creating or changing functionality:

Check whether the behavior is already defined in:

```text
PROJECT\_SPEC.md

ARCHITECTURE.md

DATA\_SCHEMA.md

AI\_ENGINE\_SPEC.md

```
Documentation is considered the source of truth.


---


# File Modification Policy

Contributors should:

```text

Modify Only What Is Necessary

```

Prefer:

```text

Small Patches

```

Avoid:

```text

Full File Rewrites

```

unless explicitly required.

\---

# Forbidden Contributions

Do not:

```text

Rewrite Stable Systems

Duplicate Existing Functionality

Break Backward Compatibility

Ignore Project Specifications

Bypass Validation Rules

```

---

# Branch Strategy

Recommended Branches

```text
main

develop

feature/\*

```

---



# Branch Naming

Examples:

```text

feature/stl-import

feature/orientation-optimizer

feature/material-profiles

bugfix/printer-validation

docs/update-roadmap

```


\---


# Commit Message Format


Use:

```text

TYPE: Short Description

```

Examples:

```text

feat: add STL importer

fix: correct printer validation

docs: update architecture specification

refactor: simplify scene manager

```


\---


# Commit Types


```text

feat

fix

docs

refactor

test

perf

build

ci

```

---



# Coding Standards

Required:

```text

TypeScript

Strict Mode

ESLint

Prettier

```


---



# Naming Conventions



Classes:



```text

PascalCase

```



Example:



```text

PrinterManager

ModelAnalyzer

```



---



Variables:



```text

camelCase

```



Example:



```text

selectedPrinter

analysisResult

```


---


Constants:



```text

UPPER\_CASE

```


Example:


```text

DEFAULT\_LAYER\_HEIGHT

MAX\_PRINT\_SPEED

```


---


# Architecture Rules

Respect module boundaries.

Allowed:

```text

GUI

↓

Services

↓

Data

```

Avoid direct cross-module access.

---



# Testing Requirements

Every feature should include:


```text

Unit Test

```


Recommended:


```text

Integration Test

```


Required for major features:


```text

Regression Test

```


\---



# Documentation Requirements



Update documentation when:



```text

Architecture Changes

Schema Changes

API Changes

Feature Changes

```



---



# Changelog Requirements



Update:



```text

docs/01-project/CHANGELOG.md

```



for:



```text

New Features

Bug Fixes

Breaking Changes

```



\---



# Pull Request Checklist

Before submitting:



```text

[ ] Code Compiles

[ ] No Lint Errors

[ ] Tests Pass

[ ] Documentation Updated

[ ] Changelog Updated (if needed)

[ ] Architecture Respected

[ ] No Duplicate Functionality

```


---



# AI Contribution Rules



AI-assisted contributions must follow:



```text

SYSTEM\_RULES.md

DEVELOPMENT\_RULES.md

AI\_START\_HERE.md

```


AI-generated changes should:


```text

Preserve Existing Functionality

Avoid Full Rewrites

Maintain Compatibility

```


---



# Issue Reporting


When reporting issues include:


```text

Version

Operating System

Steps To Reproduce

Expected Behavior

Actual Behavior

Logs (if available)

```


\---


# Feature Requests


Feature requests should include:


```text

Problem Description

Proposed Solution

Benefits

Potential Risks

```


\---


# Performance Contributions

Do not sacrifice:


```text

Correctness

Reliability

Maintainability

```

for small performance gains.


\---


# Security Contributions

Security issues should follow:

```text

SECURITY\_SPEC.md

```

Never introduce:


```text

Unvalidated Inputs

Unsafe File Access

Unverified Remote Data

```


\---


# Project Goal


The objective is not only to build a slicer.

The objective is to build a reliable, maintainable, AI-assisted 3D printing platform.


---



# Golden Rule

Make the smallest safe change that solves the problem while preserving stability.

---

