# Lot 105 : menu du clic droit, questions avant de coder

Date : 2026-11-17. Base : `main` 7ec3f1f (lot 104 vérifié identique, 13 fichiers).

Ta demande : un menu du clic droit comme dans les slicers. Clic droit sans bouger = menu, clic droit en glissant = rotation de la vue comme aujourd'hui. Sur un objet (vue 3D ou panneau Objets) : Propriétés, Dupliquer, Supprimer, Optimiser l'orientation, Centrer sur le plateau, Réinitialiser la rotation et l'échelle, et d'autres options utiles. Dans le vide : Importer, Tout sélectionner, Ranger. Les options agissent sur la sélection ; un clic droit sur un objet non sélectionné le sélectionne d'abord. Textes en 3 langues, raccourcis à droite.

Aucun code n'est écrit. Les captures sont des maquettes posées sur la vraie application (même police, mêmes couleurs que les menus d'aujourd'hui) ; le curseur montre l'endroit du clic droit.

Toutes les commandes du menu existent déjà (menu Édition, menu Outils, boutons de la section Transformation) : le menu les appelle, sans nouvelle logique. Aucun changement de format (WYPROJ, DATA_SCHEMA), aucun nouveau canal IPC.

Réponse rapide possible : « tout A ».

---

## Q1. Quand le menu s'ouvre-t-il ?

- **A (recommandé)** : au relâchement du bouton droit, si la souris a bougé de moins de 5 pixels depuis l'appui, quel que soit le temps tenu. Au-delà de 5 pixels, c'est une rotation de la vue et aucun menu ne s'ouvre. C'est le comportement de Bambu Studio et d'OrcaSlicer.
- **B** : même règle, mais aussi moins d'une demi-seconde d'appui. Un appui long sans bouger n'ouvre rien.

Dans les deux cas, Échap ou un clic ailleurs ferme le menu sans rien faire.

## Q2. Menu sur un objet : contenu et ordre

**A (recommandé)** : ta liste, plus deux groupes que je propose (capture 1).

```text
Propriétés
───────────────────────────────
Déplacer                        G
Pivoter                         R
Échelle                         S
───────────────────────────────
Dupliquer                  Ctrl+D
Supprimer                     Del
───────────────────────────────
Optimiser l'orientation
Centrer sur le plateau
Réinitialiser la rotation et l'échelle
───────────────────────────────
Recalculer l'analyse
```

- Déplacer, Pivoter, Échelle : choisissent le mode, comme les boutons au-dessus de la vue et les touches G, R, S. Le mode en cours n'est pas coché (les boutons le montrent déjà).
- Recalculer l'analyse : le même que Outils > Recalculer l'analyse.

**B** : seulement ta liste (capture 2).

```text
Propriétés
───────────────────────────────
Dupliquer                  Ctrl+D
Supprimer                     Del
───────────────────────────────
Optimiser l'orientation
Centrer sur le plateau
Réinitialiser la rotation et l'échelle
```

Dans les deux cas :
- **Propriétés** ouvre l'onglet Objet du panneau Propriétés (comme un clic sur l'onglet) ;
- **Supprimer** garde la confirmation quand plusieurs objets sont sélectionnés (lot 100) ;
- avec plusieurs objets sélectionnés, chaque commande fait la même chose qu'aujourd'hui dans la section Transformation : **Centrer sur le plateau** met le centre du groupe au centre du plateau ; **Optimiser l'orientation** cherche l'orientation de chaque objet sélectionné.

Options que je ne propose pas dans ce lot, avec la raison :
- **Renommer** (prévu dans GUI_SPEC.md) : l'objet n'a pas de champ « nom » dans DATA_SCHEMA.md (seulement `fileName`) ; il faudrait changer le format.
- **Masquer / Afficher, Verrouiller / Déverrouiller** (prévus dans GUI_SPEC.md) : les champs `visible` et `locked` existent, mais aucun comportement n'est décrit (un objet masqué est-il exporté ? un objet verrouillé peut-il être sélectionné ?). Ça mérite son propre lot, avec ses questions. Voir Q10.
- **Miroir** : il faudrait une échelle négative, refusée aujourd'hui.

## Q3. « Réinitialiser la rotation et l'échelle » : une ligne ou deux ?

- **A (recommandé)** : une seule ligne, comme tu l'as écrit. Elle remet la rotation à 0 et l'échelle à 100 % en une fois ; un seul Ctrl+Z annule les deux.
- **B** : deux lignes, « Réinitialiser la rotation » et « Réinitialiser l'échelle », comme les boutons de la section Transformation. Chacune s'annule séparément.

```text
B :
Optimiser l'orientation
Centrer sur le plateau
Réinitialiser la rotation
Réinitialiser l'échelle
```

## Q4. Menu dans le vide : contenu

**A (recommandé)** : ta liste, plus « Réinitialiser la vue » (capture 3).

```text
Importer…
───────────────────────────────
Tout sélectionner          Ctrl+A
Ranger                          A
───────────────────────────────
Réinitialiser la vue         Home
```

**B** : seulement ta liste (Importer…, Tout sélectionner, Ranger).

Dans les deux cas, **Importer…** ouvre la même fenêtre que le bouton Importer de la barre d'outils (STL et 3MF ensemble). Il n'a pas de raccourci : aucun n'est prévu dans GUI_SPEC.md.

