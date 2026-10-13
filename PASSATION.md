# SlicyWeb : résumé de passation

Date : 2026-10-13. État vérifié sur `main` au commit `62a0f05` : le lot 8 y est appliqué à l'identique.

---

## 1. Règles de travail (à reprendre telles quelles)

- **Livraison :** Noam remplace lui-même les fichiers sur GitHub. Claude ne fait ni commit, ni branche, ni push, ni PR.
- **Lots :** un lot à la fois, avec les fichiers complets et leur chemin exact. Noam confirme chaque lot avant le suivant.
- **Emplacement :** livrables dans `/mnt/project-files/slicyweb/lotN-…/`, avec à chaque fois un `LOTN.md`, un zip des fichiers complets et un `.patch` vérifié par `git apply --check` sur `main`.
- **Contenu attendu de chaque lot de code :**
  - fichiers créés ou modifiés, avec leur chemin exact ;
  - pour un champ de schéma, la ligne de DATA_SCHEMA.md dont il vient ;
  - erreurs TypeScript corrigées et restantes.
- **Aucun champ inventé.** La hiérarchie documentaire fait foi : DATA_SCHEMA.md est de priorité 0.
- **« Sans autre changement » :** quand Noam l'écrit, ne rien toucher d'autre. Signaler les incohérences restantes en une ligne.
- **CHANGELOG :** une entrée par lot, insérée avant « # VERSION 0.2.0 ». La dernière est 0.1.11.
- **Fins de ligne à préserver :**
  - CRLF : DATA_SCHEMA.md, API_SPEC.md, DECISIONS.md, CHANGELOG.md, FILE_STRUCTURE.md.
  - LF : IMPORT_EXPORT_SPEC.md, ARCHITECTURE_DECISION_MATRIX.md, DIRECTORY_PURPOSES.md, SLICER_EXPORT_SPEC.md et tout `src/`.
- **Langue :** réponses en français.

---

## 2. État actuel

- **Phase 0 (Foundation) :** pas formellement close. CHANGELOG 0.1.0 est encore « Planned » et le statut de PHASES_IMPLEMENTATION_PLAN.md n'est pas mis à jour.
- **Phase 1 (Project Bootstrap) :** le plan est approuvé (`plan-phase1-bootstrap.md`), mais les fichiers d'outillage ne sont pas encore créés : package.json, tsconfig, vite.config.ts, etc.
- **Format WYPROJ :** documentation et code alignés sur DATA_SCHEMA.md 2.2.0 (option 1), pour le type `Project` comme pour la couche `src/project/`.
- **Erreurs TypeScript :** `tsc --strict` est lancé sur une copie hors dépôt, faute d'outillage. On est passé de 21 erreurs à **10**, toutes hors projet :
  - `classification_engine/ClassificationEngine.ts`
  - `cost_engine/CostCalculator.ts`
  - `gui/panels/RecommendationPanel.tsx`
  - `i18n/LocalizationService.ts`
  - `notifications/NotificationFactory.ts`
  - `optimization_engine/ClassificationEngine.ts`
  - `optimization_engine/OptimizationEngine.ts` (2 erreurs)
  - `preset_engine/PresetManager.ts` (2 erreurs)
- **Versions des documents :**
  - DATA_SCHEMA.md 2.2.0
  - IMPORT_EXPORT_SPEC.md 2.2.0
  - API_SPEC.md 2.1.0, alors qu'il devrait être 3.0.0 (voir §5)
  - SLICER_EXPORT_SPEC.md 1.0.0
  - ARCHITECTURE_DECISION_MATRIX.md 2.1.0
  - Format WYPROJ 2.0.0

---

## 3. Lots appliqués

