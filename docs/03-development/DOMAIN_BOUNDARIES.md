# SlicyWeb SMART SLICER

# DOMAIN BOUNDARIES

Version: 2.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the responsibilities, ownership, boundaries, and restrictions of every project domain.

The objective is to:

- Preserve clear responsibilities
- Prevent architectural drift
- Prevent domain overlap
- Prevent duplicate functionality
- Prevent ownership conflicts
- Improve maintainability
- Improve scalability
- Reduce regressions

Every module, service, engine, component, API, repository, and future feature must respect these boundaries.

---

# Boundary Philosophy

Every domain must have a clearly defined responsibility.

A domain should:

```text
Own One Responsibility
```

A domain should not:

```text
Own Multiple Unrelated Responsibilities
```

When responsibilities overlap:

- complexity increases
- maintenance becomes harder
- regressions become more likely

---

# Domain Ownership Rule

Each responsibility must have one primary owner.

Example:

```text
Printer Profiles

Owner:
Profiles Domain
```

Not:

```text
Profiles Domain
+
GUI Domain
+
Repository Domain
```

Ownership must remain clear.

---

# Domain Isolation Rule

Each domain must remain focused on its own responsibilities.

Domains may collaborate.

Domains must not absorb responsibilities that belong elsewhere.

---

# Current Domains

```text
GUI
Viewport
Application
State Management
Import
Scene
Analysis
Classification
Recommendation
Optimization
Profiles
Presets
Validation
API
IPC
Repository
RepositorySync
Storage
Local Storage / Cache
Notification
Cost Estimation
Project Management
Internationalization
Security
Testing
```

---

# GUI DOMAIN

Purpose:

User Interface

Responsibilities:

- Layout
- Menus
- Panels
- Dialogs
- User Interaction
- Visual Feedback

Owns:

```text
GUI_SPEC.md

src/gui/
src/gui/components/
src/gui/dialogs/
src/gui/windows/
```

May:

```text
Display Data

Collect Input

Trigger Actions
```

Must Not:

```text
Analyze Models

Access Repositories

Access Remote Sources

Make Business Decisions

Generate Recommendations
```

Boundary:

```text
Presentation Only
```

---

# VIEWPORT DOMAIN

Purpose:

3D Visualization

Responsibilities:

- Rendering
- Camera Controls
- Grid Rendering
- Selection Display
- Object Visualization

Owns:

```text
Three.js Integration

Viewport Components

Camera Controllers
```

Must Not:

```text
Analyze Models

Generate Recommendations

Access Repository Data
```

Boundary:

```text
Visual Representation Only
```

---

# APPLICATION DOMAIN

Purpose:

Application Coordination

Responsibilities:

- Workflow Coordination
- Domain Orchestration
- Operation Sequencing

May:

```text
Coordinate
```

Must Not:

```text
Store Data

Access Remote Sources Directly

Perform Rendering
```

Boundary:

```text
Coordination Only
```

---

# STATE MANAGEMENT DOMAIN

Purpose:

Application State Ownership

Responsibilities:

- Global State
- Shared State
- State Synchronization

Owns:

```text
src/state/
```

Must Not:

```text
Contain Business Logic

Contain Repository Logic

Contain Rendering Logic
```

Boundary:

```text
State Management Only
```

---

# IMPORT DOMAIN

Purpose:

Importing External Files

Responsibilities:

- STL Import
- 3MF Import
- Validation Triggering
- Object Creation

Owns:

```text
Import Services

Import Validation
```

Must Not:

```text
Generate Recommendations

Manage Printers

Manage Repositories
```

Boundary:

```text
File Import Only
```

---

# SCENE DOMAIN

Purpose:

Scene Management

Responsibilities:

- Object Registration
- Object Removal
- Object Duplication
- Object Organization

Owns:

```text
Scene Objects

Scene Structure
```

Must Not:

```text
Perform Geometry Analysis

Generate Recommendations

Access Remote Sources
```

Boundary:

```text
Scene Ownership Only
```

---

# ANALYSIS DOMAIN

Purpose:

Geometry Understanding

Responsibilities:

- Dimensions
- Mesh Analysis
- Stability Analysis
- Overhang Analysis
- Bridge Analysis
- Thin Wall Analysis

Owns:

```text
Analysis Results

Analysis Engines
```

Must Not:

```text
Generate Recommendations

Access GUI

Access Remote Sources
```

Boundary:

```text
Analysis Only
```

---

# CLASSIFICATION DOMAIN

Purpose:

Object Understanding

Responsibilities:

- Category Detection
- Subcategory Detection
- Feature Detection
- Confidence Calculation

Owns:

```text
Classification Engine
```

Must Not:

```text
Generate Presets

Modify Profiles

Access GUI
```

Boundary:

```text
Classification Only
```

---

# RECOMMENDATION DOMAIN

