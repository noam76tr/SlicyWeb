# Lot 110 : phase 13 (enregistrer et rouvrir un projet), inventaire et questions

Date : 2026-11-24. Analyse faite sur `main` au commit 5ac819b (lot 109, vérifié identique : les 18 fichiers du zip, aucune différence). Aucun code de la phase 13 n'est écrit avant tes réponses.

Ce document pose **toutes les questions de la phase 13 en une fois** (Q1 à Q22), comme tu l'as demandé. Pour chacune, je donne une option « Recommandé ». Elles touchent le format du fichier projet, la sécurité, un choix visible ou une suppression de code : je n'en applique aucune sans ton accord. Pour répondre, écris par exemple « tout A » ou « tout A sauf Q9 : B ».

**En une phrase :** aujourd'hui, SlicyWeb ne sait ni enregistrer ni rouvrir un projet. Les menus Fichier > Nouveau, Ouvrir, Enregistrer, Enregistrer sous et Fermer existent mais ne font rien. La couche « projet » du code existe depuis les lots 4 à 9, mais **rien ne l'appelle**. Surtout, **le fichier WYPROJ décrit par la documentation ne contient pas la forme des objets** (leurs triangles) : un projet rouvert n'aurait aucun objet à afficher. C'est la question principale (Q2).

---

## 1. Ce que demande la documentation

