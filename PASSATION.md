# SlicyWeb : résumé de passation

Date : 2026-10-20. Lot 48 sur `main` au commit `0f3203f`, vérifié identique. Dernière entrée du CHANGELOG : 0.1.52 (lot 49).

---

## 1. Règles de travail (à reprendre telles quelles)

- **Livraison :** Noam remplace lui-même les fichiers sur GitHub. Claude ne fait ni commit, ni branche, ni push, ni PR. Si un contrôle automatique demande un commit, Claude répond que c'est Noam qui applique les fichiers.
- **Lots :** un lot à la fois, avec les fichiers complets et leur chemin exact. Noam confirme chaque lot (résultats de ses vérifications) avant le suivant.
- **Emplacement :** livrables dans `/mnt/project-files/slicyweb/lotN-…/`, avec à chaque fois un `LOTN.md`, un zip des fichiers complets (avec leurs chemins) et un `.patch` vérifié par `git apply --check` sur `main`. Claude envoie ces fichiers à Noam dans la conversation.
- **Contenu attendu de chaque lot :**
  - fichiers créés ou modifiés, avec leur chemin exact ;
  - pour un champ de schéma, la ligne de DATA_SCHEMA.md dont il vient ;
  - ce que Claude a vérifié lui-même, et ses limites ;
  - les commandes PowerShell à lancer et les contrôles à faire ;
  - en haut, « Décisions prises seul » (voir la règle de décision).
- **Aucun champ inventé.** La hiérarchie documentaire fait foi : DATA_SCHEMA.md est de priorité 0. Un manque dans la documentation est signalé (Known Issue), pas comblé par une invention.
- **« Sans autre changement » :** quand Noam l'écrit, ne rien toucher d'autre. Signaler les incohérences restantes en une ligne.
- **CHANGELOG :** une entrée par lot, insérée avant « # VERSION 0.2.0 ». La version suivante reçoit les résultats de validation de Noam (« Validation Result ») et passe en « Completed ». Un Known Issue est retiré dans la version qui le résout.
- **Fins de ligne à préserver :**
  - CRLF : CHANGELOG.md, DECISIONS.md, PHASES_IMPLEMENTATION_PLAN.md, FILE_STRUCTURE.md, DATA_SCHEMA.md, API_SPEC.md, GUI_SPEC.md, SECURITY_SPEC.md, TECH_STACK.md, USER_SETTINGS_SPEC.md, ERROR_CODES_SPEC.md.
  - LF : DIRECTORY_PURPOSES.md, DOMAINS_DEPENDENCY_MATRIX.md, ARCHITECTURE_DECISION_MATRIX.md, IMPORT_EXPORT_SPEC.md, SLICER_EXPORT_SPEC.md, PASSATION.md et tout `src/`.
  - En cas de doute, garder les fins de ligne du fichier existant.
- **Langue :** réponses en français.
- **Poste de Noam :** Windows 11. Toutes les commandes et les scripts `package.json` doivent fonctionner dans PowerShell, sans commande propre à Mac ou Linux.
- **Vérifications habituelles chez Noam :**

  ```powershell
  npm run check:locales
  npm run check:ipc
  npm run typecheck
  npm run lint
  npm test
  npm run dev
  npm run build
  npm start
  ```

- **Ne jamais lancer `npm audit fix --force`** (KI-013).
- **Pas de `git status` chez Noam :** son dossier local n'est pas un dépôt git. Ne jamais le lui demander. Pour connaître les fichiers créés ou modifiés par un outil (par exemple `npx shadcn add …`), lui donner cette commande PowerShell, à lancer depuis le dossier du projet (remplacer `-30` par le nombre de minutes écoulées) :

  ```powershell
  Get-ChildItem -Path . -Exclude node_modules,dist,.git | Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object LastWriteTime -gt (Get-Date).AddMinutes(-30) | ForEach-Object { Resolve-Path -Relative $_.FullName }
  ```

