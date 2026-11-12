# SlicyWeb Smart Slicer

# PERFORMANCE SPECIFICATION



Version: 1.4.1



Status: Approved

Priority: High



---



# Purpose



Defines performance requirements.



---



# Startup Targets



```text

Cold Start < 3 seconds



Warm Start < 1 second

```



---



# Viewport Performance



Target:



```text

60 FPS

```



Minimum:



```text

30 FPS

```



---



# STL Loading Targets



```text

50 MB STL < 2 sec



500 MB STL < 10 sec

```



---



# Supported Geometry



```text

100K Triangles



500K Triangles



1M Triangles



5M Triangles+



10M Triangles Future

```



---



# Memory Targets



Normal Session:



```text

< 2 GB RAM

```



Heavy Session:



```text

< 8 GB RAM

```



---



# Optimization Methods



Use:



```text

BVH

Geometry Caching

Lazy Loading

Instancing

LOD

```



---



# Analysis Performance



Analysis should run asynchronously.



GUI must remain responsive.

Phase 9 (ADR-034 D7, D10): the analysis runs in a Web Worker, one object at a time; a computation that is no longer needed (object removed, or turned again) is dropped.

Target:

```text
1M Triangles Analyzed < 5 seconds
```

on the Windows 11 computer used for the validation, the interface staying fluid. Larger models are analyzed too (no limit of the analysis; the limits of the import stay), with "Analyzing…" in the status bar. The target is checked at the closure of Phase 9; it does not block.

Thin walls: at most 200 000 measured points per object, with a BVH (three-mesh-bvh).

Phase 10 (lot 90, closure): the classification runs in the same Web Worker, after the analysis; the target above covers both. Convex hull of the feature hollow (OBJECT_CLASSIFICATION_SPEC.md): the exact hull of every vertex took 6.5 s for 1M triangles when every vertex lies on the hull (a sphere). It is framed first by two bounds: the hull of the extreme vertices in 128 directions (lower bound) and this small hull scaled by 1 + delta / (smallest distance from its center to its faces), delta being the largest distance of a vertex outside its face planes, or the bounding box (upper bound). When the ratio volume / hull is on the same side of the limit for both bounds, the answer is certain; otherwise the exact hull decides. The features are the same as with the exact hull alone.

Lot 92 (1.3.0): on the PC of Noam the sphere of 998 000 triangles took 8.76 s (lot 90). Same results, less work: the edges of the mesh are found once (edge table, linear time) and shared by the open edges, the bridges, the planar share and the genus; the BVH is built once and shared by the thin walls and open_top; hollow first compares the volume with the bounding box (the hull lies inside it: above 35 % of the box, never hollow, no hull), then bounds with 32 directions, then 128, then the exact hull. Measured on Linux in the application built ("Analyzing…" in the status bar, sphere of 998 000 triangles): 1.8 to 2.3 s instead of 3.4 to 4.4 s. The thin walls (200 000 rays) and the BVH now take most of the time.

Measured on Linux in lot 90 (sphere of 998 000 triangles): analysis 2 s, classification 2 to 2.5 s (hollow 0.5 to 0.9 s instead of 6.5 s), about 4 to 4.8 s in all. Sphere of 99 224 triangles: classification 0.14 to 0.18 s (Classification Performance: less than 500 ms).



---

# Optimization Performance

Phase 11 (1.4.0, ADR-036 D4): the orientation search runs in a Web Worker, one object at a time, at the request of the user; the interface stays fluid; a search that is no longer needed (object removed, or turned meanwhile) is dropped.

Target:

```text
1M Triangles Optimized < 5 seconds
```

on the Windows 11 computer used for the validation, like the analysis. The target is checked at the closure of Phase 11; it does not block.

Method (same results, less work):

```text
Each orientation is measured with the functions of the analysis on the
  welded vertices turned (no new weld, no BVH, no thin walls, no
  classification: they do not depend on the orientation)
Center of gravity and area of the surface: computed once, then turned
Convex hull of the candidates (AI_ENGINE_SPEC.md 1.1.0, Orientation
  Candidates):
  the hull of the extreme vertices in 128 directions (spread evenly on the
    sphere, always the same) frames the vertices
  exact hull of the vertices that are not inside this first hull
  when more than 20 000 vertices are not inside it (a surface curved
    everywhere, as a sphere: the exact hull of 500 000 vertices takes more
    than 6 s), the hull of the extreme vertices in 512 directions is used:
    a face of it that carries three vertices of a flat face of the object
    lies on the plane of this face; its faces of at least 1 % are the
    candidates
```

Measured on Linux in lot 97, in the unit tests (Node.js, not yet in the application: the search is started from the interface in lot 98): sphere of 998 000 triangles, 6 orientations: 1.4 to 1.5 s; cup with 40 flat sides holding a sphere, 998 316 triangles, 48 orientations: 2.5 s. The analysis of the same sphere takes 1.8 to 2.3 s in the application (lot 92).

Measured on Linux in lot 99, in the application built (1.4.1; Tools > Optimize Orientation after the analysis, Prusa MK4S selected, 3 runs each): tower of 20 x 20 x 100 mm made of 1 016 576 triangles, laid down (66 to 98): "Optimizing…" shown 2.4 to 2.9 s, 3.0 to 3.9 s from the click to the message; sphere of 998 000 triangles (every orientation has a risk of 100, kept): 2.4 s shown, 3.4 to 3.6 s from the click to the message. The search alone (Node.js, same models): 1.4 to 1.9 s and 1.0 to 1.2 s; the rest is outside the search (copy of the triangles to the Web Worker, check of the result, the viewport drawn on the same computer). The duration on the PC of Noam is checked at the closure (lot 99).

---

# Classification Performance

Target:

```text
< 500 ms
```

for standard models.

---

# Confidence Calculation Performance

Target:

```text
< 100 ms
```

---

# Scene Management


Only re-render modified objects.

Avoid full scene refresh.


---


# Caching Rules



Cache:



```text

Printers

Materials

Filaments

Print Presets

Analyses

Downloads

Recommendations

```



---



# AI Performance

```text
Classification < 500 ms

Recommendation Generation < 1 second

Confidence Calculation < 100 ms
```

for standard models.


---


# Large Model Handling


When geometry exceeds threshold:



```text

Display Warning



Enable Optimized Mode

```


---

# Large Scene Handling

When scene complexity exceeds threshold:

```text
Enable LOD

Reduce Update Frequency

Use Cached Analysis

Enable Performance Mode
```

---

# Performance Monitoring



Track:

```text

FPS

RAM

CPU

GPU

Render Time

AI Response Time

Classification Time

Cache Hit Rate

```



---



# Performance Alerts



Generate warnings when:



```text

Low FPS

High RAM

Slow Analysis

Slow Classification

Slow Recommendation Generation

Cache Miss Rate High

```



---

# Repository Performance

Target:

```text
Profile Search < 500 ms

Repository Sync < 10 sec

Cache Refresh < 5 sec
```

---

# Auto Save Performance

Target:

```text
Auto Save < 1 second

Recovery Load < 3 seconds
```

---

# Database Performance

Target:

```text
Printer Lookup < 100 ms

Material Lookup < 100 ms

Filament Lookup < 100 ms

Preset Lookup < 100 ms
```

---

# Future Performance Targets

Reserved:

```text
10M Triangle Models

Multi Build Plates

Cloud Synchronization

Distributed Analysis

GPU Accelerated Classification
```

---

# Golden Rule



Performance improvements must never compromise correctness.



---



# End Of Document

