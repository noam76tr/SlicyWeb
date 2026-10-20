# SlicyWeb Smart Slicer

# GUI SPECIFICATION

Version: 2.0.0

Status: Approved

Priority: Critical

---



# Purpose



This document defines the complete graphical user interface of the SlicyWeb Smart Slicer.



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



Hebrew Characters:

```text
Noto Sans Hebrew
```

Inter has no Hebrew glyphs. Noto Sans Hebrew follows Inter in the font stack, so Hebrew text keeps a consistent rendering while Latin text stays in Inter.

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

Undo and Redo (Phase 6) undo and redo the last change of transform; they are disabled while their history is empty (UNDO_REDO_SPEC.md).



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



Reset



Analyze



Optimize



Generate

```

Undo and Redo (Phase 6) undo and redo the last change of transform, disabled while their history is empty (UNDO_REDO_SPEC.md). Move, Rotate and Scale are not in the toolbar: they are shown over the 3D viewport only, at the top on the start side (decision of Noam, Phase 6). They choose the mode of the gizmo of the selected object (Move by default, shortcuts G, R, S); the active button is highlighted. They are active only when an object is selected, and grayed out otherwise.



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

Phase 6 (decisions of Noam):

- CTRL + Click (CMD + Click on macOS) on an object, in the 3D viewport or in the Object Panel, adds it to the selection or removes it; CTRL + A selects all the objects; a click in the empty space clears the selection; a click (without CTRL) on an object selects this object only.
- SHIFT + Click and the selection with a rectangle are not available yet (KI-022).
- Several objects selected form a group: the selected objects are shown in the accent color, the gizmo is placed at the center of the group (center of the bounding box of the objects), and dragging one of them moves the whole group.
- The group moves, turns (around its center) and scales (always uniformly, around its center); after a rotation or a scale, each object is placed back on the plate. A change of the group is one action of the undo history.
- The Object section shows the number of objects selected; the Transform section acts on the group (Transform Section).



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

No printer selected: no build plate is shown. The grid covers a default workspace of 400 x 400 mm, centered on the origin.

Coordinate system (ADR-028): millimeters, X to the right, Y to the back, Z up; origin at the center of the build plate, Z = 0 on the plate surface.



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

Left mouse (objects):

- a click on an object selects it; a click in the empty space clears the selection;
- pressing on an object and dragging moves it on the build plate (X, Y), as in Bambu Studio and OrcaSlicer;
- the move starts only after 4 pixels: a selection click never moves the object, and a drag that starts in the empty space keeps the selection;
- a press on a handle of the gizmo is left to the gizmo.



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

The gizmo moves the object along X and Y only: the object always stands on the build plate (Position Z is computed, Transform Section).



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

Free by default; with Shift held, by steps of 15 degrees.
The gizmo shows three rings, one per axis of the build plate. As in Bambu Studio and OrcaSlicer, during the gesture the object turns freely around its center (it may go under the plate for a moment); on release it is placed back on the plate: only Position Z changes, the rotation and Position X, Y (center of the object) are kept. Rotations typed in the Transform section are placed on the plate at once.



---



# Scale Gizmo



Modes:



```text

Uniform



Non Uniform

```

One handle per axis of the object, on one side only: X on the right, Y in front, Z on top; and the center handle, which scales uniformly (decision of Noam, Phase 6).

The lock of the Scale row (Transform Section) applies to the gizmo too: closed, every handle scales uniformly; open, an axis handle scales along that axis of the object only. After a change the object is placed back on the plate.

Several objects selected: the gizmo is in the axes of the build plate, at the center of the group, and always scales the group uniformly (Multi Selection).



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



 └─ Models

```



Example:



```text

Bambu Lab



 ├─ X1C

 ├─ P1S

 └─ A1



Prusa



 ├─ MK4

 └─ XL

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

Details (Phase 6, decisions of Noam; DATA_SCHEMA.md, Transform Rules):

```text
Position X, Y   mm, editable: place of the center of the object
                (DATA_SCHEMA.md 3.4.0, Transform Rules)
Position Z      mm, shown but not editable: height of the center of the
                object, computed so that the object always stands on the
                build plate (an object can never be placed under the
                plate; sunk objects: KI-021)
Rotation X Y Z  degrees, around the axes of the build plate
Scale X Y Z     %, 100 % = imported size; a lock keeps the proportions
                (on by default)
Size X Y Z      mm, along the axes of the object, editable and linked to
                the scale: changing one updates the other
```

A value is applied with Enter or when the field loses the focus; Escape restores it; a comma is accepted as decimal separator; a value that is not a number, or a scale of 0.1 % or less, is refused. Every change of transform (fields, Transform Actions, gizmos) goes through one service (TransformService), where undo and redo are recorded.

The rows and the Transform Actions shown follow the mode of the gizmo (decision of Noam, Phase 6):

```text
Move     Position, Scale; Reset Position, Center On Bed, Reset Scale
Rotate   Rotation; Reset Rotation
Scale    Scale, Size; Reset Scale
```

Several objects selected (group, decision of Noam, Phase 6): the fields act like the gizmo on the group.

```text
Position X, Y   center of the group; a value moves the whole group
Position Z      height of the center of the group, not editable
Rotation X Y Z  0: a value turns the group around its center, around this
                axis of the build plate, then the field goes back to 0
Scale X Y Z     100 %: a value scales the group uniformly around its
                center, then the field goes back to 100 %; the lock is
                closed and cannot be opened
Size X Y Z      size of the group (bounding box); a value scales the group
                uniformly
Reset Position, Center On Bed   center of the group at the center of the
                                build plate
Reset Rotation, Reset Scale     rotation 0 or scale 100 % for each object
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

```text
Reset Position   position X and Y back to the center of the build plate
                 (origin of the object at X = 0, Y = 0)
Reset Rotation   rotation 0, 0, 0
Reset Scale      scale 100 %
Center On Bed    the center of the bounding box of the object (as seen
                 from above, after rotation and scale) moved to the center
                 of the build plate
```

After each action, the object stands on the build plate.



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



CTRL + SHIFT + Z  Redo (UNDO_REDO_SPEC.md)



DELETE       Delete Object

```



---



## Selection



```text

CTRL + A     Select All (not in a text field)



CTRL + Click Add or remove an object (Multi Selection)



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

G, R and S choose the mode of the gizmo, when an object is selected. They are read by their position on the keyboard, so they work the same with an English, French or Hebrew layout. The shortcuts of the viewport (G, R, S, ESC, HOME) are not active while a text field has the focus: in a field, ESC restores the value and keeps the selection.



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



1. The viewport is the primary focus.



2. Important information must remain visible.



3. User actions should require the minimum number of clicks.



4. Every action should provide visual feedback.



5. Changes must never surprise the user.



6. Advanced options should be available without overwhelming beginners.



7. AI recommendations should assist, not replace, user decisions.



---



# End Of Document
