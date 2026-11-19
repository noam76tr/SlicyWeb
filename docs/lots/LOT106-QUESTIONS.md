# Lot 106 : Renommer, Masquer, Verrouiller, toutes les questions avant de coder

Date : 2026-11-18. Base : `main` 55e6aeb (lot 105 v2 validé).

Ta nouvelle règle : toutes les questions du sujet en une fois, puis un seul envoi pour Renommer, Masquer et Verrouiller, avec une seule série de contrôles manuels à la fin.

Aucun code n'est écrit. Les captures sont des maquettes posées sur la vraie application (même police, mêmes couleurs) : capture 1, le panneau Objets avec un objet renommé (« Boîtier »), un objet masqué (« Couvercle », en gris, œil barré, absent de la vue) et un objet verrouillé (« Base », cadenas fermé).

Ce qui existe déjà :
- les champs `visible` et `locked` sont dans l'objet (DATA_SCHEMA.md, Object Schema), toujours `true` et `false` aujourd'hui ;
- l'œil et le cadenas sont dessinés dans chaque ligne du panneau Objets, mais grisés (« Disponible dans une version ultérieure ») ;
- la vue 3D ne dessine déjà pas un objet dont `visible` vaut `false`, et le rectangle de sélection l'ignore ;
- il n'y a pas de champ « nom » : le panneau affiche le nom du fichier (`fileName`), avec « cube (1) », « cube (2) » quand deux fichiers ont le même nom.

Réponse rapide possible : « tout A ».

---

## Renommer

### Q1. Où garder le nom donné (format)

