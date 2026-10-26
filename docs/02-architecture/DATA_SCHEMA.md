# DATA SCHEMA

Version: 3.5.0

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


Unknown values (3.5.0, ADR-032): each value of motion is a number, or null when the manufacturer does not publish it. null means unknown, never 0; code that uses these values (recommendation, limits, export) handles null explicitly.


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


Unknown values (3.5.0, ADR-032): each value of thermal is a number, or null when the manufacturer does not publish it (maxChamberTemp is null when no chamber temperature is published). null means unknown, never 0.


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
  "version": "3.0.0",
  "project": {},
  "metadata": {}
}
```

WYPROJ Version Rule:

The WYPROJ format version is 3.0.0 (format and project.version).

A file with another version, or without a version, is refused at load (ERROR_CODES_SPEC.md, PROJ_003 Project Version Mismatch). The error message gives the version of the file and the supported version.

No migration exists from WYPROJ 2.0.0: no 2.0.0 file was distributed.

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

Analysis And Recommendations Indexing (ADR-026):

analysis and recommendations are indexed by objectId.

```json

{
  "analysis": {
    "<objectId>": {}
  },
  "recommendations": {
    "<objectId>": {}
  }
}

```

Each analysis entry follows the Complete Analysis Schema.

Each recommendation entry follows the Recommendation Schema.

Integrity constraints are defined in Object Reference Rules.

Selection Fields:

printer, material, filament and preset are null while no selection has been made.

A new project starts with these four fields set to null.

null means "not yet selected". It never means "unknown" or "invalid".

Known Duplication:

The four selections (printer, material, filament, preset) exist both in the Project Schema and in the Scene Schema.

This duplication is known and is not resolved yet.

A later change must define which of the two is the source of truth.



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

Selection Fields:

scene.printer, scene.material, scene.filament and scene.preset are null while no selection has been made.

null means "not yet selected". It never means "unknown" or "invalid".

The same four selections also exist in the Project Schema (see Known Duplication in the Project Schema).



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

Coordinate System (DECISIONS.md, ADR-028):

```text
Units: mm
Axes: X to the right, Y to the back, Z up
Origin: center of the build plate, Z = 0 on the plate surface
```

position is expressed in this coordinate system. It does not depend on the printer: the origin of the printer (PRINTER_PROFILE_SPEC.md, Build Plate Origin: Center, Front Left, Custom) is applied only when exporting to the target slicer.

Transform Rules (DECISIONS.md, ADR-031):

```text
Local origin of an object (3.4.0):
  center of the object defined at import: center of the bounding box in X, Y
  and Z of the geometry as imported
  the geometry of the object is stored relative to this point

scale:
  factors along the axes of the object (local axes), applied first

rotation:
  unit: degrees
  sign: right-hand rule; a positive angle turns counterclockwise when seen
        from the positive end of the axis (seen from above, +90 around Z
        turns the X axis onto the Y axis)
  order: around the axes of the build plate (fixed axes), first X, then Y,
         then Z: R = Rz(z) · Ry(y) · Rx(x) (column vectors; Euler order "ZYX"
         of Three.js)
  pivot: the local origin of the object (its center): the object turns
         around its center

position:
  place of the local origin (center) of the object on the build plate
  (coordinate system above); a rotation does not change position X and Y;
  position Z is the height of the center (half the height of an object
  that is not turned)

Point on the plate = position + R · (S · point of the object), S = diag(scale)

Placement on the plate:
  after each change of rotation or scale, the object is placed back on the
  plate: position.z is changed so that the lowest point of the object is at
  Z = 0 (as in Bambu Studio, OrcaSlicer and PrusaSlicer); an object is never
  placed under the plate (sunk objects: KI-021)
```

Conversion at export (3MF build item, transform attribute, row vectors of the 3MF Core Specification: point of the plate = point of the object · M):

```text
m00 m01 m02 m10 m11 m12 m20 m21 m22 m30 m31 m32

3 x 3 part: (R · S) transposed: row r of M is column r of (R · S)
m30 m31 m32: position + offset of the printer origin (PRINTER_PROFILE_SPEC.md,
             Build Plate Origin), applied only at export
mesh: vertices of the object in its own coordinate system (relative to the
      local origin), in millimeters
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

Analysis Status Values:

```text
generated = Computed for the current geometry, rotation and scale of the object

outdated = The object was rotated or scaled after computation; must be recomputed
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

category: stored value (Classification Categories).

classificationVersion: version of OBJECT_CLASSIFICATION_SPEC.md applied by the classification.

The confidence level is not stored. It is computed from confidenceScore (OBJECT_CLASSIFICATION_SPEC.md, Confidence Levels).


---

# Classification Categories

Supported values (OBJECT_CLASSIFICATION_SPEC.md, Supported Categories):

| Category | Stored Value |
|----------|--------------|
| Figurine | figurine |
| Miniature | miniature |
| Mechanical Part | mechanical_part |
| Gear | gear |
| Bracket | bracket |
| Container | container |
| Vase | vase |
| Enclosure | enclosure |
| Tool | tool |
| Articulated Model | articulated_model |
| Prototype | prototype |
| Structural Part | structural_part |
| Decorative Object | decorative_object |
| Functional Part | functional_part |
| Unknown | unknown |

The category field contains the stored value.

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
    "settings": {},
    "confidenceScore": 0
  }
}
```

confidenceScore: 0 to 100 (PRINT_PRESETS_SPEC.md, Preset Structure).

---

# Print Preset Categories

Supported values (PRINT_PRESETS_SPEC.md, Preset Categories):

| Category | Stored Value |
|----------|--------------|
| Ultra Quality | ultra_quality |
| High Quality | high_quality |
| Balanced | balanced |
| Draft | draft |
| Fast Prototype | fast_prototype |
| Structural | structural |
| Functional | functional |
| Engineering | engineering |
| Flexible | flexible |
| Miniature | miniature |
| Vase | vase |
| Custom | custom |

The category field contains the stored value.

---

# Category Value Format

Classification categories and print preset categories are stored as lowercase snake_case values (for example structural_part, ultra_quality).

The same values are used in the source code, in WYPROJ files and in API payloads.

They are data values. NAMING_CONVENTIONS.md, Enum Values (PascalCase) applies to the members of TypeScript enums, not to stored values.

A display name is converted to its stored value by writing it in lowercase and replacing spaces with underscores.

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
    "infillDensity": 0,
    "infillPattern": "",
    "confidenceScore": 0
  }
}
```

Infill Settings:

infillDensity (percentage, 0 to 100) and infillPattern belong to the recommended profile, at the same level as quality.

They are not part of quality.

Export Values:

The target slicer export uses the values of the recommended profile (SLICER_EXPORT_SPEC.md, Settings Mapping).

The preset is the starting point of the recommendation (PRINT_PRESETS_SPEC.md, Golden Rule). The values of preset.settings are never exported.

When a value exists in the recommended profile and in preset.settings (for example infillDensity), the value of the recommended profile is exported.

---

# Recommendation Schema

```json
{
  "recommendation": {
    "recommendationId": "",
    "objectId": "",
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

Recommendation Status Values:

```text
generated = Generated from the current analysis of the object

outdated = The analysis of the object is outdated or was recomputed; must be regenerated
```



---



# Object Reference Rules

Reference: ADR-026

```text
1. Every analysis references exactly one object through objectId.

2. Every recommendation references exactly one object through objectId.

3. In the Project Schema, the key of each entry in analysis and recommendations equals the objectId of that entry.

4. Every objectId must exist in scene.objects.

5. recommendation.analysisId must reference the analysis of the same object.

6. Object Removal: when an object is removed from the scene, its analysis and its recommendation are removed.

7. Object Duplication: the copy receives a new objectId. The analysis and the recommendation of the original object are not copied. The copy has no analysis and no recommendation until it is analyzed.

8. Object Transformation: when the rotation or the scale of an object changes (Transform Schema), the status of its analysis and of its recommendation becomes outdated. A change of position alone does not change the status.

9. When the analysis of an object becomes outdated or is recomputed, the recommendation of the same object becomes outdated. A recomputed analysis keeps the analysisId of the object, so that rule 5 remains satisfied.

10. An outdated analysis or recommendation must be recomputed before any export. Export is blocked for an object whose recommendation is missing or outdated (SLICER_EXPORT_SPEC.md, error EXP_003).
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

   "units": "metric",

   "printer": {

     "defaultPrinter": null,

     "autoloadLastPrinter": true

   }

 }

}

```


printer (3.5.0, ADR-032, USER_SETTINGS_SPEC.md Printer Settings): defaultPrinter is the id of the last printer selected, or null when none was selected (null = not chosen yet, as for the selections of the Project Schema); when autoloadLastPrinter is true, this printer is selected again at startup. A defaultPrinter that is no longer in the printer database is ignored (no printer selected).


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
