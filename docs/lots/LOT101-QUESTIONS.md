# Lot 101 : avertissement hors plateau, « Ranger » et place de la copie, questions (choix visibles)

**Réponses de Noam (2026-11-16) : Q1 à Q10 A**, textes validés, bouton en hébreu « סדר » (décision 103). Le lot est livré dans `LOT101.md`.

Base : `main` 94754c8 (lots 100, 102 et 103). Version 2 du 2026-11-15 : questions relues face aux lots 102 et 103.

**Ce que les lots 102 et 103 changent ici :** aucune question n'est tranchée par eux. Ils n'ont touché ni à Dupliquer, ni au panneau Objets, ni à la barre d'outils, ni aux menus, ni à la couleur des pièces. Seule Q4 est précisée : « pendant le geste » vaut aussi pour les nouvelles flèches (lot 102), les anneaux de Pivoter et les poignées de l'Échelle (lot 103). L'orange des pièces reste bien distinct du jaune d'une flèche ou d'un anneau survolé. La touche A est toujours libre (G, R, S et Ctrl+A sont pris). Numéros gardés pour ce lot : CHANGELOG 0.1.101 et décision 103 de PASSATION.

Réponds par exemple « Q1 A, Q2 A… ». Je n'écris pas de code avant tes réponses. Aucune suppression de code n'est prévue.

Ce qui est déjà décidé par tes messages :
- un avertissement visible dès qu'un objet dépasse du plateau, pas seulement à l'export ;
- un bouton « Ranger » qui pose tous les objets sur le plateau, sans contact entre eux, centrés ;
- Dupliquer pose la copie à une place libre DANS le plateau (à droite si possible, sinon ailleurs), avec le même calcul que « Ranger » ; s'il n'y a aucune place libre, la copie est quand même créée, avec l'avertissement ;
- l'optimisation reste sur l'orientation seule, elle ne déplace rien.

---

## Avertissement hors plateau

### Q1. Quand un objet « dépasse »

| Option | Règle |
|---|---|
| **A (recommandé)** | Sa boîte vue de dessus sort du rectangle du plateau (en X ou en Y), ou il est plus haut que la hauteur d'impression de l'imprimante (Z). |
| B | En X et en Y seulement. La hauteur n'est jamais vérifiée. |
| C | Sa forme exacte vue de dessus. Un objet tourné de 45° dont seuls les coins de la boîte dépassent n'est pas signalé, mais le calcul est plus long sur un gros modèle. |

Pourquoi A : c'est rapide même pendant un glissement, et un objet trop haut ne s'imprime pas non plus. Les coins arrondis du plateau (3 à 10 mm) ne sont pas comptés.

### Q2. Comment l'avertissement se voit

| Option | Ce qu'on voit |
|---|---|
| **A (recommandé)** | Trois signes ensemble. L'objet est en orange dans la vue 3D (#FFB020, la couleur des avertissements ; le rouge reste aux surplombs). Un ⚠ orange est devant son nom dans le panneau Objets. Un message au-dessus de la vue, avec ceux de l'import : « cube dépasse du volume d'impression », ou « 3 objets dépassent du volume d'impression ». |
| B | La couleur et le ⚠ du panneau Objets, sans message. |
| C | Le message seulement. |

Le message n'a pas de bouton Fermer. Il disparaît tout seul quand tous les objets sont rentrés (déplacés, Ranger, Ctrl+Z ou objet supprimé).

### Q3. Un objet sélectionné qui dépasse

Aujourd'hui, un objet sélectionné est tout bleu.

| Option | Couleur |
|---|---|
| **A (recommandé)** | Orange vif s'il est sélectionné, orange plus sombre sinon. L'orange passe avant le bleu : on voit l'objet changer de couleur pendant qu'on le glisse vers le bord. |
| B | Bleu tant qu'il est sélectionné (la sélection passe avant). L'orange n'apparaît qu'une fois l'objet désélectionné ; pendant un glissement, seul le message le dit. |

### Q4. À quel moment

