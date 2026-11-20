# Lot 106 : questions de la deuxième partie (Q19 à Q26)

Contrôles de Noam du 2026-11-19 : 501 clés, 29 canaux, 0 erreur, 622 + 1, 71 e2e, contrôles 1 à 13 OK, sauf deux demandes :
1. la touche H inverse : elle réaffiche un objet masqué sélectionné ;
2. après Optimiser, un objet tourné ne doit plus toucher un autre objet ; un écart plus grand que 5 mm.

Ces réponses seront livrées en un seul envoi (lot 106, version 2), avec une seule série de contrôles manuels.

---

## Point 1 : la touche H

**Q19. Ce que j'ai trouvé :** le code livré fait déjà la règle que tu décris. Je l'ai essayé dans l'application compilée :
- je masque un objet avec l'œil ;
- je clique sur sa ligne grise, qui est alors sélectionnée ;
- j'appuie sur H : l'objet réapparaît.

Une sélection qui mélange des objets visibles et masqués : H masque tout. C'est la même règle que la ligne Masquer / Afficher du menu.

- **A (Recommandé) :** je garde ce comportement. J'ajoute un test e2e qui fait exactement ces étapes, et un contrôle manuel.
- **B :** chez toi, H n'a pas réaffiché l'objet. Dis-moi comment tu as fait. Par exemple : ligne grise cliquée ou objet choisi autrement, clavier hébreu ou français, focus dans un champ. Je cherche la cause avant de coder.

---

## Point 2 : après Optimiser, pas de chevauchement

Aujourd'hui, l'optimisation tourne l'objet autour de son centre et le repose sur le plateau. Elle ne regarde jamais ses voisins. Un objet couché prend plus de place et peut donc couvrir un voisin.

**Q20. Quels objets sont déplacés ?**
- **A (Recommandé) :** seulement les objets que cette optimisation a tournés, et seulement s'ils touchent un autre objet visible ou en sont plus près que l'écart (Q25). Un objet gardé tel quel ne bouge pas. Les autres objets ne bougent jamais. Les objets verrouillés ne bougent jamais.
- **B :** après l'optimisation, « Ranger » est lancé sur tous les objets.
- **C :** aucun déplacement, seulement un message qui signale le chevauchement.

**Q21. Où va l'objet déplacé ?**
- **A (Recommandé) :** à la place libre la plus proche de sa place actuelle, dans le plateau. Le calcul est le même que pour Ranger et Dupliquer (`findFreePlace`). L'objet reste où il est si sa place est déjà libre.
- **B :** à droite de sa place, puis la place libre la plus proche (comme la copie de Dupliquer).

**Q22. Aucune place libre dans le plateau :**
- **A (Recommandé) :** l'objet est posé à droite du plateau, comme ce qui ne tient pas avec Ranger (lot 101, Q8). Il est alors orange, avec l'avertissement hors plateau. Il ne chevauche rien.
- **B :** l'objet reste à sa place, même s'il chevauche un voisin, et le message de l'optimisation le dit.

**Q23. Les objets masqués :**
- **A (Recommandé) :** ils ne comptent pas, comme pour Ranger (Q7 A). Un objet tourné peut donc se poser là où un objet masqué se trouve.
- **B :** ils comptent comme des obstacles.

**Q24. Annuler, et le message :**
- **A (Recommandé) :** un seul Ctrl+Z annule ensemble la rotation et le déplacement (une seule action OPTIMIZATION, comme aujourd'hui). Le message de l'optimisation ajoute une ligne pour chaque objet déplacé. C'est une nouvelle clé `optimization.moved`, avec ces textes :
  - EN « Moved to a free place. »
  - FR « Déplacé à une place libre. »
  - HE « הועבר למקום פנוי. »
- **B :** un seul Ctrl+Z, sans ligne dans le message.

---

## L'écart entre les objets

**Q25. Écart pour Ranger, Dupliquer et l'optimisation :**
- **A (Recommandé) :** 10 mm fixes, partout (`OBJECT_GAP_MM` = 10). C'est simple et ne change aucun format de fichier. Un réglage pourra venir quand la fenêtre Préférences existera (aujourd'hui, Édition > Préférences est grisé).
- **B :** un réglage « Écart entre les objets » (10 mm par défaut, de 0 à 50 mm), enregistré dans `settings.json`. Il faut alors un nouveau champ dans DATA_SCHEMA et USER_SETTINGS_SPEC, et une première fenêtre Préférences. C'est un plus gros lot, qui touche le format des réglages.
- **C :** une autre valeur fixe (dis-moi laquelle, par exemple 8 ou 15 mm).

**Q26. Écart avec le bord du plateau :**
- **A (Recommandé) :** aucun changement. Un objet peut toucher le bord du plateau, comme aujourd'hui. L'écart ne vaut qu'entre deux objets.
- **B :** le même écart aussi avec le bord. Le plateau utile devient alors plus petit de 2 × l'écart en X et en Y.

---

## Ce qui change avec les réponses A

- `ObjectStateService` : rien pour H (A à Q19), à part un test e2e.
- `PlateLayout.ts` : `OBJECT_GAP_MM` passe à 10.
- `OptimizationService.ts` : après les rotations, chaque objet tourné qui touche ou est trop près d'un autre est déplacé, dans la même action OPTIMIZATION.
- 1 nouvelle clé, `optimization.moved`.
- Tests unitaires et e2e, puis GUI_SPEC (Arrange, Duplicate, Optimize), UNDO_REDO_SPEC, CHANGELOG 0.1.106 et PASSATION (décision 113).
- Aucune suppression de code.

Une seule série de contrôles manuels à la fin, avec ton cas : 3 objets, dont un verrouillé, et un objet optimisé qui se posait sur lui.
