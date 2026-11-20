# Lot 106 : questions de la troisième partie (Q27 à Q35)

Tes contrôles de la version 2 (2026-11-20) : 502 clés, 29 canaux, 0 erreur, 630 + 1, 72 e2e, contrôles OK, avec 5 demandes. Les réponses seront livrées en un seul envoi (lot 106, version 3). Le point 5 (la forme des contrôles manuels) n'a pas de question : je l'écris dans PASSATION §1 et je l'applique dès cet envoi.

---

## 1. Un objet masqué reste sélectionné (Q10 change)

**Q27. Masquer garde la sélection :**
- **A (Recommandé) :** masquer ne change plus la sélection. L'objet masqué reste sélectionné : sa ligne est grise et surlignée en bleu. Dans la vue, il n'y a ni objet ni poignées. Tu peux appuyer sur H autant de fois que tu veux : masquer, réafficher, masquer…
  - Ctrl+A et le rectangle continuent à ne prendre que les objets visibles.
  - Un clic sur la ligne grise la sélectionne, comme aujourd'hui.
- **B :** autre chose (dis-moi).

**Q28. Ce qui agit sur un objet masqué sélectionné :**
- **A (Recommandé) :**
  - Supprimer, Dupliquer, Renommer, Verrouiller et Réafficher agissent sur lui. La copie de Dupliquer est visible, comme aujourd'hui.
  - Déplacer, Pivoter, Échelle, Centrer sur le plateau et Réinitialiser ne font rien. Les champs Transformation restent en lecture seule, avec « Objet masqué ».
  - Dans un groupe qui contient un objet masqué, rien ne bouge. La ligne dit « La sélection contient un objet masqué ». C'est la même règle que pour un objet verrouillé.
- **B :** dans un groupe, les objets visibles bougent et l'objet masqué reste à sa place.

**Q29. Optimiser avec un objet masqué sélectionné :**
- **A (Recommandé) :** l'objet masqué n'est pas tourné. Le message ajoute une ligne : « cube : masqué, orientation non changée ». C'est une nouvelle clé `optimization.hidden`, avec ces textes :
  - EN « {name}: hidden, orientation not changed »
  - FR « {name} : masqué, orientation non changée »
  - HE « {name}: מוסתר, הכיוון לא שונה »
- **B :** il est tourné quand même, même s'il est invisible.

---

## 2. Clic dans le vide du panneau Objets

**Q30. Clic gauche sous les lignes du panneau Objets :**
- **A (Recommandé) :** comme l'Explorateur Windows.
  - Un clic simple désélectionne tout.
  - Ctrl+clic ou Maj+clic dans le vide garde la sélection.
  - Le clic droit garde la sélection et ouvre le menu du vide, comme aujourd'hui (lot 105).
- **B :** tout clic gauche dans le vide désélectionne, même avec Ctrl ou Maj.

---

## 3. Import : chaque objet à une place libre

**Q31. Quand l'import cherche une place :**
- **A (Recommandé) :** à chaque import (un ou plusieurs fichiers, par Fichier > Importer, le bouton ou le glisser-déposer).
  - Un nouvel objet posé au centre qui toucherait un autre objet (ou en serait à moins de 10 mm) va à la place libre la plus proche du centre. Le calcul est le même que Ranger.
  - Les fichiers sont pris dans l'ordre. Les objets déjà sur le plateau ne bougent jamais.
  - Ce qui ne tient pas va dans une rangée à droite du plateau, en orange.
- **B :** seulement quand plusieurs fichiers arrivent ensemble. Un seul fichier reste au centre, même sur un autre objet.

**Q32. Un fichier 3MF avec plusieurs objets :**
- **A (Recommandé) :** sa disposition est gardée. Ses objets restent ensemble comme un bloc, et c'est le bloc qui va à la place libre.
- **B :** chaque objet du 3MF est posé seul, à sa place libre.

**Q33. Les autres objets pendant l'import :**
- **A (Recommandé) :** les objets masqués ne comptent pas, comme pour Ranger. Les objets verrouillés comptent comme des obstacles. Sans imprimante, toute place est libre : la place la plus proche du centre, sans limite.
- **B :** les objets masqués comptent aussi comme des obstacles.

---

## 4. Textes : « Unhide »

**Q34. Les textes :**
- **A (Recommandé) :** tes textes, avec une seule retouche en hébreu.

  | | Tout | Un objet |
  |---|---|---|
  | EN | « Unhide All » | « Unhide » |
  | FR | « Tout réafficher » | « Réafficher » |
  | HE | « בטל הסתרת הכל » | « בטל הסתרה » |

  En hébreu, « בטל הסתרת הכל » (« annule le masquage de tout ») est plus naturel que « בטל הסתרה של הכל ». « בטל הסתרה » est le mot habituel pour Unhide, par exemple dans Excel en hébreu. Les mêmes textes vont partout : menu Affichage, menu du clic droit et bulle de l'œil.
- **B :** tes textes exactement, avec « בטל הסתרה של הכל ».

Seuls les textes changent. Les noms des clés restent (`view.showAll`, `contextMenu.show`), donc le nombre de clés ne change pas pour ce point.

---

## 5. Contrôles manuels

**Q35. Quels contrôles dans le prochain LOT106.md :**
- **A (Recommandé) :** les nouveaux contrôles, et ceux de la version 2 dont le résultat change (par exemple le contrôle 4 : masquer ne désélectionne plus). Tous sont écrits dans la nouvelle forme : où cliquer, quoi taper, ce que tu dois voir, à quoi ressemble un échec.
- **B :** tous les contrôles du lot 106 (1 à 16 et les nouveaux), réécrits dans la nouvelle forme.

---

## Ce qui change avec les réponses A

- La sélection garde un objet masqué ; H masque et réaffiche.
- Le clic dans le vide du panneau Objets désélectionne tout.
- L'import pose chaque nouvel objet à une place libre, avec le calcul de Ranger et 10 mm d'écart. Les objets déjà sur le plateau ne bougent pas.
- Une nouvelle clé `optimization.hidden` (503 clés). Les textes « Unhide » changent.
- Tests unitaires et e2e ; GUI_SPEC, IMPORT_EXPORT_SPEC (place des objets importés), CHANGELOG 0.1.106 ; PASSATION avec la décision 114 et la règle des contrôles manuels au §1.
- Aucune suppression de code.
