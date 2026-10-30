# SlicyWeb SMART SLICER

# API SPECIFICATION


Version: 2.1.0

Status: Approved

Priority: High

---


# Purpose

This document defines all internal and external APIs used by the project.

The objectives are:

- Standardized communication
- Consistent data exchange
- Reliable integrations
- Future scalability
- Secure external access

This document serves as the reference for:

- Internal Services
- Local Storage
- Cache
- Repositories
- RepositorySync
- Remote Sources
- Future Online Services

---

# API Philosophy

The project follows:

```text
Local First
↓
Cache
↓
Repositories
↓
RepositorySync
↓
Remote Sources
```

The application must always prioritize local data.

Remote requests should only occur when necessary.

RepositorySync is the only authorized access layer to external sources.

Remote data must be validated before it is stored or consumed.

---

# API Governance

All API modifications must comply with:

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

Purpose:

```text
Protect API Consistency
Prevent Breaking Changes
Maintain Compatibility
Control API Evolution
Protect Domain Boundaries
Standardize Validation
Protect RepositorySync Access Rules
```

---

# API Categories

The system uses:

```text
Internal APIs
Repository APIs
RepositorySync APIs
Profile APIs
Cache APIs
Security Validation APIs
Future Cloud APIs
```

Repository APIs are responsible for local data access.

RepositorySync APIs are responsible for remote synchronization only.

Direct access to Remote Sources outside RepositorySync is forbidden.

---

# API Ownership Rules

Every API belongs to a domain.

Ownership must follow:

```text
FILE_OWNERSHIP_MATRIX.md
DOMAIN_BOUNDARIES.md
```

Cross-domain API modifications require impact analysis.

Ownership must be verified before modifying shared APIs.

RepositorySync APIs are owned by the RepositorySync domain.

Remote Source access is never owned by the GUI, Viewport, Analysis, Recommendation, or Optimization domains.

---

# API Architecture

```text
GUI
↓
IPC / Internal API
↓
Services
↓
Repositories
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources
```

The architecture must always respect this order.

Required flow:

```text
Renderer
↓
IPC Layer
↓
Service Layer
↓
Repository Layer
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources
```

Direct access that bypasses IPC, Services, Repositories, or RepositorySync is prohibited.

---

# IPC API

Purpose:

Electron Renderer ↔ Main communication.

Endpoints:

```text
ProjectIPC
StorageIPC
ImportIPC
SettingsIPC
PrinterIPC
MaterialIPC
FilamentIPC
```

Communication flow:

```text
Renderer
↓
IPC Layer
↓
Services
↓
Repositories
```

The IPC layer must never access Remote Sources directly.

The IPC layer must never contain business logic.

The IPC layer must validate incoming and outgoing payloads.

---

## SettingsIPC Channels

User preferences (DATA_SCHEMA.md, User Preferences Schema), stored in settings.json by StorageService (USER_SETTINGS_SPEC.md, Storage Location).

| Channel | Payload | Response data |
|---|---|---|
| `settings:get` | none | `{ settings }` |
| `settings:update` | partial preferences (`theme`, `language`, `units`, `printer` with all of its fields, `material` with all of its fields: defaultMaterial, defaultFilament, autoloadLastMaterial); unknown fields refused | `{ settings }` |
| `settings:reset` | none | `{ settings }` (default preferences) |
| `settings:theme` | `{ theme }`: dark, light or system | `{ settings }` |
| `settings:language` | `{ language }`: en, fr or he | `{ settings }` |

`settings` is always the complete stored preferences after the operation. Payloads are validated by src/schemas/UserPreferencesSchema.ts; an invalid payload returns `success: false` with the validation errors and changes nothing.

The renderer reads the saved language at start (`settings:get`) and saves each language change (`settings:language`) through src/gui/components/I18nProvider.tsx.

---

## PrinterIPC Channels

Printers (DATA_SCHEMA.md, Printer Schema), loaded at start by the main process (DECISIONS.md, ADR-032, D4): PrinterService reads the profile files of data/printers/ (Official) and of the printers/ folder of the user data folder (Local Custom), validates them (Repository Data Schema envelope, PrinterSchema) and keeps the valid ones. The renderer reads no profile file.

