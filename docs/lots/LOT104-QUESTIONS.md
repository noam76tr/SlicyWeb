# Lot 104 : nettoyage de Viewport et place des messages (questions)

Date : 2026-11-16. Base : `main` 0773338 (lot 101, vérifié identique, 36 fichiers). Hors phase, avant la phase 12 (Cost Estimation).

Une seule question (choix visible). Pas de code avant ta réponse.

---

## Partie 1 : Viewport.tsx utilise ObjectBounds.ts (pas de question)

Aujourd'hui, `src/gui/viewport/Viewport.tsx` garde sa propre copie du calcul de la boîte d'un objet (lot 102), et `src/scene/ObjectBounds.ts` (lot 101) fait le même calcul pour le contrôle du plateau, « Ranger » et Dupliquer.

Ce que je ferai (suppression approuvée par toi) :

- `selectionBounds` (boîte d'un objet ou d'un groupe, pour placer les flèches, les anneaux et les poignées) appelle `objectBounds` d'ObjectBounds.ts pour chaque objet, puis réunit les boîtes, comme avant.
- Retirés de Viewport.tsx : l'interface `RelativeBounds`, la table `relativeBounds`, le calcul de la boîte dans `selectionBounds`, et la fonction `forgetBounds` (remplacée par `keepBoundsOf` d'ObjectBounds.ts, qui fait la même chose). Les imports `GeometryRegistry` et `worldBounds` deviennent inutiles dans Viewport.tsx et sont retirés.
- Rien d'autre n'est supprimé. Les deux parties (vue et contrôle du plateau) partagent ensuite la même table : la boîte d'un objet n'est calculée qu'une fois.
- Aucun changement visible : flèches, anneaux, poignées et couleur orange restent au même endroit (les e2e du lot 102, 103 et 101 le vérifient).

## Partie 2 : les messages ne passent plus sous les boutons

Aujourd'hui, les boutons Déplacer, Pivoter, Échelle et Surplombs sont en haut côté début (à gauche, à droite en hébreu), et les messages (import, hors plateau, analyse, optimisation) en haut côté fin, sur 320 px de large. La fenêtre fait au moins 1280 px : à cette largeur, en français et en hébreu, le message passe sous le bouton Surplombs (captures 1 et 2). C'est pire si tu élargis un panneau latéral.

### Q1 : où mettre les messages quand la place manque ?

- **A (recommandé) : à côté des boutons s'il y a la place, sinon juste en dessous.** Quand la vue est assez large pour les boutons et un message de 320 px, rien ne change (capture 5). Sinon, les messages descendent juste sous la rangée de boutons, toujours côté fin (captures 3 et 4). Le passage se fait tout seul quand la fenêtre ou un panneau change de taille. La place en haut de la vue reste libre le plus souvent.
- **B : toujours sous les boutons.** Les messages commencent toujours sous la rangée de boutons, côté fin, quelle que soit la largeur (capture 6, fenêtre large ; en fenêtre étroite, comme la capture 3). Plus simple à prévoir, mais les messages descendent même quand ils auraient la place en haut.

Dans les deux cas : même ordre (import, hors plateau, analyse, optimisation), même largeur (320 px, moins si la vue est plus étroite), les boutons ne bougent jamais, et un e2e vérifie à 1280 px en français et en hébreu que le rectangle des messages ne touche pas celui des boutons.

### Captures (fenêtre de 1280 px sauf mention, cube déplacé hors du plateau)

1. `capture-1-aujourdhui-fr.png` : aujourd'hui, français, le message passe sous « Surplombs ».
2. `capture-2-aujourdhui-he.png` : aujourd'hui, hébreu, même problème côté gauche.
3. `capture-3-A-etroite-fr.png` : A (et B), français : le message est sous les boutons.
4. `capture-4-A-etroite-he.png` : A (et B), hébreu.
5. `capture-5-A-large-fr.png` : A, fenêtre de 1600 px : le message reste en haut, à côté des boutons (comme aujourd'hui).
6. `capture-6-B-large-fr.png` : B, fenêtre de 1600 px : le message est sous les boutons même s'il y a la place.

Les captures 3 à 6 sont faites en déplaçant les messages à la main dans la page, pas avec le code du lot.

---

## Ce que le lot touchera (prévu)

- `src/gui/viewport/Viewport.tsx` (partie 1).
- `src/gui/import/ImportDropZone.tsx` et `src/gui/App.tsx` : les boutons et les messages dans la même rangée en haut de la vue (partie 2) ; `src/gui/toolbars/TransformModeBar.tsx` : sa place (`absolute start-2 top-2`) passe à cette rangée. Aucun texte nouveau, aucune clé de traduction.
- `GUI_SPEC.md` (place des messages), `CHANGELOG.md` (0.1.104 ; 0.1.101 passe Completed avec tes résultats : 484, 29, 597 + 1, 59 e2e, contrôles 1 à 9), `PASSATION.md` (décisions), un e2e de plus.
- Contrôle manuel prévu : fenêtre à 1280 px en français, déplacer un objet hors du plateau, le message ne touche pas « Surplombs » ; élargir un panneau latéral, même résultat ; Ctrl+D, Ranger, flèches, anneaux et poignées comme avant.
