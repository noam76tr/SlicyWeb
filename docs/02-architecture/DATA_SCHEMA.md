# DATA SCHEMA

Version: 3.10.1

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

Angle: degrees

Percentage: 0 to 100

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

Types (3.7.0, ADR-032, ADR-033): "printer" (data is a Printer Schema), "material" (data is a Complete Material Schema) and "filament" (data is a Filament Schema). Type "preset" (3.10.0, ADR-035 D4): data is a Print Preset Schema; the presets are shipped in data/presets/ (source Official) and are not synchronized in Phase 10. The files are written with validated false; the loader sets validated only after the schema validation.

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

 "brand": "",

 "description": "",

 "temperature": {},

 "cooling": {},

 "physical": {},

 "recommended": {}

}

```

Material rules (3.7.0, ADR-033):

```text
id, name, category, temperature, cooling, physical and recommended are required; no other field is accepted
brand and description are optional (Material Schema); a shipped material is a family and has no brand
id: lowercase letters, digits and "_" (as "pla")
category is the name of the family (as "PLA"): a name of the Material Families of MATERIAL_PROFILE_SPEC.md
temperature: minNozzle and maxNozzle, minBed and maxBed are numbers in degrees Celsius (min not above max), or null when not published; the four values are required (not null) for a shipped material
Each value of cooling (fanMin, fanMax, percent from 0 to 100), physical (density in g/cm3, shrinkage in percent, warpingRisk low, medium or high) and recommended (speeds in mm/s, retractionDistance in mm) is a number (or a warpingRisk value), or null when it is not published
null means not published, never 0; code that uses these values (recommendation, export, KI-008) handles null explicitly
```

Shipped materials (3.7.0, ADR-033 D2): the ranges of temperature of a shipped material are those of its shipped filaments (Filament Schema, temperature): the smallest minimum and the largest maximum. A single value (fanMin, fanMax, density, shrinkage, warpingRisk, recommended) is the value published by every shipped filament of the family that publishes it, or null when they differ or none publishes it.

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

  "temperature": {
    "minNozzle": 190,
    "maxNozzle": 230,
    "minBed": 35,
    "maxBed": 45
  },

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

Filament rules (3.7.0, ADR-033):

```text
All the fields above are required; no other field is accepted
id: lowercase letters, digits and "_" (as "bambu_pla_basic")
brand and name: the brand and the product line, as written by the manufacturer (as "Bambu Lab", "PLA Basic")
material is the family of the filament: the category of a material (as "PLA")
color is a name chosen by the user, or null; a shipped filament is a product line, its color is null
diameter in mm (1.75 or 2.85)
density (g/cm3) and pricePerKg are numbers, or null when not published; pricePerKg of a shipped filament is null (it depends on the country and the seller), the user gives it for their own filaments; its currency is the one of the user preferences
temperature has the structure of Material Thermal Properties: the ranges published by the manufacturer, in degrees Celsius; each value is a number, or null when not published; the four values are required (not null) for a shipped filament
manufacturerSettings has exactly these five fields: retractionDistance (mm), retractionSpeed (mm/s), fanSpeed (percent), nozzleTemperature and bedTemperature (degrees Celsius); each is a single value published by the manufacturer, or null (a range only is kept in temperature, never turned into a single value)
recommendedProfile stays {}: the recommendation of Phase 10 does not use it (ADR-035; the values of the filament come from temperature and manufacturerSettings)
null means not published, never 0
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

   "centerOfGravity": {

     "x": 0,

     "y": 0,

     "z": 0

   },

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

 "dimensions": {

   "width": 0,

   "depth": 0,

   "height": 0

 },

 "geometry": {},

 "mesh": {},

 "stability": {},

 "overhangs": {},

 "bridges": {},

 "thinWalls": {},

 "classification": null

}

```

Analysis Status Values:

```text
generated = Computed for the current geometry, rotation and scale of the object