| Channel | Payload | Response data |
|---|---|---|
| `printer:getAll` | none | `{ printers, userPrinterIds, profiles }`: userPrinterIds = ids of the printers entered by the user (Local Custom); profiles = `{ origin, tag, checkedAt }` of the Official profiles in use: origin `repository` (cache of the SlicyWeb profile repository) or `application` (data/printers/), tag of their index.json (null when unknown), date of the last check of the repository (ISO 8601, null before the first one) |
| `printer:get` | `{ printerId }` | `{ printer }`; unknown id: `success: false`, error `PRN_001 Printer Not Found` |
| `printer:count` | none | `{ count }` |
| `printer:add` | a printer (PrinterSchema); its id is ignored | `{ printer }`: the printer added, with the id chosen by the main process (`user_` + random UUID); same brand and model as a loaded printer: `PRN_006 Printer Already Exists` |
| `printer:update` | a printer (PrinterSchema) | `{ printer }`; unknown id: `PRN_001 Printer Not Found`; printer not entered by the user: `PRN_005 Printer Not Editable`; same brand and model as another printer: `PRN_006 Printer Already Exists` |
| `printer:remove` | `{ printerId }` | `{ printerId }`; unknown id: `PRN_001`; printer not entered by the user: `PRN_005` |
| `printer:refresh` | `{ force }` (boolean, default false); optional | `{ status, profiles }`: status `skipped` (checked less than 24 hours ago, force false), `upToDate` (same index.json, or profiles of the repository older than those of the application, which are kept), `updated` (new profiles kept in the cache and loaded), `notPublished` (the repository answers HTTP 404 for index.json or for a file at the tag: no version published yet, the profiles in use are kept; success true, no error) or `failed`; profiles as for printer:getAll. A failed check returns `success: false` with `SYNC_001 Repository Synchronization Failed` (cache not written), `SYNC_002 Remote Source Unavailable`, `SYNC_003 Remote Source Timeout` or `SYNC_004 Remote Data Validation Failed`, and the profiles in use are kept |

A value of motion or thermal of a printer may be null (unknown, never 0). An invalid payload returns `success: false` with the validation errors ("path: message"); for printer:add and printer:update, the default nozzle must be one of the nozzles of the printer. A refused profile file (PRN_002) is left out of the printers and reported in the log of the main process.

printer:add, printer:update and printer:remove change only the printers entered by the user (Local Custom, Phase 7 lot 61): the main process writes or deletes their file in the printers/ folder of the user data folder (one file per printer, Repository Data Schema envelope, source Local Custom), then changes the printers. A file that cannot be written or deleted returns `PRN_007 Printer Not Saved`, and nothing is changed. The renderer never gives a path.

printer:refresh checks the SlicyWeb profile repository (DECISIONS.md, ADR-032, D5; Phase 7 lot 62): the main process downloads index.json from the main branch, then each profile at the tag named by the index (SECURITY_SPEC.md, Printer Profile Download), keeps them in the cache of the user data folder and loads them in place of data/printers/. The renderer asks for a check at start when the setting printer.autoCheckProfiles is true (force false: at most once every 24 hours) and with Printer > Refresh Profiles (force true). The profiles of the repository are used only when their tag (vX.Y.Z) is the same as, or more recent than, the tag of data/printers/index.json. After `updated`, the renderer reads the printers again. Printers entered by the user are never changed. The details of a failure (file, HTTP status) go to the log of the main process, never a local path.

---

## MaterialIPC Channels

Materials (DATA_SCHEMA.md, Complete Material Schema), loaded at start by the main process (DECISIONS.md, ADR-033, D6; Phase 8 lot 68): MaterialService reads the profile files of data/materials/ (Official), validates them (Repository Data Schema envelope, MaterialSchema; the four temperatures are required for a shipped material) and keeps the valid ones. The renderer reads no profile file.

| Channel | Payload | Response data |
|---|---|---|
| `material:getAll` | none | `{ materials }` |

