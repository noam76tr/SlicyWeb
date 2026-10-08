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

  "language": "en",

  "theme": "dark",

  "units": "metric"

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

  "gui": {

    "rememberLayout": true,

    "showTooltips": true,

    "showStatusBar": true

  }

}

```



---



# Viewport Settings



```json

{

  "viewport": {

    "showGrid": true,

    "showAxes": true,

    "showBuildVolume": true,

    "showBoundingBoxes": true

  }

}

```



---



# Camera Settings



```json

{

  "camera": {

    "invertZoom": false,

    "invertRotation": false,

    "defaultView": "isometric"

  }

}

```



---



# Printer Settings



```json

{

  "printer": {

    "defaultPrinter": "",

    "autoloadLastPrinter": true

  }

}

```



---



# Material Settings



```json

{

  "material": {

    "defaultMaterial": "PLA",

    "autoloadLastMaterial": true

  }

}

```



---



# AI Settings



```json

{

  "ai": {

    "autoAnalyze": true,

    "autoRecommend": true,

    "showWarnings": true

  }

}

```



---



# Performance Settings



```json

{

  "performance": {

    "enableCaching": true,

    "maxMemoryMB": 4096,

    "enableBVH": true

  }

}

```



---



# File Settings



```json

{

  "files": {

    "recentProjects": 20

  }

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