## Q5. Clic droit sur un objet non sélectionné, alors que d'autres le sont

Ta règle dit qu'il est sélectionné d'abord. Reste à savoir ce que deviennent les autres.

- **A (recommandé)** : il devient le seul sélectionné, puis le menu s'ouvre. Comme l'Explorateur Windows, Bambu Studio et OrcaSlicer.
- **B** : il est ajouté à la sélection, comme un Ctrl+clic.

Un clic droit sur un objet **déjà** sélectionné garde toute la sélection (sinon on ne pourrait pas agir sur plusieurs objets).

## Q6. Clic droit dans le vide alors que des objets sont sélectionnés

- **A (recommandé)** : la sélection reste. On peut fermer le menu par Échap sans rien perdre.
- **B** : la sélection est vidée, comme un clic gauche dans le vide.

## Q7. Panneau Objets : clic droit sous la liste

Clic droit sur une ligne = menu de l'objet (capture 4, il s'ouvre à la place du curseur).

- **A (recommandé)** : clic droit dans la partie vide du panneau, sous la dernière ligne = menu du vide (Importer…, Tout sélectionner…).
- **B** : rien ne s'ouvre là.

## Q8. Option impossible pour l'instant : grisée ou cachée ?

Exemples : Ranger et Tout sélectionner sans aucun objet, Optimiser l'orientation pendant une recherche.

- **A (recommandé)** : grisée, à sa place, comme dans la barre de menus aujourd'hui. Le menu garde toujours la même forme.
- **B** : cachée.

## Q9. Ouvrir le menu au clavier

- **A (recommandé)** : la touche Menu (à droite de la barre d'espace) et Maj+F10, comme dans Windows. Dans la vue 3D, le menu de la sélection s'ouvre au centre de la sélection à l'écran (menu du vide si rien n'est sélectionné) ; dans le panneau Objets, sous la ligne qui a le focus. Flèches, Entrée et Échap fonctionnent dans le menu.
- **B** : souris seulement.

## Q10. GUI_SPEC.md, section « Object Context Menu »

Cette section prévoit Renommer, Dupliquer, Supprimer, Centrer sur le plateau, Masquer, Afficher, Verrouiller, Déverrouiller. Elle ne correspond pas à ta demande.

- **A (recommandé)** : je la remplace par le menu choisi ici (objet et vide). Renommer, Masquer et Verrouiller restent notés « pour plus tard », avec la raison (Q2), sans être retirés de la spécification.
- **B** : je garde la section telle quelle et j'ajoute en plus le menu de ce lot ; les 6 options manquantes apparaissent grisées dans le menu, avec l'infobulle « Disponible dans une version ultérieure », comme les commandes futures de la barre de menus.

## Q11. Hébreu : place des raccourcis

- **A (recommandé)** : le menu est en miroir, comme la barre de menus en hébreu aujourd'hui : le texte à droite, le raccourci à gauche, et le menu s'ouvre à gauche du curseur (capture 5).
- **B** : le raccourci reste à droite, le texte à gauche (capture 6).

Les raccourcis restent écrits en caractères latins dans les trois langues (Ctrl+D, Del), comme dans la barre de menus.

---

## Textes (nouveaux seulement)

Les autres libellés existent déjà (menu Édition, menu Outils, section Transformation, boutons de mode).

| Clé | Français | English | עברית |
|---|---|---|---|
| `contextMenu.properties` | Propriétés | Properties | מאפיינים |
| `contextMenu.import` | Importer… | Import… | ייבוא… |
| `contextMenu.resetRotationScale` (Q3 A) | Réinitialiser la rotation et l'échelle | Reset rotation and scale | אפס סיבוב וקנה מידה |
| `contextMenu.objectTitle` (lecteur d'écran) | Actions sur l'objet | Object actions | פעולות על האובייקט |
| `contextMenu.sceneTitle` (lecteur d'écran) | Actions sur la scène | Scene actions | פעולות על הסצנה |

Capture 7 : le menu A en anglais.

## Captures

1. `capture-1-objet-A.png` : Q2 A, menu de l'objet dans la vue 3D (il s'ouvre vers le haut quand la place manque en dessous).
2. `capture-2-objet-B.png` : Q2 B.
3. `capture-3-vide-A.png` : Q4 A, menu du vide.
4. `capture-4-panneau-objets.png` : clic droit sur une ligne du panneau Objets.
5. `capture-5-hebreu-A.png` : Q11 A.
6. `capture-6-hebreu-B.png` : Q11 B.
7. `capture-7-anglais.png` : menu A en anglais.

## Après tes réponses

- Fichiers prévus : un composant de menu dans `src/gui/menus/`, `ObjectInteraction.ts` (distinguer clic et glisser du bouton droit, sans toucher à la rotation de la vue), `LeftSidebar.tsx` (clic droit sur les lignes), les 3 dictionnaires, GUI_SPEC.md, TEST_PLAN.md, CHANGELOG 0.1.105 (0.1.104 passe en Completed avec tes résultats), PASSATION.md (décision 109 : lot 104 validé et ta demande ; décision 110 : tes réponses).
- Aucune suppression de code prévue. Si j'en trouve une nécessaire, je te la demande avant.
- Tests : tests unitaires de la règle des 5 pixels et de la sélection au clic droit ; tests e2e : menu de l'objet (Dupliquer, Supprimer), menu du vide (Ranger), clic droit glissé = pas de menu.