A value of a material may be null (not published, never 0). A refused profile file (MAT_002) is left out of the materials and reported in the log of the main process.

---

## FilamentIPC Channels

Filaments (DATA_SCHEMA.md, Filament Schema), loaded at start by the main process (DECISIONS.md, ADR-033, D6; Phase 8 lot 68): FilamentService reads the profile files of data/filaments/ (Official), then of the filaments/ folder of the user data folder (Local Custom), validates them (Repository Data Schema envelope, FilamentSchema; a shipped filament has its four temperatures, and its color and price per kg are null) and keeps the valid ones. A filament of the user never replaces an Official filament with the same id. The renderer reads no profile file.

| Channel | Payload | Response data |
|---|---|---|
| `filament:getAll` | none | `{ filaments, userFilamentIds }`: userFilamentIds = ids of the filaments entered by the user (Local Custom) |

density, pricePerKg, the values of temperature and of manufacturerSettings of a filament may be null (not published, never 0). A refused profile file (FIL_002) is left out of the filaments and reported in the log of the main process. filament:add, filament:update and filament:remove come with Manage Filaments (Phase 8 lot 71).

---

## Allowed IPC Channels

The preload bridge (src/electron/preload.ts, window.slicyWeb) accepts only the channels of the allow list src/electron/ipc/IpcChannels.ts:

| Bridge method | Allow list | Channels |
|---|---|---|
| `invoke(channel, payload)` | INVOKE_CHANNELS | the channels registered with ipcMain.handle: `filament:getAll`, `import:3mf`, `import:stl`, `import:validate`, `material:getAll`, `printer:add`, `printer:count`, `printer:get`, `printer:getAll`, `printer:refresh`, `printer:remove`, `printer:update`, `project:create`, `project:delete`, `project:load`, `project:save`, `settings:get`, `settings:language`, `settings:reset`, `settings:theme`, `settings:update`, `storage:clear`, `storage:delete`, `storage:load`, `storage:save` |
| `send(channel, data)` | SEND_CHANNELS | none yet |
| `on(channel, callback)` | RECEIVE_CHANNELS | none yet |

Rules:

```text
invoke with a channel outside the allow list: the promise is rejected
send or on with a channel outside the allow list: an error is thrown
on returns a function that removes its listener
the callback of on receives the data only, never the Electron event
```

The model import does not use the channels import:stl, import:3mf and import:validate: the files chosen by the user are read and parsed in the renderer (DECISIONS.md, ADR-029). These channels stay registered for a later use.

A new IPC handler is added to the allow list in the same change. `npm run check:ipc` (scripts/build/check-ipc-channels.mjs) compares INVOKE_CHANNELS with the ipcMain.handle registrations of src/electron/ipc/.

---

# Internal API Rules

All internal APIs must:

```text
Be Typed
Be Validated
Be Documented
Be Testable
Use Defined Schemas
Follow Domain Boundaries
```

All payloads must be validated against:

```text
PrinterSchema
MaterialSchema
FilamentSchema
AnalysisSchema
RecommendationSchema
PrintPresetSchema
ErrorSchema
```

Validation is mandatory for:

```text
Requests
Responses
Imports
Repository Data
RepositorySync Results
Remote Data
IPC Payloads
Project Files
Cache Entries
```

Unvalidated payloads are forbidden.

---

# API Validation Rules

All API payloads must be validated using:

```text
Zod Schemas
```

Located in:

```text
src/schemas/
```

Validation must occur:

```text
Before Processing
Before Storage
Before Caching
Before Synchronization
Before Returning Data
```

Invalid data must be rejected safely.

Validation failures must return structured errors and never raw exceptions.

---

# Response Format

Standard success format:

```json
{
  "success": true,
  "data": {},
  "errors": []
}
```

Standard error format:

```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "",
      "message": "",
      "module": "",
      "severity": "error",
      "timestamp": ""
    }
  ]
}
```

Error object rules:

```text
code: Machine-readable error identifier
message: Safe human-readable error message
module: Responsible module or domain
severity: Information, Warning, Error, or Critical
timestamp: ISO 8601 timestamp
```

