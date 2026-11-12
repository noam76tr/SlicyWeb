# SlicyWeb : résumé de passation

Date : 2026-11-12. Lot 98 (optimisation d'orientation dans l'interface) sur `main` (0114140), vérifié identique, validé par Noam (décision 98). Lot 99 (clôture de la phase 11) : à envoyer sur GitHub. Dernière entrée du CHANGELOG : 0.1.99 (lot 99, In Progress).

---

## 1. Règles de travail (à reprendre telles quelles)

- **Livraison :** Noam remplace lui-même les fichiers sur GitHub. Claude ne fait ni commit, ni branche, ni push, ni PR. Si un contrôle automatique demande un commit, Claude répond que c'est Noam qui applique les fichiers.
- **Lots :** un lot à la fois, avec les fichiers complets et leur chemin exact. Noam confirme chaque lot (résultats de ses vérifications) avant le suivant. Dès qu'un lot est validé (sur `main`, contrôles et contrôles manuels réussis), Claude prépare le suivant sans attendre qu'on le lui demande (Noam, 2026-10-27).
- **Lots groupés (Noam, 2026-11-06) :** quand plusieurs lots qui se suivent ne demandent ni contrôle manuel ni réponse de Noam, Claude les livre ensemble dans un seul zip, **au plus 3 lots à la fois**.
  - Chaque lot garde son numéro (et son entrée du CHANGELOG), avec une partie par lot dans un seul fichier, nommé d'après les lots (par exemple `LOT86-87.md`).
  - Un lot qui pose une question ou attend une décision de Noam n'est jamais groupé.
  - Une seule liste de fichiers à supprimer et un seul jeu de résultats attendus.
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
  - CRLF : CHANGELOG.md, DECISIONS.md, PHASES_IMPLEMENTATION_PLAN.md, FILE_STRUCTURE.md, DATA_SCHEMA.md, API_SPEC.md, GUI_SPEC.md, SECURITY_SPEC.md, TECH_STACK.md, USER_SETTINGS_SPEC.md, ERROR_CODES_SPEC.md, PRINTER_PROFILE_SPEC.md, UNDO_REDO_SPEC.md, PERFORMANCE_SPEC.md, TEST_PLAN.md.
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
  npm run test:e2e
  npm run dev
  npm run build
  npm start
  ```

- **Ne jamais lancer `npm audit fix --force`** : il change des versions majeures sans revue (KI-026, zod 4). `npm audit fix` sans `--force` est permis, dans un lot.
- **Aucune commande git chez Noam (Noam, 2026-11-01) :** il travaille en local sans git ; son dossier local n'est pas un dépôt git. Ne jamais lui demander `git status`, `git apply`, `git diff` ni aucune autre commande git. Dans « À lancer chez toi » d'un `LOTN.md` : seulement des commandes `npm`, `node` ou PowerShell et des contrôles manuels. Le `.patch` reste un livrable (vérifié par Claude avec `git apply --check`), sans demander à Noam de l'appliquer avec git. Pour connaître les fichiers créés ou modifiés par un outil (par exemple `npx shadcn add …`), lui donner cette commande PowerShell, à lancer depuis le dossier du projet (remplacer `-30` par le nombre de minutes écoulées) :

  ```powershell
  Get-ChildItem -Path . -Exclude node_modules,dist,.git | Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object LastWriteTime -gt (Get-Date).AddMinutes(-30) | ForEach-Object { Resolve-Path -Relative $_.FullName }
  ```

- **Ligne 3 (Date) de ce fichier (Noam, 2026-10-24) :** écrire « Lot X : à envoyer sur GitHub » pour le lot livré, sans affirmer l'état de GitHub avant l'envoi de Noam ; seul un lot déjà comparé avec `main` est noté « sur `main` (commit …) ».
- **Envoi sur GitHub par le site web :** l'envoi ne garde pas toujours les chemins (lot 32 : fichiers posés à la racine ; lot 38 : fichiers manquants). Noam glisse les **dossiers** du zip (`docs`, `src`, `public`…), pas des fichiers seuls. Après chaque envoi, Claude compare `main` avec le lot, fichier par fichier, avant de continuer.
- **Nouvelles dépendances npm :** Noam les installe lui-même (`npm install paquet@version`), puis envoie `package.json` et `package-lock.json`. Le zip ne contient pas `package.json` dans ce cas.
- **Modifier `package.json` (scripts) :** ne pas utiliser `npm pkg set` avec une valeur qui contient un espace : PowerShell coupe l'argument (lot 44). Utiliser une commande `node -e "…"` qui lit, modifie et réécrit `package.json` (guillemets doubles autour, guillemets simples dedans).
- **Règle de décision (Noam, 2026-10-17) :** Claude peut appliquer lui-même l'option « Recommandé » sans demander, **sauf** si la question touche :
  1. le format des données ou des fichiers (DATA_SCHEMA, WYPROJ, export slicer) ;
  2. la sécurité (IPC, CSP, accès aux fichiers) ;
  3. un choix visible pour l'utilisateur (interface, comportement, réglages d'impression) ;
  4. une suppression de code ou de fonctionnalité (fichier, fonction, méthode, export) : même quand un tableau de suppressions a été validé, toute suppression qui n'y figure pas est demandée **avant** (Noam, 2026-11-02, après `getConfidenceLevel` et `getConfidenceScore` au lot 80) ; ne jamais la ranger seulement dans « Décisions prises seul » ;
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
| 6 | Transform System | Completed (2026-10-21) | 0.1.47 à 0.1.56 |
| 7 | Printer Database | Completed (2026-10-27) | 0.1.59 à 0.1.66 |
| 8 | Material Database | Completed (2026-11-01) | 0.1.67 à 0.1.75 |
| 9 | Model Analysis | Completed (2026-11-02) | 0.1.77 à 0.1.82 |
| 10 | Classification and Recommendation Engine | Completed (2026-11-08, après le contrôle de durée du lot 92 ; ADR-035 ; lot 84 documentation, 85 classification, 86 presets, 87 moteur de recommandation, 88 interface, 89 hébreu, 90 clôture, 91 maillage, 92 performance) | 0.1.84 à 0.1.93 |
| 11 | Optimization Engine | Completed (2026-11-12, lot 99, confirmée par les contrôles de Noam sur ses modèles et son PC ; ADR-036 ; analyse au lot 94, réponses D1 à D8 : A, décision 95 ; 96 documentation et 97 calcul, validés (décision 97) ; 98 interface, validé (décision 98) ; 99 clôture) | 0.1.96 à 0.1.99 |
| 12 à 16 | Cost, Project Persistence, Slicer Export, Advanced Features, Production Release | À venir | — |

### Ce que fait l'application aujourd'hui

- **Fenêtre :** Electron avec React ; barre de menus (9 menus de GUI_SPEC) ; barre d'outils (11 boutons) ; panneaux latéraux redimensionnables et repliables ; barre d'état ; thème sombre.
- **Panneau Propriétés en onglets (lot 93, décisions 90 et 93) :** ligne Projet au-dessus de trois onglets (Tabs de shadcn, texte seul) : Imprimante (Imprimante, Matériau, Filament), Objet (Objet, Transformation, Analyse), Réglages (Préréglage, Recommandations). L'onglet ne change jamais tout seul (import, sélection, analyse, recommandation, avertissement) ; seuls un clic et les menus Sélectionner une imprimante, un matériau, un filament (qui ouvrent l'onglet Imprimante) le changent. Onglet Imprimante à chaque démarrage, onglet non enregistré (lot 95, Q3 B, décision 95 ; `gui.propertiesTab` du lot 93 ignoré à la lecture, DATA_SCHEMA 3.12.0). Point rouge sur Réglages quand l'objet sélectionné (un seul) a un avertissement critique, annoncé « avertissement critique » par un lecteur d'écran. Chaque onglet garde son défilement ; en hébreu, Imprimante est à droite.
- **Langues :** anglais, français, hébreu (droite à gauche). La langue choisie est enregistrée dans `settings.json` (dossier de l'utilisateur) et rechargée au démarrage. 479 clés de traduction (lot 98). Tous les nombres affichés suivent le format de la langue (lot 81) : virgule décimale en français, point en anglais et en hébreu. Une valeur avec son unité s'affiche comme en anglais et en français dans les trois langues (« 200 mm/s », « 210 °C », « 15 % » ; lot 89) : en hébreu, `NumberFormatter` l'isole de gauche à droite (U+2066 … U+2069), à un seul endroit pour toute l'interface.
- **Vue 3D :**
  - repère en mm, X à droite, Y vers l'arrière, Z vers le haut, origine au centre du plateau (ADR-028) ;
  - grille adaptative ;
  - caméras perspective et orthographique, 7 vues prédéfinies, Home ;
  - pas de plateau tant qu'aucune imprimante n'est choisie (phase 7) ;
  - cube de navigation (lot 74) : zone de 120 px en bas à droite de la vue (en bas à gauche en hébreu), le cube tourne avec la caméra, 6 faces traduites (Avant = côté −Y, celui de la languette), clic sur une face = même vue que le menu View, face survolée éclairée, axes X rouge, Y vert, Z bleu partant du coin avant gauche bas ; plus d'axes au centre du plateau ;
  - plateau dessiné comme une plaque magnétique (lot 67) : plaque sombre à grain léger, coins arrondis, languette au milieu du bord avant (seul repère « avant »), grille sur la plaque, nom de l'imprimante (marque et modèle, texte seul) le long du bord avant ; jamais sélectionnable, ne bloque pas les clics.
- **Matériaux et filaments (phase 8, lot 68) :** le processus principal lit `data/materials/`, `data/filaments/` (Official) et les filaments de l'utilisateur (`<dossier de réglages>/filaments/`, Local Custom), les valide (MaterialSchema, FilamentSchema, `null` = non publié) et les sert par `material:getAll` et `filament:getAll`. Lot 69 : 5 matériaux (PLA, PETG, ABS, ASA, TPU) et 11 filaments livrés, écrits à partir des fiches techniques (`data/materials/SOURCES.md`, `data/filaments/SOURCES.md`) ; Elegoo PLA non livré (pas de fiche avec la température du plateau). Lot 70 : sections Material et Filament du panneau Propriétés (familles, filaments de la famille, « Not published » pour `null`, avertissement « Not listed by the printer manufacturer », dernier choix retenu dans `settings.json`, menus Select Material et Select Filament). Lot 71 : fenêtre Manage Filaments (filaments de l'utilisateur, copie d'un filament livré, couleur et prix au kg saisis, `filament:add`, `update`, `remove`, FIL_003 à FIL_005), prix au kg dans la section Filament. Lot 72 : matériaux et filaments mis à jour depuis `slicyweb-profiles` (dossiers `materials/` et `filaments/`, un `index.json` et un cache chacun, mêmes règles que les imprimantes), par Refresh Profiles et la vérification au démarrage.
- **Imprimantes (phase 7) :** 79 profils dans `data/printers/` (Official ; 10 en v1.0.0, 69 ajoutés en v1.0.1) et les imprimantes de l'utilisateur (`<dossier de réglages>/printers/`, Local Custom), lus par le processus principal. Section Printer du panneau Propriétés : sélecteur (« No printer », « My printers », puis un groupe par marque), limites (« Not published » pour `null`), taille du plateau en bas de la vue, dernière imprimante retenue. Fenêtre Manage Printers (lot 61) : ajouter, copier, modifier, supprimer ses propres imprimantes ; les imprimantes Official ne se modifient jamais. Synchronisation (lot 62) : au démarrage (au plus une fois par 24 h) et par Printer > Refresh Profiles, le processus principal lit `index.json` sur `main` de `noam76tr/slicyweb-profiles`, puis les profils au tag de l'index (SHA-256, tout ou rien), et les garde dans `<dossier de réglages>/cache/printers/` ; ce cache valide remplace `data/printers/`. Une ligne « Profiles v1.0.1 … » sous le sélecteur.
- **Import :**
  - STL (binaire et texte) et 3MF ;
  - par File > Import, le bouton Import ou le glisser-déposer ;
  - analyse dans un Web Worker, avec une barre de progression et un bouton Annuler ;
  - objets centrés à Z = 0 ; un 3MF garde la disposition de ses objets ;
  - messages d'erreur traduits, avec les codes d'ERROR_CODES_SPEC.
- **Analyse des modèles (phase 9, lots 77 à 80) :** chaque objet est analysé tout seul après son import, et de nouveau après une rotation ou une échelle (à la fin du geste ou à la validation du champ, jamais pendant un glissement), un objet à la fois, dans un Web Worker ; un calcul devenu inutile (objet supprimé ou de nouveau tourné) est abandonné. Section Analysis du panneau Propriétés : statut (À jour, Obsolète, Analyse en cours…, Aucune analyse), dimensions, volume (cm³), surface (cm²), maillage, surplombs, ponts, parois fines, stabilité (surface de contact, rapport de hauteur, risque de bascule sur 100 et son niveau) ; « Sélectionnez un seul objet » pour plusieurs objets. Tools > Analyze Models (et le bouton Analyze de la barre d'outils) et Recompute Analysis ; « Analyzing… » dans la barre d'état ; messages ANA_001 (échec) et ANA_002 (maillage non fermé, une fois par objet) au-dessus de la vue 3D, sous ceux de l'import. Lot 91 : seule une arête partagée par un nombre impair de triangles (1 ou 3) est un trou (ANA_002) ; des parties qui se touchent par une arête (4, 6… triangles) donnent l'information ANA_005, en gris dans la section Analysis seulement, sans baisse de confiance. Surplombs en rouge (lot 82, décision 83) : bouton « Surplombs » à côté de Déplacer, Pivoter, Échelle et Affichage > Afficher les surplombs ; les triangles au-delà de 45° de tous les objets de la scène en rouge, sélectionnés ou non, trouvés par le Worker de l'analyse, seulement quand l'analyse est à jour ; éteint à chaque démarrage.
- **Classification (phase 10, lot 85) :** calculée avec l'analyse, dans le même Worker, sur l'objet tel qu'il est posé : 10 caractéristiques (`FeatureDetector.ts`), 5 règles (vase 75, container 70, miniature 70, figurine 65, mechanical_part 65, sinon unknown 0), `source` automatic ; `open_top` exige des parois autour du fond (4 rayons horizontaux, remarque de Noam : une équerre en L n'est ni container ni vase) ; une catégorie choisie par l'utilisateur est gardée après une nouvelle analyse. `hollow` (volume / enveloppe convexe ≤ 0,35) est décidé par deux bornes du volume de l'enveloppe, l'enveloppe exacte seulement près de la limite (lot 90 : même résultat, 1 million de triangles analysés et classés en 4 à 4,8 s sous Linux au lieu de 11 s). Affichée et choisie dans la section Recommendation (lot 88).
- **Presets (phase 10, lot 86) :** les 11 presets de `data/presets/` (un fichier par catégorie, Official, valeurs de PRINT_PRESETS_SPEC 1.3.1) sont lus par le processus principal (`PresetLoader`, PresetSchema strict, fichier refusé : SCH_001 dans le journal) et servis par `preset:getAll`. `tree` est le seul type de supports en arbre (`organic` retiré), pas de ventilateur dans un preset. Lus par la fenêtre au démarrage (lot 88).
- **Moteur de recommandation (phase 10, lot 87) :** règles de RECOMMENDATION_RULES 1.1.2 (limites, températures, ventilateur, rétraction, supports, bordure, 13 avertissements, confiance), testé avec les imprimantes, matériaux, filaments et presets livrés (Ultimaker S5 + Fast Prototype : 100 mm/s avec VALUE_LIMITED, déplacement 150 mm/s ; jamais d'avertissement pour le déplacement).
- **Recommandation dans la fenêtre (phase 10, lot 88) :** `RecommendationService` fait la recommandation de chaque objet dès que son analyse est à jour et qu'une imprimante et un matériau sont choisis (le filament est facultatif) ; changer d'imprimante, de matériau ou de filament rend toutes les recommandations obsolètes, puis elles sont refaites (règle 11) ; sans imprimante ou sans matériau, elles restent obsolètes. Section Recommendation : statut, Type d'objet (« Automatique (catégorie) » puis les 15 catégories, avec la confiance de la classification automatique), preset, avertissements (les plus graves en premier, critique en rouge), confiance de la recommandation ; le reste sous « Détails », replié (couche, parois, remplissage, supports, adhérence, températures, ventilateur, vitesses, rétraction). Section Print Preset et barre d'état : le preset de l'objet sélectionné, « — » sinon. Outils > Générer les recommandations et le bouton Générer (objets sélectionnés, tous sinon). REC_001 et REC_002 dans la section seulement.
- **Transformations (phase 6) :** la vue 3D applique la position, la rotation et l'échelle de chaque objet (règles d'ADR-031). La section Transform du panneau Propriétés permet de saisir la position X, Y, la rotation, l'échelle (%) et la taille (mm), avec Reset et Center On Bed ; l'objet reste toujours posé sur le plateau. Dans la vue 3D : clic pour sélectionner (un vrai clic dans le vide désélectionne), glisser un objet pour le déplacer sur le plateau (après 4 pixels), poignées Move, Rotate, Scale (touches G, R, S et boutons au-dessus de la vue 3D, grisés sans sélection), Échap désélectionne. La position d'un objet est celle de son **centre** (DATA_SCHEMA 3.4.0) : il tourne autour de son centre ; avec la poignée, il tourne librement pendant le geste et se repose sur le plateau au relâchement. Poignée Scale : une poignée par axe (X à droite, Y devant, Z en haut) et celle du centre ; le cadenas agit pareil dans le panneau et sur la poignée. La section Transform n'affiche que les lignes du mode. Annuler / Rétablir (lot 49) : transformations seulement, un geste = une étape, 50 étapes, barre d'outils, menu Édition, Ctrl+Z, Ctrl+Y, Ctrl+Maj+Z ; l'objet concerné est sélectionné ; dans un champ de la section Transform, Ctrl+Z annule d'abord la frappe non validée, sinon il annule dans l'application (lot 52). Plusieurs objets (lot 50) : Ctrl+clic (vue 3D et panneau Objets), Ctrl+A ; le groupe se déplace, tourne et change d'échelle (uniforme) autour de son centre ; le panneau Transform agit comme la poignée sur le groupe. Rectangle de sélection dans la vue 3D, Maj+clic dans le panneau Objets (lot 51).
- **Optimisation de l'orientation (phase 11, lots 97 et 98, ADR-036) :** Outils > Optimiser l'orientation et le bouton Optimiser (actifs dès qu'il y a un objet, grisés pendant une recherche) cherchent la meilleure orientation des objets sélectionnés (tous si aucun), un objet à la fois dans un Web Worker (« Optimisation… » dans la barre d'état) : objet posé sur une de ses faces planes, note 100 − S − T − H, règles de fiabilité, appliquée seulement avec 5 points de plus. Les orientations trouvées sont appliquées ensemble à la fin, en une seule action d'historique OPTIMIZATION (Ctrl+Z les rend), position X et Y gardées, objet reposé sur le plateau ; l'analyse et la recommandation sont refaites. Un message au-dessus de la vue donne une ligne par objet (note avant et après, surplombs, supports, risque de bascule ; « déjà la meilleure » ; OPT_002). Jamais lancée toute seule, rien d'enregistré (`OptimizationService.ts`, `optimizationTaskStore.ts`, `OptimizationMessages.tsx`).
- **Sécurité :**
  - liste blanche des canaux IPC dans le preload (29 canaux depuis le lot 86, `npm run check:ipc`) ;
  - téléchargement des profils (imprimantes, et matériaux et filaments depuis le lot 72) : processus principal seulement, HTTPS sous `raw.githubusercontent.com/noam76tr/slicyweb-profiles/`, sans redirection, 15 s et 1 Mo par fichier, SHA-256 ;
  - politique de sécurité du contenu (CSP) stricte dans l'application compilée, et adaptée en développement ;
  - lecture des 3MF par le répertoire central de l'archive, limites de décompression, décompression arrêtée dès qu'une partie dépasse sa taille annoncée (bombes zip).

### Outils et versions (package.json)

- Electron 44 (44.9.3 depuis le lot 63), Vite 8.3 (`vite.config.mts`, vite-plugin-electron), React 18, TypeScript 6, Zod 3.25, Zustand 5, Three.js 0.186.
- Tailwind CSS 4, shadcn/ui (Base UI, style base-nova, `rtl: true`), Lucide 1.56, react-resizable-panels 4.14.
- Polices Inter et Noto Sans Hebrew (Fontsource).
- fflate 0.8.3 et fast-xml-parser 5.11.2 (lecture des 3MF).
- Vitest 5.0.3 pour les tests unitaires (`npm test`, `vitest.config.mts`, `tests/unit/`).
- Playwright 1.64.1 (`@playwright/test`) pour les tests de bout en bout (`npm run test:e2e`, `playwright.config.mts`, `tests/e2e/`) : l'application Electron compilée est lancée pour chaque test, dans un dossier de réglages temporaire ; aucun navigateur à télécharger.

### Versions des documents

| Document | Version |
|---|---|
| DATA_SCHEMA.md | 3.13.0 (lot 96 : règles de l'Optimization Result Schema, rien d'enregistré ; lot 95 : `gui` retiré du User Preferences Schema, un `settings.json` du lot 93 reste lu ; lot 93 : `gui.propertiesTab` ; lot 91 : ANA_002 seulement pour une arête à nombre impair de triangles, ANA_005 ; phase 10 : `classification.source`, Preset Settings, `supports {enabled, type}` sans `organic`, `temperature {nozzle, bed}`, `filamentId` nullable, règle 11 ; dans le code : `classification.source` au lot 85, presets au lot 86, recommandation au lot 87 ; règle 11 au lot 88) |
| Format WYPROJ | 3.0.0 (les fichiers 2.0.0 sont refusés) |
| USER_SETTINGS_SPEC.md | 2.2.0 (lot 95 : aucun réglage GUI enregistré, `propertiesTab` du lot 93 ignoré à la lecture) |
| IMPORT_EXPORT_SPEC.md | 3.0.0 |
| ERROR_CODES_SPEC.md | 2.6.0 (lot 96 : OPT_002 pour un objet, OPT_001 non utilisé en phase 11 ; lot 91 : ANA_005 information, maillage non conforme ; ANA_001 ; ANA_002 avertissement non bloquant ; REC_001, REC_002 information, REC_003 non utilisé en phase 10 ; SCH_001 aussi pour un fichier de preset refusé) |
| OBJECT_CLASSIFICATION_SPEC.md | 1.2.2 (lot 91 : `holes` non calculé pour un maillage non conforme ; `classificationVersion` « 1.2.2 » ; 10 caractéristiques, 5 catégories automatiques, choix de l'utilisateur ; `open_top` avec les parois autour du fond) |
| PRINT_PRESETS_SPEC.md | 1.3.1 (11 presets livrés, valeurs, `tree` ; id de l'enveloppe = catégorie) |
| RECOMMENDATION_RULES.md | 1.1.4 (lot 96 : Optimization Rules = règles de fiabilité de la recherche d'orientation ; lot 91 : aucune baisse de confiance pour un maillage seulement non conforme ; limites, températures, rétraction, supports, 13 avertissements, confiance ; déplacement 150 mm/s quand `maxTravelSpeed` vaut `null` ; jamais d'avertissement pour le déplacement) |
| SUPPORT_GENERATION_SPEC.md | 1.1.0 (Organic et Tree = `tree`) |
| PERFORMANCE_SPEC.md | 1.4.1 (lot 99 : durée de l'optimisation mesurée dans l'application sous Linux, 2,4 à 2,9 s pour 1 million de triangles ; lot 96 : optimisation, 1 million de triangles en moins de 5 s, méthode ; analyse et classification : 1 million de triangles en moins de 5 s ; enveloppe convexe, lot 90 ; arêtes et BVH partagés, boîte englobante, lot 92) |
| ARCHITECTURE_DECISION_MATRIX.md | 2.8.0 (ADM-032) |
| AI_ENGINE_SPEC.md | 1.1.0 (lot 96 : Rules Of Version 1.1.0, recherche d'orientation : candidats, note 100 − S − T − H, règles de fiabilité, aucune suggestion automatique) |
| DOMAINS_DEPENDENCY_MATRIX.md | 2.1.0 (lot 96 : Optimization ne dépend plus de Recommendation, D7) |
| ROADMAP.md | 2.2.0 (lot 96 : phase 9 de la feuille de route limitée à l'orientation ; temps, matériau et presets en phase 13, phase 15 du plan technique) |
| API_SPEC.md | 2.1.0 (voir §5, points en attente ; PresetIPC Channels au lot 86) |
| SLICER_EXPORT_SPEC.md | 1.1.0 (températures réglées, mode vase manquant : KI-029) |
| UNDO_REDO_SPEC.md | 2.3.0 (lot 96 : Orientation Optimization, une action OPTIMIZATION pour tous les objets tournés ; 50 étapes ; phase 6 : transformations ; Ctrl+Z dans un champ) |
| Dernier ADR | ADR-036 ; dernier ADM : ADM-032 |

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
| 50 | Sélection de plusieurs objets, transformations de groupe ; KI-022 | 0.1.53 |
| 51 | Rectangle de sélection, Maj+clic dans le panneau Objets ; KI-022 réglé | 0.1.54 |
| 52 | Bug 16 : Ctrl+Z dans un champ de la section Transform | 0.1.55 |
| 53 | Clôture de la phase 6 ; 8 fichiers jamais utilisés supprimés (KI-015 pour la vue 3D) | 0.1.56 |
| 54 | Tests de bout en bout avec Playwright (16 tests) | 0.1.57 |
| 55 | Messages d'import qui bloquaient les clics dans la vue 3D ; rectangle testé depuis le haut (17 tests e2e) | 0.1.58 |
| 56 | Phase 7 : inventaire, sources des profils d'imprimantes et licences, 8 décisions (`lot56-phase7-analyse/PHASE7-ANALYSE.md`) | — |
| 57 | Phase 7, documentation : ADR-032, DATA_SCHEMA 3.5.0, PRINTER_PROFILE_SPEC 2.0.0, KI-023 | 0.1.59 |
| 58 | Phase 7 : profils lus par le processus principal, canaux `printer:getAll`, `get`, `count`, réglages `printer` | 0.1.60 |
| 59 | Phase 7 : les 10 profils de `data/printers/` et `SOURCES.md` (pages des fabricants lues le 2026-10-26) | 0.1.61 |
| 60 | Phase 7 : section Printer (sélecteur, limites, « Not published »), taille du plateau dans la vue, dernière imprimante retenue, menu Select Printer | 0.1.62 |
| 61 | Phase 7 : imprimantes saisies par l'utilisateur (`printer:add`, `update`, `remove`), fenêtre Manage Printers, groupe « My printers » ; PRN_005 à PRN_007 | 0.1.63 |
| 62 | Phase 7 : synchronisation des profils depuis `noam76tr/slicyweb-profiles` (`index.json`, cache, `printer:refresh`, Refresh Profiles) ; DATA_SCHEMA 3.6.0, amendement d'ADR-032 ; KI-024 réglé (B) | 0.1.64 |
| 63 | « Aucune version publiée » distinct de « Dépôt injoignable » (HTTP 404) ; Electron 44.9.3 et `npm audit fix` ; KI-013 réglé, KI-026 (zod 4) | 0.1.65 |
| 64 | Clôture de la phase 7 ; `PrinterCache.ts` supprimé (jamais utilisé) | 0.1.66 |
| 65 | Analyse seule : phase 8 (Material Database), inventaire, sources et licences, décisions D1 à D11 (`lot65-phase8-analyse/PHASE8-ANALYSE.md`) | — |
| 66 | Phase 8, documentation : ADR-033, DATA_SCHEMA 3.7.0, MATERIAL_PROFILE_SPEC et FILAMENT_SETTINGS_SPEC 2.0.0, FIL_001 et FIL_002 | 0.1.67 |
| — | Profils v1.0.1 (hors lot) : 69 imprimantes ajoutées à `data/printers/` et à `noam76tr/slicyweb-profiles` (pages des fabricants lues le 2026-10-28), machines sans fiche lisible listées dans `profils-v1.0.1/PROFILS-V1.0.1.md` ; tests adaptés (79 profils, tag v1.0.1) | 0.1.68 |
| 67 | Plateau en plaque magnétique (coins arrondis, grain, languette avant) et nom de l'imprimante sur le plateau, hors phase 8 ; numéros de la phase 8 décalés (68 à 73) ; cube de navigation prévu après la phase 8 | 0.1.69 |
| 68 | Phase 8, chargement : MaterialSchema et FilamentSchema avec `null` et `.strict()`, fichiers lus par le processus principal (MAT_002, FIL_002), `material:getAll` et `filament:getAll` (25 canaux) ; `MaterialValidator.ts` et `FilamentValidator.ts` supprimés (D11) | 0.1.70 |
| 69 | Phase 8, données : 5 matériaux et 11 filaments (fiches lues le 2026-10-30), SOURCES.md ; Elegoo PLA non livré ; `DefaultMaterial.ts` supprimé (D11) | 0.1.71 |
| 70 | Phase 8, interface : sections Material et Filament, avertissement (alias Flex = TPU, NYLON = PA), réglages `material`, 16 clés (334) ; `MaterialPanel.tsx` et `FilamentPanel.tsx` supprimés (D11) | 0.1.72 |
| 71 | Phase 8 : filaments saisis par l'utilisateur (`filament:add`, `update`, `remove`, 28 canaux), fenêtre Manage Filaments, prix au kg ; FIL_003 à FIL_005 ; 36 clés (370) ; attendu de `printer.spec.ts` corrigé ; dans Manage Filaments et Manage Printers : erreurs affichées dès la saisie, Save bloqué, ouverture sur l'élément choisi, « Edit: nom » ou « New … » en haut du formulaire | 0.1.73 |
| 72 | Phase 8 : synchronisation des matériaux et filaments depuis `slicyweb-profiles` (`materials/index.json`, `filaments/index.json`, tag v1.1.0, caches `cache/materials/` et `cache/filaments/`), Refresh Profiles et la vérification au démarrage sur les trois listes ; `ProfileRepositorySync.ts` commun ; DATA_SCHEMA 3.8.0 ; `MaterialCache.ts` et `FilamentCache.ts` supprimés (D11) | 0.1.74 |
| 73 | Clôture de la phase 8 ; aucun fichier à supprimer (tableau D11 fait aux lots 68 à 72) ; règle d'écriture du tag de publication (minuscule, comme dans `index.json`) | 0.1.75 |
| 74 | Cube de navigation (décisions 76 et 78) : `NavigationCube.ts`, `NavigationCube.tsx`, axes retirés du centre du plateau, 6 clés (376) ; 2 tests e2e (28) ; règle « aucune commande git chez Noam » (§1) | 0.1.76 |
| 75 | Analyse seule : phase 9 (Model Analysis), inventaire, définitions et méthodes de calcul, décisions D1 à D10 (`lot75-phase9-analyse/PHASE9-ANALYSE.md`) ; 0.1.76 passe en « Completed » | — |
| 76 | Phase 9, documentation : ADR-034, DATA_SCHEMA 3.9.0, plan (classification en phase 10), GUI_SPEC, ERROR_CODES_SPEC 2.3.0, PERFORMANCE_SPEC 1.1.0, TEST_PLAN ; AnalysisSchema strict avec `classification` à `null` (9 tests) | 0.1.77 |
| 77 | Phase 9, calcul de base (`src/model_analysis/`, réécrit) : sommets soudés, dimensions, volume, surface, maillage, arêtes ouvertes (ANA_002), centre de gravité, stabilité avec l'enveloppe des contacts ; Web Worker `modelAnalysis.worker.ts` et `AnalysisRunner.ts` (pas encore lancés par l'interface, lot 80) ; 23 tests ; 1 million de triangles en 0,5 s environ (Linux) | 0.1.78 |
| 78 | Phase 9, surplombs et ponts (`PrintabilityAnalyzer.ts` réécrit, branché sur `ModelAnalyzer`, donc dans le Worker) : angle depuis la verticale, faces posées exclues, seuil 45° ; ponts = zones plates (> 80°) avec au moins deux appuis séparés, portée = plus courte distance entre deux appuis ; classe `PrintabilityAnalyzer` et `getPrintabilityScore` retirées ; 8 tests (31) ; sphère de 1 million de triangles en 0,8 s environ (Linux) | 0.1.79 |
| 79 | Phase 9, parois fines (`analyzeThinWalls` dans `PrintabilityAnalyzer.ts`, branché sur `ModelAnalyzer`) : 200 000 points au plus, répartis selon l'aire, toujours les mêmes, jamais sur une arête ; rayon vers l'intérieur qui ignore son propre triangle, BVH de `three-mesh-bvh` 0.9.17 (dépendance ajoutée, `package.json` et `package-lock.json` de Noam) ; détection sous 0,8 mm ; 9 tests (40) ; sphère de 1 million de triangles en 2 s environ en tout (Linux) ; KI-027 (deepmerge) et KI-028 (minimatch) ajoutés (outils de développement) | 0.1.80 |
| 80 | Phase 9, interface de l'analyse : `AnalysisService.ts` réécrit (lancement automatique, attente de la fin d'un geste, un objet à la fois, calcul abandonné, AnalysisSchema, ANA_001 et ANA_002), `analysisTaskStore.ts`, section Analysis (`AnalysisSection.tsx`), `AnalysisMessages.tsx`, Tools > Analyze Models et Recompute Analysis, bouton Analyze de la barre d'outils, barre d'état ; `TransformService` : `isGestureActive`, `onGestureEnd` ; 31 clés (407) ; 14 tests (354 + 1), 4 e2e (32) ; `AnalysisPanel.tsx` supprimé (D9) | 0.1.81 |
| 81 | Clôture de la phase 9 ; nombres au format de la langue dans toutes les sections (`src/i18n/NumberFormatter.ts`, GUI_SPEC « Number Format ») ; aucune suppression ; 4 tests (358 + 1), 1 e2e (33) | 0.1.82 |
| 82 | Surplombs en rouge dans la vue 3D (décision 81, D8 option B ; GUI_SPEC « Overhang Display ») : `overhangTriangles` (Worker de l'analyse), `analysisTaskStore`, `viewportStore.showOverhangs`, `ObjectRenderer.syncOverhangs`, bouton « Surplombs » et Affichage > Afficher les surplombs ; 2 clés (409) ; 8 tests (366 + 1), 1 e2e (34) ; `RightSidebar.tsx` et `StatusBar.tsx` au format Prettier (format seulement) ; aucune suppression | 0.1.83 |
| 83 | Analyse seule : phase 10 (Classification and Recommendation Engine), inventaire, 13 décisions D1 à D13 (`lot83-phase10-analyse/PHASE10-ANALYSE.md`) ; hébreu `analysis.overhangs` « אזורים תלויים » au lieu de « תליות », comme le bouton et le menu (demande de Noam) | 0.1.84 |
| 84 | Documentation de la phase 10 (décision 84) : ADR-035, ADM-031, DATA_SCHEMA 3.10.0, OBJECT_CLASSIFICATION_SPEC 1.2.0, PRINT_PRESETS_SPEC 1.3.0, RECOMMENDATION_RULES 1.1.0, SUPPORT_GENERATION_SPEC 1.1.0, GUI_SPEC, ERROR_CODES_SPEC 2.4.0, SLICER_EXPORT_SPEC 1.1.0, plan, TEST_PLAN ; KI-029 ; aucun code | 0.1.85 |
| 85 | Phase 10, classification (décision 85) : `FeatureDetector.ts` (nouveau), `CategoryDetector`, `ConfidenceScorer`, `ClassificationEngine` réécrits, `ClassificationValidator` appelé (KI-011), `classification.source` (AnalysisSchema, type), classification calculée dans le Worker de l'analyse et gardée si choisie par l'utilisateur (AnalysisService) ; `open_top` avec 4 rayons horizontaux (équerre en L) ; OBJECT_CLASSIFICATION_SPEC 1.2.1, RECOMMENDATION_RULES 1.1.1 (Q1 C) ; 4 copies de `src/optimization_engine/` et `ConfidenceScorer.isReliable` supprimés (D13) ; 26 tests (392 + 1), e2e inchangés (34) | 0.1.86 |
| 86 | Phase 10, presets (livré avec le lot 87) : 11 fichiers dans `data/presets/` (id = catégorie), `PresetLoader.ts` (nouveau, processus principal, SCH_001), `PresetIPC.ts` et `preset:getAll` (29 canaux), PresetSchema strict sans `fanSpeed`, `organic` retiré ; `PresetManager`, `PresetRepository`, `PresetSelector`, `PresetValidator` et `PresetService.ts` supprimés (D13) ; API_SPEC (PresetIPC Channels), PRINT_PRESETS_SPEC 1.3.1, ERROR_CODES_SPEC 2.4.1 ; 18 tests, 1 e2e | 0.1.87 |
| 87 | Phase 10, moteur de recommandation (livré avec le lot 86) : limites, températures, ventilateur, rétraction, supports, bordure, 13 avertissements, confiance (RECOMMENDATION_RULES 1.1.2, Q1 A : jamais d'avertissement pour le déplacement) ; `RecommendationConstants.ts` (nouveau) ; RecommendationSchema avec `temperature`, `filamentId` `null`, Warning Schema ; méthodes jamais appelées de DecisionEngine et WarningEngine supprimées (D13) ; KI-008 et KI-010 réglés ; 38 tests (448 + 1), e2e 35 | 0.1.88 |
| 88 | Phase 10, interface : `RecommendationService.ts` réécrit (presets lus par `preset:getAll`, lancement automatique, règle 11, Generate, type d'objet), `recommendationTaskStore.ts` et `RecommendationSection.tsx` (nouveaux), section Print Preset et barre d'état, Outils > Générer les recommandations et bouton Générer, `ClassificationEngine.chooseCategory` et `automaticOf` ; 61 clés (470) ; KI-011 réglé ; `RecommendationPanel.tsx` et `PresetPanel.tsx` supprimés (D13) ; 18 tests (466 + 1), 2 e2e (37) | 0.1.89 |
| 89 | Valeurs avec unité en hébreu (remarque de Noam sur le lot 88) : `formatQuantity`, `formatQuantities`, `formatQuantityRange`, `isolateValue` dans `NumberFormatter.ts`, utilisés par toutes les valeurs avec unité (sections, taille du plateau) ; unités `mm` aussi en hébreu ; clé `preset.noSelection` supprimée (469) ; fonction privée `format` de `PrinterSection.tsx` supprimée (demandée à Noam) ; 3 tests (469 + 1), 1 e2e en hébreu (38) | 0.1.90 |
| 90 | Clôture de la phase 10 : `hollow` décidé par deux bornes du volume de l'enveloppe convexe (`isHollow`, `hullVolumeBounds` dans `FeatureDetector.ts`), l'enveloppe exacte seulement près de 0,35 (même résultat ; 6,5 s → 0,5 à 0,9 s sur 1 million de triangles) ; PERFORMANCE_SPEC 1.2.0 ; seuils de la classification inchangés, vérifiés sur les modèles de Noam (contrôles manuels) ; aucune suppression ; 18 tests (487 + 1), e2e inchangés (38) | 0.1.91 |
| 91 | Trou ou maillage non conforme (remarque de Noam sur son modèle Seckit, décision 90) : ANA_002 seulement pour une arête partagée par un nombre impair de triangles (1 ou 3) ; une arête à 4, 6… triangles (parties qui se touchent par une arête) donne l'information ANA_005, en gris dans la section Analyse seulement, sans baisse de confiance, sans `holes` ; `countEdgeDefects` (MeshValidator), `meshManifold` (ModelAnalyzer), `nonManifoldObjectIds` (analysisTaskStore) ; `CLASSIFICATION_VERSION` « 1.2.2 » ; 1 clé (470) ; 3 tests (490 + 1), 1 e2e (39) ; aucune suppression | 0.1.92 |
| 92 | Analyse plus rapide, mêmes résultats (décision 91 : 8,76 s chez Noam pour 1 million de triangles) : table des arêtes construite une fois en temps linéaire (`buildEdgeTable`, `triangleUses`) et partagée (arêtes ouvertes, ponts, part plane, genre) ; BVH construit une fois (`buildPlacedBVH`), partagé par les parois fines et `open_top` ; `hollow` : boîte englobante d'abord, puis bornes à 32 puis 128 directions, puis l'enveloppe exacte ; sous Linux dans l'application, 1,8 à 2,3 s au lieu de 3,4 à 4,4 s ; fonctions privées `edgeKey` de MeshValidator et FeatureDetector supprimées (acceptée par Noam) ; PERFORMANCE_SPEC 1.3.0 ; 4 tests (494 + 1), e2e inchangés (39) ; clôture de la phase 10 | 0.1.93 |
| 93 | Onglets du panneau Propriétés (décisions 90 et 93, hors phase) : `tabs.tsx` (shadcn), `propertiesPanelStore.ts` et `PropertiesTabService.ts` (nouveaux), `RightSidebar.tsx` (ligne Projet, 3 onglets, point rouge, défilement par onglet), menus Sélectionner… qui ouvrent l'onglet Imprimante (`focusTab`) ; `gui.propertiesTab` dans `settings.json` (DATA_SCHEMA 3.11.0, USER_SETTINGS_SPEC 2.1.0, `settings:update`, aucun canal ajouté) ; GUI_SPEC (Properties Tabs) ; 5 clés (475) ; 7 tests (501 + 1), 3 e2e (42), les autres e2e ouvrent l'onglet de leur section (`openTab`) ; aucune suppression | 0.1.94 |
| 94 | Phase 11, inventaire et décisions (aucun code) : `PHASE11-ANALYSE.md` (documentation de la phase, inventaire de `src/optimization_engine/` jamais appelé et sans mesure, 8 décisions D1 à D8, découpage en lots 95 à 98) ; 0.1.94 passe en Completed avec les résultats de Noam | — |
| 95 | Onglet Imprimante à chaque démarrage (décision 95, Q3 B, hors phase) : onglet non enregistré ; `gui` retiré du User Preferences Schema (DATA_SCHEMA 3.12.0, USER_SETTINGS_SPEC 2.2.0) ; un `settings.json` du lot 93 avec `gui` lu sans erreur ni perte de réglage, `gui` absent du fichier après l'écriture suivante ; GUI_SPEC (Properties Tabs), API_SPEC (`settings:update` refuse `gui`, version inchangée) ; suppressions : `GuiPreferencesSchema`, `GuiPreferences`, `readGui`, `PropertiesTabService.load`, `restoreTab` et `chosen` du store ; aucune clé (475) ; tests 498 + 1, 43 e2e | 0.1.95 |
| 96 | Documentation de la phase 11 (décision 95, D1 à D8 : A) : ADR-036, ADM-032, AI_ENGINE_SPEC 1.1.0, DATA_SCHEMA 3.13.0, RECOMMENDATION_RULES 1.1.4, GUI_SPEC (Tools, Optimize, « Optimisation… », message du résultat), UNDO_REDO_SPEC 2.3.0, ERROR_CODES_SPEC 2.6.0, DOMAINS_DEPENDENCY_MATRIX 2.1.0, PERFORMANCE_SPEC 1.4.0, TEST_PLAN, plan (phase 11 In Progress, phase 15), ROADMAP 2.2.0 ; KI-030 ; 0.1.95 passe en Completed | 0.1.96 |
| 97 | Recherche d'orientation (ADR-036 D2, D3), livrée avec le lot 96 : `OrientationOptimizer.ts` et `OptimizationEngine.ts` réécrits, `OptimizationError.ts`, `OptimizationRunner.ts`, `workers/orientationSearch.worker.ts`, `OptimizationConstants.ts` ; `OptimizationSchema` strict ; suppressions D8 : `SupportOptimizer.ts`, `SpeedOptimizer.ts`, `MaterialOptimizer.ts` ; 25 tests (tour couchée sur son côté gauche, vases debout gardés, figurine gardée debout) ; aucune clé (475), aucun canal (29) ; tests 523 + 1 attendus | 0.1.97 |
| 98 | Phase 11, interface (ADR-036 D4) : Outils > Optimiser l'orientation et bouton Optimiser actifs, `OptimizationService.ts` (sélection ou tous les objets, un à la fois dans le Worker, recherche abandonnée si l'objet est supprimé ou tourné, appliquée après un geste en cours), une action d'historique OPTIMIZATION (`historyStore`, option `actionType` de `TransformService.applyMany`), `optimizationTaskStore.ts`, `OptimizationMessages.tsx` (une ligne par objet), « Optimisation… » dans la barre d'état ; 8 clés ajoutées, 4 clés `optimization.title`, `.run`, `.material`, `.time` supprimées (D8) : 479 ; 0.1.96 et 0.1.97 passent en Completed ; 14 tests (537 + 1), 2 e2e (45) | 0.1.98 |
| 99 | Clôture de la phase 11 (aucun code) : phase 11 Completed dans le plan (Printability Improves, Reliability Maintained, durée) ; PERFORMANCE_SPEC 1.4.1 (durée mesurée dans l'application sous Linux : « Optimisation… » 2,4 à 2,9 s pour une tour de 1 016 576 triangles, 2,4 s pour une sphère de 998 000 triangles) ; poids de la note inchangés, vérifiés sur les modèles de Noam (contrôles manuels) ; 0.1.98 passe en Completed ; aucune suppression ; tests inchangés (537 + 1, 45 e2e) | 0.1.99 |

---

## 4. Décisions prises par Noam

**Données et projets**

1. **Structure WYPROJ : option 1**, alignée sur DATA_SCHEMA.md (priorité 0). L'enveloppe est `{format, version, project, metadata}` et le projet est à plat. Format 3.0.0 depuis ADR-027 ; les fichiers 2.0.0 sont refusés.
2. **ADR-026 :** analyses et recommandations par objet, indexées par `objectId`. Rotation et échelle rendent les résultats `outdated`, pas un simple déplacement. Les contrôles de scène (volume d'impression, collisions) sont refaits avant chaque export.
3. **Sélections non choisies :** `null`, aussi pour `scene.printer`, `scene.material`, `scene.filament` et `scene.preset`.
4. **Duplication projet/scène des 4 sélections dans DATA_SCHEMA :** connue et documentée (« Known Duplication »), source de vérité encore à choisir.
5. **Nom de fichier WYPROJ :** lettres de toutes les langues acceptées (lots 7 et 8).
6. **Création de projet :** ProjectManager est le seul créateur ; ProjectService lui délègue.
7. **Copies de classification dans `src/optimization_engine/` :** supprimées au lot 85 (D13 de la phase 10, validé par Noam le 2026-11-05 ; elles restaient depuis le 2026-10-13).
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
36. Annuler / Rétablir : seulement les transformations (l'import et la suppression plus tard) ; 50 étapes (UNDO_REDO_SPEC disait 100), historique vidé à la fermeture ou l'ouverture d'un projet ; l'objet de l'étape annulée est sélectionné, une sélection seule n'est pas une étape ; Ctrl+Z dans un champ annule seulement la frappe (précisé par la décision 43).
37. Historique gardé à 50 étapes.
38. Sélection multiple (lot 50) : Ctrl+clic ajoute ou retire (vue 3D et panneau Objets), Ctrl+A tout, clic dans le vide désélectionne ; groupe déplacé, tourné et mis à l'échelle autour de son centre, chaque objet reposé au relâchement ; une étape d'annulation par modification du groupe. Pas de rectangle ni de Maj+clic (KI-022).
39. Échelle d'un groupe : toujours uniforme.
40. Panneau Transform d'un groupe : agit comme la poignée (position = centre, rotation relative qui revient à 0, échelle 100 % = taille du groupe, taille = emprise du groupe). Pour tourner une pièce sur elle-même, on la sélectionne seule.
41. Rectangle de sélection comme l'Explorateur Windows : bouton gauche dans le vide de la vue 3D, puis glisser ; au relâchement, les objets touchés sont sélectionnés ; Ctrl + rectangle ajoute ; même seuil (un clic dans le vide désélectionne) ; commencer sur un objet le déplace. Maj+clic dans le panneau Objets : plage depuis le dernier objet cliqué.
42. Un rectangle qui ne touche aucun objet désélectionne (accepté au contrôle du lot 51).
43. Ctrl+Z dans un champ de la section Transform (bug 16) : frappe pas encore validée → Ctrl+Z annule la frappe ; rien en attente → Annuler de l'application, l'objet change tout de suite et le champ se met à jour ; quitter le champ ensuite ne crée pas d'étape.
44. Fichiers jamais utilisés supprimés à la clôture de la phase 6 : `src/gui/viewport/ViewportToolbar.tsx`, `ViewportStatus.tsx` et, dans `src/transform/`, tout sauf `TransformValidator.ts` (HistoryManager, UndoRedoManager, TransformManager, MoveTool, RotateTool, ScaleTool).
45. Un message d'information (import) ne doit jamais empêcher de cliquer en dessous : seuls ses boutons Annuler et Fermer reçoivent la souris (lot 55).
46. **Phase 7, profils d'imprimantes (ADR-032, D1) :** écrits par SlicyWeb à partir des pages des fabricants, publiés dans le dépôt public `noam76tr/slicyweb-profiles`, d'où vient la liste ; `data/printers/` n'en garde qu'une copie de secours hors ligne. Plus les imprimantes saisies par l'utilisateur. Aucun fichier de profil d'un slicer copié.
47. **Licences (D2) :** les chiffres viennent des pages des fabricants, **jamais** recopiés depuis les fichiers de profils des slicers, même si les valeurs sont identiques. Sources dans `data/printers/SOURCES.md`. Avis juridique avant la diffusion (KI-023).
48. **Format (D3) :** enveloppe Repository Data Schema, Printer Schema plat inchangé ; PRINTER_PROFILE_SPEC aligné sur DATA_SCHEMA.
49. **Chargement (D4) :** par le processus principal, validation PrinterSchema, canaux `printer:*`.
50. **Mises à jour (D5) :** depuis le dépôt de SlicyWeb `noam76tr/slicyweb-profiles` (jamais les dépôts des slicers) ; processus principal seulement, adresse autorisée (tag fixe, lu dans `index.json` depuis le lot 62 : décision 67), PrinterSchema, SHA-256 (`index.json`), cache local, hors ligne avec les profils présents. Dépôt public, lu sans authentification, aucun jeton GitHub dans l'application ; le dépôt du code pourra devenir privé. Licence des données : tous droits réservés (comme LICENSE.md). Lots 57 à 61 en local, 62 synchronisation, 63 clôture.
51. **Valeurs inconnues (D6) :** `null`, jamais 0 ; le code qui les utilise (recommandation, KI-008, export) traite `null` explicitement.
52. **Premières imprimantes (D7) :** Bambu Lab X1 Carbon, P1S, A1, A1 mini ; Prusa MK4S, CORE One, MINI+ ; Creality K1C, Ender-3 V3 SE ; Elegoo Neptune 4 Pro.
53. **Dernière imprimante (D8) :** retenue dans les réglages (`printer.defaultPrinter`, `autoloadLastPrinter`), jusqu'à la phase 13.
54. **Version site web (KI-024, réglé le 2026-10-27, option B de Noam) :** l'application de bureau reste la cible. La logique de téléchargement et de validation des profils (`PrinterRepositorySync`, `ProfileSyncService`) n'utilise ni Electron ni Node.js (fetch, Web Crypto) ; le cache passe par le contrat `ProfileCacheStore` (fichiers ici, IndexedDB pour une future version web).
55. **Lecture des profils (lot 58) :** seulement `data/printers/` (Official) puis `<dossier de réglages>/printers/` (Local Custom), dossiers fixés par le processus principal ; seuls les `*.json` du dossier, ni sous-dossier ni lien suivi ; 1 Mo au plus par fichier ; fichier refusé = PRN_002, les autres se chargent ; une imprimante de l'utilisateur ne remplace jamais une imprimante Official (même id refusé).
56. **Canaux `printer:add`, `update`, `remove` :** payload validé puis refusé (`success: false`) jusqu'au lot 61 ; avant, ils répondaient « réussi » sans rien faire.
57. **Réglages :** un `settings.json` sans `printer` se charge sans erreur, langue gardée (test unitaire et test de bout en bout).
58. **Lot 59 (Noam) :** une valeur non publiée par le fabricant = `null`, jamais devinée ni reprise d'un slicer ; URL de la fiche et date de vérification de chaque imprimante dans `SOURCES.md`.
59. **Dépôt `noam76tr/slicyweb-profiles` :** créé par Noam le 2026-10-27 (public, LICENSE.md tous droits réservés, les 10 profils et SOURCES.md).
60. **Profils (lot 59) :** règles de `data/printers/SOURCES.md` : ventilateur à true seulement s'il est nommé par une page du fabricant ; type d'extrudeur `unknown` s'il n'est pas écrit (les 4 Bambu Lab) ; « vitesse max de la tête » donne maxPrintSpeed et maxTravelSpeed, « vitesse d'impression » seulement maxPrintSpeed ; deux températures de plateau selon la tension → la plus basse ; matériaux du fabricant tels qu'écrits (sans les « non recommandés » ni ceux qui demandent une option) ; `supportedFilaments` vide (phase 9) ; `firmware` et `releaseDate` vides sauf s'ils sont écrits.
61. **Prusa CORE One+ au lieu du CORE One (lot 59, confirmé par Noam le 2026-10-26) :** Prusa ne publie plus de fiche technique du CORE One, seulement celle du CORE One+ (Gen 2). Marques : `Prusa` (fabricant `Prusa Research`), modèles `MK4S`, `CORE One+`, `MINI+`.
62. **Section Printer (lot 60) :** liste native (`select`) : « No printer » en premier, puis un groupe par marque ; marques et modèles par ordre alphabétique. Une valeur `null` s'affiche « Not published » (fr « Non publié »), jamais 0. Lignes : Brand, Model, Build Volume, Nozzle, Nozzles, puis Printer Limits (7 valeurs).
63. **Dernière imprimante (lot 60) :** chaque choix est enregistré dans `printer.defaultPrinter` ; `autoloadLastPrinter` garde sa valeur enregistrée (true par défaut). Au démarrage, une imprimante qui n'est plus chargée est ignorée (aucune imprimante choisie, pas d'erreur).
64. **Plateau et menu (lot 60) :** « Plate: X × Y mm » en bas de la vue 3D, côté début de ligne (à gauche en anglais et en français, à droite en hébreu) ; rien sans imprimante. Printer > Select Printer donne le focus au sélecteur quand le menu se ferme (`focusId` dans `MenuBar.tsx` ; sinon le menu rend le focus à son titre).
65. **`src/gui/panels/PrinterPanel.tsx` supprimé (lot 60, décision de Noam le 2026-10-27) :** jamais utilisé, texte en dur ; remplacé par la section Printer.
66. **Imprimantes de l'utilisateur (lot 61, options recommandées de `lot61-imprimantes-utilisateur/LOT61-QUESTIONS.md`, à confirmer par Noam) :** fenêtre « Manage Printers » (menu Printer et bouton « Manage… ») ; tous les champs de PrinterSchema, limite vide = `null`, `supported` = true, `supportedFilaments` vide ; « Copy a printer » depuis n'importe quelle imprimante, Official comprises (copie « Modèle (copy) »), les Official jamais modifiées ni supprimées ; id `user_` + UUID choisi par le processus principal, fichier `<id>.json` dans `<dossier de réglages>/printers/`, écrit par un fichier temporaire puis renommé ; même marque et même modèle refusés (PRN_006) ; groupe « My printers » après « No printer » (`printer:getAll` renvoie `userPrinterIds`) ; suppression avec confirmation, l'imprimante choisie supprimée → « No printer » et choix enregistré effacé ; pas dans Annuler / Rétablir ; codes PRN_005, PRN_006, PRN_007. Confirmé par la validation du lot 61 (Noam, 2026-10-27).
67. **Synchronisation des profils (lot 62, Q1 à Q6 de `lot62-synchronisation-profils/LOT62-QUESTIONS.md` : option A partout, choisie par Noam le 2026-10-27) :** `index.json` sur `main` donne le tag et le SHA-256 de chaque profil, profils lus à ce tag (amendement d'ADR-032 : plus de tag inscrit dans l'application) ; format « Profile Repository Index Schema » (DATA_SCHEMA 3.6.0) ; vérification au démarrage en arrière-plan au plus une fois par 24 h, et par Printer > Refresh Profiles ; tout ou rien (SYNC_004), adresse autorisée seulement, sans redirection, 15 s, 1 Mo, 500 profils ; cache `<dossier de réglages>/cache/printers/` validé à chaque démarrage, qui remplace `data/printers/` (un profil retiré du dépôt disparaît de la liste) ; ligne « Profiles v1.0.0 (SlicyWeb repository) » ou « … of the application » sous le sélecteur, message après Refresh Profiles ; canal `printer:refresh` (23 canaux). Ajouts de Noam : tag `vX.Y.Z`, et entre le cache et `data/printers/` la liste la plus récente gagne (un cache plus ancien que la copie de l'application n'est pas utilisé) ; 20 Mo au plus pour tout un téléchargement ; réglage « Check for profile updates automatically » (`printer.autoCheckProfiles`, activé par défaut, case sous la ligne des profils tant qu'il n'y a pas de fenêtre Préférences) ; signature d'`index.json` à faire avant la phase 16 (KI-025) ; Noam active la double authentification sur GitHub.
68. **Publier une mise à jour des profils (étapes détaillées dans `lot62-synchronisation-profils/LOT62.md`) :** modifier `data/printers/` ; `npm run profiles:index -- vX.Y.Z` (tag plus récent que l'actuel) ; envoyer les profils, `SOURCES.md` et `index.json` sur `main` de `slicyweb-profiles` ; créer la release `vX.Y.Z` (Releases > Draft a new release). Tant que le tag n'existe pas, les applications gardent leurs profils et Actualiser affiche « aucune version publiée ». Matériaux et filaments (lot 72) : mêmes étapes avec `npm run profiles:index -- vX.Y.Z materials` (ou `filaments`), fichiers envoyés dans le dossier `materials/` (ou `filaments/`) de `slicyweb-profiles` ; chaque liste a son tag (v1.1.0 pour la première publication). Le tag de la release s'écrit exactement comme dans `index.json`, avec un « v » minuscule (`v1.1.0`, jamais `V1.1.0` : les fichiers sont lus à ce tag, une autre écriture donne HTTP 404) ; les trois listes partagent les tags du dépôt, donc un nouveau tag doit être plus récent que tous les tags déjà présents (demande de Noam, 2026-11-01).

69. **Lot 63 (demande de Noam, 2026-10-27) :** une réponse HTTP 404 du dépôt (`index.json` ou tag absent) donne « Aucune version des profils publiée, profils actuels gardés. » (statut `notPublished`, pas une erreur) ; « Dépôt injoignable » reste pour les erreurs réseau, le délai dépassé et les autres statuts HTTP. Petit lot sécurité : Electron 44.9.3, `npm audit fix` (shadcn 4.23.0, fast-uri, undici ; body-parser n'est plus installé) ; zod 4 en Known Issue (KI-026). La clôture de la phase 7 passe au lot 64.
70. **Clôture de la phase 7 (lot 64) :** `src/printer_database/PrinterCache.ts` supprimé (jamais utilisé, remplacé par `PrinterProfileCache.ts` ; option recommandée, confirmée par Noam, qui a supprimé le fichier) ; `PrinterImporter.ts` gardé pour « Import Profile » (phase 15).
71. **Phase 8, sources (ADR-033, D1 et D2, Noam, 2026-10-28) :** matériaux et filaments écrits par SlicyWeb à partir des fiches techniques des fabricants, jamais recopiés depuis les profils des slicers ; sources dans `data/materials/SOURCES.md` et `data/filaments/SOURCES.md`. Un matériau est une famille ; ses plages = la plus petite valeur minimale et la plus grande valeur maximale des fiches de ses filaments livrés ; une famille sans filament livré n'est pas livrée. KI-023 couvre aussi les matériaux.
72. **Format (D3, D4, et carte du lot 66) :** enveloppe Repository Data Schema (`type` `material` ou `filament`) ; `null` = non publié, jamais 0 ; températures de buse et de plateau obligatoires pour un profil livré ; le filament a ses plages (`temperature`, même structure que le matériau, nombre ou `null`) et les valeurs uniques du fabricant dans `manufacturerSettings` (jamais une valeur prise au milieu d'une plage) ; filament livré = gamme, `color` et `pricePerKg` à `null` (DATA_SCHEMA 3.7.0).
73. **Noms (D5) :** liste de référence des familles et table des alias dans MATERIAL_PROFILE_SPEC 2.0.0 ; `supportedMaterials` des imprimantes garde les mots du fabricant ; famille absente de la liste de l'imprimante = avertissement, jamais un blocage (pas d'avertissement si l'imprimante ne publie aucun matériau).
74. **Chargement et interface (D6, D9, D10) :** processus principal ; canaux `material:getAll`, `filament:getAll` (lot 68), puis `filament:add`, `update`, `remove` (lot 71) ; sections Material et Filament, filaments filtrés par famille ; dernier choix retenu (`material.defaultMaterial`, `defaultFilament`, `autoloadLastMaterial`) ; fenêtre Manage Filaments.
75. **Liste et suite (D7, D8, D11) :** 5 familles (PLA, PETG, ABS, ASA, TPU ; PA et PC retirés par Noam) et 12 gammes (Bambu Lab PLA Basic, PLA Matte, PETG HF, ABS, TPU 95A HF ; Prusament PLA, PETG, ASA ; Polymaker PolyLite PLA, PolyLite PETG ; eSUN PLA+, famille PLA ; Elegoo PLA), aucun filament personnel de Noam ; synchronisation au lot 72 dans `slicyweb-profiles` (dossiers `materials/` et `filaments/`, un `index.json` chacun) ; fichiers inutilisés supprimés au lot concerné, selon le tableau D11 de l'analyse (validé).
76. **Plateau (lot 67, Noam, 2026-10-30) :** plaque magnétique sombre (dans les deux thèmes), coins arrondis, grain léger, languette centrée au bord avant comme seul repère « avant » (la flèche et le mot « Avant » de la première demande sont abandonnés) ; nom de l'imprimante en texte seul, sans logo (marques déposées), marque et modèle (gardé à la validation du lot 67). Cube de navigation (faces traduites, clic = vue, axes X, Y, Z en couleur, à la place des axes au centre du plateau) : **après la clôture de la phase 8** (option B). Lot 67 placé avant la suite de la phase 8, dont les lots deviennent 68 à 73.
77. **Clôture de la phase 8 (lot 73) :** aucun fichier à supprimer ; `MaterialImporter.ts` et `FilamentImporter.ts` gardés pour Import Material et Import Filament (phase 15) ; la ligne « Profiles v… » sous le sélecteur d'imprimante reste celle des imprimantes (compris par Noam, 2026-11-01).
78. **Cube de navigation (lot 74, Noam, 2026-11-01) :** en bas à droite de la vue 3D (seul coin libre), en bas à gauche en hébreu comme le reste de l'interface, le cube lui-même jamais inversé (X à droite) ; zone de 120 px ; noms courts des faces (en Top… ; fr Dessus, Dessous, Avant, Arrière, Gauche, Droite ; he עליון, תחתון, חזית, אחור, שמאל, ימין) ; la face Avant correspond au repère avant du plateau (côté −Y) ; le cube tourne en même temps que la caméra ; clic sur les 6 faces seulement (pas d'arêtes ni de coins), même vue que le menu View, passage immédiat (sans animation) ; face survolée éclairée ; axes X, Y, Z en couleur depuis un coin du cube, avec leur lettre ; test e2e qui clique sur Dessus et vérifie que la vue change.

79. **Phase 9, décisions D1 à D10 (Noam, 2026-11-01, ADR-034 ; option A partout, avec les corrections des décisions 80 et 81) :** géométrie seule en phase 9, classification en phase 10 et `classification` à `null` d'ici là (D1) ; analyse de l'objet tel qu'il est posé (rotation et échelle, pas la position), mm, mm², mm³, degrés, %, `dimensions {width, depth, height}`, centre de gravité `{x, y, z}` par rapport au centre de l'objet (D2) ; surplombs depuis la verticale, seuil 45°, faces posées exclues ; pont = zone plate (> 80°) avec au moins deux appuis, portée = plus courte distance entre deux appuis (D3) ; parois fines par rayons vers l'intérieur avec `three-mesh-bvh@0.9.17` (Noam l'installe au lot 79), 200 000 points au plus, détectées sous 0,8 mm, sans dépendre de l'imprimante (D5) ; maillage non fermé analysé quand même, ANA_002 non bloquant, aucun champ ajouté (D6) ; lancement automatique dans un Web Worker, menus Tools activés, « Analyzing… » (D7) ; section Analysis en cm³ et cm² (D8) ; fichiers de `src/model_analysis/` et `AnalysisService.ts` réécrits, `AnalysisPanel.tsx` supprimé au lot 80 (D9) ; cible 1 million de triangles en moins de 5 s, sans blocage (D10).
80. **Stabilité (D4 corrigé par Noam) :** le test de bascule et `heightRatio` utilisent l'**enveloppe convexe des points de contact** avec le plateau (sommets à Z ≤ 0,01 mm) ; `heightRatio` = hauteur ÷ √(aire de l'enveloppe) ; risque = (rapport − 1) × 20, arrondi, borné à 0 et 100, 100 si le centre de gravité vu de dessus est hors de l'enveloppe ou sans contact. `contactArea` reste l'aire réelle des faces posées (adhérence). Tests demandés : tabouret à 4 pieds à risque faible ; cube plein de 20 mm qui donne une épaisseur minimale de 20 mm (D5).
81. **Surplombs en rouge dans la vue 3D (D8 option B) :** accepté, dans un lot séparé **après la clôture de la phase 9** (noté dans le plan et dans GUI_SPEC, Future GUI Features).
82. **Format des nombres (remarque de Noam sur le lot 80, 2026-11-02) :** toutes les valeurs affichées suivent le format de la langue, dans toutes les sections (virgule décimale en français, point en anglais et en hébreu, 2 décimales au plus) ; une valeur seulement lue a les séparateurs de milliers de la langue (comme la section Analysis), un champ n'en a pas et accepte la virgule ou le point ; les valeurs enregistrées restent des nombres JSON. Clôture de la phase 9 (lot 81) : aucune suppression, tous les fichiers de `src/model_analysis/` sont utilisés.
83. **Surplombs en rouge (lot 82, choix de Noam le 2026-11-03 : Q1 B, Q2 à Q5 A) :** tous les objets de la scène, sélectionnés ou non (Q1 B) ; triangles de l'analyse (même règle que `overhangs.percentage`), affichés seulement quand l'analyse est à jour, donc rien pendant une rotation ou une échelle jusqu'au nouveau calcul ; bouton « Surplombs » dans son propre groupe à côté de Déplacer, Pivoter, Échelle, et Affichage > Afficher les surplombs ; éteint à chaque démarrage, non enregistré ; rouge #E5484D (celui de l'axe X) ; textes hébreux choisis par Noam : « אזורים תלויים » (bouton) et « הצג אזורים תלויים » (menu) ; le titre de la ligne de la section Analysis (`analysis.overhangs`) dit aussi « אזורים תלויים » depuis le lot 83 (demande de Noam, 2026-11-04).
84. **Phase 10, décisions D1 à D13 (Noam, 2026-11-05, ADR-035 ; option A partout sauf D12 = B, avec deux corrections) :** classification automatique de 5 catégories seulement (vase, container, miniature, figurine, mechanical_part) à partir de 10 caractéristiques mesurées, confiance au plus 75, nom du fichier non utilisé (D2) ; type d'objet choisi par l'utilisateur, `classification.source`, confiance 100, gardé après rotation ou échelle (D3) ; 11 presets dans `data/presets/`, `preset:getAll` (D4) ; valeurs des presets de PRINT_PRESETS_SPEC 1.3.0, **un seul nom `tree` pour les supports en arbre dans tous les presets** (correction de Noam ; `organic` retiré), pas de ventilateur dans le preset (D5) ; limites : **vitesse d'impression ≤ 100 mm/s quand `maxPrintSpeed` vaut `null`, avec VALUE_LIMITED** (correction de Noam), déplacement ≤ 150 mm/s quand `maxTravelSpeed` vaut `null` (proposition du lot 84, à confirmer par Noam : 57 imprimantes sur 79), TPU ≤ 30 mm/s, couche ≤ 75 % de la buse, rétraction par type d'extrudeur ; test Ultimaker S5 + Fast Prototype ≤ 100 mm/s (D6) ; températures `{nozzle, bed}` au milieu de la plage arrondi à 5 °C, ventilateur du filament ou de la famille (D7) ; `supports {enabled, type}`, supports au-delà de 60° ou d'un pont de 50 mm, bordure (brim) (D8) ; 13 avertissements, un `critical` ne bloque pas (D9) ; confiance 100 moins les baisses (D10) ; recommandation automatique, règle 11 (D11) ; section Recommendation : type d'objet, preset, avertissements et confiance visibles, le reste sous « Détails » (D12 B) ; tableau de suppressions validé, chaque suppression faite au lot indiqué (D13).
85. **Réponses du lot 84 et remarque sur la classification (Noam, 2026-11-05) :** Q1 C : déplacement limité à 150 mm/s quand `maxTravelSpeed` vaut `null`, **sans avertissement** ; VALUE_LIMITED reste pour la vitesse d'impression (100 mm/s quand `maxPrintSpeed` vaut `null`) et les autres limites (RECOMMENDATION_RULES 1.1.1). Q2 A : `tree` seul, `organic` retiré (retiré du code au lot 86). `open_top` : le fond touché par le rayon vertical doit être entouré de parois (4 rayons horizontaux depuis ce point, chacun touche une face) ; une équerre en L n'est ni container ni vase, modèle ajouté aux tests (OBJECT_CLASSIFICATION_SPEC 1.2.1).

86. **Réponse du lot 85 et lots groupés (Noam, 2026-11-06) :** Q1 A : **jamais d'avertissement pour le déplacement**, même quand un `maxTravelSpeed` publié le baisse (RECOMMENDATION_RULES 1.1.2, ADR-035 D6). L'enveloppe convexe de la classification est déjà calculée sur les sommets soudés : son accélération (7 s pour 1 million de triangles, cible 5 s) reste pour le lot 89. Nouvelle règle de livraison (§1, « Lots groupés ») : jusqu'à 3 lots qui se suivent, sans contrôle manuel ni question, dans un seul zip ; appliquée d'abord aux lots 86 et 87.

87. **Lots 86 et 87 validés (Noam, 2026-11-06) :** remarque pour plus tard, pas urgente : 24 imprimantes, dont toutes les Bambu Lab, auront toujours EXTRUDER_UNKNOWN (rétraction du direct drive). À faire : revérifier leur type d'extrudeur sur les fiches des fabricants, **seulement si la fiche le dit clairement**, puis publier une nouvelle version des profils dans `slicyweb-profiles` (§5).

88. **Lot 88 validé (Noam, 2026-11-07) :** `presetStore.selectedPreset` gardé (phase 15) ; clé `preset.noSelection` supprimée au lot 89. Remarque : en hébreu, chaque valeur avec son unité doit s'afficher comme en anglais et en français (« 200 mm/s », pas « mm/s 200 »), dans toute l'interface, par un isolement Unicode à un seul endroit commun, avec un test e2e en hébreu : fait au lot 89, avant la clôture (lot 90). Idée pour après la clôture de la phase 10 : onglets dans le panneau Propriétés (§5).

89. **Lot 89 validé (Noam, 2026-11-07) :** 469 clés, 29 canaux, 469 + 1, 38 e2e, contrôles 1 à 7 en hébreu, français et anglais ; suppression de la fonction privée `format` de `PrinterSection.tsx` acceptée. Lot 90 : clôture de la phase 10, avec l'accélération de l'enveloppe convexe (décision 86) ; phase 10 Completed (2026-11-07), à confirmer par les contrôles manuels du lot 90 sur les modèles de Noam. Les questions sur les onglets du panneau Propriétés sont dans `lot90-cloture-phase10/QUESTIONS-ONGLETS.md`.

90. **Lot 90 et maillage (Noam, 2026-11-08) :** lots 89 et 90 envoyés ; contrôles automatiques du lot 90 réussis. Onglets du panneau Propriétés : Q1 à Q6 option A (`lot90-cloture-phase10/QUESTIONS-ONGLETS.md`) : trois onglets Imprimante (Imprimante, Matériau, Filament), Objet (Objet, Transformation, Analyse), Réglages (Préréglage, Recommandations) ; Projet au-dessus des onglets ; dernier onglet retenu dans `settings.json` ; point rouge si l'objet sélectionné a un avertissement critique ; texte seul (Tabs de shadcn) ; pas de Ctrl+1/2/3 ; un lot seul après la clôture de la phase 10. Maillage : son modèle Seckit (aucune arête à 1 face, 94 arêtes à 4 faces, 6 triangles dégénérés) affichait « Maillage non fermé » à tort ; une arête à 1 ou 3 triangles reste un trou (ANA_002, −20) ; seulement des arêtes à 4, 6… triangles : information ANA_005, Q1 A (aucune baisse de confiance), Q2 A (section Analyse seulement), Q3 A (`holes` non calculé) ; fait au lot 91.

91. **Lot 91 validé, clôture de la phase 10 suspendue (Noam, 2026-11-08) :** lot 91 : 470 clés, 490 + 1, 39 e2e, contrôles 1 à 3 OK (texte hébreu d'ANA_005 OK). Contrôles de la clôture : modèle Seckit « Automatique (Inconnue) » (normal, `holes` non calculé, Q3 A) ; sphère fermée de 998 000 triangles (80 mm) « Automatique (Figurine) », vue fluide, mais analyse en **8,76 s** (cible 5 s) : accélérer l'analyse avant de clôturer (l'enveloppe convexe en premier), puis nouveau contrôle avec la même sphère. Fait au lot 92 ; la phase 10 repasse In Progress jusqu'à ce contrôle. Le lot des onglets devient le lot 93.

92. **Lot 92 validé, phase 10 close (Noam, 2026-11-08) :** 470 clés, 29 canaux, typecheck et lint sans erreur, 494 + 1, 39 e2e. Sphère de 998 000 triangles : environ 4 s (cible 5 s), « Automatique (Figurine) », vue fluide. Seckit : 80,93 × 59,38 × 38,52 mm, 33,37 cm³, 179,28 cm², parois fines détectées, ligne grise ANA_005, « Automatique (Inconnue) ». Suppression d'`edgeKey` acceptée (A). Phase 10 Completed le 2026-11-08 ; lot suivant : les onglets (lot 93).

93. **Menus et onglets (Noam, 2026-11-08, question du lot 93) :** A : un menu choisi par Noam peut ouvrir l'onglet correspondant (Imprimante > Sélectionner une imprimante, Matériau > Sélectionner un matériau, Filament > Sélectionner un filament ouvrent l'onglet Imprimante, puis placent le curseur sur le sélecteur). La règle « jamais de changement d'onglet automatique » ne concerne que les changements que l'application ferait sans action de sa part.

94. **Lot 93 validé, phase 11 (Noam, 2026-11-09) :** lot 93 : 475 clés, 29 canaux, 501 + 1, 42 e2e, contrôles 1 à 8 OK ; `main` 7861c4c identique (33 fichiers). Analyse de la phase 11 livrée au lot 94 : réponses de Noam à D1 à D8 attendues (PHASE11-ANALYSE.md).

95. **Lot 94 envoyé, onglets Q3 B, phase 11 (Noam, 2026-11-09) :** lot 94 sur `main` (f87bead), identique. Onglets : Q3 passe de A à B : l'onglet Imprimante s'ouvre à chaque démarrage (la scène est vide, Objet et Réglages n'auraient rien à montrer), le dernier onglet n'est plus retenu dans `settings.json` ; un `settings.json` du lot 93 avec ce champ reste lu sans erreur et sans perte de réglage, avec un test (lot 95, contrôle manuel : relancer l'application). Phase 11 : D1 à D8 option A. Pour D3, modèles de test en plus : un vase ouvert debout (l'optimisation le laisse debout, mode vase) ; une figurine (qualité de surface non mesurée, montrer le résultat) ; une tour de 20 × 20 × 100 mm (dire dans le `LOTN.md` quelle orientation est choisie et pourquoi). Lots de la phase 11 renumérotés : 96 documentation (ADR-036 ; DATA_SCHEMA 3.13.0, car 3.12.0 est pris par le lot 95), 97 calcul, 98 interface, 99 clôture.

96. **Lot 95 validé (Noam, 2026-11-09) :** 475 clés, 29 canaux, typecheck et lint sans erreur, 498 + 1, 43 e2e, contrôles 1 à 4 OK ; `main` 95d3045 identique (21 fichiers). Lots 96 et 97 livrés ensemble (aucune question, aucun contrôle manuel).

97. **Lots 96 et 97 validés (Noam, 2026-11-10) :** 475 clés, 29 canaux, typecheck et lint sans erreur, 523 + 1, 43 e2e ; `SupportOptimizer.ts`, `SpeedOptimizer.ts` et `MaterialOptimizer.ts` supprimés sur GitHub et en local ; résultats de la tour (couchée sur son côté gauche, 66 → 98), des vases ouverts (gardés debout) et de la figurine (gardée debout, 42) acceptés ; `main` fdf635f identique (25 fichiers). Lot 98 (interface) demandé ; lot avec contrôles manuels, livré seul.

98. **Lot 98 validé (Noam, 2026-11-12) :** 479 clés, 29 canaux, typecheck et lint sans erreur, 537 + 1, 45 e2e, contrôles manuels 1 à 10 OK ; `main` 0114140 identique (19 fichiers). Lot 99 (clôture de la phase 11) demandé. La remarque du lot 98 (messages au-dessus de la vue qui peuvent cacher le texte du bouton Surplombs dans une fenêtre étroite) reste sans réponse : rien de changé.

**Méthode**

27. Règle de décision (§1) : l'option « Recommandé » peut être appliquée sans demander, hors des 5 cas listés.

---

## 5. Travail restant, dans l'ordre

1. **Phase 6 : Transform System** : close le 2026-10-21 (lot 53).
   - Fait : sens de la transformation (ADR-031), rendu, tests ; section Transform du panneau (lot 45) ; sélection, glisser, poignées 3D et raccourcis G, R, S (lot 46) ; corrections (lots 47 et 48) ; Annuler / Rétablir (lot 49) ; plusieurs objets (lot 50) ; rectangle et Maj+clic (lot 51) ; Ctrl+Z dans un champ (lot 52).
   - Contrôles manuels des lots 49 à 52 : tous réussis (le contrôle 16 du lot 51 a été corrigé au lot 52).
2. **Tests automatiques avec Playwright** (lots 54, 55, 58, 60, 61, 62, 63, 67, 68, 70, 71 et 74) : 28 tests sur l'application compilée (démarrage, langues, import, transformations, Annuler / Rétablir, sélection multiple, imprimantes, matériaux, cube de navigation). À compléter à chaque phase (TEST_PLAN, scénarios E2E 1 à 6 quand les projets, imprimantes et matériaux existeront).
3. **Phase 7 : Printer Database** (Completed, ADR-032) : lot 58 chargement par le processus principal (fait) ; 59 les 10 profils et SOURCES.md (fait) ; 60 section Printer, sélecteur, plateau, dernière imprimante retenue (fait) ; 61 imprimantes saisies par l'utilisateur (fait) ; 62 synchronisation depuis `noam76tr/slicyweb-profiles` (fait, v1.0.0 publiée) ; 63 « aucune version publiée » et sécurité des dépendances (fait) ; 64 clôture (fait). Close le 2026-10-27, lot 64 validé par Noam.
4. **Phase 8 : Material Database** (Completed, ADR-033) : analyse au lot 65 (fait) ; 66 documentation (fait, validé) ; 68 chargement (fait, validé) ; 69 données (fait, validé) ; 70 interface (fait, validé) ; 71 filaments de l'utilisateur (fait, validé) ; 72 synchronisation (fait, validé ; release v1.1.0 de `slicyweb-profiles`) ; 73 clôture (fait, validé). Close le 2026-11-01. (Lot 67 : plateau, hors phase 8.)
5. **Cube de navigation** (décisions 76 et 78) : lot 74 fait, validé par Noam le 2026-11-01.
6. **Phase 9 : Model Analysis** (Completed, ADR-034) : analyse au lot 75 ; réponses de Noam (décisions 79 à 81) ; 76 documentation ; 77 calcul de base dans un Worker ; 78 surplombs et ponts ; 79 parois fines ; 80 interface (tous validés) ; 81 clôture et format des nombres (décision 82). Close le 2026-11-02, confirmée par les contrôles de Noam sur le lot 81 (2026-11-03). Lot 82 : surplombs en rouge (décisions 81 et 83). Suite : la phase 10. La contradiction du plan (classification en phase 9 et 10) est réglée : classification en phase 10.
7. **Phase 10 : Classification and Recommendation Engine** (Completed le 2026-11-08, après le contrôle de durée du lot 92 : environ 4 s ; ADR-035) : analyse au lot 83 (validé) ; réponses de Noam (décision 84) ; 84 documentation (validé) ; 85 classification (validé) ; 86 presets et 87 moteur de recommandation (livrés ensemble, validés) ; 88 interface (validé) ; 89 valeurs avec unité en hébreu (validé) ; 90 clôture (enveloppe convexe accélérée ; seuils de la classification et durée vérifiés sur les modèles de Noam, contrôles manuels du lot 90) ; 91 maillage non conforme (validé) ; 92 analyse plus rapide (validé, clôture). Si un modèle de Noam est mal classé, le changement de seuil est un choix visible : question à Noam, puis un lot à part (nouvelle version d'OBJECT_CLASSIFICATION_SPEC).
8. **Onglets du panneau Propriétés (idée de Noam, 2026-11-07) :** réponses Q1 à Q6 option A (décision 90), menus Sélectionner… : A (décision 93) ; lot 93 validé par Noam le 2026-11-09 (décision 94).
9. **Phase 11 : Optimization Engine** (Completed le 2026-11-12, lot 99, confirmée par les contrôles manuels de Noam sur ses modèles et la durée sur son PC ; si un contrôle échoue, elle repasse In Progress) : analyse au lot 94 (`PHASE11-ANALYSE.md`, D1 à D8, option A recommandée partout : orientation seule, posée sur une face plane, note 0 à 100 avec règles de fiabilité, appliquée à la demande en une action annulable, rien d'enregistré, pas de suggestion automatique, cycle Optimization / Recommendation de DOMAINS_DEPENDENCY_MATRIX corrigé, 3 optimiseurs supprimés). Réponses de Noam : D1 à D8 option A, avec trois modèles de test en plus pour D3 (décision 95). Lot 95 avant la phase : onglet Imprimante à chaque démarrage (validé, décision 96). Découpage : 96 documentation (ADR-036, DATA_SCHEMA 3.13.0) et 97 calcul, livrés ensemble, validés (décision 97) ; 98 interface, validé (décision 98 ; menu et bouton actifs, une action d'historique, message du résultat, traductions, 4 clés supprimées, e2e ; contrôles manuels) ; 99 clôture, livré (aucun code ; durée sous Linux 2,4 à 2,9 s pour 1 million de triangles ; poids inchangés). Si un modèle de Noam est mal orienté, changer un poids de la note est un choix visible : question à Noam, puis un lot à part (nouvelle version d'AI_ENGINE_SPEC). Petit lot possible, si Noam le veut : décaler les messages au-dessus de la vue sous les boutons (remarque du lot 98).
10. **Phases 12 à 16**, dans l'ordre du plan technique. Suivante : phase 12 (Cost Estimation), qui commence par un lot d'analyse (inventaire et décisions), comme les phases 9 à 11.
   - **Pas urgent (remarque de Noam, 2026-11-06, décision 87) :** type d'extrudeur des 24 imprimantes à « unknown » (dont toutes les Bambu Lab) : le revérifier sur les fiches des fabricants, seulement si la fiche le dit clairement, puis publier une nouvelle version des profils dans `slicyweb-profiles` (même règle de tag qu'à la v1.1.0).
11. **Known Issues ouverts** (CHANGELOG, KNOWN ISSUES) :

   | KI | Sujet | À régler avant |
   |---|---|---|
   | KI-007 | Réponse de Generate Recommendation différente du Recommendation Schema | Implémentation de l'API Recommendation |
   | KI-012 | Table des types de supports par slicer non vérifiée (`tree` seul nom depuis le lot 84, `organic` retiré du code au lot 86) | Phase 14 |
   | KI-015 | `Renderer.ts` inutilisé (tous les panneaux supprimés : `PrinterPanel.tsx` au lot 60, `MaterialPanel.tsx` et `FilamentPanel.tsx` au lot 70, `RecommendationPanel.tsx` et `PresetPanel.tsx` au lot 88) | À tout moment |
   | KI-019 | 3MF Bambu à plusieurs plateaux : objets éloignés | Phase 14 |
   | KI-020 | Noms d'objets et métadonnées du 3MF non gardés (aucun champ dans DATA_SCHEMA) | Phase 13 |
   | KI-021 | Objet enfoncé sous le plateau, non permis pour l'instant | Phase 15 |
   | KI-023 | Avis juridique sur les profils d'imprimantes, les matériaux, les filaments et les licences | Phase 16 |
   | KI-025 | Signature d'`index.json` (clé privée de Noam, clé publique dans l'application) : le SHA-256 vérifie l'intégrité, pas l'auteur | Phase 16 |
   | KI-026 | npm audit : zod 3 (GHSA-mrhx-c7xc-m3w5), correction seulement en zod 4 (version majeure) ; ne pas lancer `npm audit fix --force` | Phase 16 |
   | KI-027 | npm audit : deepmerge (GHSA-gcqx-w48m-w2h4, faible), via shadcn, outil de développement seulement, absent de l'application livrée | Phase 16 |
   | KI-028 | npm audit : minimatch (GHSA-g3hv-75wg-m249, modérée), via eslint, typescript-eslint et ts-morph (shadcn), outils de développement seulement | Phase 16 |
   | KI-029 | Mode vase : aucun champ dans le profil recommandé | Phase 14 |
   | KI-030 | Optimization API HTTP d'API_SPEC (orientation, supports, temps, matériau) : aucune API HTTP, à aligner sur ADR-036 | Implémentation d'une API HTTP |

12. **Points signalés, en attente d'une décision de Noam :**
   - API_SPEC.md devrait passer en 3.0.0 : la réponse Generate Recommendation est un changement cassant (lié à KI-007).
   - SLICER_EXPORT_SPEC.md (1.1.0 depuis le lot 84) : pas de code d'erreur pour les contrôles de scène (proposés : EXP_013 hors volume, EXP_014 collision).
   - Duplication projet/scène des 4 sélections dans DATA_SCHEMA (décision 4) : choisir la source de vérité.
   - `WYPROJExporter` : le champ `author` de `metadata` n'est jamais rempli.
   - README.md : il indique encore « Current Phase: Phase 0 » et une liste des phases qui ne suit pas ROADMAP ; ambiguïté sur Undo/Redo (ROADMAP phase 0, plan technique phase 6).
   - Fichiers d'emplacement mal nommés (`README.me`, `readme.me`, `readme`) dans `assets/`, `data/`, `cache/`, `.github/workflows/`.

---

## 6. Fichiers utiles dans `/mnt/project-files/slicyweb/`

- `lot9-create-project/` à `lot83-phase10-analyse/` : livrables de chaque lot (`LOTN.md`, zip, patch). Au 2026-10-21, seuls les dossiers des lots 1 à 8 et 52 à 75 sont présents dans le dossier du projet.
- `lot39-stl-import/fichiers-de-test.zip` : STL de test (cube, tour en texte, fichier tronqué, fichier vide, `.txt`).
- `lot40-3mf-import/fichiers-de-test-3mf.zip` : 3MF de test (badge OrcaSlicer, ligne Bambu Studio, disposition, cube en pouces, et trois fichiers à refuser).
- `lot42-zip-reader-cancel/fichiers-de-test-lot42.zip` : bombes zip à en-tête mensonger (3 Go réels, 1 ko ou 400 Mo annoncés), fichier avec bit 3 et fausse signature `PK\x07\x08`, gros 3MF pour tester Annuler.
- Les anciennes analyses (`plan-phase1-bootstrap.md`, `lot2-options-wyproj.md`, `lot2-proposition-objectid-adr026.md`) ne sont plus dans le dossier.
