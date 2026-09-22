# AI SMART SLICER

# PRINTER PROFILE SPECIFICATION

Version: 1.0.0

Status: Approved

Priority: High

---



\# Purpose



This document defines the complete structure of printer profiles used by the AI Smart Slicer.



All printer profiles must comply with this specification.



The objective is to provide:



\- Consistency

\- Validation

\- Compatibility

\- Reliable Recommendations

\- Accurate Limit Detection



This specification is mandatory.



\---



\# Profile Objectives



A printer profile must describe:



\- Physical dimensions

\- Motion capabilities

\- Thermal capabilities

\- Extrusion capabilities

\- Cooling capabilities

\- Supported materials



The profile must allow the AI Engine to generate accurate recommendations.



\---



\# Profile Categories



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



\---



\# Profile Structure



```json

{
  
&#x20; "metadata": {},
  
&#x20; "buildVolume": {},
  
&#x20; "motion": {},
  
&#x20; "extrusion": {},
  
&#x20; "nozzle": {},
 
&#x20; "thermal": {},
  
&#x20; "cooling": {},
  
&#x20; "sensors": {},
  
&#x20; "supportedMaterials": [],
  
&#x20; "limits": {},
  
&#x20; "features": {},
  
&#x20; "power": {},
  
&#x20; "multiMaterial": {},
  
&#x20; "remote": {},
  
&#x20; "source": {}
}

```



\---



\# Metadata Section



Purpose:



Identify the printer.



\---



\## Metadata Schema



```json

{

&#x20; "id": "",

&#x20; "brand": "",

&#x20; "model": "",

&#x20; "series": "",

&#x20; "manufacturer": "",

&#x20; "firmware": "",

&#x20; "releaseDate": "",

&#x20; "supported": true,

&#x20; "verified": true

}

```



\---



\# Example



```json

{

&#x20; "id": "bambu\_x1c",

&#x20; "brand": "Bambu Lab",

&#x20; "model": "X1 Carbon",

&#x20; "series": "X1",

&#x20; "supported": true

}

```



\---



\# Build Volume Section



Purpose:



Define printable space.



\---



\## Schema



```json

{

&#x20; "buildVolume": {

&#x20;   "x": 256,

&#x20;   "y": 256,

&#x20;   "z": 256

&#x20; }

}

```



\---



\# Units



```text

millimeters (mm)

```



\---



\# Plate Shape



Supported:



```text

rectangular

round

custom

```



\---



\## Schema



```json

{

&#x20; "bedShape": "rectangular"

}

```



\---



\# Plate Surface



Examples:



```text

PEI Smooth



PEI Textured



Glass



Garolite



Engineering Plate



Unknown

```



\---



\## Schema



```json

{

&#x20; "bedSurface": "PEI Textured"

}

```



\---



\# Motion System



Purpose:



Defines movement capabilities.



\---



\## Motion Schema



```json

{

&#x20; "motion": {

&#x20;   "kinematics": "",

&#x20;   "maxPrintSpeed": 0,

&#x20;   "maxTravelSpeed": 0,

&#x20;   "maxAcceleration": 0,

&#x20;   "maxJerk": 0

&#x20; }

}

```



\---



\# Supported Kinematics



```text

Cartesian



CoreXY



Delta



Polar



Custom

```



\---



\# Motion Validation



Values must be positive.



Negative values are invalid.



\---



\# Extrusion System



Purpose:



Defines filament delivery system.



\---



\## Schema



```json

{

&#x20; "extrusion": {

&#x20;   "type": "",

&#x20;   "extruderCount": 1,

&#x20;   "filamentDiameter": 1.75

&#x20; }

}

```



\---



\# Extruder Types



```text

Direct Drive



Bowden



Hybrid

```



\---



\# Multi Extruder Support



```json

{

&#x20; "extruderCount": 2

}

```



Allowed for future versions.



\---



\# Supported Filament Diameter



Allowed Values:



```text

1.75 mm



2.85 mm

```



\---



\# Nozzle Configuration



Purpose:



Defines nozzle support.



\---



\## Schema



```json

{

&#x20; "nozzle": {

&#x20;   "defaultSize": 0.4,

&#x20;   "supportedSizes": \[

&#x20;     0.2,

&#x20;     0.4,

&#x20;     0.6,

&#x20;     0.8

&#x20;   ]

&#x20; }

}

```



\---



\# Validation



Nozzle Size must be:



```text

> 0

```



\---



\# Thermal System



Purpose:



Defines heating capabilities.



\---



\## Schema



```json

{

&#x20; "thermal": {

&#x20;   "maxNozzleTemp": 300,

&#x20;   "maxBedTemp": 110,

&#x20;   "maxChamberTemp": 60

&#x20; }

}

```



\---



\# Chamber Support



```json

{

&#x20; "heatedChamber": true

}

```



\---



\# Supported Values