All API errors must use this structure.

---

# Error Validation Rules

Every API error must:

```text
Use a Unique Error Code
Include a Severity
Include the Responsible Module
Include a Safe Message
Include a Timestamp
Be Serializable
Be Loggable
Be Safe For User Display
```

Errors must use the codes defined in:

```text
docs/03-development/ERROR_CODES_SPEC.md
```

The API must never expose:

```text
Raw Stack Traces
Internal File Paths
Authentication Tokens
Credentials
Private Environment Variables
Raw Remote Responses
Internal IPC Payloads
```

---

# API Status Rules

API responses must use consistent status values.

Success responses:

```text
success: true
data: Populated Response Data
errors: Empty Array
```

Failure responses:

```text
success: false
data: null or Safe Partial Data
errors: Structured Error Array
```

Allowed response states:

```text
Success
Validation Failed
Not Found
Unauthorized
Forbidden
Conflict
Unavailable
Timeout
Internal Error
```

An API must never return an undefined response state.

---

# Cache API

Purpose:

```text
Read Validated Local Data
Store Validated Data
Invalidate Expired Data
Rebuild Corrupted Data
Coordinate Local-First Access
```

Required cache flow:

```text
Request
↓
Local Data
↓
Cache Lookup
↓
Validate Cached Data
↓
Return Valid Data
```

If valid local data or cache data is unavailable:

```text
Repository
↓
RepositorySync
↓
Remote Source
↓
Validate Remote Data
↓
Update Cache
↓
Return Validated Data
```

Cache rules:

```text
Cached data must never bypass validation.

Expired data must not be treated as current data.

Corrupted cache data must be rejected.

Invalid cache data must be removed or rebuilt.

Remote data must be validated before entering the cache.
```

---

# RepositorySync API

Purpose:

```text
Synchronize Validated Data From External Sources
```

RepositorySync must be called only by:

```text
Repositories
```

RepositorySync must not be called directly by:

```text
GUI
Renderer
IPC
State Management
Analysis
Recommendation
Optimization
```

Required flow:

```text
Service
↓
Repository
↓
RepositorySync
↓
Remote Source
↓
Remote Data Validation
↓
Repository
↓
Service
```

RepositorySync must:

```text
Identify the Remote Source
Request Remote Data
Handle Timeout Errors
Handle Unavailable Sources
Validate the Response
Reject Invalid Data
Normalize Valid Data
Report Synchronization Errors
Return Validated Data
```

RepositorySync must never:

```text
Return Unvalidated Data
Write Invalid Data To Storage
Bypass The Repository Layer
Expose Raw Remote Errors
Modify GUI State Directly
Generate Business Recommendations
```

---

# Remote Source API

Remote Sources include:

```text
GitHub Repositories
Official Manufacturer Sources
Verified Community Repositories
Future REST APIs
Future Cloud Sources
```

Remote Sources are untrusted by default.

Remote Sources may only be accessed through:

```text
RepositorySync
```

Required remote data flow:

```text
Remote Source
↓
RepositorySync
↓
Schema Validation
↓
Integrity Validation
↓
Version Validation
↓
Data Normalization
↓
Repository
```

Direct access to Remote Sources is forbidden from:

```text
GUI
Renderer
IPC
State Management
Analysis
Recommendation
Optimization
```

A remote response must be rejected when:

```text
The Response Is Unavailable
The Response Times Out
The Schema Is Invalid
Required Fields Are Missing
The Version Is Unsupported
The Integrity Check Fails
The Source Is Not Authorized
```

---

# API Compatibility Rules

Existing APIs must remain backward compatible whenever possible.

Before modifying an API, verify:

```text
Existing Consumers
Existing Payloads
Existing Responses
Existing Error Codes
Existing Schemas
Existing IPC Channels
Existing Repository Contracts
```

API changes must not silently:

```text
Remove Existing Fields
Rename Stable Fields
Change Field Meaning
Change Data Types
Change Error Codes
Change Event Names
Break Existing Consumers
```

Breaking changes require:

```text
Impact Analysis
Version Update
Migration Strategy
Documentation Update
Compatibility Validation
Changelog Evaluation
```