outdated = The object was rotated or scaled after computation; must be recomputed
```

Analysis Rules (3.9.0, DECISIONS.md, ADR-034):

```text
Frame:
  the object as placed on the build plate: scale and rotation of the
  Transform Schema applied (Point on the plate = R · (S · point of the
  object)), position ignored; axes of the build plate (ADR-028); the lowest
  point of the object at Z = 0 (Placement on the plate)
  a change of position alone does not change the analysis (Object Reference
  Rules, rule 8)

Units:
  lengths mm, areas mm², volumes mm³, angles degrees, percentages 0 to 100

Numbers:
  every number is finite; every number is >= 0, except centerOfGravity x, y
  and z; mesh.vertices, mesh.triangles, bridges.count and riskScore are
  whole numbers;
  maxAngle is at most 90; percentage and riskScore are at most 100

Solid:
  the material is full and homogeneous (no infill at this stage)
```

Fields:

```text
dimensions.width, depth, height:
  size of the object on the build plate along X, Y and Z, in mm (bounding box
  of the placed object)

geometry.width, depth, height:
  the same values as dimensions (Known Duplication below)
geometry.volume:
  volume enclosed by the mesh after scale, in mm³
geometry.surfaceArea:
  sum of the areas of the triangles after scale, in mm²

mesh.triangles:
  number of triangles
mesh.vertices:
  number of distinct vertices (a position shared by several triangles is
  counted once)

stability.contactArea:
  area of the triangles lying on the build plate (facing down, the three
  vertices at Z <= 0.01 mm), in mm²; used for adhesion
stability.centerOfGravity {x, y, z}:
  center of gravity of the solid, relative to the center of the object
  (transform.position), along the axes of the build plate, in mm; it does not
  change when the object is moved
  when the enclosed volume is 0 (flat or open mesh), the center of the
  surface (area weighted) is used
stability.heightRatio:
  dimensions.height divided by the square root of the area of the contact
  hull; 0 when the area of the contact hull is 0
stability.riskScore:
  tip risk, 0 to 100: (heightRatio - 1) x 20, rounded to the nearest whole
  number and limited to 0 and 100; 100 when
  the center of gravity, seen from above, is outside the contact hull, or
  when the area of the contact hull is 0 (no contact, a point or a line)
  levels: AI_ENGINE_SPEC.md (0-20 very low, 21-40 low, 41-60 moderate,
  61-80 high, 81-100 critical)
contact hull (not stored):
  convex hull, seen from above, of the contact points: the vertices at
  Z <= 0.01 mm; an object on legs is stable when its center of gravity is
  inside the hull of its legs, even when its contactArea is small

overhangs (each triangle facing down, triangles lying on the build plate
excluded):
  angle of a triangle: measured from the vertical, 0 = vertical wall,
  90 = flat ceiling (SUPPORT_GENERATION_SPEC.md, Overhang Angle Thresholds)
  maxAngle: the largest angle, 0 when no triangle faces down
  percentage: area of the triangles beyond 45 degrees divided by
    geometry.surfaceArea, x 100
  detected: at least one triangle beyond 45 degrees

bridges:
  flat region: triangles facing down beyond 80 degrees, not lying on the
    build plate, joined by their edges
  support of a region: a part of its border where the next triangle goes
    down (a wall that carries it); a part where it goes up is a free edge
  bridge: a flat region with at least two separate supports; a region with
    one support is an overhang only
  count: number of bridges
  longestBridge: the largest span, in mm; the span of a bridge is the
    shortest distance between two of its supports; 0 when there is no bridge
  detected: count > 0

thinWalls:
  thickness at a point of the surface: distance from this point, towards the
    inside of the object, to the next face met
  minimumThickness: the smallest thickness measured (at most 200 000 points,
    spread over the surface in proportion to the area, the same points at
    each computation), in mm; 0 when no thickness can be measured (open or
    flat mesh)
  detected: minimumThickness below 0.8 mm (two lines of a 0.4 mm nozzle);
    false when no thickness can be measured; it does not depend on the
    selected printer (the comparison with the nozzle is a recommendation,
    RECOMMENDATION_RULES.md, Phase 10)