- **Envoi sur GitHub par le site web :** l'envoi ne garde pas toujours les chemins (lot 32 : fichiers posés à la racine ; lot 38 : fichiers manquants). Noam glisse les **dossiers** du zip (`docs`, `src`, `public`…), pas des fichiers seuls. Après chaque envoi, Claude compare `main` avec le lot, fichier par fichier, avant de continuer.
- **Nouvelles dépendances npm :** Noam les installe lui-même (`npm install paquet@version`), puis envoie `package.json` et `package-lock.json`. Le zip ne contient pas `package.json` dans ce cas.
- **Modifier `package.json` (scripts) :** ne pas utiliser `npm pkg set` avec une valeur qui contient un espace : PowerShell coupe l'argument (lot 44). Utiliser une commande `node -e "…"` qui lit, modifie et réécrit `package.json` (guillemets doubles autour, guillemets simples dedans).
- **Règle de décision (Noam, 2026-10-17) :** Claude peut appliquer lui-même l'option « Recommandé » sans demander, **sauf** si la question touche :
  1. le format des données ou des fichiers (DATA_SCHEMA, WYPROJ, export slicer) ;
  2. la sécurité (IPC, CSP, accès aux fichiers) ;
  3. un choix visible pour l'utilisateur (interface, comportement, réglages d'impression) ;
  4. une suppression de code ou de fonctionnalité ;
  5. une contradiction entre deux documents de même priorité.

  Dans ces cas, Claude pose la question comme avant. Dans chaque lot, le `LOTN.md` liste en haut « Décisions prises seul » : la question, l'option choisie et une ligne de justification, pour que Noam puisse les relire et les annuler.
- **Clôture de phase :** une phase passe en « Completed » avec le résultat des contrôles de Noam. Si un contrôle échoue ensuite, elle repasse en « In Progress ».

---

## 2. État actuel

### Phases techniques (PHASES_IMPLEMENTATION_PLAN.md)

| Phase | Contenu | État | CHANGELOG |
|---|---|---|---|
| 0 | Foundation | Completed (2026-10-14) | 0.1.23 |
| 1 | Project Bootstrap | Completed (2026-10-14) | 0.1.22 |
| 2 | Core Dependencies | Completed (2026-10-14) | 0.1.29 |
| 3 | GUI Foundation | Completed (2026-10-15) | 0.1.35 |
| 4 | 3D Viewport | Completed (2026-10-16) | 0.1.37 |
| 5 | Model Import | Completed (2026-10-17) | 0.1.44 |
| 6 | Transform System | **In Progress** (depuis le 2026-10-18) | 0.1.47 à 0.1.52 |
| 7 à 16 | Printer Database, Material Database, Model Analysis, Classification, Optimization, Cost, Project Persistence, Slicer Export, Advanced Features, Production Release | À venir | — |

### Ce que fait l'application aujourd'hui