---

# API Versioning

The current API uses unversioned routes:

```text
/api/...
```

Examples:

```text
/api/printers
/api/materials
/api/filaments
/api/presets
```

A version prefix may be introduced when a breaking API change requires a new contract.

Future versioned routes may use:

```text
/api/v1/...
/api/v2/...
/api/v3/...
```

A new API version is required only when:

```text
A Stable Contract Is Broken
A Required Field Is Removed
A Field Meaning Changes
A Response Structure Becomes Incompatible
An Existing Consumer Requires Migration
```

Non-breaking additions must remain compatible with the current `/api/...` routes.

---

# API Testing Rules

Every API must have:

```text
Unit Tests
Validation Tests
Error Tests
Integration Tests
Regression Tests
```

RepositorySync APIs must additionally test:

```text
Successful Synchronization
Unavailable Remote Source
Remote Timeout
Invalid Remote Response
Missing Remote Fields
Unsupported Remote Version
Corrupted Remote Data
Cache Fallback
Local-First Behavior
```

IPC APIs must additionally test:

```text
Valid Request
Invalid Request
Invalid Payload
Missing Handler
Service Failure
Structured Error Response
```

An API is not complete until the required tests pass.

---

# Printer API

Purpose:

```text
Manage Printer Profiles
```

---

## Get All Printers

```text
GET
/api/printers
```

---

## Response

```json
{
  "printers": []
}
```

---

## Get Printer

```text
GET
/api/printers/{id}
```

---

## Response

```json
{
  "printer": {}
}
```

---

## Search Printers

```text
GET
/api/printers/search
```

---

## Parameters

```json
{
  "brand": "",
  "model": ""
}
```

---

## Import Printer Profile

```text
POST
/api/printers/import
```

---

## Input

```json
{
  "profile": {}
}
```

--- 

## Validation



Verify:



```text

Schema

Required Fields

Version

```



---



# Material API

Purpose:

Manage materials.

---

## Get Materials


```text

GET

/api/materials

```

---

## Get Material

```text

GET


/api/materials/{id}

```

---

## Search Material



```text

GET



/api/materials/search

```



---



## Parameters



```json

{

  "category": "",

  "brand": ""

}

```



---



## Import Material



```text

POST



/api/materials/import

```



---

# Filament API

Purpose:

Manage filament profiles.

---

# Print Preset API

Purpose:

Manage print presets.

---

## Get Presets

GET

/api/presets

---

## Get Preset

GET

/api/presets/{id}

---

## Select Preset

POST

/api/presets/select

---

## Import Preset

POST

/api/presets/import

---

## Get Filaments

```text
GET
/api/filaments
```

---

## Get Filament

```text
GET
/api/filaments/{id}
```

---

## Search Filaments

```text
GET
/api/filaments/search
```

---

## Parameters

```json
{
  "brand": "",
  "material": "",
  "color": ""
}
```

---

## Import Filament

```text
POST
/api/filaments/import
```
---

# Model Import API



Purpose:

Handle STL and 3MF model imports.

Project loading is handled separately by the Project API using the WYPROJ format.



---



## Import File



```text

POST



/api/import

```



---



## Accepted Formats



```text

STL



3MF

```



---



## Response



```json

{

  "objectId": "",

  "status": "imported"

}

```



---



# Scene API



Purpose:



Manage workspace objects.



---



## Get Scene



```text

GET



/api/scene

```



---



## Add Object



```text

POST



/api/scene/object

```



---



## Remove Object



```text

DELETE



/api/scene/object/{id}

```



---



## Duplicate Object



```text

POST



/api/scene/object/{id}/duplicate

```



---



# Transform API



Purpose:



Move, rotate and scale objects.



---



## Move Object



```text

POST



/api/object/{id}/move

```



---



## Input



```json

{

  "x": 0,

  "y": 0,

  "z": 0

}

```



---



## Rotate Object



```text

POST



/api/object/{id}/rotate

```



---



## Input



```json

{

  "x": 0,

  "y": 0,

  "z": 0

}

```