| Document | Ce qu'il dit de la phase 13 |
|---|---|
| PHASES_IMPLEMENTATION_PLAN.md, phase 13 « Project Persistence » | Objectif « Implement the native WYPROJ project lifecycle ». Modules : `src/project/` (ProjectManager, ProjectSerializer, ProjectDeserializer, ProjectValidator, WYPROJImporter, WYPROJExporter). Validation : projet créé, écrit, relu ; projets invalides refusés ; versions non prises en charge détectées ; données indépendantes de la langue ; compatibilité avec les projets existants. |
| ROADMAP.md, phase 11 fonctionnelle | Enregistrer, Ouvrir, **sauvegarde automatique**, **récupération**, préférences, scène. Validation : « Projects perfectly restored », « No data loss ». |
| DECISIONS.md, ADR-020 | Format WYPROJ, extension `.wyproj`, **JSON**, un seul fichier (« plusieurs fichiers séparés » refusé : risque de données manquantes). Doit permettre Enregistrer, Ouvrir, sauvegarde automatique, récupération, migration future. |
| DECISIONS.md, ADR-027 | Format 3.0.0 ; toute autre version, ou pas de version, refusée (PROJ_003). |
| DATA_SCHEMA.md 3.15.0 (priorité 0) | Enveloppe `{format, version, project, metadata}`. Projet : `projectId`, `projectName`, `projectFormat`, `createdAt`, `updatedAt`, `version`, `scene`, `settings`, `analysis` et `recommendations` (par `objectId`), `preset`, `printer`, `material`, `filament`. Objet : `objectId`, `fileName`, `name`, `fileType`, `visible`, `locked`, avec `transform`, la géométrie (dimensions, volume, surface) et le nombre de triangles. **Aucun champ pour les triangles eux-mêmes.** Les 4 sélections existent en double (projet et scène, « Known Duplication », décision 4 encore ouverte). `preset` et `settings` du projet : contenu non décrit. |
| DATA_SCHEMA.md, User Preferences Schema | **Rien** pour la sauvegarde automatique ni pour les projets récents. |
| USER_SETTINGS_SPEC.md 2.3.0, Project Settings et File Settings | `autoSave: true`, `autoSaveInterval: 300` (s), `restoreLastSession: true`, `recentProjects: 20`. **Absents du DATA_SCHEMA** (contradiction : le DATA_SCHEMA l'emporte). |
| IMPORT_EXPORT_SPEC.md 3.1.0 | Chemin d'écriture et de lecture par les 6 modules de `src/project/`. Contenu : scène, objets, transformations, imprimante, matériau, filament, preset, réglages, analyses, recommandations. `metadata` : `application`, `author` facultatif. Enregistrer, Enregistrer sous, sauvegarde automatique. Système de récupération (sans détail). |
| GUI_SPEC.md | Menu Fichier : Nouveau projet, Ouvrir un projet, **Ouvrir WYPROJ**, Enregistrer, Enregistrer sous, **Exporter WYPROJ**, Importer STL, Importer 3MF, Fermer le projet, Quitter. Raccourcis Ctrl+N, Ctrl+O, Ctrl+S. Glisser-déposer d'un `.wyproj` dans la vue. Section Projet : nom, version, date de création, dernier enregistrement, format, application. Barre d'état : « Project Status ». **Aucune fenêtre décrite** (modifications non enregistrées, récupération, erreurs). |
| UNDO_REDO_SPEC.md 2.6.0 | Ouvrir remplace tout l'espace de travail, sans Annuler ; l'historique est vidé à l'ouverture et à la fermeture d'un projet. Enregistrer, sauvegarde automatique et récupération ne sont pas dans l'historique. |
| SECURITY_SPEC.md | Projet validé avant chargement ; refusé si structure corrompue, références manquantes, version non prise en charge, scène invalide. Sauvegardes automatiques : versionnées, vérifiées, **séparées du projet principal**. Récupération : validée avant restauration ; état local corrompu mis en quarantaine ; aucun fichier de récupération incomplet. |
| PERFORMANCE_SPEC.md | Sauvegarde automatique < 1 s ; chargement d'une récupération < 3 s. |
| ERROR_CODES_SPEC.md 2.6.0 | PROJ_001 projet introuvable, PROJ_002 projet corrompu, PROJ_003 version différente. **Aucun code** pour un enregistrement qui échoue (disque plein, dossier protégé). |
| DOMAINS_DEPENDENCY_MATRIX.md | Project Management peut dépendre de Storage, Validation et Scene. Il doit pourtant écrire les analyses, les recommandations et les profils choisis : ces domaines ne sont pas listés. |
| API_SPEC.md | Une API HTTP du projet (`/api/project/save`, `load`, `new`, `autosave`, `recovery`) : aucune API HTTP n'existe (comme KI-007, KI-030, KI-031). |
| TEST_PLAN.md | Tests de la sauvegarde automatique et de la récupération (création, validation, restauration, refus d'une récupération corrompue). |
| CHANGELOG, KI-020 | Noms d'objets et métadonnées des 3MF non gardés, **« à régler avant la phase 13 »**. Le champ `name` existe depuis le lot 106. |
| PASSATION §5 | Point en attente : `author` de `metadata` jamais rempli. |

**Trous de la documentation :**
- aucun champ pour les triangles des objets : sans eux, un projet rouvert est vide ;
- contenu de `printer`, `material`, `filament`, `preset` et `settings` du projet non décrit, et la double copie projet / scène non réglée ;
- aucune fenêtre décrite : « Enregistrer les modifications ? », récupération, erreurs ;
- sauvegarde automatique et projets récents absents du DATA_SCHEMA ;
- aucune règle pour un projet dont l'imprimante ou le filament n'existe plus ;
- aucune règle de version pour les futurs formats (aujourd'hui : tout ce qui n'est pas 3.0.0 est refusé) ;
- aucun code d'erreur pour un enregistrement qui échoue.

---

## 2. Inventaire du code

| Élément | État | Remarque |
|---|---|---|
| Menu Fichier (`MenuBar.tsx`) | Nouveau, Ouvrir, Ouvrir WYPROJ, Enregistrer, Enregistrer sous, Exporter WYPROJ, Fermer : **affichés, sans action** | Seuls Importer STL, Importer 3MF et Quitter marchent. |
| Ligne Projet (panneau Propriétés) et barre d'état | « Projet : Aucun », « État du projet : Aucun » | Toujours le même texte. |
| `src/project/ProjectManager.ts` | Écrit aux lots 6 à 10, **jamais appelé** | Crée, charge, sérialise un projet ; applique les règles 6 à 9 (suppression, copie, transformation, analyse). Ne connaît pas les stores de l'interface. |
| `ProjectSerializer.ts`, `ProjectDeserializer.ts`, `ProjectValidator.ts` | Jamais appelés | Le validateur utilise `ProjectSchema` (Zod) : règles 3 à 5, analyses et recommandations complètes, version 3.0.0 (PROJ_003). Justes, à garder. |
| `WYPROJExporter.ts` | Jamais appelé | Enveloppe, nom de fichier sûr (lots 7 et 8 : toutes les langues, noms réservés Windows, 60 caractères). À garder. |
| `WYPROJImporter.ts` | Jamais appelé | Lit un fichier par son chemin (`fs`), vérifie l'extension, le format et la version. Aucune limite de taille. |
| `src/schemas/ProjectSchema.ts` | Utilisé seulement par le validateur | Objets de la scène : seul `objectId` est vérifié, le reste passe sans contrôle (`passthrough`). |
| `src/electron/ipc/ProjectIPC.ts` | 4 canaux `project:create`, `save`, `load`, `delete` | **Coquilles vides** (« TODO ») : ils renvoient ce qu'ils reçoivent, n'écrivent ni ne lisent rien. Aucun appel depuis la fenêtre. |
| `src/recovery/` (AutoSaveService, RecoveryManager, RecoveryValidator, SessionRestorer) | Modèles de la phase 0, **jamais appelés** | Gardent un projet en mémoire seulement : rien n'est écrit sur le disque, donc rien ne survit à un plantage. |
| `src/storage/ProjectStorage.ts` | Utilisé par `StorageManager`, lui-même jamais appelé pour un projet | Projet en mémoire seulement. |
| `src/services/ProjectService.ts` | Jamais appelé | Délègue à ProjectManager (lot 9). |
| Forme des objets | `GeometryRegistry` (mémoire de la fenêtre) | Les triangles de chaque objet (9 nombres par triangle et leurs normales) ne sont gardés qu'en mémoire. Un objet d'un million de triangles = 36 Mo de nombres. |
| Analyses, recommandations, choix de l'utilisateur | Stores de l'interface (Zustand) | Le type d'objet choisi par l'utilisateur est dans l'analyse. Les triangles en surplomb (rouge) et les aires des faces (estimation) sont calculés par le Worker et **ne sont pas dans le schéma** : ils seraient à recalculer après ouverture. |
| Imprimante, matériau, filament | Choix gardés dans `settings.json` | Une imprimante ou un filament de l'utilisateur peut être supprimé ; une imprimante officielle peut changer à la mise à jour des profils. |
| Fermeture de la fenêtre | Aucune interception | Fermer la fenêtre perd tout, sans question. |
| Tests | Aucun test de la couche projet | |

**En résumé :** les briques de validation et le nom de fichier sont prêts. Il manque tout le reste : les triangles dans le fichier, les fenêtres système pour choisir le fichier (processus principal), l'écriture et la lecture réelles, le lien avec l'interface (rassembler les objets, analyses, recommandations, puis tout remettre à l'ouverture), les modifications non enregistrées, la sauvegarde automatique et la récupération.

---

## 3. Questions

### Q1. Périmètre de la phase 13 *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Nouveau, Ouvrir, Enregistrer, Enregistrer sous, Fermer ; glisser-déposer d'un `.wyproj` ; modifications non enregistrées (marque et fenêtre « Enregistrer les modifications ? ») ; projets récents ; sauvegarde automatique et récupération après un plantage. Hors phase 13 : la fenêtre Préférences (gardée pour après, avec « Écart entre les objets » et les coûts) ; l'export vers le slicer (phase 14) ; les projets dans le nuage. |
| B | Comme A, sans sauvegarde automatique ni récupération (un sujet à part, plus tard). La ROADMAP les demande pour cette phase. |

### Q2. La forme des objets dans le fichier *(format du fichier, question principale)*

Sans les triangles, un projet rouvert n'a rien à afficher. Il faut un nouveau champ dans l'objet du DATA_SCHEMA.

| Option | Contenu |
|---|---|
| **A (Recommandé)** | **Les triangles dans le fichier `.wyproj` lui-même**, qui reste un seul fichier JSON (ADR-020). Nouveau champ `meshData` de l'objet : les sommets des triangles, nombres à virgule 32 bits, écrits en base64 (texte), dans le repère de l'objet (comme à l'export 3MF). Les normales sont recalculées à l'ouverture. Taille : environ 48 Mo pour un objet d'un million de triangles, à peu près celle d'un STL binaire ; un cube de 12 triangles fait quelques ko. Le projet s'ouvre sur un autre ordinateur, même si les STL d'origine ont disparu. |
| B | Le fichier garde seulement le **chemin** des STL et 3MF d'origine, relus à l'ouverture. Fichier très petit, mais le projet est perdu si un fichier d'origine est déplacé, renommé ou modifié, et ne s'ouvre pas sur un autre ordinateur. ADR-020 refuse ce cas (« Increased Risk Of Missing Data »). |
| C | Le `.wyproj` devient une **archive zip** (le JSON + un fichier binaire par objet), comme un 3MF. Plus petit (environ 36 Mo pour un million de triangles, moins après compression), mais ce n'est plus « un fichier JSON » : nouvel ADR, format 4.0.0. |

### Q3. Imprimante, matériau et filament enregistrés *(format du fichier, choix visible)*

Le DATA_SCHEMA prévoit `printer`, `material`, `filament` dans le projet, sans dire ce qu'ils contiennent. Une imprimante officielle peut changer à la mise à jour des profils ; une imprimante ou un filament à toi peut être supprimé, ou ne pas exister sur un autre ordinateur.

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Le projet garde **une copie complète** du profil choisi (Printer Schema, Material Schema, Filament Schema, validés comme dans la base). À l'ouverture : <br>• le même `id` existe dans ta base et le profil est identique → il est choisi, rien d'autre ; <br>• le même `id` existe mais le profil a changé (mise à jour, modification) → le profil de ta base est choisi, les recommandations sont refaites (règle 11), message « L'imprimante X a changé depuis l'enregistrement : recommandations refaites » ; <br>• l'`id` n'existe pas chez toi → la copie du projet est utilisée **pour ce projet seulement**, dans un groupe « Ce projet » du sélecteur, sans être ajoutée à tes imprimantes ; message « L'imprimante X n'est pas dans ta liste : celle du projet est utilisée ». |
| B | Le projet garde seulement l'**`id`**. À l'ouverture, s'il n'existe pas : aucune imprimante (ou matériau, filament) choisie, message, recommandations obsolètes. Plus simple, mais un projet envoyé à quelqu'un perd son imprimante. |

Dans les deux cas, ouvrir un projet ne change pas le dernier choix gardé dans tes préférences (`settings.json`) tant que tu ne choisis pas toi-même une autre imprimante.

### Q4. Double copie projet / scène, `preset` et `settings` *(format du fichier ; décision 4 encore ouverte)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Source de vérité = **le projet** (`project.printer`, `material`, `filament`). `scene.printer`, `scene.material`, `scene.filament`, `scene.preset` sont **retirés** du DATA_SCHEMA : la scène garde seulement `objects`. Aucun fichier n'a jamais été écrit, donc rien ne casse. `project.preset` reste `null` : depuis la phase 10, le preset est choisi **par objet** et se trouve dans sa recommandation. `project.settings` reste `{}` : aucun réglage propre au projet n'existe aujourd'hui (il servira plus tard). Fin de la décision 4 et de la note « Known Duplication ». |
| B | Garder les deux copies, écrites identiques ; seule celle du projet est lue. La duplication reste documentée. |

### Q5. Version du format et projets plus anciens ou plus récents *(format du fichier)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Le format reste **3.0.0** : aucun fichier WYPROJ n'a jamais été écrit (l'enregistrement n'a jamais marché), donc ajouter `meshData` (Q2) et retirer les copies de la scène (Q4) ne casse aucun fichier existant. Nouvelle règle pour l'avenir (ADR à écrire) : un fichier d'une **version plus ancienne** que celle de SlicyWeb s'ouvre par une conversion (à écrire avec la future version) ; un fichier d'une **version plus récente** est refusé avec PROJ_003 et le message « Ce projet a été créé par une version plus récente de SlicyWeb (format 3.1.0). Cette version ouvre le format 3.0.0. » |
| B | Passer à **4.0.0** pour marquer le changement, même sans fichier existant ; même règle pour l'avenir. |

### Q6. Ce qui est enregistré, et ce qui ne l'est pas *(format du fichier, choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | **Enregistré :** chaque objet (nom, fichier d'origine, visible, verrouillé, position, rotation, échelle, triangles), son analyse (avec le type d'objet que tu as choisi), sa recommandation, l'imprimante, le matériau et le filament. <br>**Non enregistré :** les objets sélectionnés, la caméra (vue et zoom), l'onglet ouvert, les surplombs en rouge (déjà décidé : éteints à chaque démarrage), l'historique Annuler / Rétablir (vidé à l'ouverture, UNDO_REDO_SPEC), l'estimation (recalculée), les coûts (ils sont dans tes préférences, pas dans le projet). |
| B | Comme A, et aussi la **vue de la caméra** (nouveau champ du projet). |

### Q7. Analyses et recommandations à l'ouverture *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Les analyses et recommandations du fichier sont **affichées tout de suite**, avec leur état (à jour ou obsolète). Le Worker de l'analyse repasse ensuite sur chaque objet, en arrière-plan, seulement pour ce qui n'est pas dans le fichier : les triangles en surplomb (rouge) et les aires des faces (estimation) ; il ne change pas les valeurs enregistrées. L'estimation apparaît quand c'est fini. Une recommandation est refaite seulement si l'imprimante, le matériau ou le filament a changé (Q3). |
| B | **Tout est refait** à l'ouverture (analyse, classification, recommandation), comme après un import ; le type d'objet que tu as choisi est gardé. Plus simple, mais quelques secondes de calcul pour un gros modèle, et des valeurs qui peuvent différer si les règles ont changé entre deux versions. |

### Q8. Le menu Fichier *(choix visible, suppression de deux lignes)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Nouveau projet Ctrl+N · Ouvrir un projet… Ctrl+O · Projets récents ▸ · Enregistrer Ctrl+S · Enregistrer sous… Ctrl+Maj+S · Importer STL · Importer 3MF · Fermer le projet · Quitter. **« Ouvrir WYPROJ » et « Exporter WYPROJ » sont retirés** (menu, GUI_SPEC et 2 clés de traduction) : WYPROJ est le seul format de projet, ils feraient la même chose qu'Ouvrir et Enregistrer sous. |
| B | Garder les deux lignes, qui font la même chose qu'Ouvrir et Enregistrer sous. |

### Q9. Le nom du projet *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Le nom du projet est **le nom du fichier**, sans `.wyproj`. Avant le premier enregistrement, il s'affiche « Sans titre » (« Untitled », « ללא שם »), qui n'est jamais écrit dans un fichier (le projet reste indépendant de la langue). Enregistrer sous avec un autre nom change le nom du projet. Le nom proposé dans la fenêtre d'enregistrement : celui du premier objet importé (« cube.wyproj »), sinon « Sans titre ». Toutes les langues acceptées (lots 7 et 8). |
| B | Un nom de projet séparé, modifiable dans la ligne Projet (double-clic, comme Renommer) ; le nom du fichier peut être différent. |

### Q10. Enregistrer et Enregistrer sous *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Enregistrer (Ctrl+S) écrit dans le fichier du projet ; pour un projet jamais enregistré, il ouvre la fenêtre Enregistrer sous. Enregistrer sous ouvre la fenêtre de Windows : dossier proposé = le dernier dossier utilisé, sinon « Documents » ; un fichier qui existe déjà : Windows demande s'il faut le remplacer. L'écriture passe par un fichier temporaire, renommé à la fin : un plantage pendant l'enregistrement ne laisse jamais un fichier à moitié écrit. Pendant l'écriture : « Enregistrement… » dans la barre d'état ; ensuite « Projet enregistré » quelques secondes. Enregistrer est possible pendant une analyse (l'analyse en cours est enregistrée « obsolète » et refaite à l'ouverture). |
| B | Comme A, mais Enregistrer est grisé tant qu'une analyse, une recommandation ou une optimisation est en cours. |

### Q11. Modifications non enregistrées : ce qui compte *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Rend le projet **« modifié »** tout ce qui change le fichier : import, supprimer, dupliquer, déplacer, pivoter, échelle, renommer, masquer, verrouiller, ranger, optimiser, changer d'imprimante, de matériau ou de filament, choisir le type d'objet. **Ne compte pas** : la sélection, la caméra, l'onglet, les surplombs en rouge, les coûts, la langue. Annuler / Rétablir jusqu'à l'état enregistré enlève la marque (comme Word) : SlicyWeb retient la place de l'historique au moment de l'enregistrement. |
| B | Comme A, mais une fois modifié, le projet reste modifié jusqu'au prochain enregistrement, même si Annuler revient à l'état enregistré (plus simple). |

### Q12. Où voir le nom et l'état du projet *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | **Titre de la fenêtre** : « cube — SlicyWeb », avec « • » devant le nom quand le projet est modifié (« • cube — SlicyWeb »). **Ligne Projet** (au-dessus des onglets) : le nom, puis « modifié » en petit quand il l'est ; « Sans titre » pour un projet jamais enregistré. **Barre d'état**, champ « Projet » : « Enregistré à 14:32 », « Modifié » ou « Non enregistré ». Les autres lignes de la section Projet de GUI_SPEC (version, date de création, format, application) ne sont pas affichées : elles n'aident pas l'utilisateur ; GUI_SPEC est mis à jour. |
| B | Comme A, et la ligne Projet se déplie au clic pour montrer : dossier du fichier, date de création, dernier enregistrement, version du format. |

### Q13. Fenêtre « Enregistrer les modifications ? » *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Quand le projet est modifié, Nouveau, Ouvrir, un projet récent, un `.wyproj` déposé, Fermer, Quitter **et la croix de la fenêtre** ouvrent : « Enregistrer les modifications de « cube » ? » avec trois boutons : **Enregistrer** (a le focus), **Ne pas enregistrer**, **Annuler**. Échap = Annuler. Enregistrer sur un projet jamais enregistré ouvre d'abord la fenêtre Enregistrer sous ; si tu l'annules, rien ne se passe. Un projet non modifié (ou vide) se ferme sans question. Même fenêtre en anglais et en hébreu (boutons en miroir en hébreu). |
| B | Comme A, sans le bouton Annuler (Enregistrer ou Ne pas enregistrer seulement). |

### Q14. Nouveau et Fermer *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Nouveau et Fermer font la même chose : scène vide, historique vidé, « Sans titre », non modifié. **L'imprimante, le matériau et le filament choisis restent** (comme Bambu Studio et OrcaSlicer, qui gardent l'imprimante). Le menu « Fermer le projet » est grisé quand le projet est vide et jamais enregistré. |
| B | Nouveau et Fermer reviennent aussi à l'imprimante, au matériau et au filament de tes préférences (le dernier choix enregistré dans `settings.json`). |

### Q15. Ouvrir un projet, et le glisser-déposer *(choix visible, sécurité)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Ouvrir (Ctrl+O) ouvre la fenêtre de Windows, filtrée sur les `.wyproj`. Ouvrir **remplace** la scène (après Q13), sans Annuler (UNDO_REDO_SPEC). Pendant la lecture d'un gros projet : barre de progression comme à l'import. **Glisser-déposer** un `.wyproj` dans la vue l'ouvre de la même façon ; déposé avec des STL ou des 3MF, seul le projet est refusé, avec le message « Déposez un projet seul » (les STL et 3MF sont importés comme avant). Un projet ouvert depuis le glisser-déposer garde son chemin : Ctrl+S écrit dedans. |
| B | Comme A, mais déposer un `.wyproj` **ajoute** ses objets à la scène actuelle (fusion), au lieu de la remplacer. |

### Q16. Erreurs à l'ouverture et à l'enregistrement *(choix visible, format des erreurs)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Un fichier refusé **ne change rien** à la scène actuelle. Messages traduits, avec leur code : PROJ_001 « Projet introuvable » (projet récent déplacé ou supprimé : il est retiré de la liste) ; PROJ_002 « Projet endommagé » (JSON illisible, champ manquant ou invalide, référence d'analyse vers un objet absent, triangles illisibles) ; PROJ_003 version (Q5) ; **nouveau PROJ_004 « Enregistrement impossible »** (disque plein, dossier protégé, fichier ouvert ailleurs : le fichier existant n'est pas touché) ; **nouveau PROJ_005 « Projet trop volumineux »** au-delà de **500 Mo** (même ordre que la limite de l'import ; la mémoire d'Electron ne lit pas un texte beaucoup plus long). Le message s'affiche au-dessus de la vue, comme ceux de l'import. |
| B | Comme A, sans limite de taille (un fichier trop gros fait échouer la lecture avec PROJ_002). |

### Q17. Projets récents *(choix visible, format des réglages)*

USER_SETTINGS_SPEC dit `recentProjects: 20` ; le DATA_SCHEMA n'a rien.

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Fichier > Projets récents ▸ : les **10** derniers projets ouverts ou enregistrés, le plus récent en haut, avec leur nom (le chemin complet au survol) ; « Effacer la liste » en bas ; grisé quand la liste est vide. Liste gardée dans `settings.json` (nouveau champ `files.recentProjects` du User Preferences Schema, DATA_SCHEMA 3.16.0 ; USER_SETTINGS_SPEC aligné : une liste de 10 au plus). Un projet introuvable : PROJ_001, retiré de la liste. |
| B | Comme A avec **20** projets, comme le dit USER_SETTINGS_SPEC. |

### Q18. Sauvegarde automatique *(choix visible, format des fichiers)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Toutes les **5 minutes** (USER_SETTINGS_SPEC : 300 s), **seulement si le projet est modifié**, SlicyWeb écrit une **copie de secours** dans le dossier des réglages (`recovery/`), **jamais dans ton fichier** (SECURITY_SPEC : séparée du projet principal). Aussi pour un projet jamais enregistré. La copie est supprimée quand tu enregistres, quand tu choisis « Ne pas enregistrer » et quand SlicyWeb se ferme normalement. Aucune trace dans la barre d'état, rien dans l'historique. Intervalle fixe jusqu'à la fenêtre Préférences (où il pourra se régler, ou s'éteindre). Réglages `project.autoSave` et `project.autoSaveInterval` ajoutés au User Preferences Schema avec ces valeurs. |
| B | La sauvegarde automatique **écrit directement dans ton fichier** `.wyproj` (seulement s'il a déjà été enregistré). Rien pour un projet sans titre ; aucune récupération possible si le fichier est abîmé. |

### Q19. Récupération après un plantage, et démarrage *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Au démarrage, si une copie de secours existe encore (plantage, coupure de courant, fermeture forcée), une fenêtre demande : « SlicyWeb ne s'est pas fermé normalement. Récupérer « cube » (sauvegardé le 24/11 à 14:32) ? » **Récupérer** / **Ignorer**. Récupérer ouvre le projet, marqué « modifié », rattaché à son fichier s'il en avait un (Ctrl+S écrit dedans). Ignorer supprime la copie. Une copie endommagée est mise de côté (`recovery/quarantine/`, SECURITY_SPEC) avec un message, jamais ouverte. **Démarrage normal : scène vide**, le dernier projet n'est **pas** rouvert tout seul (`restoreLastSession` de USER_SETTINGS_SPEC passe à `false`, à régler plus tard dans Préférences). |
| B | Comme A, et à chaque démarrage normal, le **dernier projet est rouvert** tout seul (`restoreLastSession: true`, comme le dit USER_SETTINGS_SPEC). |

### Q20. Sécurité : fichiers et canaux IPC *(sécurité)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Les fenêtres de Windows, la lecture et l'écriture des fichiers se font **dans le processus principal seulement**. La fenêtre de l'application **n'envoie jamais un chemin à écrire** : le processus principal retient le chemin du projet ouvert. Seules exceptions, pour lire : un numéro de la liste des projets récents, et le chemin d'un fichier déposé, accepté seulement s'il finit par `.wyproj`. Tout fichier lu est validé en entier (ProjectSchema strict, triangles vérifiés : nombres finis, multiple de 9) avant d'être envoyé à la fenêtre. Canaux : les 4 coquilles `project:create`, `project:save`, `project:load`, `project:delete` sont **remplacées** par `project:open`, `project:openRecent`, `project:openPath`, `project:save`, `project:saveAs`, `project:recent`, `project:clearRecent`, `project:autosave`, `project:recovery`, `project:discardRecovery` (10 canaux, **35 au total**), plus un message du processus principal vers la fenêtre quand on clique la croix (Q13). `check:ipc` les vérifie. |
| B | Comme A, mais la lecture d'un `.wyproj` se fait dans la fenêtre (comme l'import des STL), et le chemin n'est jamais connu pour un fichier déposé : Ctrl+S sur un projet déposé ouvre Enregistrer sous. |

### Q21. KI-020 et `author` *(format du fichier ; KI à régler avant la phase 13)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | **KI-020 :** le nom d'un objet dans un 3MF (attribut `name` de l'objet, quand il existe) devient son `name` à l'import (lot 106) : « Support », « Base » au lieu de « plateau (1) », « plateau (2) ». Les autres métadonnées du 3MF (auteur, date, application) ne sont pas gardées et sont retirées d'IMPORT_EXPORT_SPEC (aucun champ). KI-020 fermé. **`author` :** jamais rempli et jamais écrit (SlicyWeb ne connaît pas ton nom, et un fichier envoyé ne doit pas le contenir sans que tu le saches) ; IMPORT_EXPORT_SPEC le garde « facultatif » ; point retiré de PASSATION §5. |
| B | KI-020 reste ouvert pour plus tard (hors phase 13) ; `author` comme A. |

### Q22. Code existant : réécrit, retiré, documents *(suppression de code)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | **Gardés et utilisés :** ProjectSerializer, ProjectDeserializer, ProjectValidator, WYPROJExporter, WYPROJImporter (avec limite de taille et triangles), ProjectSchema (objets vérifiés en entier). **Réécrits sous le même nom :** `ProjectManager.ts` (seul créateur, ouverture, enregistrement ; ses méthodes jamais appelées `updateScene`, `updateAnalysis`, `removeObject`, `duplicateObject`, `updateObjectTransform`, `setObjectAnalysis`, `markAnalysisOutdated`, `updateRecommendations`, `updateSettings` **supprimées** : les stores de l'interface appliquent déjà ces règles), `ProjectIPC.ts`, `AutoSaveService.ts`, `RecoveryManager.ts`, `RecoveryValidator.ts`, `ProjectService.ts` (rassemble la scène pour l'enregistrement, la remet à l'ouverture). **Supprimés :** `src/recovery/SessionRestorer.ts` (rien à rouvrir tout seul, Q19 A) et `src/storage/ProjectStorage.ts` (projet en mémoire, jamais utilisé ; `StorageManager.ts` adapté). **Documents :** nouvel ADR-038 (phase 13) et ADM-034 ; DATA_SCHEMA 3.16.0 ; IMPORT_EXPORT_SPEC, USER_SETTINGS_SPEC, GUI_SPEC, ERROR_CODES_SPEC, UNDO_REDO_SPEC, SECURITY_SPEC, TEST_PLAN, FILE_STRUCTURE, DIRECTORY_PURPOSES ; DOMAINS_DEPENDENCY_MATRIX : Project Management peut lire les données de Model Analysis, Recommendation et des profils (sans les calculer) ; **KI-033** : API HTTP du projet d'API_SPEC, sans API HTTP (comme KI-030, KI-031). |
| B | Comme A, mais rien n'est supprimé : SessionRestorer, ProjectStorage et les méthodes inutilisées de ProjectManager restent. |

---

## 4. Envoi proposé

| Lot | Contenu |
|---|---|
| **111** | Toute la phase 13 en un envoi (ta règle du 2026-11-18) : documents, code, traductions (anglais, français, hébreu, nombre avant l'unité partout), tests unitaires et e2e (enregistrer puis rouvrir et comparer chaque objet, valeur par valeur ; fichier refusé ; modifications non enregistrées ; sauvegarde automatique ; récupération après un arrêt forcé ; projets récents ; Hébreu), et **une seule série de contrôles manuels** à la fin (sur ton PC : enregistrer, fermer, rouvrir, comparer ; couper SlicyWeb dans le Gestionnaire des tâches pour la récupération ; un gros modèle pour la durée). |
| 112 | Clôture de la phase 13 avec tes résultats (ou corrections, si un contrôle échoue). |

Durées visées (PERFORMANCE_SPEC) : sauvegarde automatique < 1 s, chargement d'une récupération < 3 s. Je les mesurerai sous Linux sur un modèle d'un million de triangles ; tu les vérifieras sur ton PC.

---

## 5. Gardé pour après (hors phase 13)

- **Fenêtre Préférences** (ta demande du 2026-11-19 et du 2026-11-24) : le réglage « Écart entre les objets » (10 mm fixes aujourd'hui), les coûts (section Coûts de l'onglet Imprimante, qui y iront), et plus tard l'intervalle de la sauvegarde automatique et la réouverture du dernier projet.
- Export vers le slicer (phase 14).