- **Fenêtre :** Electron avec React ; barre de menus (9 menus de GUI_SPEC) ; barre d'outils (11 boutons) ; panneaux latéraux redimensionnables et repliables ; barre d'état ; thème sombre.
- **Langues :** anglais, français, hébreu (droite à gauche). La langue choisie est enregistrée dans `settings.json` (dossier de l'utilisateur) et rechargée au démarrage. 250 clés de traduction.
- **Vue 3D :**
  - repère en mm, X à droite, Y vers l'arrière, Z vers le haut, origine au centre du plateau (ADR-028) ;
  - grille adaptative et axes ;
  - caméras perspective et orthographique, 7 vues prédéfinies, Home ;
  - pas de plateau tant qu'aucune imprimante n'est choisie (phase 7).
- **Import :**
  - STL (binaire et texte) et 3MF ;
  - par File > Import, le bouton Import ou le glisser-déposer ;
  - analyse dans un Web Worker, avec une barre de progression et un bouton Annuler ;
  - objets centrés à Z = 0 ; un 3MF garde la disposition de ses objets ;
  - messages d'erreur traduits, avec les codes d'ERROR_CODES_SPEC.
- **Transformations (phase 6, en cours) :** la vue 3D applique la position, la rotation et l'échelle de chaque objet (règles d'ADR-031). La section Transform du panneau Propriétés permet de saisir la position X, Y, la rotation, l'échelle (%) et la taille (mm), avec Reset et Center On Bed ; l'objet reste toujours posé sur le plateau. Dans la vue 3D : clic pour sélectionner (un vrai clic dans le vide désélectionne), glisser un objet pour le déplacer sur le plateau (après 4 pixels), poignées Move, Rotate, Scale (touches G, R, S et boutons au-dessus de la vue 3D, grisés sans sélection), Échap désélectionne. La position d'un objet est celle de son **centre** (DATA_SCHEMA 3.4.0) : il tourne autour de son centre ; avec la poignée, il tourne librement pendant le geste et se repose sur le plateau au relâchement. Poignée Scale : une poignée par axe (X à droite, Y devant, Z en haut) et celle du centre ; le cadenas agit pareil dans le panneau et sur la poignée. La section Transform n'affiche que les lignes du mode. Annuler / Rétablir (lot 49) : transformations seulement, un geste = une étape, 50 étapes, barre d'outils, menu Édition, Ctrl+Z, Ctrl+Y, Ctrl+Maj+Z ; l'objet concerné est sélectionné.
- **Sécurité :**
  - liste blanche des canaux IPC dans le preload (22 canaux, `npm run check:ipc`) ;
  - politique de sécurité du contenu (CSP) stricte dans l'application compilée, et adaptée en développement ;
  - lecture des 3MF par le répertoire central de l'archive, limites de décompression, décompression arrêtée dès qu'une partie dépasse sa taille annoncée (bombes zip).

### Outils et versions (package.json)

- Electron 44, Vite 8.3 (`vite.config.mts`, vite-plugin-electron), React 18, TypeScript 6, Zod 3.25, Zustand 5, Three.js 0.186.
- Tailwind CSS 4, shadcn/ui (Base UI, style base-nova, `rtl: true`), Lucide 1.56, react-resizable-panels 4.14.
- Polices Inter et Noto Sans Hebrew (Fontsource).
- fflate 0.8.3 et fast-xml-parser 5.11.2 (lecture des 3MF).
- Vitest 5.0.3 pour les tests unitaires (`npm test`, `vitest.config.mts`, `tests/unit/`).

### Versions des documents