classification:
  null = not yet classified; otherwise the Object Classification Schema
  (3.10.0, ADR-035): computed with the analysis, in the same Web Worker
```

Known Duplication:

The width, depth and height of the object exist both in dimensions and in geometry. They always have the same values. This duplication is known and is kept: both fields come from the Complete Analysis Schema.

Mesh not closed: when an edge is shared by an odd number of triangles (1 or 3…), the analysis is still computed and stored; volume, center of gravity and thickness are then approximate, and the message ANA_002 (warning, non-blocking) is shown (ERROR_CODES_SPEC.md). An edge shared by 4, 6… triangles (parts touching along an edge) does not open the mesh: the volume stays reliable, and the information ANA_005 is shown in the Analysis section (3.10.1, lot 91, Noam 2026-11-08). An empty or unreadable mesh gives ANA_001 and no analysis.

Validation: AnalysisSchema (Zod) refuses any field that is not in this schema, in the analysis and in each of its parts.

Compatibility: a WYPROJ 3.0.0 file whose analysis has a classification object stays valid. No version of the application before 3.9.0 computed an analysis.

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
    "classificationVersion": "",
    "source": "automatic"
  }
}
```

category: stored value (Classification Categories).

classificationVersion: version of OBJECT_CLASSIFICATION_SPEC.md applied by the classification.

Classification Rules (3.10.0, DECISIONS.md, ADR-035 D2 and D3):

```text
source:
  automatic = category and confidenceScore computed from the geometry
              (OBJECT_CLASSIFICATION_SPEC.md 1.2.0, Category Rules)
  user      = category chosen by the user for this object
  a classification without source (WYPROJ 3.0.0 file written before 3.10.0)
  is read as automatic

confidenceScore:
  automatic: the confidence of the rule that matched, at most 75;
             0 for unknown
  user: 100

detectedFeatures:
  the measured geometric features, whatever the source, with the names of
  OBJECT_CLASSIFICATION_SPEC.md 1.2.0 (Geometric Features): small, large,
  tall, flat, planar, curved, holes, hollow, open_top, thin_walls; each name
  at most once, in this order

subcategory: "" (no list of subcategories is defined)
detectedTags: [] (no list of tags is defined)

A category chosen by the user is kept when the analysis of the object is
computed again (rotation, scale): only detectedFeatures is computed again.
It is not part of Undo / Redo (UNDO_REDO_SPEC.md). A duplicated object has
no analysis and no classification (Object Reference Rules, rule 7).
```

Compatibility: source is an added field; a WYPROJ 3.0.0 file stays valid, with or without it. No new version of the WYPROJ format.

The confidence level is not stored. It is computed from confidenceScore (OBJECT_CLASSIFICATION_SPEC.md, Confidence Levels).

Not yet classified (3.9.0, ADR-034): the classification of an analysis is null until the object is classified (from 3.10.0, the classification is computed with the analysis, ADR-035). recommendation.classification is the classification of the analysis used: a recommendation is not generated while the classification of the analysis is null (ERROR_CODES_SPEC.md, REC_002 Insufficient Data).


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

   "supportType": "tree",

   "adhesionType": "brim"

 }

}

```

Known Duplication (3.10.0): the Recommended Settings Schema repeats values of the Recommended Profile Schema (quality, infill, supports, adhesion) in a flat form. No module uses it: the recommendation, the WYPROJ files and the export use the Recommended Profile Schema only. This duplication is known; the Recommended Settings Schema is kept until a decision removes it.

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

Preset Settings (3.10.0, ADR-035 D4 and D5):

```json
{
  "settings": {
    "layerHeight": 0.2,
    "wallCount": 3,
    "topLayers": 5,
    "bottomLayers": 4,
    "infillDensity": 15,
    "infillPattern": "gyroid",
    "supportEnabled": false,
    "supportType": "tree",
    "adhesionType": "skirt",
    "printSpeed": 150
  }
}
```

```text
layerHeight in mm; wallCount, topLayers, bottomLayers whole numbers;
infillDensity percentage 0 to 100; printSpeed in mm/s
infillPattern: gyroid, lightning or cubic for the shipped presets
supportType: a Support Type value; it is used only when the geometry
  requires supports (RECOMMENDATION_RULES.md 1.1.0); supportEnabled is false
  for every shipped preset
