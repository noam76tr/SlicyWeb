# SlicyWeb SMART SLICER

# TECHNOLOGY STACK

Version: 2.0.0

Status: Approved

Priority: High

---



# Purpose

This document defines the official technology stack used by the project.


Goals:


- Long-term maintainability

- High performance

- Cross-platform support

- Modular architecture

- Large model support

- Professional desktop experience

- Compatibility with future extensions


All development should follow this document.


Technology changes require:


- Architecture review

- Documentation update

- Changelog update


---

# Technology Governance

Technology modifications must comply with:

```text
DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md

CHANGE_CLASSIFICATION_RULES.md

CHANGE_VERIFICATION_CHECKLIST.md

DOCUMENT_UPDATE_MATRIX.md

CROSS_DOCUMENT_DEPENDENCIES.md
```

Technology changes require:

```text
Impact Analysis

Architecture Review

Compatibility Review

Documentation Review

Migration Evaluation
```

---

# Technology Selection Philosophy



Selection priorities:



1\. Stability

2\. Community Support

3\. Performance

4\. Scalability

5\. Developer Experience

6\. AI Development Compatibility



Avoid technologies that are:



- Experimental

- Poorly documented

- Difficult to maintain

- Rarely used



---



# Official Application Stack



```text

Frontend

&#x20;   ↓

React



Desktop Runtime

&#x20;   ↓

Electron



3D Rendering

&#x20;   ↓

Three.js



State Management

&#x20;   ↓

Zustand



Language

&#x20;   ↓

TypeScript



Build Tool

&#x20;   ↓

Vite



Testing

&#x20;   ↓

Vitest

```



---



# Architecture Overview



```text

Electron

│

├── React

│

├── Three.js

│

├── Zustand

│

├── Services

│

├── Analysis Engine

│

└── Local Database

```



---



# Primary Language



## TypeScript



Reason:



- Type Safety

- Better Refactoring

- Large Project Support

- Better AI Assistance

- Better IDE Support



---



# TypeScript Rules



Strict Mode:



```text

Enabled

```



---



# Configuration



```json

{

&#x20; "strict": true,

&#x20; "noImplicitAny": true,

&#x20; "strictNullChecks": true

}

```



---



# UI Framework



## React



Version:



Latest Stable



---



# Reason



Provides:



- Component Architecture

- Reusable Interface Elements

- Fast Development

- Large Ecosystem

- Excellent Tooling



---



# React Guidelines



Use:



```text

Functional Components

```



Avoid:



```text

Class Components

```



---



# State Management



## Zustand



---



# Why Zustand



Advantages:



- Lightweight

- Fast

- Minimal Boilerplate

- Excellent for Desktop Apps

- Easy Testing



---



# Responsibilities



Zustand manages:



```text

Application State

Scene State

Selected Objects

Printer Profiles

Materials

Filaments

Print Presets

Analysis Results

Recommendations

```


---


# Forbidden


Do not use Zustand for:


```text

Temporary Form Fields


One-Time UI States

```


Use local component state instead.


---



# Desktop Framework



## Electron



---



# Why Electron



Requirements:



- Windows Support

- Linux Support

- macOS Support

- Local File Access

- STL/3MF Import

- Future G-Code Support



---



# Benefits



Electron allows:



```text

Desktop Application

File System Access

Project Saving

Project Loading

Offline Usage

```



---



# Electron Structure



```text

Main Process

↓

Renderer Process

↓

React Application

```



---



# Communication


Use:


```text

IPC Layer

```
Technology:

```text
ipcMain
ipcRenderer
preload.ts
```


Used For:


```text

File Access

Project Save/Load

System Operations

Profile Management

```

---

# IPC Architecture Rules

Preferred Flow:

```text
Renderer
↓
IPC
↓
Service
↓
Repository
```

Renderer components must not directly access:

```text
Repositories

Storage Systems

Remote Sources
```

All communication must pass through the IPC layer.

Reference:

```text
API_SPEC.md

ARCHITECTURE.md
```

---

# 3D Rendering Engine



## Three.js



---



# Why Three.js



Provides:



- High Performance Rendering

- Large Community

- STL Support

- Extensive Documentation



---



# Responsibilities



Three.js handles:



```text

Viewport

Grid

Axes

Camera

Objects

Selection

Transformations

```



---



# Forbidden



Three.js should NOT manage:



```text

Application State

Printer Profiles

Business Logic

```



---



# STL Support



Primary Library:



```text

STLLoader

```



Source:



Three.js Examples



---



# 3MF Support



Primary Library:


```text

3MFLoader

```


Source:


Three.js Examples


---


# 3D Helper Libraries



Use:


```text

three/examples

```


For:



```text

TransformControls



OrbitControls



GridHelper



AxesHelper

```



---



# UI Component Library



## shadcn/ui



---



