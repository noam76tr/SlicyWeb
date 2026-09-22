# AI SMART SLICER

# GUI SPECIFICATION

Version: 2.0.0

Status: Approved

Priority: Critical

---



# Purpose



This document defines the complete graphical user interface of the AI Smart Slicer.



This specification serves as the reference for:



- Visual Design

- Layout

- Navigation

- User Experience

- Components

- Interaction Rules



The GUI should provide a familiar experience for users coming from:



- OrcaSlicer

- Bambu Studio

- PrusaSlicer

- Cura



while introducing a modern AI-assisted workflow.



---



# GUI Principles



The interface must be:



- Modern

- Fast

- Predictable

- Consistent

- Responsive

- Beginner Friendly

- Advanced User Friendly



---



# Design Priorities



Priority Order:



1. Clarity

2. Efficiency

3. Visibility

4. Accessibility

5. Aesthetics



---



# Visual Style



Theme:



Dark Theme default



Light Theme optional



System Theme optional



---



# Color Philosophy



Dark Theme:



```text

Background: #1E1E1E

Viewport: #252526

Panels: #2D2D30

Borders: #404040

Text: #FFFFFF

Accent: #4FA3FF

Warning: #FFB020

Error: #FF5A5A

Success: #27AE60

```



---



# Font



Primary Font:



```text

Inter

```



Fallback:



```text

Segoe UI

Roboto

Sans-serif

```



---



# Minimum Font Sizes



```text

Title       16px

Section     14px

Label       12px

Data        12px

Tooltip     11px

```



---



# Main Window



Layout:



```text

+--------------------------------------------------------+

| Menu Bar                                               |

+--------------------------------------------------------+

| Toolbar                                                 |

+--------------------------------------------------------+

| Object List |         3D Viewport      | Properties    |

|             |                          | Panel         |

|             |                          |               |

+--------------------------------------------------------+

| Notifications / Status Bar                              |

+--------------------------------------------------------+

```



---



# Window Areas



The application consists of:



```text

Menu Bar

Toolbar

Object Panel

Viewport

Properties Panel

Status Bar

```



---



# Menu Bar



Position:



Top



Always Visible



---



# File Menu



Functions:

```text

New Project

Open Project

Open WYPROJ

Save Project

Save As

Export WYPROJ

Import STL

Import 3MF

Close Project

Exit

```



---



# Edit Menu



Functions:



```text

Undo



Redo



Duplicate



Delete



Select All



Deselect All



Preferences

```



---



# View Menu



Functions:



```text

Perspective



Orthographic



Top



Bottom



Front



Back



Left



Right



Isometric



Reset View

```



---



# Printer Menu



Functions:



```text

Select Printer



Manage Printers



Refresh Profiles



Import Profile



Export Profile

```



---



# Material Menu



Functions:



```text

Select Material

Manage Materials

Import Material

Export Material

```


---

# Filament Menu

Functions:

```text
Select Filament

Manage Filaments

Import Filament

Export Filament
```
---

# Tools Menu


Functions:


```text

Analyze Models

Recompute Analysis

Generate Recommendations

Optimize Orientation

```



---

# Language Menu

Functions:

English
French
Hebrew

Managed By:
```text
- LanguageManager
- LocalizationService
- TranslationLoader
```

---

# Help Menu



Functions:


```text

Documentation

Release Notes

About

```



---



# Toolbar

Position:

Below Menu



---



# Toolbar Buttons



```text

Import



Save



Undo



Redo



Move



Rotate



Scale



Reset



Analyze



Optimize



Generate

```



---



# Object Panel



Position:



Left Side



Resizable



Collapsible



---



# Contents



List of all imported models.



Each item contains:



```text

Icon



Object Name



Visibility Toggle



Lock Toggle



Selection State

```



---



# Object Context Menu



Right Click



Options:



```text

Rename



Duplicate



Delete



Center On Bed



Hide



Show



Lock



Unlock

```



---



# Multi Selection



Supported.



Examples:



```text

CTRL + Click



SHIFT + Click

```



---



# 3D Viewport



Position:



Center



Largest interface area.



---



# Viewport Purpose



Display:



- Build Plate

- Objects

- Axes

- Grid

- Selection Indicators



---



# Build Plate



Must visually represent selected printer.



Dynamic sizing.



---



# Plate Display



Show:



```text

Build Width



Build Depth



Origin Point



Boundary Limits

```



---



# Axis Display



Visible at all times.



Colors:



```text

X = Red



Y = Green



Z = Blue

```



---



# Coordinate Grid



Always visible.



Adaptive spacing.



---



# Viewport Controls



Mouse:



```text

Middle Mouse = Pan



Wheel = Zoom



Right Mouse = Rotate Camera

```



---



# Camera Views



Buttons:



```text

Top



Bottom



Left



Right



Front



Back



Isometric

```



---



# Selection Visualization



Selected objects show:



```text

Selection Outline



Transform Gizmo



Bounding Box

```