- **A (recommandé)** : un nouveau champ `name` dans l'objet (DATA_SCHEMA.md, Object Schema, version 3.14.0). `null` = pas de nom donné : on affiche le nom du fichier, comme aujourd'hui. `fileName` ne change jamais (on garde le nom du fichier d'origine). Le nom sera enregistré avec le projet (phase 13) ; le format WYPROJ reste 3.0.0, car le champ est seulement ajouté : un projet sans `name` s'ouvre avec `null`. À l'export (phase 14), le nom donné sera le nom de l'objet dans le fichier du slicer (noté dans SLICER_EXPORT_SPEC.md, rien à coder maintenant).
- **B** : on remplace `fileName` par le nom donné. Pas de nouveau champ, mais le nom du fichier d'origine est perdu.
- **C** : le nom reste seulement en mémoire, jamais enregistré : il est perdu à la réouverture du projet.

### Q2. Comment renommer

- **A (recommandé)** : le nom devient un champ dans la ligne même du panneau Objets (capture 2), le texte entier sélectionné. On l'ouvre par un double-clic sur le nom, par F2 (objet sélectionné, dans la vue ou dans le panneau) ou par « Renommer » dans le menu du clic droit. Entrée ou un clic ailleurs valide, Échap annule.
- **B** : mêmes façons de l'ouvrir, mais une petite fenêtre « Renommer l'objet » avec le champ et les boutons Annuler et Renommer.

Le double-clic ne désélectionne pas l'objet (aujourd'hui, un 2e clic sur l'objet seul sélectionné le désélectionne).

### Q3. Règles du nom

- **A (recommandé)** : espaces retirés au début et à la fin ; un nom vide remet le nom du fichier (`name` = `null`) ; 100 caractères au plus (la frappe s'arrête là) ; toutes les langues acceptées (hébreu compris) ; un nom déjà utilisé par un autre objet est accepté.
- **B** : comme A, mais un nom déjà utilisé est refusé (champ en rouge, « Ce nom est déjà utilisé »).

### Q4. Deux objets avec le même nom affiché

- **A (recommandé)** : la règle « cube (1), cube (2) » s'applique à tous les noms affichés, donnés ou non : deux objets nommés « Support » s'affichent « Support (1) » et « Support (2) ». Dans les messages (hors plateau, analyse, optimisation), on sait toujours de quel objet on parle.
- **B** : un nom donné s'affiche tel qu'il a été tapé ; la numérotation ne vaut que pour les noms de fichier.

### Q5. Dupliquer un objet renommé

- **A (recommandé)** : la copie garde le nom donné (« Boîtier » → « Boîtier (1) » et « Boîtier (2) » avec Q4 A). DATA_SCHEMA.md, règle 7, est complétée : la copie garde son nom, mais toujours sans analyse ni choix.
- **B** : la copie reprend le nom du fichier.

### Q6. Renommer avec plusieurs objets sélectionnés

- **A (recommandé)** : « Renommer » est grisé et F2 ne fait rien : on renomme un objet à la fois.
- **B** : le nom tapé est donné à tous (puis numéroté par Q4 A).

Partout où un nom est affiché (panneau Objets, onglet Objet, barre d'état, messages au-dessus de la vue), c'est le nom donné.

---

## Masquer

### Q7. Que devient un objet masqué

- **A (recommandé)** : il est mis de côté. Il n'est pas dessiné, ne se clique pas dans la vue, n'est pas pris par le rectangle de sélection ni par Ctrl+A, n'a pas d'avertissement hors plateau (pas d'orange, pas de ⚠, absent du message), ne bouge pas avec Ranger (les autres sont rangés comme s'il n'était pas là ; s'il est réaffiché par-dessus un autre, l'avertissement de chevauchement n'existe pas encore, comme aujourd'hui). Son analyse et sa recommandation restent calculées (elles seront prêtes quand il revient), et ses surplombs ne sont pas dessinés (déjà écrit dans GUI_SPEC).
- **B** : seulement invisible dans la vue : Ctrl+A, Ranger et l'avertissement hors plateau le prennent toujours.

### Q8. Objet masqué et export vers le slicer (phase 14)

- **A (recommandé)** : il n'est pas exporté (ce qu'on voit est ce qu'on imprime). L'export dira « 1 objet masqué n'est pas exporté ». Noté dans SLICER_EXPORT_SPEC.md, rien à coder maintenant.
- **B** : il est exporté comme les autres.

### Q9. Comment masquer et afficher

- **A (recommandé)** :
  - l'œil de chaque ligne du panneau Objets devient actif : il masque ou affiche **cette ligne seulement**, sans changer la sélection ;
  - menu du clic droit sur un objet : « Masquer » (capture 3) ;
  - touche **H** : masque les objets sélectionnés ;
  - « Tout afficher » (**Alt+H**) dans le menu du vide (capture 4) et dans le menu Affichage.
- **B** : comme A, sans les touches H et Alt+H.

### Q10. Masquer un objet sélectionné

- **A (recommandé)** : il quitte la sélection (sa poignée disparaît avec lui).
- **B** : il reste sélectionné, invisible.

### Q11. Ligne d'un objet masqué dans le panneau Objets

- **A (recommandé)** : la ligne est en gris, œil barré (capture 1). Un clic sur la ligne le sélectionne quand même : l'onglet Objet l'affiche, et Renommer, Afficher, Supprimer, Dupliquer marchent ; rien n'apparaît dans la vue, et la section Transformation est grisée tant qu'il est masqué (on ne déplace pas un objet qu'on ne voit pas).
- **B** : un clic sur une ligne grise ne fait rien ; seul son œil la réaffiche.

---

## Verrouiller

### Q12. Ce que bloque le verrou

- **A (recommandé)** : toute modification de position, de rotation et d'échelle :
  - glisser l'objet dans la vue ne le déplace pas (curseur normal, pas ✥), pas de poignées Déplacer, Pivoter, Échelle ;
  - section Transformation grisée (valeurs lisibles), avec la ligne « Objet verrouillé » ;
  - Centrer sur le plateau, Réinitialiser… et Réinitialiser la rotation et l'échelle grisés ;
  - Optimiser l'orientation le saute, avec une ligne « Base : verrouillé, orientation non changée » dans le message ;
  - Ranger le laisse en place et range les autres autour de lui (sa place compte comme occupée).
- **B** : comme A, mais Ranger range les autres sans tenir compte de lui (ils peuvent se poser sur lui).

### Q13. Supprimer un objet verrouillé

- **A (recommandé)** : permis (le verrou protège la place, pas l'existence de l'objet ; Ctrl+Z le remet). Dupliquer, Renommer et Masquer aussi. La copie d'un objet verrouillé n'est pas verrouillée.
- **B** : Supprimer est grisé tant qu'un objet sélectionné est verrouillé.

### Q14. Sélectionner un objet verrouillé

- **A (recommandé)** : il se sélectionne comme les autres (clic, rectangle, Ctrl+A, panneau), avec la couleur de sélection, mais sans poignées.
- **B** : il ne se sélectionne pas dans la vue, seulement dans le panneau Objets.

### Q15. Sélection avec des objets verrouillés et d'autres non

- **A (recommandé)** : les poignées et la section Transformation sont bloquées dès qu'un objet de la sélection est verrouillé (ligne « La sélection contient un objet verrouillé ») : rien ne bouge à moitié. Ranger et Optimiser traitent chaque objet à part (Q12).
- **B** : seuls les objets non verrouillés bougent ; les verrouillés restent en place.

### Q16. Comment verrouiller et déverrouiller

- **A (recommandé)** : le cadenas de chaque ligne devient actif (cette ligne seulement, sans changer la sélection) ; « Verrouiller » dans le menu du clic droit ; pas de touche (un verrou posé par erreur au clavier ne se verrait pas).
- **B** : comme A, plus la touche **L**.

Dans la vue, rien de spécial ne montre le verrou : seulement le cadenas fermé de la ligne.

---

## Commun aux trois

### Q17. Annuler (Ctrl+Z)

- **A (recommandé)** : Renommer, Masquer ou Afficher, Verrouiller ou Déverrouiller sont chacun une étape de l'historique (nouveaux types RENAME, VISIBILITY, LOCK dans UNDO_REDO_SPEC.md). « Tout afficher » est une seule étape.
- **B** : seulement Renommer.
- **C** : aucun des trois.

### Q18. Libellés du menu du clic droit

Place des nouvelles lignes : captures 3 (objet), 4 (vide) et 5 (hébreu, en miroir comme au lot 105).

```text
Propriétés
Renommer                       F2
───────────────────────────────
Déplacer                        G
Pivoter                         R
Échelle                         S
───────────────────────────────
Dupliquer                  Ctrl+D
Supprimer                     Del
───────────────────────────────
Masquer                         H
Verrouiller
───────────────────────────────
Optimiser l'orientation
Centrer sur le plateau
Réinitialiser la rotation et l'échelle
───────────────────────────────
Recalculer l'analyse
```

- **A (recommandé)** : une ligne qui change selon la sélection : « Masquer » si au moins un objet sélectionné est visible (elle les masque tous), sinon « Afficher » ; « Verrouiller » si au moins un n'est pas verrouillé (elle les verrouille tous), sinon « Déverrouiller ».
- **B** : deux lignes fixes chacune (Masquer et Afficher, Verrouiller et Déverrouiller), celle qui ne sert à rien grisée.

Menu du vide : « Tout afficher Alt+H » au-dessus de « Réinitialiser la vue », grisé quand aucun objet n'est masqué.

`visible` et `locked` seront enregistrés avec le projet (phase 13), comme les autres champs de l'objet.

---

## Textes (nouveaux seulement)

| Clé | Français | English | עברית |
|---|---|---|---|
| `contextMenu.rename` | Renommer | Rename | שנה שם |
| `contextMenu.hide` | Masquer | Hide | הסתר |
| `contextMenu.show` | Afficher | Show | הצג |
| `contextMenu.lock` | Verrouiller | Lock | נעל |
| `contextMenu.unlock` | Déverrouiller | Unlock | בטל נעילה |
| `view.showAll` | Tout afficher | Show All | הצג הכל |
| `objects.nameField` (lecteur d'écran) | Nom de l'objet | Object name | שם האובייקט |
| `transform.locked` (Q12) | Objet verrouillé | Object locked | האובייקט נעול |
| `transform.lockedInSelection` (Q15) | La sélection contient un objet verrouillé | The selection contains a locked object | הבחירה כוללת אובייקט נעול |
| `transform.hidden` (Q11) | Objet masqué | Object hidden | האובייקט מוסתר |
| `optimization.locked` (Q12) | {name} : verrouillé, orientation non changée | {name}: locked, orientation not changed | {name}: נעול, הכיוון לא שונה |

Les infobulles de l'œil et du cadenas reprennent Masquer, Afficher, Verrouiller, Déverrouiller. « (Disponible dans une version ultérieure) » disparaît de ces deux boutons.

## Captures

1. `capture-1-panneau.png` : panneau Objets, objet renommé, masqué, verrouillé.
2. `capture-2-renommer.png` : Q2 A, le nom en cours de modification dans la ligne.
3. `capture-3-menu-objet.png` : Q18, menu de l'objet.
4. `capture-4-menu-vide.png` : menu du vide avec Tout afficher.
5. `capture-5-hebreu.png` : menu de l'objet en hébreu.

## Après tes réponses : un seul envoi (lot 106)

- Fichiers prévus : `Object3D.ts` et DATA_SCHEMA.md (Q1), `objectStore.ts`, un service pour les trois actions (nom, visibilité, verrou, avec l'historique), `objectNames.ts`, `LeftSidebar.tsx`, `ContextMenu.tsx`, `ObjectInteraction.ts` et les poignées (verrou), `TransformSection.tsx`, `ArrangeService.ts` et `PlateLayout.ts` (Q7, Q12), `PlateCheckService.ts` (Q7), `OptimizationService.ts` (Q12), les raccourcis (F2, H, Alt+H), le menu Affichage, les 3 dictionnaires, GUI_SPEC.md (le bloc « Later » du menu du clic droit est remplacé), UNDO_REDO_SPEC.md (Q17), SLICER_EXPORT_SPEC.md (Q1, Q8), TEST_PLAN.md.
- Aussi dans cet envoi : PASSATION.md §1 avec ta nouvelle règle (un sujet = toutes les questions d'abord, un seul envoi, une seule série de contrôles), décision 111 (lot 105 validé et cette règle), décision 112 (tes réponses), CHANGELOG 0.1.105 passé en Completed avec tes résultats (489 clés, 29 canaux, 605 + 1, 67 e2e, contrôles 1 à 10) et 0.1.106 pour ce lot.
- Aucune suppression de code prévue. Si j'en trouve une nécessaire, je te la demande avant.
- Tests : unitaires (noms et numérotation, règles du nom, masqué ignoré par Ctrl+A, Ranger et le contrôle hors plateau, verrou dans TransformService, Ranger autour d'un objet verrouillé, Ctrl+Z des trois actions) ; e2e (renommer par double-clic et F2, Échap ; œil et H puis Tout afficher ; cadenas : glisser ne déplace pas).