# Purpose



Provides:



```text

Professional Components



Consistent Design



Accessibility



Customization

```



---



# Components



Examples:



```text

Buttons



Dropdowns



Tabs



Dialogs



Menus



Tables



Cards

```



---



# Styling System



## Tailwind CSS



---



# Benefits



```text

Fast Development



Consistent Design



Easy Maintenance



Small Bundle Size

```



---



# Design Rules



Avoid:



```text

Large Custom CSS Files

```



Prefer:



```text

Tailwind Utilities

```



---



# Icons



## Lucide React



---



# Purpose



Unified icon library.



Examples:



```text

Import



Save



Delete



Rotate



Scale



Printer



Material

```



---



# Data Validation



## Zod



---



# Why



Validate:



```text

Printer Profiles

Material Profiles

Filament Profiles

Print Presets

Settings

Imported Data

API Responses

```


---


# File Formats


Supported:


```text

Supported:

JSON
STL
3MF
WYPROJ

Project Extension:

.wyproj

```



Future:



```text

OBJ



STEP



AMF

```



---



# Local Storage



## JSON Based



Initial Versions



---



# Storage Location



```text

User Data Folder

```



Contains:



```text

Projects



Profiles



Cache



Settings

```



---



# Future Database



Potential Upgrade



```text

SQLite

```



Only when required.



---



# GitHub Integration



## Octokit



---

# Repository Integration

Primary Technology:

```text
Octokit
```

Repository access flow:

```text
Service
↓
Repository
↓
RepositorySync
↓
GitHub
```

Direct GitHub access from GUI modules is forbidden.

---


# Purpose



Access:


```text
Printer Profiles
Material Profiles
Filament Profiles
Community Data
```


---


# Strategy



```text

Local First



Then Cache



Then GitHub

```



---



# Search Indexing



Future



Potential:



```text

FlexSearch

```



Used for:



```text

Profile Search



Printer Search



Material Search

```



---



# Geometry Analysis



## three-mesh-bvh



---



# Purpose



Accelerated Geometry Operations



Provides:



```text

Faster Raycasting



Fast Analysis



Large Model Support

```



---



# Mathematical Calculations



Use:



```text

Native TypeScript



Three.js Math

```



Avoid unnecessary dependencies.



---



# Logging System



## Electron Log



---



# Responsibilities



```text

Debug



Info



Warnings



Errors

```



---



# Settings Management



Store:



```text

JSON Configuration Files

```



Examples:



```text

settings.json



preferences.json

```



---



# Testing Framework

## Coverage Target

Minimum:

80%

Critical Modules:

90%

## Vitest



---



# Responsibilities



```text

Unit Tests



Integration Tests

```



---



# UI Testing



## Testing Library



---



# Purpose



Interaction Testing



Component Testing



Accessibility Verification



---



# Future End-To-End Testing



## Playwright



---



# Responsibilities



Validate:



```text

Imports



Transformations



Project Saving



Project Loading



GUI Workflows

```



---



# Build System



## Vite



---



# Why



```text

Fast Startup



Fast Build



Modern Tooling

```



---



# Package Manager



## npm



Preferred



Alternative:



```text

pnpm

```



Supported



---



# Source Control



## Git



Hosted On:



```text

GitHub

```



---



# Branch Strategy



```text

main



develop



feature/\*

```



---



# CI/CD



Future



Recommended:



```text

GitHub Actions

```



---



# CI Tasks



```text

Lint



Tests



Build Verification



Schema Validation

```



---



# Code Quality



## ESLint



Mandatory



---



# Formatting



## Prettier



Mandatory



---



# Linting Rules



Required Before Commit



```text

No Errors



No Warnings

```



---



# Performance Targets



GUI Startup:



```text

< 3 seconds

```



---



# STL Loading



Medium Models



```text

< 2 seconds

```



---



# Scene FPS



Target:



```text

60 FPS

```



Minimum:



```text

30 FPS

```



---



# Memory Goals



Efficient handling of:



```text

Multiple Models



Large Models



Long Sessions

```



---



# Future Technologies


Reserved


Do Not Implement Yet


---


## G-Code Engine


Possible:


```text

Rust

```


---


## Machine Learning


Possible:


```text

ONNX Runtime

Computer Vision Models

Local Inference

```


---


## Cloud Sync



Possible:



```text

Azure



Firebase

```



---



# Forbidden Technologies



Do Not Use:



```text

jQuery



Angular



Vue



Redux



MobX

```



Reason:



Maintain stack consistency.



---



# Stack Stability Rule



Technology choices should remain stable.



Changing a core technology requires:



1\. Architecture Review

2\. Changelog Update

3\. Migration Plan

4\. Compatibility Analysis



---



# Golden Rule



Choose technologies that make the project easier to maintain five years from now, not only faster to develop today.



---



# End Of Document

