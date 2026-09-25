# SlicyWeb SMART SLICER

# API SPECIFICATION


Version: 2.0.0

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

- Local Databases

- GitHub Repositories

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
Protect RepositorySync access rules
```

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

Direct access bypassing IPC or RepositorySync is prohibited.

---

# API Ownership Rules

Every API belongs to a domain.

Ownership must follow:

FILE_OWNERSHIP_MATRIX.md

DOMAIN_BOUNDARIES.md

Cross-domain API modifications require impact analysis.

Ownership must be verified before modifying shared APIs.

RepositorySync APIs are owned by the RepositorySync domain.

Remote source access is never owned by the GUI, Viewport, or Analysis domains.

---

# RepositorySync API

Purpose:

```text
Fetch remote repository data
Sync profile data
Validate external payloads
Return normalized results
```

Allowed responsibilities:

```text
GitHub repository access
Remote profile synchronization
Remote validation
Cache refresh coordination
Repository data normalization
```

Forbidden responsibilities:

```text
Rendering UI
Business rule generation
Recommendation generation
Model analysis
Direct storage bypass
Direct GUI access
```

Required validation flow:

```text
RepositorySync
↓
Remote Source
↓
Schema Validation
↓
Repository Normalization
↓
Storage / Cache Update
```

Any remote payload must be validated before use.

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
IPC Payloads
Project Files
Remote Sync Results
Cache Entries
```

Unvalidated payloads are forbidden.


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
code: machine-readable identifier
message: human-readable error
module: responsible module or domain
severity: error | warning | critical
timestamp: ISO timestamp
```

All API errors must use this schema.

---

# Error Format

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
Error handling rules:

```text
Errors must never be silent.
Errors must always be structured.
Errors must include the responsible module.
Errors must be serialized consistently.
Remote errors must be normalized before returning.
```

Validation failures must return structured errors and never raw exceptions.

---

# Error Validation Rules

Every error must:

```text
Use a unique error code
Include a severity
Include a responsible module
Include a safe message
Include a timestamp
Be serializable
Be loggable
Be safe for user display
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
data: populated response data
errors: empty array
```

Failure responses:

success: false
data: null or partial safe data
errors: structured error array

Allowed response states:

Success
Validation Failed
Not Found
Unauthorized
Forbidden
Conflict
Unavailable
Timeout
Internal Error

An API must never return an undefined response state.

---

# API Validation Rules

All API payloads must be validated using:

Zod Schemas

Located in:

src/schemas/

Validation is mandatory for:

- Requests
- Responses
- Imports
- Repository Data
- IPC Payloads
- Project Files

Unvalidated payloads are forbidden.

---

# Response Format

Standard success format:

```json

{

&#x20; "success": true,

&#x20; "data": {},

&#x20; "errors": \[]

}

```

---

# Error Format

```json

{

&#x20; "success": false,

&#x20; "data": null,

&#x20; "errors": \[

&#x20;   {

&#x20;     "code": "",

&#x20;     "message": ""

&#x20;   }

&#x20; ]

}

```



---



# Printer API


Purpose:

Manage printer profiles.



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

&#x20; "printers": \[]

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

&#x20; "printer": {}

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

&#x20; "brand": "",

&#x20; "model": ""

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

&#x20; "profile": {}

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

&#x20; "category": "",

&#x20; "brand": ""

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

&#x20; "objectId": "",

&#x20; "status": "imported"

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

&#x20; "x": 0,

&#x20; "y": 0,

&#x20; "z": 0

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

&#x20; "x": 0,

&#x20; "y": 0,

&#x20; "z": 0

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

&#x20; "x": 1,

&#x20; "y": 1,

&#x20; "z": 1

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

&#x20; "dimensions": {},

&#x20; "geometry": {},

&#x20; "mesh": {},

&#x20; "stability": {},

&#x20; "overhangs": {},

&#x20; "bridges": {},

&#x20; "thinWalls": {},

&#x20; "classification": {}

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

&#x20; "printerId": "",

&#x20; "materialId": "",

&#x20; "filamentId": "",

&#x20; "objectIds": \[]

}

```



---



## Response



```json
{
  "recommendation": {
    "recommendedProfile": {},
    "printPreset": {},
    "warnings": [],
    "confidenceScore": 95
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

&#x20; "orientationScore": 92,

&#x20; "rotation": {}

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

&#x20; "materialCost": 0,

&#x20; "energyCost": 0,

&#x20; "totalCost": 0,

&#x20; "printTime": 0

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

PRINTER\_NOT\_FOUND



MATERIAL\_NOT\_FOUND



INVALID\_PROFILE



IMPORT\_FAILED



ANALYSIS\_FAILED



RECOMMENDATION\_FAILED

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