| Option | Moment |
|---|---|
| **A (recommandé)** | La couleur change pendant le geste (glisser la pièce, une flèche, un anneau de Pivoter, une poignée de l'Échelle). Le message et le ⚠ suivent à la fin du geste, pour que le texte au-dessus de la vue ne clignote pas. |
| B | Tout à la fin du geste. |

---

## Bouton « Ranger »

### Q5. Où se trouve la commande

| Option | Place |
|---|---|
| **A (recommandé)** | Bouton « Ranger » dans la barre d'outils, à côté d'Optimiser, et Édition > Ranger, avec la touche **A** (comme Bambu Studio et OrcaSlicer). La touche ne fait rien dans un champ, une fenêtre ou un menu ouvert, ni pendant un geste. |
| B | Le bouton et Édition > Ranger, sans touche. |
| C | Le bouton et Outils > Ranger, sans touche. |

Le bouton est grisé quand il n'y a aucun objet.

### Q6. Quels objets sont rangés

| Option | Objets |
|---|---|
| **A (recommandé)** | Tous les objets, toujours, comme tu l'as écrit. La sélection ne compte pas et ne change pas. |
| B | Les objets sélectionnés s'il y en a au moins deux, sinon tous (comme Optimiser). |

### Q7. La disposition

| Option | Disposition |
|---|---|
| **A (recommandé)** | En rangées, le plus grand d'abord. Chaque rangée se remplit de gauche à droite, puis la suivante vers l'arrière. Il y a 5 mm entre deux objets (le même écart que Dupliquer), et le bloc entier est centré sur le plateau. Chaque objet est vu comme sa boîte vue de dessus. L'orientation n'est jamais changée. |
| B | Comme A, mais dans l'ordre du panneau Objets (plus prévisible, souvent moins serré). |
| C | Plus serré : la forme réelle vue de dessus, avec le droit de tourner les objets autour de Z. C'est plus long à calculer et ça change leur orientation. |

### Q8. Si tous les objets ne tiennent pas sur le plateau

| Option | Résultat |
|---|---|
| **A (recommandé)** | Les objets qui tiennent sont rangés et centrés. Les autres sont posés en rangée à droite du plateau, hors du plateau, en orange avec l'avertissement. |
| B | Rien ne bouge. Un message dit « Les objets ne tiennent pas sur le plateau ». |
| C | Tout est rangé en un seul bloc centré, même si le bloc dépasse. |

Un objet plus grand que le plateau, ou trop haut, ne peut jamais y tenir : il suit la même règle et garde l'avertissement.

### Q9. Sans imprimante choisie (pas de plateau)

| Option | Ranger |
|---|---|
| **A (recommandé)** | Ranger marche quand même : sans contact, en rangées, bloc centré sur l'origine, sans limite de taille. Il n'y a jamais d'avertissement sans plateau. |
| B | Le bouton et le menu sont grisés tant qu'aucune imprimante n'est choisie. |

---

## Dupliquer

### Q10. Où chercher la place libre de la copie

Tu as déjà décidé : dans le plateau, à droite si possible, sinon ailleurs, avec le calcul de Ranger. Il me reste l'ordre de recherche du « ailleurs ».

| Option | Recherche |
|---|---|
| **A (recommandé)** | D'abord à droite (5 mm de l'original, même Y, comme au lot 100). Si cette place est prise ou hors du plateau, je prends la place libre la plus proche de l'original, dans n'importe quelle direction. |
| B | Dans un ordre fixe : droite, gauche, arrière, avant, puis la première place libre en partant de l'avant gauche du plateau. |

Pour un groupe copié, le bloc garde sa disposition et c'est le bloc entier qui cherche sa place. Les autres objets ne bougent jamais. S'il n'y a aucune place libre, la copie va à droite à 5 mm (comme au lot 100), avec l'avertissement. Sans imprimante, la copie va toujours à droite à 5 mm.

---

## Décisions que je prendrai seul (à relire, dis-moi si l'une ne te va pas)

| Question | Choix | Pourquoi |
|---|---|---|
| Annulation de Ranger | Une seule action d'historique (Ctrl+Z remet tous les objets à leur place d'avant) | UNDO_REDO_SPEC prévoit déjà « Arrange Objects » dans Scene Actions. |
| Analyse et recommandation après Ranger | Gardées, pas refaites | Un déplacement ne rend pas l'analyse obsolète (ADR-026). |
| Changement d'imprimante | L'avertissement est refait tout de suite avec le nouveau plateau | Un plateau plus petit peut faire dépasser des objets déjà posés. |
| Ouverture d'un projet | L'avertissement est calculé dès l'ouverture | C'est la même règle partout. |
| Code du message | Nouveau code SCN_001 (avertissement, n'empêche rien), dans ERROR_CODES_SPEC | Les messages au-dessus de la vue ont tous un code. Les contrôles faits avant l'export (SLICER_EXPORT_SPEC) restent prévus pour l'export. |
| Enregistré dans le projet | Rien. L'avertissement est recalculé à chaque fois | Pas de nouveau champ dans DATA_SCHEMA. |
| Objets qui se chevauchent | Pas d'avertissement dans ce lot (seulement Ranger qui les sépare) | Tu ne l'as pas demandé. PROJECT_SPEC prévoit « Collision Detected » pour plus tard. |
| Bord du plateau | Un objet qui touche le bord, sans le dépasser, est dans le plateau | Ranger centre le bloc : il reste de la marge dès que tout tient. |

## Textes proposés (à corriger si tu veux)

| Usage | Français | English | עברית |
|---|---|---|---|
| Bouton et menu | Ranger | Arrange | סידור |
| Un objet | {name} dépasse du volume d'impression | {name} is outside the build volume | {name} חורג מנפח ההדפסה |
| Plusieurs | {count} objets dépassent du volume d'impression | {count} objects are outside the build volume | {count} אובייקטים חורגים מנפח ההדפסה |

Le ⚠ du panneau Objets porte le même texte, lu par un lecteur d'écran.

## Tests prévus

- Tests unitaires : la règle de Q1, la disposition de Ranger (rangées, écart, bloc centré, objets qui ne tiennent pas), la place de la copie (à droite, ailleurs, aucune place, sans imprimante), et l'annulation de Ranger.
- Tests e2e : un objet glissé hors du plateau donne le message et le ⚠, Ranger le fait disparaître, Ctrl+Z le fait revenir ; Ctrl+D près du bord droit pose la copie dans le plateau.
