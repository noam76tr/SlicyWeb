# DATA SCHEMA

Version: 2.0.0

Status: Approved

Priority: Mandatory

---


# Purpose

This document defines every data structure used by the project.

All modules must follow these schemas.

No module may introduce incompatible structures without updating this document.

This document is considered the single source of truth for data modeling.

---

# Schema Governance

All schema modifications must comply with:

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
Protect Data Consistency

Prevent Breaking Changes

Maintain Compatibility

Control Schema Evolution

Protect Domain Boundaries

Standardize Validation
```

---

# Global Rules


## Units

Distances: mm

Temperatures: °C

Speed: mm/s

Acceleration: mm/s²

Weight: g

Length: mm

Volume: mm³

Area: mm²

Time: seconds

Cost: local currency

---

# Schema Ownership Rules

Every schema belongs to a domain.


Ownership must follow:

FILE_OWNERSHIP_MATRIX.md

DOMAIN_BOUNDARIES.md


Cross-domain schema modifications require impact analysis.

Ownership must be verified before modifying shared schemas.

---

# Runtime Validation Rules

All runtime validation must use:

```text
Zod Schemas
```

Located in:

```text
src/schemas/
```

Every schema documented in this file must have a corresponding runtime validation schema.

Runtime validation is mandatory for:

```text
User Input
Imported Files
Printer Profiles
Material Profiles
Filament Profiles
Print Presets
Repository Data
RepositorySync Results
Remote Source Data
IPC Requests
IPC Responses
API Requests
API Responses
Project Files
Cache Entries
Error Objects
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

---

# Error Schema

The Error Schema defines the standard structure used by APIs, services, IPC, logging, and user notifications.

```json
{
  "code": "",
  "severity": "",
  "message": "",
  "module": "",
  "timestamp": ""
}
```

Required fields:

```text
code
severity
message
module
timestamp
```

Allowed severity values:

```text
Info
Warning
Error
Critical
```

Error codes must be defined in:

```text
docs/03-development/ERROR_CODES_SPEC.md
```

Error objects must not contain:

```text
Raw Stack Traces
Internal File Paths
Authentication Tokens
Credentials
Sensitive Information
Raw Remote Responses
```

---

# IPC Payload Schema

IPC requests and responses must use validated payloads.

Request structure:

```json
{
  "channel": "",
  "requestId": "",
  "payload": {}
}
```

Response structure:

```json
{
  "channel": "",
  "requestId": "",
  "success": true,
  "data": {},
  "errors": []
}
```

Required fields:

```text
channel
requestId
payload
success
data
errors
```

IPC payloads must be validated before processing.

Invalid IPC payloads must be rejected safely.

---

# Repository Data Schema

Repository data must include source and version metadata.

```json
{
  "id": "",
  "type": "",
  "version": "",
  "source": "",
  "data": {},
  "validated": false
}
```

Required fields:

```text
id
type
version
source
data
validated
```

Repository data must not be consumed when:

```text
validated is false
The source is unknown
The version is unsupported
The data is incomplete
The data fails schema validation
```

---

# RepositorySync Result Schema

RepositorySync results must distinguish successful synchronization from failure.

```json
{
  "success": true,
  "source": "",
  "repository": "",
  "version": "",
  "data": {},
  "errors": [],
  "synchronizedAt": ""
}
```

Required fields:

```text
success
source
repository
version
data
errors
synchronizedAt
```

RepositorySync results must be validated before they are returned to a Repository.

Invalid synchronization results must not be stored in the cache.

---

# Cache Entry Schema

Cached data must include validation and expiration metadata.

```json
{
  "key": "",
  "dataType": "",
  "data": {},
  "version": "",
  "source": "",
  "validated": true,
  "createdAt": "",
  "expiresAt": ""
}
```

Required fields:

```text
key
dataType
data
version
source
validated
createdAt
expiresAt
```

Cache entries must be rejected when:

```text
The entry is corrupted
The entry is expired
The entry fails validation
The schema version is unsupported
The source is unknown
```

---

# Remote Source Metadata Schema

Remote data must retain information about its origin.

```json
{
  "sourceType": "",
  "sourceName": "",
  "sourceUrl": "",
  "retrievedAt": "",
  "version": "",
  "integrityValidated": false
}
```

Required fields:

```text
sourceType
sourceName
retrievedAt
version
integrityValidated
```

Allowed source types:

