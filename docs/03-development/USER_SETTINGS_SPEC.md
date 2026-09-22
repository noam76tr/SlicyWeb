# SlicyWeb SMART SLICER

# USER SETTINGS SPECIFICATION


Version: 2.0.0

Status: Approved

Priority: High


---



# Purpose



Defines all user preferences and application settings.



Provides:



- User customization

- Persistent preferences

- UI configuration

- AI behavior preferences

- Workspace restoration



---



# Settings Categories



```text

General

GUI

Viewport

Printer

Material

AI

Performance

Files

Shortcuts

Advanced

```



---



# General Settings



```json

{

&#x20; "language": "en",

&#x20; "theme": "dark",

&#x20; "units": "metric"

}

```


Supported Values:

```text
en
fr
he
```

---

# Project Settings

```json
{
  "project": {
    "autoSave": true,
    "autoSaveInterval": 300,
    "restoreLastSession": true
  }
}
```

Used By:

```text
ProjectManager
RecoveryManager
AutoSaveService
SessionRestorer
```
---

# Supported Languages

```text
English

French

Hebrew
```

---

# Internationalization

Language management is handled by:

```text
LanguageManager
LocalizationService
TranslationLoader
```

Requirements:

```text
No hardcoded UI text
Externalized translations
Language-neutral project files
Runtime language switching
```

---

# Theme Modes



```text

Dark

Light

System

```



---



# GUI Settings



```json

{

&#x20; "gui": {

&#x20;   "rememberLayout": true,

&#x20;   "showTooltips": true,

&#x20;   "showStatusBar": true

&#x20; }

}

```



---



# Viewport Settings



```json

{

&#x20; "viewport": {

&#x20;   "showGrid": true,

&#x20;   "showAxes": true,

&#x20;   "showBuildVolume": true,

&#x20;   "showBoundingBoxes": true

&#x20; }

}

```



---



# Camera Settings



```json

{

&#x20; "camera": {

&#x20;   "invertZoom": false,

&#x20;   "invertRotation": false,

&#x20;   "defaultView": "isometric"

&#x20; }

}

```



---



# Printer Settings



```json

{

&#x20; "printer": {

&#x20;   "defaultPrinter": "",

&#x20;   "autoloadLastPrinter": true

&#x20; }

}

```



---



# Material Settings



```json

{

&#x20; "material": {

&#x20;   "defaultMaterial": "PLA",

&#x20;   "autoloadLastMaterial": true

&#x20; }

}

```



---



# AI Settings



```json

{

&#x20; "ai": {

&#x20;   "autoAnalyze": true,

&#x20;   "autoRecommend": true,

&#x20;   "showWarnings": true

&#x20; }

}

```



---



# Performance Settings



```json

{

&#x20; "performance": {

&#x20;   "enableCaching": true,

&#x20;   "maxMemoryMB": 4096,

&#x20;   "enableBVH": true

&#x20; }

}

```



---



# File Settings



```json

{

&#x20; "files": {

&#x20;   "recentProjects": 20

&#x20; }

}

```



---



# Keyboard Shortcuts



Customizable.



---



# Storage Location



```text

settings.json

```

Stored separately from WYPROJ project files.
User settings must not alter project data.

---



# Backward Compatibility



Old settings must migrate automatically.



---



# Golden Rule



User settings must never corrupt a project.



---



# End Of Document