| Lot | Contenu | CHANGELOG |
|---|---|---|
| 1 | En-têtes « Based on » de 20 fichiers `src/` : les specs inexistantes (STARTUP_SPEC, CONFIG_SPEC, EVENT_SPEC, SCENE_SPEC, OBJECT_MANAGEMENT_SPEC, UTILS_SPEC, I18N_SPEC) sont remplacées par des documents existants. Seules ces lignes ont changé. | — |
| 2 | Analyse seule, sans livraison : options de structure WYPROJ (`lot2-options-wyproj.md`) et proposition ADR-026 (`lot2-proposition-objectid-adr026.md`). | — |
| 3 + 3c | Documentation : DATA_SCHEMA 2.1.0 (objectId, analysisId, status, Object Reference Rules 1 à 10), API_SPEC, IMPORT_EXPORT_SPEC 2.2.0 aligné sur DATA_SCHEMA, ADR-026 dans DECISIONS.md, ADM-021 dans la matrice, contrôles de scène dans SLICER_EXPORT_SPEC (Validation Rules). Le lot 3c a corrigé 3 fichiers (phrase de l'ADR-026, précision CHANGELOG, SLICER_EXPORT_SPEC). Le lot 3b, remplacé par 3c, n'a pas été appliqué. | 0.1.6 |
| 4 | Création de `src/schemas/ProjectSchema.ts` (Zod v3) : Project Schema, Project File Schema, règles 3 à 5. Débloque la compilation d'Electron (`ProjectIPC.ts`). FILE_STRUCTURE et DIRECTORY_PURPOSES mis à jour. | 0.1.7 |
| 5 | `null` = « pas encore choisi » pour printer, material, filament et preset (projet et scène). Note « Known Duplication » ajoutée. DATA_SCHEMA 2.2.0 et ProjectSchema.ts adaptés. | 0.1.8 |
| 6 | `src/types/Project.ts` réécrit selon le Project Schema. `ProjectService.createProject` complété. 10 erreurs TS corrigées (ProjectService, RecoveryValidator, SessionRestorer). | 0.1.9 |
| 7 | Couche `src/project/` : `ProjectState` est remplacé par `Project` dans les 6 fichiers. Le validateur utilise ProjectSchema. Le `metadata` de l'enveloppe se réduit à `{ application }`. Nom de fichier construit à partir de `projectName`. ProjectService passe en version `"2.0.0"` et délègue la sérialisation à la couche Project. | 0.1.10 |
| 8 | Nom de fichier WYPROJ : NFC, lettres et marques de toutes les langues, noms réservés Windows préfixés par `_`, limite de 60 caractères. Les caractères interdits, de contrôle et RTL étaient déjà retirés au lot 7. | 0.1.11 |

---

## 4. Décisions prises par Noam

1. **Structure WYPROJ : option 1**, alignée sur DATA_SCHEMA.md (priorité 0). L'enveloppe est `{format, version, project, metadata}` et le projet est à plat.
2. **ADR-026 :** analyses et recommandations par objet, indexées par `objectId`. Rotation et échelle rendent les résultats `outdated`, pas un simple déplacement. Les contrôles de scène (volume d'impression, collisions) sont refaits avant chaque export.
3. **Sélections non choisies :** `null`. La règle vaut aussi pour `scene.printer`, `scene.material`, `scene.filament` et `scene.preset`.
4. **Duplication projet/scène des 4 sélections :** connue et documentée, à résoudre dans un lot ultérieur, pas maintenant.
5. **Copies de classification dans `src/optimization_engine/` :** elles restent (documentées dans DIRECTORY_PURPOSES).
6. **Specs manquantes :** ne pas en créer. Les en-têtes « Based on » pointent vers des documents existants (lot 1).
7. **Outillage (à consigner dans l'ADR-025, pas encore écrit) :** Vite avec `vite-plugin-electron`, React 18, Zod dès la phase 1, en version 3.25.x (le code utilise l'API v3 : `.passthrough()`, `z.ZodIssueCode`).
8. **Erreurs TypeScript : réponse A.** On ne corrige que les erreurs bloquantes. Les 10 erreurs hors projet viennent dans un lot séparé, après l'outillage typecheck.
9. **Ordre des lots :** la couche Project passe avant les erreurs hors projet (fait au lot 7).
10. **Nom de fichier :** lettres de toutes les langues acceptées (lots 7 et 8).
11. **Création de projet :** ProjectManager doit être le seul créateur, et ProjectService lui délègue (règle Project Management de CLAUDE.md).

---

## 5. Travail restant, dans l'ordre

1. **Lot 9 : création de projet unique.** `ProjectService.createProject` délègue à `ProjectManager.createProject`, qui reste le seul à construire un projet. C'est la prochaine étape demandée par Noam.
2. **Lot Analysis / Recommendation (ADR-026).**
   - Ajouter `analysisId`, `objectId` et `status` aux types `Analysis` et `Recommendation` ainsi qu'à leurs schémas Zod (AnalysisSchema, RecommendationSchema).
   - Passer les stores d'un résultat unique à des résultats par objet.
   - D'ici là, tout projet contenant des analyses est refusé au chargement.
3. **ADR-025 :** consigner l'outillage (décision 7) dans DECISIONS.md et ARCHITECTURE_DECISION_MATRIX.md, puis mettre à jour TECH_STACK.md et FILE_STRUCTURE.md.
4. **Phase 1, bootstrap**, selon `plan-phase1-bootstrap.md` :
   - fichiers à créer : package.json, tsconfig(s), vite.config.ts, index.html, src/gui/main.tsx, configs ESLint et Prettier, .env.example, electron-builder.json (ce dernier éventuellement reporté) ;
   - documents à mettre à jour : FILE_STRUCTURE (« Planned Items »), DIRECTORY_PURPOSES, README, CONTRIBUTING, PHASES_IMPLEMENTATION_PLAN.
5. **Les 10 erreurs TypeScript hors projet**, une fois `npm run typecheck` disponible.
6. **Points signalés, en attente d'une décision de Noam :**
   - API_SPEC.md devrait passer en 3.0.0 : la réponse Generate Recommendation est un changement cassant (VERSIONING_POLICY).
   - SLICER_EXPORT_SPEC.md : version restée en 1.0.0, pas de code d'erreur pour les contrôles de scène (proposés : EXP_013 hors volume, EXP_014 collision), et le CHANGELOG ne mentionne pas ce document.
   - Duplication projet/scène des 4 sélections (décision 4) : choisir la source de vérité.
   - `WYPROJImporter` ne vérifie pas la `version` de l'enveloppe, et `author` n'est jamais écrit dans `metadata`.
   - Clôture formelle de la phase 0 (CHANGELOG 0.1.0, PHASES_IMPLEMENTATION_PLAN).
   - README : liste des phases désalignée de ROADMAP 2.1.0 ; ambiguïté sur Undo/Redo (ROADMAP phase 0, plan technique phase 6).
   - Fichiers d'emplacement mal nommés (`README.me`, `readme.me`, `readme`) ; texte en dur dans `App.tsx` (à traiter en phase 3, i18n).

---

## 6. Fichiers utiles dans `/mnt/project-files/slicyweb/`

- `plan-phase1-bootstrap.md` : état de la phase 0, ordre de lecture, chemin court, plan de la phase 1.
- `lot2-options-wyproj.md`, `lot2-proposition-objectid-adr026.md` : analyses ayant mené aux décisions 1 et 2.
- `lot1-based-on/` à `lot8-filename/` : livrables de chaque lot. `lot3b-corrections/` est obsolète.