```text
GitHub Repository
Official Manufacturer Source
Verified Community Repository
REST API
Cloud Source
```

Remote source metadata must be validated before remote data is consumed or cached.

---

# Entity Relationship Overview

Printer
↓
Materia
↓
Filament
↓
Model
↓
Analysis
↓
Classification
↓
Recommendation
↓
Recommended Profile
↓
Print Preset
↓
Warnings


---


# Printer Schema


```json

{

&#x20; "id": "",

&#x20; "brand": "",

&#x20; "model": "",

&#x20; "series": "",

&#x20; "manufacturer": "",

&#x20; "firmware": "",

&#x20; "releaseDate": "",

&#x20; "supported": true

}

```


---


# Build Volume Schema


```json

{

&#x20; "buildVolume": {

&#x20;   "x": 256,

&#x20;   "y": 256,

&#x20;   "z": 256

&#x20; }

}

```


---


# Nozzle Schema


```json

{

&#x20; "defaultNozzle": 0.4,

&#x20; "supportedNozzles": \[

&#x20;   0.2,

&#x20;   0.4,

&#x20;   0.6,

&#x20;   0.8

&#x20; ]

}

```


---


# Extruder Schema


```json

{

&#x20; "extruder": {

&#x20;   "type": "direct\_drive",

&#x20;   "count": 1

&#x20; }

}

```


Possible Values


```text

direct\_drive

bowden

unknown

```


---


# Motion System Schema



```json

{

&#x20; "motion": {

&#x20;   "maxPrintSpeed": 500,

&#x20;   "maxTravelSpeed": 500,

&#x20;   "maxAcceleration": 20000,

&#x20;   "maxJerk": 20

&#x20; }

}

```


---



# Thermal Schema


```json

{

&#x20; "thermal": {

&#x20;   "maxNozzleTemp": 300,

&#x20;   "maxBedTemp": 110,

&#x20;   "maxChamberTemp": 60

&#x20; }

}

```


---


# Cooling Schema


```json

{

&#x20; "cooling": {

&#x20;   "partFan": true,

&#x20;   "auxFan": false,

&#x20;   "chamberFan": false

&#x20; }

}

```


---


# Complete Printer Schema


```json

{

&#x20; "id": "",

&#x20; "brand": "",

&#x20; "model": "",

&#x20; "series": "",

&#x20; "buildVolume": {},

&#x20; "defaultNozzle": 0.4,

&#x20; "supportedNozzles": \[],

&#x20; "motion": {},

&#x20; "thermal": {},

&#x20; "cooling": {},

&#x20; "extruder": {},

&#x20; "supportedMaterials": \[],

&#x20; "supportedFilaments": \[]

}

```


---


# Material Schema



```json

{

&#x20; "id": "",

&#x20; "name": "",

&#x20; "category": "",

&#x20; "brand": "",

&#x20; "description": ""

}

```


---


# Material Thermal Properties


```json

{

&#x20; "temperature": {

&#x20;   "minNozzle": 190,

&#x20;   "maxNozzle": 220,

&#x20;   "minBed": 50,

&#x20;   "maxBed": 60

&#x20; }

}

```


---


# Material Cooling



```json

{

&#x20; "cooling": {

&#x20;   "fanMin": 80,

&#x20;   "fanMax": 100

&#x20; }

}

```



---



# Material Physical Properties



```json

{

&#x20; "physical": {

&#x20;   "density": 1.24,

&#x20;   "shrinkage": 0.2,

&#x20;   "warpingRisk": "low"

&#x20; }

}

```



---



# Material Print Settings



```json

{

&#x20; "recommended": {

&#x20;   "printSpeed": 80,

&#x20;   "travelSpeed": 200,

&#x20;   "retractionDistance": 0.8,

&#x20;   "retractionSpeed": 35

&#x20; }

}

```



---



# Complete Material Schema



```json

{

&#x20; "id": "",

&#x20; "name": "",

&#x20; "category": "",

&#x20; "temperature": {},

&#x20; "cooling": {},

&#x20; "physical": {},

&#x20; "recommended": {}

}

```

--- 

# Filament Schema

```json
{
  "id": "",
  "brand": "",
  "name": "",
  "material": "",
  "color": "",
  "diameter": 1.75,
  "density": 1.24,
  "pricePerKg": 0,

  "manufacturerSettings": {
    "retractionDistance": 0,
    "retractionSpeed": 0,
    "fanSpeed": 0,
    "nozzleTemperature": 0,
    "bedTemperature": 0
  },

  "recommendedProfile": {}
}
```

