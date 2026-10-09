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
sourceUrl
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
Material
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

 "id": "",

 "brand": "",

 "model": "",

 "series": "",

 "manufacturer": "",

 "firmware": "",

 "releaseDate": "",

 "supported": true

}

```


---


# Build Volume Schema


```json

{

 "buildVolume": {

   "x": 256,

   "y": 256,

   "z": 256

 }

}

```


---


# Nozzle Schema


```json

{

 "defaultNozzle": 0.4,

 "supportedNozzles": [

   0.2,

   0.4,

   0.6,

   0.8

 ]

}

```


---


# Extruder Schema


```json

{

 "extruder": {

   "type": "direct_drive",

   "count": 1

 }

}

```


Possible Values


```text

direct_drive

bowden

unknown

```


---


# Motion System Schema



```json

{

 "motion": {

   "maxPrintSpeed": 500,

   "maxTravelSpeed": 500,

   "maxAcceleration": 20000,

   "maxJerk": 20

 }

}

```


---



# Thermal Schema


```json

{

 "thermal": {

   "maxNozzleTemp": 300,

   "maxBedTemp": 110,

   "maxChamberTemp": 60

 }

}

```


---


# Cooling Schema


```json

{

 "cooling": {

   "partFan": true,

   "auxFan": false,

   "chamberFan": false

 }

}

```


---


# Complete Printer Schema


```json

{

 "id": "",

 "brand": "",

 "model": "",

 "series": "",

 "buildVolume": {},

 "defaultNozzle": 0.4,

 "supportedNozzles": [],

 "motion": {},

 "thermal": {},

 "cooling": {},

 "extruder": {},

 "supportedMaterials": [],

 "supportedFilaments": []

}

```


---


# Material Schema



```json

{

 "id": "",

 "name": "",

 "category": "",

 "brand": "",

 "description": ""

}

```


---


# Material Thermal Properties


```json

{

 "temperature": {

   "minNozzle": 190,

   "maxNozzle": 220,

   "minBed": 50,

   "maxBed": 60

 }

}

```


---


# Material Cooling



```json

{

 "cooling": {

   "fanMin": 80,

   "fanMax": 100

 }

}

```



---



# Material Physical Properties



```json

{

 "physical": {

   "density": 1.24,

   "shrinkage": 0.2,

   "warpingRisk": "low"

 }

}

```



---



# Material Print Settings



```json

{

 "recommended": {

   "printSpeed": 80,

   "travelSpeed": 200,

   "retractionDistance": 0.8,

   "retractionSpeed": 35

 }

}

```



---



# Complete Material Schema



```json

{

 "id": "",

 "name": "",

 "category": "",

 "temperature": {},

 "cooling": {},

 "physical": {},

 "recommended": {}

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

 "scene": {

   "objects": [],

   "printer": {},

   "material": {},

   "filament": {},

   "preset": {}

 }

}

```



---



# Object Schema



```json

{

 "objectId": "",

 "fileName": "",

 "fileType": "",

 "visible": true,

 "locked": false

}

```



---



# Transform Schema



```json

{

 "transform": {

   "position": {

     "x": 0,

     "y": 0,

     "z": 0

   },



   "rotation": {

     "x": 0,

     "y": 0,

     "z": 0

   },



   "scale": {

     "x": 1,

     "y": 1,

     "z": 1

   }

 }

}

```



---



# Model Geometry Schema



```json

{

 "geometry": {

   "width": 0,

   "depth": 0,

   "height": 0,

   "volume": 0,

   "surfaceArea": 0

 }

}

```



---



# Mesh Statistics Schema



```json

{

 "mesh": {

   "vertices": 0,

   "triangles": 0

 }

}

```



---



# Stability Analysis Schema



```json

{

 "stability": {

   "contactArea": 0,

   "heightRatio": 0,

   "centerOfGravity": {},

   "riskScore": 0

 }

}

```



---



# Overhang Analysis Schema



```json

{

 "overhangs": {

   "detected": true,

   "maxAngle": 60,

   "percentage": 25

 }

}

```



---



# Bridge Analysis Schema



```json

{

 "bridges": {

   "detected": true,

   "count": 10,

   "longestBridge": 25

 }

}

```



---



# Thin Wall Schema



```json

{

 "thinWalls": {

   "detected": true,

   "minimumThickness": 0.8

 }

}

```



---


# Complete Analysis Schema


```json

{

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

 "recommendedSettings": {

   "layerHeight": 0.2,

   "wallCount": 3,

   "topLayers": 5,

   "bottomLayers": 5,

   "infillDensity": 15,

   "infillPattern": "gyroid",

   "supportType": "organic",

   "adhesionType": "brim"

 }

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

 "speed": {

   "print": 80,

   "outerWall": 40,

   "innerWall": 80,

   "infill": 120,

   "travel": 250

 }

}

```



---



# Cooling Settings Schema



```json

{

 "cooling": {

   "fanSpeed": 100,

   "minimumLayerTime": 5

 }

}

```


---



# Retraction Schema



```json

{

 "retraction": {

   "distance": 0.8,

   "speed": 35

 }

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

 "optimization": {

   "orientationScore": 90,

   "supportReduction": 35,

   "timeReduction": 12,

   "materialReduction": 8

 }

}

```


---


# Cost Estimation Schema



```json

{

 "cost": {

   "filamentLength": 0,

   "filamentWeight": 0,

   "materialCost": 0,

   "electricityCost": 0,

   "totalCost": 0

 }

}

```


---


# Print Estimation Schema



```json

{

 "estimation": {

   "printTime": 0,

   "layerCount": 0

 }

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

 "preferences": {

   "theme": "dark",

   "language": "en",

   "units": "metric"

 }

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
   "pluginSystem": {},
  
   "pluginMarketplace": {},
  
   "communityProfiles": {},

   "filamentTracking": {},
  
   "visionClassification": {},

   "gcode": {},

   "multimaterial": {},

   "camera": {},

   "cloud": {},

   "remotePrinter": {},

   "telemetry": {},

   "machineLearning": {}

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

- PROJECT_SPEC update

- ARCHITECTURE update

- CHANGELOG entry

- Version increase


---


# End Of Document