---



## Scale Object



```text

POST



/api/object/{id}/scale

```



---



## Input



```json

{

  "x": 1,

  "y": 1,

  "z": 1

}

```



---



# Analysis API



Purpose:



Launch and retrieve analysis.



---



## Analyze Object



```text

POST



/api/analysis/object/{id}

```



---



## Analyze Scene



```text

POST



/api/analysis/scene

```



---



## Analysis Result



```json

{

  "analysisId": "",

  "objectId": "",

  "status": "generated",

  "dimensions": {},

  "geometry": {},

  "mesh": {},

  "stability": {},

  "overhangs": {},

  "bridges": {},

  "thinWalls": {},

  "classification": {}

}

```



---

# Classification API

Purpose:

Classify imported objects.

## Classify Object

POST

/api/classification/object/{id}

## Response

{
  "category": "",
  "subcategory": "",
  "confidenceScore": 0
}

---

# Recommendation API



Purpose:



Generate AI recommendations.



---



## Generate Recommendation



```text

POST



/api/recommendation/generate

```



---



## Input



```json

{

  "printerId": "",

  "materialId": "",

  "filamentId": "",

  "objectIds": []

}

```



---



## Response



One recommendation is returned for each objectId of the input, indexed by objectId (ADR-026).

```json
{
  "recommendations": {
    "<objectId>": {
      "recommendationId": "",
      "objectId": "",
      "analysisId": "",
      "recommendedProfile": {},
      "printPreset": {},
      "warnings": [],
      "confidenceScore": 95,
      "status": "generated"
    }
  }
}
```



---


# Optimization API


Purpose:

Optimize print settings.


---



## Optimize Orientation


```text

POST



/api/optimization/orientation

```



---



## Response



```json

{

  "orientationScore": 92,

  "rotation": {}

}

```



---



## Optimize Supports



```text

POST



/api/optimization/supports

```



---



## Optimize Time



```text

POST



/api/optimization/time

```


Optimize Material

```text
POST

/api/optimization/material
```

---

# Cost API



Purpose:



Estimate production cost.



---



## Estimate Cost



```text

POST



/api/cost/estimate

```



---



## Response



```json

{

  "materialCost": 0,

  "energyCost": 0,

  "totalCost": 0,

  "printTime": 0

}

```



---



# Project API


Purpose:

Save and load projects.


Supported Project Format:

WYPROJ


Project Extension:

.wyproj


Project Storage Format:

JSON

---

## Project File Structure

Project Container:

WYPROJ

Underlying Structure:

JSON

Required Metadata:

- format
- version
- projectId
- createdAt
- updatedAt

---

## Save Project


```text

POST

/api/project/save

```

Output Format:

WYPROJ

---

## Load Project



```text

POST



/api/project/load

```

Accepted Format:

WYPROJ

Accepted Extension:

.wyproj

---



## Create Project

```text
POST

/api/project/new
```

---

## Auto Save

```text
POST

/api/project/autosave
```

---

## Recovery

```text
POST

/api/project/recovery
```


---


# Cache API

Purpose:

```text
Read validated local data
Store validated data
Invalidate expired data
Rebuild corrupted data
Coordinate local-first access
```

Required cache flow:

```text
Request
↓
Local Data
↓
Cache Lookup
↓
Validate Cached Data
↓
Return Valid Data
```

If valid local data or cache data is unavailable:

```text
Repository
↓
RepositorySync
↓
Remote Source
↓
Validate Remote Data
↓
Update Cache
↓
Return Validated Data
```

Cache rules:

```text
Cached data must never bypass validation.

Expired data must not be treated as current data.

Corrupted cache data must be rejected.

Invalid cache data must be removed or rebuilt.

Remote data must be validated before entering the cache.
```

---

## Refresh Cache



```text

POST



/api/cache/refresh

```



---



## Clear Cache



```text

DELETE



/api/cache

```



---



# Repository API


Purpose:


Access online repositories.


Repository Resolution Order:

Local Database
↓
Local Cache
↓
Official Profiles
↓
Verified Repositories
↓
Community Sources

---