Purpose:

Recommendation Creation

Responsibilities:

- Settings Recommendation
- Preset Selection
- Confidence Scoring
- Warning Generation

Owns:

```text
Recommendation Engine
```

Must Not:

```text
Render UI

Manage Repositories

Modify Printer Profiles
```

Boundary:

```text
Recommendation Logic Only
```

---

# OPTIMIZATION DOMAIN

Purpose:

Optimization

Responsibilities:

- Orientation Optimization
- Support Reduction
- Material Reduction
- Time Reduction

Owns:

```text
Optimization Engine
```

Must Not:

```text
Manage Storage

Manage GUI

Manage Repositories
```

Boundary:

```text
Optimization Only
```

---

# PROFILES DOMAIN

Purpose:

Profile Management

Responsibilities:

- Printer Profiles
- Material Profiles
- Filament Profiles

Owns:

```text
PRINTER_PROFILE_SPEC.md

MATERIAL_PROFILE_SPEC.md

FILAMENT_SETTINGS_SPEC.md
```

Must Not:

```text
Perform Analysis

Render UI

Generate Recommendations
```

Boundary:

```text
Profile Ownership Only
```

---

# PRESETS DOMAIN

Purpose:

Print Presets

Responsibilities:

- Preset Definitions
- Preset Categories
- Preset Templates

Owns:

```text
PRINT_PRESETS_SPEC.md
```

Must Not:

```text
Perform Geometry Analysis

Perform Repository Synchronization
```

Boundary:

```text
Preset Ownership Only
```

---

# VALIDATION DOMAIN

Purpose:

Validation

Responsibilities:

- Schema Validation
- File Validation
- Profile Validation
- API Validation

Owns:

```text
src/schemas/

Validation Services
```

Must Not:

```text
Render UI

Generate Recommendations

Manage Repositories
```

Boundary:

```text
Validation Only
```

---

# API DOMAIN

Purpose:

Contract Layer

Responsibilities:

- API Contracts
- Payload Formats
- Response Formats

Owns:

```text
API_SPEC.md
```

Must Not:

```text
Contain Business Logic

Contain Rendering Logic
```

Boundary:

```text
Contracts Only
```

---

# IPC DOMAIN

Purpose:

Electron Communication

Responsibilities:

```text
Renderer Communication
Main Process Communication
IPC Request Validation
IPC Response Validation
Payload Serialization
Safe Error Propagation
Service Invocation
```

Owns:

```text
src/electron/ipc/
```

Must Not:

```text
Contain Business Logic
Contain Repository Logic
Access Remote Sources
Access Storage Directly
Modify Domain State Directly
Bypass Services
```

Required flow:

```text
Renderer
↓
IPC
↓
Service
↓
Repository
```

Boundary:

```text
Communication Only
```

---

# REPOSITORY DOMAIN

Purpose:

```text
Local Repository Access and Data Coordination
```

Responsibilities:

```text
Local Data Retrieval
Local Data Persistence Coordination
Repository Contracts
Data Normalization
Repository Validation Coordination
Cache Coordination
RepositorySync Coordination
```

Owns:

```text
src/repositories/
Repository Services
Repository Contracts
```

May:

```text
Read Local Data
Write Validated Local Data
Use Local Storage / Cache
Request Remote Synchronization Through RepositorySync
Coordinate Data Normalization
```

Must Not:

```text
Render UI
Access Remote Sources Directly
Bypass RepositorySync
Generate Recommendations
Perform Geometry Analysis
Contain GUI Logic
```

Required flow:

```text
Service
↓
Repository
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources
```

Boundary:

```text
Local Data Access and Repository Coordination Only
```

---

# REPOSITORYSYNC DOMAIN

Purpose:

```text
Validated Synchronization With External Sources
```

Responsibilities:

```text
Remote Data Retrieval
Remote Profile Synchronization
Source Identification
Remote Response Validation
Remote Data Normalization
Version Validation
Integrity Validation
Synchronization Error Handling
```

Owns:

```text
RepositorySync Services
Remote Synchronization Logic
Remote Source Adapters
```

May:

```text
Access Authorized Remote Sources
Request Remote Data
Validate Remote Responses
Normalize Valid Remote Data
Return Validated Synchronization Results
```

Must Not:

```text
Render UI
Access GUI State Directly
Perform Geometry Analysis
Generate Recommendations
Write Unvalidated Data
Bypass the Repository Layer
Expose Raw Remote Errors
Write Directly To Cache Without Repository Coordination
```

Required flow:

```text
Repository
↓
RepositorySync
↓
Remote Source
↓
Schema Validation
↓
Integrity Validation
↓
Data Normalization
↓
Repository
```

Boundary:

```text
Remote Synchronization and Validation Only
```

---

# STORAGE DOMAIN

Purpose:

```text
Local Persistence and Cache Management
```

Responsibilities:

```text
Local File Access
JSON Storage
Cache Storage
Cache Lookup
Cache Invalidation
Validated Data Persistence
Project File Read and Write Operations
Recovery Data Storage
```

Owns:

```text
src/storage/
Storage Services
Cache Services
Local Persistence Contracts
```

May:

```text
Read Local Data
Write Validated Data
Store Cache Entries
Invalidate Expired Cache Entries
Reject Corrupted Cache Entries
Persist WYPROJ Data Through Project Services
```

Must Not:

```text
Render UI
Perform Geometry Analysis
Generate Recommendations
Access Remote Sources
Perform RepositorySync
Contain Domain Decision Logic
```

Boundary:

```text
Local Persistence and Cache Management Only
```

---

# NOTIFICATION DOMAIN

Purpose:

User Notifications

Responsibilities:

- Information Messages
- Warning Messages
- Critical Messages

Owns:

```text
Notification Services
```

Must Not:

```text
Modify Data

Perform Analysis

Access Remote Sources
```

Boundary:

```text
Notification Delivery Only
```

---

# COST ESTIMATION DOMAIN

Purpose:

Cost Calculation

Responsibilities:

- Material Cost
- Energy Cost
- Total Cost

Owns:

```text
Cost Estimation Services
```

Must Not:

```text
Modify Profiles

Manage Storage
```

Boundary:

```text
Cost Estimation Only
```

---

# PROJECT MANAGEMENT DOMAIN

Purpose:

Project Lifecycle

Responsibilities:

- Project Creation
- Project Save
- Project Load
- Recovery
- Autosave

Owns:

```text
Project Services
Project Lifecycle
Project Serialization Contracts
Project Validation Contracts
WYPROJ Import and Export Workflows
```

Must Not:

```text
Perform Geometry Analysis
Generate Recommendations
Implement Low-Level Storage
Access Remote Sources Directly
Bypass Storage Services
```

Required flow:

```text
Project Service
↓
Storage Service
↓
Local Storage / Cache
```

Boundary:

```text
Project Management Only
```

---

# INTERNATIONALIZATION DOMAIN

Purpose:

Localization Management

Responsibilities:

- Language Management
- Translation Loading
- Localization Services
- Language Selection
- Translation Resolution

Owns:

```text
src/i18n/

LanguageManager
LocalizationService
TranslationLoader

public/locales/

en.json
fr.json
he.json
```

Must Not:

Render UI Directly
Perform Analysis
Generate Recommendations

Boundary:

Localization Only

---

# SECURITY DOMAIN

Purpose:

```text
Security Enforcement and Trust Validation
```

Responsibilities:

```text
Input Validation Policies
Imported File Security
Repository Data Security
Remote Source Trust Validation
Sensitive Data Protection
Credential Protection
Error Exposure Rules
Integrity Validation Policies
```

Owns:

```text
Security Validation
Security Policies
Trust Validation Rules
Sensitive Data Protection Rules
```

May:

```text
Define Security Policies
Reject Unsafe Inputs
Reject Unauthorized Sources
Protect Credentials
Validate Remote Source Integrity
Control Safe Error Exposure
```

Must Not:

```text
Render UI
Perform Geometry Analysis
Generate Recommendations
Modify Business Data Directly
Bypass Validation
Expose Credentials
Expose Raw Stack Traces
Expose Raw Remote Responses
```

Boundary:

```text
Security Enforcement and Trust Validation Only
```

---

# TESTING DOMAIN

Purpose:

Verification

Responsibilities:

- Unit Tests
- Integration Tests
- Regression Tests
- Validation Tests

Owns:

```text
tests/
```

Production Domains Must Not Depend On:

```text
Testing Domain
```

Boundary:

```text
Verification Only
```

---

# New Responsibility Rule

Before adding functionality determine:

```text
Does a domain already own this responsibility?
```

If:

```text
Yes
```

Extend the existing owner.

If:

```text
No
```

Determine whether a new domain is justified.

---

# Ownership Conflict Rule

A responsibility must never belong to multiple domains.

When ownership conflicts occur:

```text
Review

Decide

Assign One Owner
```

Multiple owners are prohibited.

---

# Domain Expansion Rule

A domain may expand only when:

```text
The new responsibility is directly related
```

A domain must not absorb unrelated functionality.

---

# Boundary Violation Rule

Any implementation that violates ownership boundaries must be:

```text
Rejected
```

or

```text
Architecturally Reviewed
```

before approval.

---

# Enforcement Rule

Before implementation verify:

```text
Domain

Ownership

Dependencies

Impact

Documentation
```

If ownership is unclear:

Stop implementation.

Clarify ownership first.

---

# Golden Rule

A domain owns its responsibility.

A domain does not own somebody else's responsibility.

Protect clear ownership at all times.