---



# Object Gizmos



Move Gizmo



Rotate Gizmo



Scale Gizmo



---



# Move Gizmo



Axes:



```text

X



Y



Z

```



---



# Rotate Gizmo



Axes:



```text

X



Y



Z

```



Rotation may be:



```text

Free



Incremental

```



---



# Scale Gizmo



Modes:



```text

Uniform



Non Uniform

```



---



# Properties Panel



Position:



Right Side



Resizable



Collapsible



---



# Properties Sections


```text

Project

Printer

Material

Filament

Print Preset

Object

Transform

Analysis

Recommendations

```

---

# Project Section

Displays:

```text
Project Name
Project Version
Created Date
Last Saved
Project Format
Application
```

Format:

```text
WYPROJ
```

---

# Printer Section



Displays:



```text

Brand



Model



Build Volume



Nozzle



Printer Limits

```



---



# Printer Selector



Structure:



```text

Brand



&#x20;└─ Models

```



Example:



```text

Bambu Lab



&#x20;├─ X1C

&#x20;├─ P1S

&#x20;└─ A1



Prusa



&#x20;├─ MK4

&#x20;└─ XL

```



---



# Material Section



Displays:



```text

Material Name

Nozzle Temperature

Bed Temperature

Cooling

Speed Profile

```



---

# Filament Section

Displays:

```text
Filament Name

Brand

Color

Thermal Overrides

Cooling Overrides

Retraction Profile
```

---

# Print Preset Section

Displays:

```text
Draft

Balanced

Quality

Custom

Active Preset
```

---

# Transform Section



Displays:



```text

Position X

Position Y

Position Z



Rotation X

Rotation Y

Rotation Z



Scale X

Scale Y

Scale Z

```



---



# Transform Actions



Buttons:



```text

Reset Position



Reset Rotation



Reset Scale



Center On Bed

```



---



# Analysis Section



Displays:



```text

Dimensions



Volume



Surface Area



Mesh Statistics



Overhangs



Bridges



Thin Walls



Stability

```



---



# Recommendation Section



Displays:



```text

Recommended Quality

Supports

Infill

Cooling

Retraction

Speed

Warnings

Confidence Score

Recommended Preset

```



---



# Notification Area



Position:



Bottom



---



# Notification Types



```text

Information



Success



Warning



Error

```



---



# Status Bar



Displays:



```text

Selected Printer

Selected Material

Selected Object

Object Count

Analysis Status

Selected Filament

Active Preset

Current Language

Project Status
```



---



# Search System

Printer Search

Material Search

Object Search

Filament Search

Preset Search

---



# Drag And Drop



Supported

Files can be dropped directly inside viewport.

Accepted:


```text

STL

3MF

WYPROJ
```



---



# Keyboard Shortcuts



---



## Project



```text

CTRL + N     New Project



CTRL + O     Open Project



CTRL + S     Save Project

```



---



## Edit



```text

CTRL + Z     Undo



CTRL + Y     Redo



DELETE       Delete Object

```



---



## Selection



```text

CTRL + A     Select All



ESC          Deselect

```



---



## View



```text

F            Focus Selection



HOME         Reset Camera

```



---



## Transform



```text

G            Move



R            Rotate



S            Scale

```



---



# AI Assistant Panel



Future Feature



Position:



Right Side



Optional



---



# AI Assistant Displays



```text

Warnings

Recommendations

Optimization Suggestions

Printability Advice

Confidence Score

Recommended Filament

Recommended Preset
```



---



# Responsive Behavior



Panels may:



```text

Collapse



Resize



Hide

```



Layout should remain functional at:



```text

1280x720



1920x1080



2560x1440



3840x2160

```



---



# Error Handling UI



Display clear messages:



Examples:



```text

Invalid STL



Corrupted File



Unsupported Format



Profile Load Failure



Analysis Failure

```



No technical stack traces visible to user.



---



# Accessibility



Support:



```text

Keyboard Navigation

High Contrast Theme

Scalable Fonts

Color Safe Warnings

RTL Language Support

```



---

# Localization Support

Supported Languages:

English
French
Hebrew

Translation Source:

```text
public/locales/
```

Files:
```text
- en.json
- fr.json
- he.json
```

Managed By:

```text
LanguageManager
LocalizationService
TranslationLoader
```

---

# Future GUI Features



Reserved:



```text

Slicing Preview

G-Code Viewer

Remote Printers

Camera Monitoring

Multi Material Visualization

Cloud Projects

Filament Manager

Preset Library

Profile Repository Browser

```



---



# GUI Golden Rules



1\. The viewport is the primary focus.



2\. Important information must remain visible.



3\. User actions should require the minimum number of clicks.



4\. Every action should provide visual feedback.



5\. Changes must never surprise the user.



6\. Advanced options should be available without overwhelming beginners.



7\. AI recommendations should assist, not replace, user decisions.



---



# End Of Document

