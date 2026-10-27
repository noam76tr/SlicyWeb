# SlicyWeb Smart Slicer

# PRINTER PROFILE SPECIFICATION

Version: 2.0.0

Status: Approved

Priority: High

---



# Purpose



This document defines the complete structure of printer profiles used by the SlicyWeb Smart Slicer.



All printer profiles must comply with this specification.



# Alignment With DATA_SCHEMA.md (2.0.0)



DATA_SCHEMA.md (priority 0) is the source of truth for the fields of a printer (Printer Schema, flat structure). This specification follows it (ADR-032):

- A printer profile has the fields of the Complete Printer Schema of DATA_SCHEMA.md: id, brand, model, series, manufacturer, firmware, releaseDate, supported, buildVolume, defaultNozzle, supportedNozzles, motion, thermal, cooling, extruder, supportedMaterials, supportedFilaments.
- Names of DATA_SCHEMA.md: cooling.partFan, auxFan, chamberFan; extruder.type direct_drive, bowden or unknown; extruder.count.
- A value of motion or thermal not published by the manufacturer is null (unknown), never 0.
- A profile file is a Repository Data Schema envelope (id, type "printer", version of the profile, source, data, validated); data is the printer.
- The sections of this document without a field in DATA_SCHEMA.md (nested structure of Profile Structure, bedShape, bedSurface, origin, kinematics, filamentDiameter, heatedChamber, sensors, features, limits, power, multiMaterial, remote, source, profileVersion, verified) are future: they are not part of a profile until DATA_SCHEMA.md defines them. Until then, the build plate is rectangular, with its origin at the center (ADR-028).
- Sources: the profiles of SlicyWeb are written from the pages of the manufacturers, never copied from a profile file of a slicer (ADR-032). Source types used: Official (the SlicyWeb repository noam76tr/slicyweb-profiles, and its offline fallback copy in data/printers/) and Local Custom (printers entered by the user). Community sources are not used.
- Loading (ADR-032, D4): the main process loads the files of data/printers/ (source Official) and of the printers/ folder of the user data folder (source Local Custom); a file whose source is not the one of its folder, or whose id is already loaded, is refused (PRN_002). A printer of the user never replaces an Official printer.
- Printers entered by the user (Phase 7 lot 61): the Printer Manager (GUI_SPEC.md) adds, changes and removes them through printer:add, printer:update and printer:remove. The main process writes one file per printer in the printers/ folder of the user data folder: a Repository Data Schema envelope with source Local Custom, version 1.0.0, validated false; the id of a new printer is chosen by the main process (user_ + random UUID) and never changes. Official printers are never changed; a printer of the user may be a copy of an Official printer. A value not entered is null (unknown).



The objective is to provide:



- Consistency

- Validation

- Compatibility

- Reliable Recommendations

- Accurate Limit Detection



This specification is mandatory.



---



# Profile Objectives



A printer profile must describe:



- Physical dimensions

- Motion capabilities

- Thermal capabilities

- Extrusion capabilities

- Cooling capabilities

- Supported materials



The profile must allow the AI Engine to generate accurate recommendations.



---



# Profile Categories



Supported Categories:



```text

Consumer FDM



Prosumer FDM



Industrial FDM



Delta FDM



CoreXY



Cartesian



Custom Machines

```



---



# Profile Structure



```json

{
  
 "metadata": {},
  
 "buildVolume": {},
  
 "motion": {},
  
 "extrusion": {},
  
 "nozzle": {},
 
 "thermal": {},
  
 "cooling": {},
  
 "sensors": {},
  
 "supportedMaterials": [],
  
 "limits": {},
  
 "features": {},
  
 "power": {},
  
 "multiMaterial": {},
  
 "remote": {},
  
 "source": {}
}

```



---



# Metadata Section



Purpose:



Identify the printer.



---



## Metadata Schema



```json

{

 "id": "",

 "brand": "",

 "model": "",

 "series": "",

 "manufacturer": "",

 "firmware": "",

 "releaseDate": "",

 "supported": true,

 "verified": true

}

```



---



# Example



```json

{

 "id": "bambu_x1c",

 "brand": "Bambu Lab",

 "model": "X1 Carbon",

 "series": "X1",

 "supported": true

}

```



---



# Build Volume Section



Purpose:



Define printable space.



---



## Schema



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



# Units



```text

millimeters (mm)

```



---



# Plate Shape



Supported:



```text

rectangular

round

custom

```



---



## Schema



```json

{

 "bedShape": "rectangular"

}

```



---



# Plate Surface



Examples:



```text

PEI Smooth



PEI Textured



Glass



Garolite



Engineering Plate



Unknown

```



---



## Schema



```json

{

 "bedSurface": "PEI Textured"

}

```



---



# Motion System



Purpose:



Defines movement capabilities.



---



## Motion Schema



```json

{

 "motion": {

   "kinematics": "",

   "maxPrintSpeed": 0,

   "maxTravelSpeed": 0,

   "maxAcceleration": 0,

   "maxJerk": 0

 }

}

```



---



# Supported Kinematics



```text

Cartesian



CoreXY



Delta



Polar



Custom

```



---



