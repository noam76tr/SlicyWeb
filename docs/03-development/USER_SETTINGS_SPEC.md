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

    "defaultPrinter": null,

    "autoloadLastPrinter": true,

    "autoCheckProfiles": true

  }

}

```



defaultPrinter: id of the last printer selected, or null (none selected yet). With autoloadLastPrinter true, this printer is selected again at startup (Phase 7, ADR-032; DATA_SCHEMA.md, User Preferences Schema).

autoCheckProfiles: "Check for profile updates automatically", true by default (Phase 7 lot 62, DATA_SCHEMA.md 3.6.0). When true, the SlicyWeb profile repository is checked at start, in the background, at most once every 24 hours. When false, it is checked only with Printer > Refresh Profiles. The setting is a check box in the Printer section (GUI_SPEC.md), until a Preferences window exists.



---



# Material Settings



```json

{

  "material": {

    "defaultMaterial": null,

    "defaultFilament": null,

    "autoloadLastMaterial": true

  }

}

```

defaultMaterial: id of the last material (family) selected, or null (none selected yet). defaultFilament: id of the last filament selected, or null. With autoloadLastMaterial true, they are selected again at startup (Phase 8, ADR-033 D9; DATA_SCHEMA.md 3.7.0, User Preferences Schema). An id no longer in the database is ignored.



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

Location: the user data folder of the application (Electron app.getPath("userData"); on Windows: %APPDATA%\SlicyWeb\settings.json).

Content (DATA_SCHEMA.md, User Preferences Schema):

```json
{
  "preferences": {
    "theme": "dark",
    "language": "en",
    "units": "metric"
  }
}
```

Read and written by src/storage/SettingsStorage.ts, through StorageService and SettingsIPC (API_SPEC.md, SettingsIPC Channels).

Reading rules:

```text
Missing or unreadable file: default preferences (ApplicationConstants)
Invalid field: default value for that field, valid fields kept
Other top-level entries: kept when the file is written
```

The language choice is saved at each change and restored at the next start.

---



# Backward Compatibility



Old settings must migrate automatically.

A settings.json without printer (written before DATA_SCHEMA.md 3.5.0) loads without error: theme, language and units are kept, printer takes its default value (defaultPrinter null, autoloadLastPrinter true, autoCheckProfiles true). A printer without autoCheckProfiles (written before DATA_SCHEMA.md 3.6.0) keeps its other fields, with autoCheckProfiles true. A settings.json without material (written before DATA_SCHEMA.md 3.7.0) loads in the same way, with defaultMaterial null, defaultFilament null and autoloadLastMaterial true. An invalid field takes its default value; the other fields are kept.



---



# Golden Rule



User settings must never corrupt a project.



---



# End Of Document