adhesionType: none, skirt, brim or raft
no fan value: the fan comes from the filament or the material
  (RECOMMENDATION_RULES.md 1.1.0, Temperature And Cooling)
no other field is accepted (PresetSchema, strict)
values of the shipped presets: PRINT_PRESETS_SPEC.md 1.3.0, Preset Values;
their confidenceScore is 100
```

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
    "enabled": false,
    "type": "tree"
  }
}
```

Support Type values (3.10.0, ADR-035 D5 and D8):

```text
none      = no support
standard  = standard (grid or normal) supports
tree      = tree supports; the only name of the tree supports, also called
            organic supports (SUPPORT_GENERATION_SPEC.md 1.1.0); the
            translation per target slicer is done by the export
            (SLICER_EXPORT_SPEC.md, Enumerations)
```

enabled: true when the geometry requires supports (RECOMMENDATION_RULES.md 1.1.0, Supports And Adhesion). type: the supportType of the preset; none when enabled is false and the preset has no support type.

Compatibility (3.10.0, ADR-035 D8): the fields required, density and overhangThreshold were never written by the application and never accepted by the validation of the recommendations (RecommendationSchema validated enabled and type); the value organic was never produced in a file (no recommendation was ever generated before Phase 10). The schema follows the code; no new version of the WYPROJ format.

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
    "temperature": {},
    "infillDensity": 0,
    "infillPattern": "",
    "confidenceScore": 0
  }
}
```

Temperature Settings (3.10.0, ADR-035 D7):

```json
{
  "temperature": {
    "nozzle": 210,
    "bed": 40
  }
}
```

nozzle and bed: degrees Celsius, whole numbers, chosen by the recommendation (RECOMMENDATION_RULES.md 1.1.0, Temperature And Cooling). Both are required. They replace the missing values Nozzle temperature and Bed temperature of SLICER_EXPORT_SPEC.md (Required Data Model Extensions).

adhesion: none, skirt, brim or raft.

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

outdated = The analysis of the object is outdated or was recomputed, or the printer, the material, the filament or the category chosen for the object changed (Object Reference Rules, rules 9 and 11); must be regenerated
```

Recommendation Rules (3.10.0, ADR-035 D9 and D11):