```text

true



false

```



\---



\# Cooling System



Purpose:



Defines available cooling.



\---



\## Schema



```json

{

&#x20; "cooling": {

&#x20;   "partCoolingFan": true,

&#x20;   "auxCoolingFan": false,

&#x20;   "chamberFan": false

&#x20; }

}

```



\---



\# Sensor System



Purpose:



Detect printer capabilities.



\---



\## Schema



```json

{

&#x20; "sensors": {

&#x20;   "filamentRunout": true,

&#x20;   "powerLossRecovery": true,

&#x20;   "autoBedLeveling": true,

&#x20;   "camera": false,

&#x20;   "lidar": false

&#x20; }

}

```



\---



\# Supported Materials



Purpose:



Declare officially supported materials.



\---



\## Schema



```json

{

&#x20; "supportedMaterials": \[

&#x20;   "PLA",

&#x20;   "PETG",

&#x20;   "ABS",

&#x20;   "ASA"

&#x20; ]

}

```



\---



\# Unsupported Material Behavior



If material is not declared:



```text

Allowed



But Warning Generated

```



\---



\# Hardware Features



Purpose:



Advanced capabilities.



\---



\## Schema



```json

{

&#x20; "features": {

&#x20;   "inputShaping": true,

&#x20;   "pressureAdvance": true,

&#x20;   "wifi": true,

&#x20;   "ethernet": false

&#x20; }

}

```



\---



\# Mechanical Limits



Purpose:



Protect recommendations.



\---



\## Schema



```json

{

&#x20; "limits": {

&#x20;   "maxSafePrintSpeed": 250,

&#x20;   "maxSafeAcceleration": 10000,

&#x20;   "maxSafeFlowRate": 25

&#x20; }

}

```



\---



\# AI Recommendation Limits



The AI Engine must never exceed:



```text

Safe Speed



Safe Acceleration



Safe Temperature



Build Volume

```



even if hardware maximum is higher.



\---



\# Power Specifications



Optional



\---



\## Schema



```json

{

&#x20; "power": {

&#x20;   "voltage": 220,

&#x20;   "averageConsumption": 250

&#x20; }

}

```



\---



\# Energy Estimation Usage



Used by:



```text

Cost Engine

```



For electricity calculations.



\---



\# Build Plate Origin



Supported Modes



```text

Center



Front Left



Custom

```



\---



\## Schema



```json

{

&#x20; "origin": "Center"

}

```



\---



\# Multi Material Support



Reserved



\---



\## Schema



```json

{

&#x20; "multiMaterial": {

&#x20;   "supported": true,

&#x20;   "maxMaterials": 4

&#x20; }

}

```



\---



\# Remote Features



Reserved



\---



\## Schema



```json

{

&#x20; "remote": {

&#x20;   "supported": true,

&#x20;   "apiAvailable": true

&#x20; }

}

```



\---



\# Validation Rules



Every profile must contain:



```text

Metadata

Build Volume

Motion

Extrusion

Nozzle

Thermal

```



\---



\# Invalid Profile Conditions



Missing:



```text

Brand



Model



Build Volume



Nozzle



Thermal Limits

```



Profile becomes invalid.



\---



\# Warning Conditions



Generate warnings if:



```text

Unknown Nozzle Size



Unknown Thermal Limits



Unknown Motion Limits



Unknown Material Support

```



\---



\# Confidence Impact



Complete Profile



↓



Higher Confidence Score



\---



Incomplete Profile



↓



Lower Confidence Score



\---



\# Profile Source Types



Supported Sources



```text

Official



Verified Repository



Community



Local Custom

```



\---



\## Schema



```json

{

&#x20; "source": {

&#x20;   "type": "Official",

&#x20;   "url": ""

&#x20; }

}

```



\---



\# Source Priority



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



\---



\# Profile Versioning



Schema



```json

{

&#x20; "profileVersion": "1.0.0"

}

```



\---



\# Backward Compatibility



Existing fields must never be removed.



New fields should be added.



Breaking changes require:



```text

Schema Revision



Changelog Update



Migration Documentation

```



\---



\# Example Complete Printer



```json

{

&#x20; "metadata": {

&#x20;   "brand": "Bambu Lab",

&#x20;   "model": "X1 Carbon"

&#x20; },



&#x20; "buildVolume": {

&#x20;   "x": 256,

&#x20;   "y": 256,

&#x20;   "z": 256

&#x20; },



&#x20; "nozzle": {

&#x20;   "defaultSize": 0.4

&#x20; },



&#x20; "thermal": {

&#x20;   "maxNozzleTemp": 300,

&#x20;   "maxBedTemp": 120

&#x20; }

}

```



\---



\# Golden Rule



A printer profile must describe the real capabilities and limits of the machine.



The AI must adapt to the printer.



The printer must never be adapted to fit an AI recommendation.



\---



\# End Of Document