## GitHub Repository Service


Sources:


```text

Official Profiles
Verified Repositories
Community Sources

```


---


## Refresh Printer Profiles


```text

POST

/api/repositories/printers/refresh

```

Refresh Print Presets

```text
POST

/api/repositories/presets/refresh
```

---


## Refresh Material Profiles


```text

POST

/api/repositories/materials/refresh
```


---

---

## Refresh Filament Profiles

```text
POST

/api/repositories/filaments/refresh
```


# Repository Validation


Every downloaded file must pass:


```text

Schema Validation
Integrity Validation
Version Validation

```

Before import.

---


# Download Queue


Purpose:

Prevent excessive requests.

---


## Queue States


```text

Pending
Running
Completed
Failed

```


---


# Rate Limiting


Remote requests should be limited.


---


## Recommended Rules


```text

Maximum Requests Per Minute
Maximum Parallel Downloads
Cache First Strategy

```

---

# Event API


Purpose:

System notifications.


---


## Events

```text

ObjectAdded
ObjectRemoved
ObjectMoved
ObjectRotated
AnalysisCompleted
RecommendationGenerated
ProfileUpdated

```

---


# Notification API


Purpose:


Display messages.


---


## Types


```text

Info
Success
Warning
Error

```


---


# Validation API


Purpose:


Validate imported data.


---

## STL Validation

File Structure
Geometry
Corruption

---

## 3MF Validation

File Structure
Metadata
Geometry
Corruption

---

## WYPROJ Validation

Project Structure
Schema Validation
Version Validation
Compatibility Validation
Corruption Detection

---

## Profile Validation


```text

Printer Profiles
Material Profiles
Filament Profiles
Print Presets
Schemas

```



---



# Authentication



Version 1.x



```text

None Required

```



Application is local.



---



# Future Authentication



Reserved



```text

Local User



Cloud User



Organization Account

```



---



# Cloud APIs



Reserved



Future Support



```text

Project Sync



Cloud Profiles



Remote Printers

```



---

# API Change Rules

Before modifying an API:

1. Identify impacted domains

2. Identify impacted services

3. Identify impacted repositories

4. Identify impacted schemas

5. Identify impacted documentation

6. Perform impact analysis

7. Update validation schemas

8. Update API documentation

9. Update CHANGELOG.md

10. Validate backward compatibility

---

# API Versioning



Format:



```text

v1

v2

v3

```



---



## Example



```text

/api/v1/printers

```



---

# API Documentation Rules

Every API modification requires review of:

API_SPEC.md

DATA_SCHEMA.md

PROJECT_SPEC.md

CHANGELOG.md

Documentation updates must be completed before implementation is considered finished.

---

# Backward Compatibility

API versions must remain available whenever possible.

Breaking changes require:


```text

Migration Documentation

Version Increment

Changelog Entry

```



---



# Error Codes



Examples:



```text

PRINTER_NOT_FOUND



MATERIAL_NOT_FOUND



INVALID_PROFILE



IMPORT_FAILED



ANALYSIS_FAILED



RECOMMENDATION_FAILED

```



---



# Logging Requirements


Every API operation must log:


```text

Timestamp
Action
Result
Duration

```


---

# API Security Rules

All APIs must:

- Validate Inputs
- Validate Outputs
- Reject Invalid Schemas
- Reject Corrupted Data
- Reject Unsupported Versions

Unknown data must never be trusted.

---

# Security Requirements



Validate:



```text

Files
Profiles
Repository Data

```

Before processing.

---


# Future APIs


Reserved


```text

G-Code API
Remote Print API
Webcam API
Machine Learning API
Plugin API
Plugin Marketplace API
Community Profiles API
Filament Tracking API
Vision Classification API

```



---

# API Governance Validation

Before accepting an API change:

Verify:

- Ownership respected

- Dependencies validated

- Schemas updated

- Documentation updated

- Impact analysis completed

- Backward compatibility verified

Reference:

CHANGE_VERIFICATION_CHECKLIST.md

---

# Golden Rule


APIs must remain simple, predictable, documented, and backward compatible.


---


# End Of Document