---

# Project File Schema

Native Project Format:

WYPROJ

Project Extension:

.wyproj

Storage Format:

JSON

```json
{
  "format": "WYPROJ",
  "version": "2.0.0",
  "project": {},
  "metadata": {}
}
```

---

# Project Schema


Represents an entire workspace.


```json

{
  "projectId": "",
  "projectName": "",
  "projectFormat": "WYPROJ",
  "createdAt": "",
  "updatedAt": "",
  "version": "",
  "scene": {},
  "settings": {},
  "analysis": {},
  "recommendations": {},
  "preset": {},
  "printer": {},
  "material": {},
  "filament": {}
}

```



---



# Scene Schema



```json

{

&#x20; "scene": {

&#x20;   "objects": \[],

&#x20;   "printer": {},

&#x20;   "material": {},

&#x20;   "filament": {},

&#x20;   "preset": {}

&#x20; }

}

```



---



# Object Schema



```json

{

&#x20; "objectId": "",

&#x20; "fileName": "",

&#x20; "fileType": "",

&#x20; "visible": true,

&#x20; "locked": false

}

```



---



# Transform Schema



```json

{

&#x20; "transform": {

&#x20;   "position": {

&#x20;     "x": 0,

&#x20;     "y": 0,

&#x20;     "z": 0

&#x20;   },



&#x20;   "rotation": {

&#x20;     "x": 0,

&#x20;     "y": 0,

&#x20;     "z": 0

&#x20;   },



&#x20;   "scale": {

&#x20;     "x": 1,

&#x20;     "y": 1,

&#x20;     "z": 1

&#x20;   }

&#x20; }

}

```



---



# Model Geometry Schema



```json

{

&#x20; "geometry": {

&#x20;   "width": 0,

&#x20;   "depth": 0,

&#x20;   "height": 0,

&#x20;   "volume": 0,

&#x20;   "surfaceArea": 0

&#x20; }

}

```



---



# Mesh Statistics Schema



```json

{

&#x20; "mesh": {

&#x20;   "vertices": 0,

&#x20;   "triangles": 0

&#x20; }

}

```



---



# Stability Analysis Schema



```json

{

&#x20; "stability": {

&#x20;   "contactArea": 0,

&#x20;   "heightRatio": 0,

&#x20;   "centerOfGravity": {},

&#x20;   "riskScore": 0

&#x20; }

}

```



---



# Overhang Analysis Schema



```json

{

&#x20; "overhangs": {

&#x20;   "detected": true,

&#x20;   "maxAngle": 60,

&#x20;   "percentage": 25

&#x20; }

}

```



---



# Bridge Analysis Schema



```json

{

&#x20; "bridges": {

&#x20;   "detected": true,

&#x20;   "count": 10,

&#x20;   "longestBridge": 25

&#x20; }

}

```



---



# Thin Wall Schema



```json

{

&#x20; "thinWalls": {

&#x20;   "detected": true,

&#x20;   "minimumThickness": 0.8

&#x20; }

}

```



---


# Complete Analysis Schema


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

# Object Classification Schema

```json
{
  "classification": {
    "category": "",
    "subcategory": "",
    "confidenceScore": 0,
    "detectedFeatures": [],
    "detectedTags": [],
    "classificationVersion": ""
  }
}
```


---

# Classification Categories

Supported values:

Figurine

Miniature

Mechanical Part

Gear

Bracket

Tool

Enclosure

Vase

Prototype

Structural Part

Functional Part

---

# Recommended Settings Schema


```json

{

&#x20; "recommendedSettings": {

&#x20;   "layerHeight": 0.2,

&#x20;   "wallCount": 3,

&#x20;   "topLayers": 5,

&#x20;   "bottomLayers": 5,

&#x20;   "infillDensity": 15,

&#x20;   "infillPattern": "gyroid",

&#x20;   "supportType": "organic",

&#x20;   "adhesionType": "brim"

&#x20; }

}

```

---


# Print Preset Schema

```json
{
  "preset": {
    "name": "",
    "category": "",
    "description": "",
    "settings": {}
  }
}
```

---

# Print Preset Categories

Supported values:

Draft

Fast

Balanced

Quality

Ultra Quality

Mechanical

Prototype

Miniature

Vase

Structural

---

# Speed Schema