| Document | Version |
|---|---|
| DATA_SCHEMA.md | 3.4.0 (Transform Rules : origine locale au centre de l'objet) |
| Format WYPROJ | 3.0.0 (les fichiers 2.0.0 sont refusés) |
| IMPORT_EXPORT_SPEC.md | 3.0.0 |
| ERROR_CODES_SPEC.md | 2.1.0 |
| ARCHITECTURE_DECISION_MATRIX.md | 2.3.0 |
| API_SPEC.md | 2.1.0 (voir §5, points en attente) |
| SLICER_EXPORT_SPEC.md | 1.0.0 |
| UNDO_REDO_SPEC.md | 2.1.0 (50 étapes ; phase 6 : transformations seulement) |
| Dernier ADR | ADR-031 ; dernier ADM : ADM-027 |

---

## 3. Lots appliqués

Les livrables des lots 9 à 42 sont dans `/mnt/project-files/slicyweb/` ; ceux des lots 1 à 8 n'y sont plus.

| Lot | Contenu | CHANGELOG |
|---|---|---|
| 1 | En-têtes « Based on » de 20 fichiers `src/` : les specs inexistantes sont remplacées par des documents existants | — |
| 2 | Analyse seule : options de structure WYPROJ et proposition ADR-026 | — |
| 3 + 3c | DATA_SCHEMA 2.1.0 (objectId, analysisId, status, Object Reference Rules), IMPORT_EXPORT_SPEC 2.2.0, ADR-026 | 0.1.6 |
| 4 | `src/schemas/ProjectSchema.ts` (Zod v3) | 0.1.7 |
| 5 | `null` = « pas encore choisi » pour imprimante, matériau, filament, preset | 0.1.8 |
| 6 | `src/types/Project.ts` selon le Project Schema | 0.1.9 |
| 7 | Couche `src/project/` sur `Project` ; nom de fichier WYPROJ | 0.1.10 |
| 8 | Nom de fichier WYPROJ : NFC, toutes les langues, noms réservés Windows | 0.1.11 |
| 9 | ProjectManager seul créateur de projet | 0.1.12 |
| 10 | Analysis / Recommendation par objet (ADR-026) | 0.1.13 |
| 11 | Section Known Issues du CHANGELOG (KI-001 à KI-004) | 0.1.14 |
| 12 | ADR-025 : outillage et versions | 0.1.15 |
| 13 | Outillage de la phase 1 : package.json, tsconfig, Vite, ESLint, Prettier, Electron | 0.1.16 |
| 14 | Compatibilité Windows 11 (PowerShell, fins de ligne Prettier) | 0.1.17 |
| 15 | `vite.config.mts` ; KI-005 | 0.1.18 |
| 16 | Recommendation alignée sur DATA_SCHEMA (KI-001, KI-002) | 0.1.19 |
| 17 | Infill au niveau du profil ; preset de DecisionEngine | 0.1.20 |
| 18 | KI-005 : erreurs TypeScript et ESLint corrigées | 0.1.21 |
| 19 | Clôture de la phase 1 | 0.1.22 |
| 20 | Fin de KI-006, DATA_SCHEMA 3.0.0 (catégories), clôture de la phase 0 | 0.1.23 |
| 21 | WYPROJ 3.0.0 (ADR-027), refus des fichiers 2.0.0 ; KI-009 à KI-012 | 0.1.24 |
| 22 | KI-003 : validation complète des analyses et recommandations au chargement | 0.1.25 |
| 23 | KI-004 : Object Reference Rules 6 à 9 | 0.1.26 |
| 24 | KI-009 : vitesses limitées par la vitesse du preset | 0.1.27 |
| 25 | Phase 2, partie 1 : Tailwind CSS 4, Lucide | 0.1.28 |
| 26 | shadcn/ui ; clôture de la phase 2 | 0.1.29 |
| 27 | shadcn en dépendance de développement ; KI-013 (npm audit, braces) | 0.1.30 |
| 28 | Phase 3, partie 1 : base des traductions | 0.1.31 |
| 29 | Langue enregistrée dans les réglages | 0.1.32 |
| 30 | Mise en page, panneaux, thème sombre, police hébraïque | 0.1.33 |
| 31 | Barre de menus et barre d'outils | 0.1.34 |
| 32 | Droite à gauche dans les composants shadcn ; clôture de la phase 3 | 0.1.35 |
| 33 | Vue 3D (ADR-028) | 0.1.36 |
| 34 | Clôture de la phase 4 ; limite d'avertissement de taille du bundle | 0.1.37 |
| 35 | KI-016 : liste blanche des canaux IPC, `check:ipc` | 0.1.38 |
| 36 | Politique de sécurité du contenu (CSP) | 0.1.39 |
| 37 | Polices refusées par la CSP dans l'application compilée | 0.1.40 |
| 38 | Phase 5 : décisions d'import (ADR-029) ; KI-014 réglé | 0.1.41 |
| 39 | Import STL | 0.1.42 |
| 40 | Import 3MF (ADR-030) | 0.1.43 |
| 41 | KI-018 (codes IMP_001, IMP_002, MF_004) ; clôture de la phase 5 ; règle de décision | 0.1.44 |
| 42 | Revue externe : lecteur ZIP (bombe à en-tête mensonger, bit 3), bouton Annuler ; PASSATION.md réécrit | 0.1.45 |
| 43 | Hébreu : bouton Annuler « בטל » | 0.1.46 |
| 44 | Phase 6 : sens de la transformation (ADR-031, KI-017), rendu de la rotation, Vitest et premiers tests | 0.1.47 |
| 45 | Section Transform du panneau Propriétés, TransformService (commande unique) | 0.1.48 |
| 46 | Sélection au clic, glisser sur le plateau, poignées 3D, raccourcis G, R, S et Échap ; Échap dans un champ | 0.1.49 |
| 47 | Corrections du lot 46 : cadenas sur la poignée Scale, boutons de mode sur la vue, 3 poignées d'échelle, panneau selon le mode | 0.1.50 |
| 48 | Position = centre de l'objet (DATA_SCHEMA 3.4.0, amendement d'ADR-031), rotation libre pendant le geste ; boutons de mode seulement sur la vue ; KI-021 | 0.1.51 |
| 49 | Annuler / Rétablir des transformations (UNDO_REDO_SPEC 2.1.0) | 0.1.52 |