```text
printerId, materialId: required; no recommendation is generated without a
  selected printer and a selected material (REC_002)
filamentId: the selected filament, or null when no filament is selected
  (the confidence is reduced, RECOMMENDATION_RULES.md 1.1.0)
classification: the classification of the analysis used (never null)
warnings: Warning Schema; source "recommendation"
confidenceScore: RECOMMENDATION_RULES.md 1.1.0, Confidence; equal to
  recommendedProfile.confidenceScore
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

11. Selection Change (3.10.0, ADR-035 D11): when the selected printer, material or filament changes, the recommendations of all the objects become outdated; when the category chosen for an object changes (classification.source), the recommendation of this object becomes outdated. They are generated again at once when an analysis up to date, a printer and a material exist; otherwise they stay outdated. The analyses do not change.
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

Recommendation warnings (3.10.0, ADR-035 D9): code is a code of RECOMMENDATION_RULES.md 1.1.0 (Recommendation Warnings); message is an English reference text, never shown (the interface shows the translation of the code); source is "recommendation"; recommendedAction is "" (no list of actions is defined). A code appears at most once in a recommendation.

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

Printer profile cache (3.6.0, ADR-032 D5): cache.json of the cache of the SlicyWeb profile repository (cache/printers/ of the user data folder) is this object. source is the repository (noam76tr/slicyweb-profiles), version is the tag of the profiles, checksum is the SHA-256 of their index.json (64 lowercase hexadecimal characters), createdAt is the date of the download and expiresAt the date of the next check (ISO 8601). An expired cache stays usable offline until the next successful check. The cache is used only when cache.json, index.json and each profile file are valid and unchanged.

Material and filament profile caches (3.8.0, ADR-033 D7): the same cache.json, in cache/materials/ and cache/filaments/ of the user data folder, each for its own list; the index.json of a cache is valid only with the type of its list (material-index or filament-index).

---

# Profile Repository Index Schema

index.json of the SlicyWeb profile repository noam76tr/slicyweb-profiles (3.6.0, ADR-032 D5), on its main branch. It names the published tag of the printer profiles and the SHA-256 of each profile file. The application ships a copy in data/printers/index.json, written by npm run profiles:index.

Materials and filaments (3.8.0, ADR-033 D7): the folders materials/ and filaments/ of the same repository each have their own index.json, of the same format, with the type "material-index" or "filament-index"; file is a file name of that folder, and the profile files are read at the tag in that folder. The application ships copies in data/materials/index.json and data/filaments/index.json (npm run profiles:index -- vX.Y.Z materials, or filaments). Each list has its own tag and is checked on its own: a list refused does not change the others. The printer index (root of the repository) does not change.

```json
{
  "type": "printer-index",
  "version": "1.0.0",
  "tag": "v1.0.0",
  "profiles": [
    {
      "file": "",
      "id": "",
      "sha256": ""
    }
  ]
}
```

Required fields:

```text
type
version
tag
profiles
profiles[].file
profiles[].id
profiles[].sha256
```

Rules:

```text
type is "printer-index" (root), "material-index" (materials/) or "filament-index" (filaments/), the type of the folder where it is read
version is the version of the index format
tag is the Git tag where the profile files are read: "v" and three numbers, vX.Y.Z (as v1.0.0); each number has 6 digits at most and no leading zero
profiles has 1 to 500 entries; no other field is accepted
file is a file name of the repository folder: letters, digits, "_" and "-", ending with .json; never index.json, never a folder
id is the id of the profile in this file
sha256 is the SHA-256 of the file, 64 lowercase hexadecimal characters
A file or an id is listed once
```

Version rule: tags are ordered by their three numbers (v1.0.10 is more recent than v1.0.9). The application uses the profiles of the repository only when their tag is the same as, or more recent than, the tag of its own copy (data/printers/index.json, data/materials/index.json or data/filaments/index.json): a list shipped with a new version of the application is never replaced by an older one.

The index is refused, and no profile is used, when one of these rules fails, when index.json and the profiles exceed 20 MB in all, when a file of the index cannot be read at the tag, or when a file differs from its sha256, fails the Repository Data Schema and the schema of its list (Printer Schema, Complete Material Schema or Filament Schema), is not of the type of the list or of source Official, or has another id.

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

     "autoloadLastPrinter": true,

     "autoCheckProfiles": true

   },

   "material": {

     "defaultMaterial": null,

     "defaultFilament": null,

     "autoloadLastMaterial": true

   }

 }

}

```


printer (3.5.0, ADR-032, USER_SETTINGS_SPEC.md Printer Settings): defaultPrinter is the id of the last printer selected, or null when none was selected (null = not chosen yet, as for the selections of the Project Schema); when autoloadLastPrinter is true, this printer is selected again at startup. A defaultPrinter that is no longer in the printer database is ignored (no printer selected).

material (3.7.0, ADR-033 D9, USER_SETTINGS_SPEC.md Material Settings): defaultMaterial is the id of the last material selected, or null; defaultFilament is the id of the last filament selected, or null; when autoloadLastMaterial is true, they are selected again at startup. An id that is no longer in the material or filament database is ignored (nothing selected). A settings.json without material loads with these defaults.

printer.autoCheckProfiles (3.6.0, ADR-032 D5, decision of Noam): boolean, true by default. When true, the SlicyWeb profile repository is checked at start, at most once every 24 hours; when false, it is checked only with Printer > Refresh Profiles. A settings.json without this field loads with true.


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