# Motion Validation



Values must be positive.



Negative values are invalid.



---



# Extrusion System



Purpose:



Defines filament delivery system.



---



## Schema



```json

{

 "extrusion": {

   "type": "",

   "extruderCount": 1,

   "filamentDiameter": 1.75

 }

}

```



---



# Extruder Types



```text

Direct Drive



Bowden



Hybrid

```



---



# Multi Extruder Support



```json

{

 "extruderCount": 2

}

```



Allowed for future versions.



---



# Supported Filament Diameter



Allowed Values:



```text

1.75 mm



2.85 mm

```



---



# Nozzle Configuration



Purpose:



Defines nozzle support.



---



## Schema



```json

{

 "nozzle": {

   "defaultSize": 0.4,

   "supportedSizes": [

     0.2,

     0.4,

     0.6,

     0.8

   ]

 }

}

```



---



# Validation



Nozzle Size must be:



```text

> 0

```



---



# Thermal System



Purpose:



Defines heating capabilities.



---



## Schema



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



# Chamber Support



```json

{

 "heatedChamber": true

}

```



---



# Supported Values



```text

true



false

```



---



# Cooling System



Purpose:



Defines available cooling.



---



## Schema



```json

{

 "cooling": {

   "partCoolingFan": true,

   "auxCoolingFan": false,

   "chamberFan": false

 }

}

```



---



# Sensor System



Purpose:



Detect printer capabilities.



---



## Schema



```json

{

 "sensors": {

   "filamentRunout": true,

   "powerLossRecovery": true,

   "autoBedLeveling": true,

   "camera": false,

   "lidar": false

 }

}

```



---



# Supported Materials



Purpose:



Declare officially supported materials.



---



## Schema



```json

{

 "supportedMaterials": [

   "PLA",

   "PETG",

   "ABS",

   "ASA"

 ]

}

```



---



# Unsupported Material Behavior



If material is not declared:



```text

Allowed



But Warning Generated

```



---



# Hardware Features



Purpose:



Advanced capabilities.



---



## Schema



```json

{

 "features": {

   "inputShaping": true,

   "pressureAdvance": true,

   "wifi": true,

   "ethernet": false

 }

}

```



---



# Mechanical Limits



Purpose:



Protect recommendations.



---



## Schema



```json

{

 "limits": {

   "maxSafePrintSpeed": 250,

   "maxSafeAcceleration": 10000,

   "maxSafeFlowRate": 25

 }

}

```



---



# AI Recommendation Limits



The AI Engine must never exceed:



```text

Safe Speed



Safe Acceleration



Safe Temperature



Build Volume

```



even if hardware maximum is higher.



---



# Power Specifications



Optional



---



## Schema



```json

{

 "power": {

   "voltage": 220,

   "averageConsumption": 250

 }

}

```



---



# Energy Estimation Usage



Used by:



```text

Cost Engine

```



For electricity calculations.



---



# Build Plate Origin



Supported Modes



```text

Center



Front Left



Custom

```



---



## Schema



```json

{

 "origin": "Center"

}

```



---



# Multi Material Support



Reserved



---



## Schema



```json

{

 "multiMaterial": {

   "supported": true,

   "maxMaterials": 4

 }

}

```



---



# Remote Features



Reserved



---



## Schema



```json

{

 "remote": {

   "supported": true,

   "apiAvailable": true

 }

}

```



---



# Validation Rules



Every profile must contain:



```text

Metadata

Build Volume

Motion

Extrusion

Nozzle

Thermal

```



---



# Invalid Profile Conditions



Missing:



```text

Brand



Model



Build Volume



Nozzle



Thermal Limits

```



Profile becomes invalid.



---



# Warning Conditions



Generate warnings if:



```text

Unknown Nozzle Size



Unknown Thermal Limits



Unknown Motion Limits



Unknown Material Support

```



---



# Confidence Impact



Complete Profile



↓



Higher Confidence Score



---



Incomplete Profile



↓



Lower Confidence Score



---



# Profile Source Types



Supported Sources



```text

Official



Verified Repository



Community



Local Custom

```



---



## Schema



```json

{

 "source": {

   "type": "Official",

   "url": ""

 }

}

```



---



# Source Priority



AI uses:



```text

Official



↓



Verified Repository



↓



Community



↓



Custom

```



---



# Profile Versioning



Schema



```json

{

 "profileVersion": "1.0.0"

}

```



---



# Backward Compatibility



Existing fields must never be removed.



New fields should be added.



Breaking changes require:



```text

Schema Revision



Changelog Update



Migration Documentation

```



---



# Example Complete Printer



```json

{

 "metadata": {

   "brand": "Bambu Lab",

   "model": "X1 Carbon"

 },



 "buildVolume": {

   "x": 256,

   "y": 256,

   "z": 256

 },



 "nozzle": {

   "defaultSize": 0.4

 },



 "thermal": {

   "maxNozzleTemp": 300,

   "maxBedTemp": 120

 }

}

```



---



# Golden Rule



A printer profile must describe the real capabilities and limits of the machine.



The AI must adapt to the printer.



The printer must never be adapted to fit an AI recommendation.



---



# End Of Document