---

## 4. Décisions prises par Noam

**Données et projets**

1. **Structure WYPROJ : option 1**, alignée sur DATA_SCHEMA.md (priorité 0). L'enveloppe est `{format, version, project, metadata}` et le projet est à plat. Format 3.0.0 depuis ADR-027 ; les fichiers 2.0.0 sont refusés.
2. **ADR-026 :** analyses et recommandations par objet, indexées par `objectId`. Rotation et échelle rendent les résultats `outdated`, pas un simple déplacement. Les contrôles de scène (volume d'impression, collisions) sont refaits avant chaque export.
3. **Sélections non choisies :** `null`, aussi pour `scene.printer`, `scene.material`, `scene.filament` et `scene.preset`.
4. **Duplication projet/scène des 4 sélections dans DATA_SCHEMA :** connue et documentée (« Known Duplication »), source de vérité encore à choisir.
5. **Nom de fichier WYPROJ :** lettres de toutes les langues acceptées (lots 7 et 8).
6. **Création de projet :** ProjectManager est le seul créateur ; ProjectService lui délègue.
7. **Copies de classification dans `src/optimization_engine/` :** elles restent (documentées dans DIRECTORY_PURPOSES).
8. **Specs manquantes :** ne pas en créer ; les en-têtes « Based on » pointent vers des documents existants.

**Outillage (ADR-025)**

9. Vite avec `vite-plugin-electron`, React 18, Zod 3.25.x, TypeScript strict. Limite d'avertissement de taille du bundle : 1500 ko (choix A, Three.js dans le bundle).

**Interface**

10. Langue enregistrée dans les réglages et rechargée au démarrage. Police hébraïque assortie : Noto Sans Hebrew. Droite à gauche par la migration `shadcn migrate rtl`.

**Vue 3D (ADR-028)**

11. Repère en mm, Z vers le haut, origine au centre du plateau. Pas de plateau sans imprimante choisie. Menu View complet (projections, 7 vues, Reset View).

**Dépendances entre domaines (DOMAINS_DEPENDENCY_MATRIX.md)**

12. GUI → Internationalization ; GUI → Viewport (Viewport ne dépend plus de GUI) ; Import → Scene (Scene ne dépend plus d'Import) ; Service → Import (ImportService).

**Sécurité**

13. Liste blanche des canaux IPC et désabonnement pour `on()` (KI-016, lot 35).
14. CSP stricte pour l'application compilée, adaptée pour `npm run dev` (lot 36). Aucun fichier compilé intégré en `data:` (lot 37).

**Import (ADR-029, ADR-030)**

15. Sélection : un store par domaine (`objectStore.selectedObjectId`, `printerStore`, `materialStore`, `filamentStore`, `presetStore`) ; `appStore` supprimé (KI-014).
16. Fichiers lus dans l'interface (fenêtre de choix, glisser-déposer), analysés dans un Web Worker avec progression ; aucun chemin de fichier par l'IPC.
17. Objets centrés sur l'origine, posés à Z = 0 ; chevauchements permis.
18. 3MF : fflate + fast-xml-parser dans le Worker (pas le 3MFLoader de Three.js) ; unités, transformations, composants, extension Production ; limites de décompression ; la disposition du 3MF est gardée. Archive lue par le répertoire central (`ZipReader.ts`) et décompression arrêtée à la taille annoncée, après revue externe (lot 42).
19. Bouton Annuler pour chaque import (lot 42) ; après Annuler, la ligne disparaît sans message ; en hébreu « בטל » (lot 43).
20. Codes d'erreur : IMP_001, IMP_002, MF_004 ajoutés ; STL_004 réservé (KI-018).

**Transformations (ADR-031)**

21. Rotation en degrés, règle de la main droite, autour des axes du plateau : X, puis Y, puis Z (Euler « ZYX » de Three.js).
22. Échelle sur les axes de l'objet, appliquée d'abord ; pivot et position au centre de la base défini à l'import.
23. Après chaque rotation ou changement d'échelle, l'objet est reposé sur le plateau (point le plus bas à Z = 0).
24. Export 3MF : matrice = (R · S) transposée, translation = position + décalage de l'origine de l'imprimante. Test automatique : un cube étiré à 200 % en X puis tourné de +90° en Z est allongé le long de Y.
25. Section Transform : échelle en % avec cadenas (activé par défaut), tailles en mm modifiables et liées aux % ; position Z jamais modifiable (objet toujours sur le plateau) ; rotation par la poignée libre, par pas de 15° avec Maj.
26. Ordre des lots de la phase 6 : panneau, puis poignées et raccourcis G, R, S, puis Annuler / Rétablir ; toute modification passe par une seule commande (`TransformService`).
28. Vue 3D : on déplace un objet en le glissant, après un seuil de quelques pixels (un clic de sélection ne le décale jamais) ; poignée Move par défaut ; sélection au clic, et seul un vrai clic (sans glisser) dans le vide désélectionne.
29. Cadenas de l'échelle : même effet dans le panneau et sur la poignée (fermé = échelle uniforme, quelle que soit la poignée).
30. Poignée Scale : une poignée par axe, X à droite, Y **devant** (côté Y négatif, visible dans la vue par défaut), Z en haut, plus celle du centre.
31. Section Transform selon le mode : Déplacer = Position et Échelle ; Tourner = Rotation ; Échelle = Échelle et Taille ; les boutons du bas suivent le mode.
32. Boutons Déplacer / Pivoter / Échelle seulement au-dessus de la vue 3D (pas dans la barre d'outils), actifs seulement avec un objet sélectionné.
33. Option B : l'origine locale d'un objet est le **centre** de sa boîte à l'import ; la position est celle du centre (Z = hauteur du centre). Test demandé : cube de 20 mm en X = 0, Y = 0, tourné de 90° autour de X → X = 0, Y = 0, Z = 10, posé.
34. Rotation à la poignée comme Bambu Studio / OrcaSlicer : libre autour du centre pendant le geste (peut passer sous le plateau un instant), reposée sur le plateau au relâchement (seul Z change).
35. Pas d'objet sous le plateau pour l'instant (« objet enfoncé » : KI-021).
36. Annuler / Rétablir : seulement les transformations (l'import et la suppression plus tard) ; 50 étapes (UNDO_REDO_SPEC disait 100), historique vidé à la fermeture ou l'ouverture d'un projet ; l'objet de l'étape annulée est sélectionné, une sélection seule n'est pas une étape ; Ctrl+Z dans un champ annule seulement la frappe.

**Méthode**

27. Règle de décision (§1) : l'option « Recommandé » peut être appliquée sans demander, hors des 5 cas listés.

---

## 5. Travail restant, dans l'ordre

1. **Phase 6 : Transform System** (en cours).
   - Fait : sens de la transformation (ADR-031), rendu, tests ; section Transform du panneau (lot 45) ; sélection, glisser, poignées 3D et raccourcis G, R, S (lot 46) ; corrections (lots 47 et 48) ; Annuler / Rétablir (lot 49).
   - À faire : clôture selon le plan, avec les résultats de Noam. Le critère « Multiple Objects Supported » du plan suppose la sélection multiple (GUI_SPEC, Multi Selection), pas encore faite : à décider avec Noam (lot de plus ou report).
   - KI-015 : ViewportToolbar et ViewportStatus contiennent du texte en dur, à traduire quand la phase 6 les affiche.
2. **Phases 7 à 16**, dans l'ordre du plan technique.
3. **Known Issues ouverts** (CHANGELOG, KNOWN ISSUES) :

   | KI | Sujet | À régler avant |
   |---|---|---|
   | KI-007 | Réponse de Generate Recommendation différente du Recommendation Schema | Implémentation de l'API Recommendation |
   | KI-008 | Limites de l'imprimante et du matériau non appliquées au profil recommandé | Phase 14 |
   | KI-013 | npm audit : 7 alertes « high » (braces, via shadcn) ; ne pas lancer `npm audit fix --force` | Phase 16 |
   | KI-015 | Composants inutilisés avec du texte en dur | Phase qui affiche chaque composant (6, puis 7 à 10) |
   | KI-019 | 3MF Bambu à plusieurs plateaux : objets éloignés | Phase 14 |
   | KI-020 | Noms d'objets et métadonnées du 3MF non gardés (aucun champ dans DATA_SCHEMA) | Phase 13 |
   | KI-021 | Objet enfoncé sous le plateau, non permis pour l'instant | Phase 15 |

4. **Points signalés, en attente d'une décision de Noam :**
   - API_SPEC.md devrait passer en 3.0.0 : la réponse Generate Recommendation est un changement cassant (lié à KI-007).
   - SLICER_EXPORT_SPEC.md : version restée en 1.0.0, pas de code d'erreur pour les contrôles de scène (proposés : EXP_013 hors volume, EXP_014 collision).
   - Duplication projet/scène des 4 sélections dans DATA_SCHEMA (décision 4) : choisir la source de vérité.
   - `WYPROJExporter` : le champ `author` de `metadata` n'est jamais rempli.
   - README.md : il indique encore « Current Phase: Phase 0 » et une liste des phases qui ne suit pas ROADMAP ; ambiguïté sur Undo/Redo (ROADMAP phase 0, plan technique phase 6).
   - `src/transform/HistoryManager.ts` et `UndoRedoManager.ts` : modèles jamais utilisés (Annuler / Rétablir est dans `historyStore` et `TransformService`) ; les supprimer demande l'accord de Noam.
   - Fichiers d'emplacement mal nommés (`README.me`, `readme.me`, `readme`) dans `assets/`, `data/`, `cache/`, `.github/workflows/`.

---

## 6. Fichiers utiles dans `/mnt/project-files/slicyweb/`

- `lot9-create-project/` à `lot49-undo-redo/` : livrables de chaque lot (`LOTN.md`, zip, patch).
- `lot39-stl-import/fichiers-de-test.zip` : STL de test (cube, tour en texte, fichier tronqué, fichier vide, `.txt`).
- `lot40-3mf-import/fichiers-de-test-3mf.zip` : 3MF de test (badge OrcaSlicer, ligne Bambu Studio, disposition, cube en pouces, et trois fichiers à refuser).
- `lot42-zip-reader-cancel/fichiers-de-test-lot42.zip` : bombes zip à en-tête mensonger (3 Go réels, 1 ko ou 400 Mo annoncés), fichier avec bit 3 et fausse signature `PK\x07\x08`, gros 3MF pour tester Annuler.
- Les anciennes analyses (`plan-phase1-bootstrap.md`, `lot2-options-wyproj.md`, `lot2-proposition-objectid-adr026.md`) ne sont plus dans le dossier.