```json

{

&#x20; "speed": {

&#x20;   "print": 80,

&#x20;   "outerWall": 40,

&#x20;   "innerWall": 80,

&#x20;   "infill": 120,

&#x20;   "travel": 250

&#x20; }

}

```



---



# Cooling Settings Schema



```json

{

&#x20; "cooling": {

&#x20;   "fanSpeed": 100,

&#x20;   "minimumLayerTime": 5

&#x20; }

}

```


---



# Retraction Schema



```json

{

&#x20; "retraction": {

&#x20;   "distance": 0.8,

&#x20;   "speed": 35

&#x20; }

}

```

---

# Support Schema

```json
{
  "supports": {
    "required": false,
    "type": "",
    "density": 0,
    "overhangThreshold": 50
  }
}
```

---

# Recommended Profile Schema

```json

{
  "recommendedProfile": {
    "preset": {},
    "quality": {},
    "speed": {},
    "cooling": {},
    "retraction": {},
    "supports": {},
    "adhesion": {},
    "confidenceScore": 0
  }
}
```
---

# Recommendation Schema

```json
{
  "recommendation": {
    "recommendationId": "",
    "printerId": "",
    "materialId": "",
    "filamentId": "",
    "analysisId": "",
    "classification": {},
    "recommendedProfile": {},
    "preset": {},
    "warnings": [],
    "confidenceScore": 0,
    "createdAt": "",
    "status": "generated"
  }
}

```



---



# Warning Schema



```json

{
  "warning": {
    "code": "",
    "severity": "",
    "message": "",
    "source": "",
    "recommendedAction": ""
  }
}

```


---


# Warning Severity


```text

info

low

medium

high

critical

```


---


# Notification Schema


```json
{
  "notification": {
    "id": "",
    "timestamp": "",
    "type": "",
    "severity": "",
    "message": "",
    "source": "",
    "read": false
  }
}
```

---


# Optimization Result Schema

```json

{

&#x20; "optimization": {

&#x20;   "orientationScore": 90,

&#x20;   "supportReduction": 35,

&#x20;   "timeReduction": 12,

&#x20;   "materialReduction": 8

&#x20; }

}

```


---


# Cost Estimation Schema



```json

{

&#x20; "cost": {

&#x20;   "filamentLength": 0,

&#x20;   "filamentWeight": 0,

&#x20;   "materialCost": 0,

&#x20;   "electricityCost": 0,

&#x20;   "totalCost": 0

&#x20; }

}

```


---


# Print Estimation Schema



```json

{

&#x20; "estimation": {

&#x20;   "printTime": 0,

&#x20;   "layerCount": 0

&#x20; }

}

```


---


# Repository Schema

```json

{
  "repository": {
    "name": "",
    "type": "",
    "url": "",
    "lastUpdated": "",
    "verified": true
  }
}

```


---


# Cache Schema



```json

{
  "cache": {
    "createdAt": "",
    "expiresAt": "",
    "source": "",
    "version": "",
    "checksum": ""
  }
}

```

---

# User Preferences Schema


```json

{

&#x20; "preferences": {

&#x20;   "theme": "dark",

&#x20;   "language": "en",

&#x20;   "units": "metric"

&#x20; }

}

```


---


# Theme Values



```text

dark

light

system

```


---


# Language Values


```text

en

fr

he
```

---


# Future Extensions

```json

{
  &#x20; "pluginSystem": {},
  
  &#x20; "pluginMarketplace": {},
  
  &#x20; "communityProfiles": {},

  &#x20; "filamentTracking": {},
  
  &#x20; "visionClassification": {},

  &#x20; "gcode": {},

  &#x20; "multimaterial": {},

  &#x20; "camera": {},

  &#x20; "cloud": {},

  &#x20; "remotePrinter": {},

  &#x20; "telemetry": {},

  &#x20; "machineLearning": {}

}

```

language:
```text
- es
- de
- it
```

---

# Schema Change Rules

Before modifying a schema:

1. Identify impacted domains

2. Identify impacted services

3. Identify impacted repositories

4. Identify impacted APIs

5. Identify impacted documentation

6. Perform impact analysis

7. Update validation schemas

8. Update documentation

9. Update CHANGELOG.md

10. Validate backward compatibility

---

# Schema Compatibility Rules

Existing fields must never be removed.

New fields should be added whenever possible.

Breaking schema changes require:

- PROJECT\_SPEC update

- ARCHITECTURE update

- CHANGELOG entry

- Version increase


---


# End Of Document
