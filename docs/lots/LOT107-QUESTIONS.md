# Lot 107 : phase 12 (estimation du coût), inventaire et questions

Date : 2026-11-20. Analyse faite sur `main` au commit c00a2ce (lot 106 version 3, vérifié identique : 54 fichiers, aucune différence). Aucun code de la phase 12 n'est écrit avant tes réponses.

Ce document pose **toutes les questions de la phase 12 en une fois** (Q1 à Q16), comme tu l'as demandé. Pour chacune, je donne une option « Recommandé ». Elles touchent un choix visible, le format des données, une contradiction entre documents ou une suppression de code : je n'en applique aucune sans ton accord. Pour répondre, écris par exemple « tout A » ou « tout A sauf Q6 : B ».

**En une phrase :** SlicyWeb ne découpe pas le modèle en couches comme un slicer ; la phase 12 donne donc une **estimation** calculée à partir de la forme de l'objet et des réglages recommandés (épaisseur de couche, parois, remplissage, vitesses). Elle ne sera jamais aussi exacte que celle du slicer ; je propose de mesurer l'écart sur tes modèles, avec ton slicer, et d'ajuster avant de clore la phase.

---

## 1. Ce que demande la documentation

| Document | Ce qu'il dit de la phase 12 |
|---|---|
| PHASES_IMPLEMENTATION_PLAN.md, phase 12 « Cost Estimation » | Objectif « Estimate printing resources ». À créer : Filament Usage, Material Weight, Material Cost, Electricity Cost, Print Duration. Validation : « Values Consistent ». Rien d'autre (aucune formule, aucun écran). |
| ROADMAP.md, phase 10 fonctionnelle | Filament, poids, durée, coût matière, coût électricité, coût total. Validation : « Calculations consistent », « Values reproducible ». |
| PROJECT_SPEC.md §12 et §13 | Estimer longueur et poids du filament, coût matière, coût électricité, durée. Avertissement « Excessive Print Time » (§13), sans seuil. |
| DATA_SCHEMA.md 3.14.0 (priorité 0) | **Cost Estimation Schema** `{filamentLength, filamentWeight, materialCost, electricityCost, totalCost}` et **Print Estimation Schema** `{printTime, layerCount}` : sans règle, sans place dans le projet. Unités globales : longueur en mm, poids en g, temps en secondes, « Cost: local currency ». Filament Schema : `pricePerKg` est `null` pour un filament livré (il dépend du pays et du vendeur) ; « sa devise est celle des préférences de l'utilisateur ». |
| DATA_SCHEMA.md, User Preferences Schema | **Aucune devise**, aucun prix de l'électricité, aucune puissance d'imprimante. |
| DATA_SCHEMA.md, Printer Schema | **Aucune puissance électrique.** |
| PRINTER_PROFILE_SPEC.md | Un bloc `power {voltage, averageConsumption}` « pour l'électricité », absent du DATA_SCHEMA. |
| MATERIAL_PROFILE_SPEC.md, FILAMENT_SETTINGS_SPEC.md | Un bloc `cost {pricePerKg}` ; « Currency: Determined by user preferences ». Dans le DATA_SCHEMA, `pricePerKg` est directement dans le filament, et le matériau n'a pas de prix. |
| API_SPEC.md, Cost API | `POST /api/cost/estimate` → `{materialCost, energyCost, totalCost, printTime}`. Aucune API HTTP n'existe dans l'application (comme KI-007 et KI-030), et le nom `energyCost` contredit `electricityCost` du DATA_SCHEMA. |
| DOMAIN_BOUNDARIES.md, DOMAINS_DEPENDENCY_MATRIX.md | Cost Estimation : coût matière, énergie, total ; ne modifie pas les profils, ne gère pas le stockage ; peut dépendre de Profiles, Recommendation, Analysis. Aucun cycle. |
| TEST_PLAN.md | « Cost Engine Unit Tests » : Time, Material, Weight Estimation, Cost Calculation. Rien d'autre. |
| GUI_SPEC.md | **Aucun écran, aucun texte** pour l'estimation. Édition > Préférences existe dans le menu (grisé), sans fenêtre décrite. |
| ERROR_CODES_SPEC.md 2.6.0 | Aucun code pour l'estimation. |
| PHASES_IMPLEMENTATION_PLAN.md, phase 15 | L'optimisation du temps et du matériau (déplacée de la phase 11, ADR-036 D1) attend l'estimation de la phase 12. |

**Trous de la documentation :**
- aucune méthode pour la durée ni pour la quantité de filament (seulement les noms des valeurs) ;
- aucune largeur de ligne d'extrusion nulle part (il en faut une pour passer d'un volume à une durée) ;
- aucune devise, aucun prix de l'électricité, aucune puissance d'imprimante dans le DATA_SCHEMA ;
- les filaments livrés n'ont pas de prix, et un filament livré ne se modifie pas : aujourd'hui, on ne peut donc avoir un coût qu'avec un filament créé par toi ;
- aucun écran, aucun texte, aucun moment de calcul décrit ;
- les supports, la bordure (brim) et la jupe (skirt) ne sont pas mentionnés.

---

## 2. Inventaire du code

| Élément | État | Remarque |
|---|---|---|
| `src/cost_engine/TimeEstimator.ts` | Modèle de la phase 0, **jamais appelé** | Ne calcule rien : il reçoit une durée et la convertit d'heures en minutes. |
| `src/cost_engine/MaterialEstimator.ts` | Jamais appelé | Reçoit longueur et poids déjà calculés ; coût = poids × `pricePerKg`, `null` quand le prix manque (déjà juste). |
| `src/cost_engine/EnergyEstimator.ts` | Jamais appelé | Énergie = puissance (W) ÷ 1000 × heures ; coût = énergie × prix du kWh. Formule juste, mais la puissance et le prix n'existent nulle part. |
| `src/cost_engine/CostCalculator.ts` | Jamais appelé | Total = matière + électricité ; deux méthodes de pourcentage (`getMaterialCostRatio`, `getElectricityCostRatio`) et `calculateTotalCost`, jamais utilisées. Ses types n'acceptent pas `null`. |
| `src/types/CostEstimation.ts` | Jamais utilisé | `CostEstimation` (5 nombres) et `PrintEstimation` (`printTime`, `layerCount`), conformes au DATA_SCHEMA mais sans `null`. Aucun schéma Zod. |
| Analyse (phase 9) | Utilisée | Donne déjà le **volume** (mm³), la **surface** (mm²), la hauteur et les angles des faces de chaque objet, dans sa position actuelle (rotation et échelle comprises). |
| Recommandation (phase 10) | Utilisée | Donne par objet : épaisseur de couche, nombre de parois, couches du dessus et du dessous, remplissage (%), vitesses (parois extérieures, intérieures, remplissage, déplacement), temps minimal par couche (5 s), supports, adhérence. Il faut une imprimante et un matériau ; le filament est facultatif. |
| Imprimantes | 79 profils | Diamètre de buse par défaut connu ; aucune puissance électrique. |
| Filaments | 11 livrés + ceux de l'utilisateur | Diamètre et densité connus pour les 11 livrés ; prix `null`. Le prix au kg se saisit seulement pour tes filaments (fenêtre Filaments), sans devise affichée. |
| Matériaux (familles) | 5 | Densité connue pour ABS, ASA, TPU ; `null` pour PLA et PETG (les filaments de la famille ne donnent pas la même). |
| Préférences | `settings.json` | Thème, langue, unités, imprimante, matériau. Pas de fenêtre Préférences (Édition > Préférences grisé). |
| Traductions | — | Aucune clé pour l'estimation. |

**En résumé :** les 4 fichiers de `src/cost_engine/` ne sont jamais appelés et ne savent pas estimer une durée ni une quantité de filament : ils font seulement les dernières multiplications. Par contre, l'analyse et la recommandation donnent déjà tout ce qu'il faut pour une estimation honnête. Ce qui manque vraiment : la devise, le prix de l'électricité, la puissance de l'imprimante, et un prix pour les filaments livrés.

---

## 3. Questions

### Q1. Périmètre de la phase 12 *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Pour chaque objet qui a une recommandation à jour : **durée**, **nombre de couches**, **longueur de filament**, **poids**, **coût du filament**, **coût de l'électricité**, **coût total** ; et le total du plateau. Hors phase 12 : les supports, la bordure et la jupe (Q5), l'avertissement « durée excessive » (Q15), l'optimisation du temps et du matériau (déjà en phase 15). |
| B | Comme A, sans le coût de l'électricité (durée, filament, coût du filament seulement). Moins de réglages à saisir (Q8, Q9 inutiles). |

### Q2. Calcul de la quantité de filament *(réglages d'impression, choix visible)*

Un slicer remplit l'objet de lignes ; SlicyWeb, sans découper, estime le volume de plastique ainsi :

| Partie | Calcul proposé |
|---|---|
| Largeur de ligne `w` | diamètre de la buse × 1,1 (0,44 mm pour une buse de 0,4 ; OrcaSlicer met 0,42, PrusaSlicer 0,45). **Aucune valeur dans la documentation** : à valider. |
| Parois | surface des faces « de côté » × (nombre de parois × `w`) |
| Dessus et dessous pleins | surface des faces tournées vers le haut × (couches du dessus × épaisseur de couche) ; idem vers le bas avec les couches du dessous. Une face est « vers le haut » ou « vers le bas » quand elle est inclinée de moins de 45° par rapport à l'horizontale. |
| Coque | parois + dessus + dessous, au plus le volume de l'objet (un petit objet est entièrement plein) |
| Remplissage | (volume de l'objet − coque) × remplissage % |
| Longueur | volume de plastique ÷ section du filament (π × (diamètre ÷ 2)²) |
| Poids | volume de plastique (cm³) × densité du filament (g/cm³) |

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Le tableau ci-dessus, écrit dans DATA_SCHEMA 3.15.0 (règles du Cost Estimation Schema) et un ADR-037. Le calcul des surfaces se fait dans un Web Worker à partir du maillage (moins de 0,5 s pour 1 million de triangles, à mesurer), une fois par rotation ou échelle ; changer de preset ou de filament ne refait que les multiplications. |
| B | Comme A, mais en coupant vraiment l'objet couche par couche (surface et contour de chaque couche). Plus précis pour les objets aux formes compliquées, environ deux fois plus de code et plus lent. |
| C | Tu changes la largeur de ligne ou l'angle de 45° (dis lesquels). |

### Q3. Calcul de la durée *(réglages d'impression, choix visible)*

| Étape | Calcul proposé |
|---|---|
| Longueur de chaque type de ligne | volume de cette partie ÷ (`w` × épaisseur de couche) |
| Temps des lignes | paroi extérieure à la vitesse « paroi extérieure », parois intérieures à la vitesse « paroi intérieure », dessus, dessous et remplissage à la vitesse « remplissage » (vitesses de la recommandation, déjà limitées par l'imprimante) |
| Temps minimal par couche | si une couche moyenne dure moins que le temps minimal de la recommandation (5 s), elle compte pour ce temps minimal |
| Nombre de couches | hauteur ÷ épaisseur de couche, arrondi au-dessus |
| Facteur de vitesse réelle | une imprimante n'atteint presque jamais sa vitesse réglée (accélérations, virages, déplacements) : la durée est multipliée par un **facteur unique**, d'abord 1,5, puis réglé à la clôture d'après tes comparaisons avec ton slicer (Q4) |

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Le tableau ci-dessus. Le facteur 1,5 est une **hypothèse** (aucune source dans la documentation), écrite comme telle, et ajustée avec ton accord à la clôture. |
| B | Comme A, mais avec le calcul des accélérations de l'imprimante (accélération maximale du profil, connue pour une partie des imprimantes seulement) : plus juste sur le papier, mais il faut une longueur moyenne des lignes que SlicyWeb ne connaît pas sans découper. |
| C | Pas de durée en phase 12 : seulement filament, poids et coût du filament (l'électricité disparaît aussi, puisqu'elle dépend de la durée). |

### Q4. Précision visée et vérification *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Cible : écart d'au plus **15 %** sur le poids et **30 %** sur la durée par rapport à ton slicer (OrcaSlicer ou Bambu Studio), avec les mêmes réglages. Vérifié dans les contrôles manuels de l'envoi : sur 3 de tes modèles, tu tapes dans ton slicer les réglages montrés par SlicyWeb (onglet Réglages), et tu me donnes la durée et les grammes du slicer. Si l'écart dépasse la cible, je te propose un nouveau facteur (Q3) ou une nouvelle largeur de ligne (Q2) avant la clôture. L'estimation est toujours montrée avec « ≈ » devant. |
| B | Comme A, mais tu me donnes ces 3 mesures **maintenant**, avec tes réponses : j'ajuste le facteur avant l'envoi. Plus de travail pour toi tout de suite, moins de risque d'une correction après. |
| C | Aucune cible chiffrée : l'estimation reste indicative. |

### Q5. Supports, bordure, jupe *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | **Non comptés** : la documentation ne définit aucun volume de supports (ADR-036 D3 : les surplombs sont mesurés en surface) ni de largeur de bordure. Quand la recommandation active les supports ou une bordure, une ligne le dit sous l'estimation : « Supports non comptés » ou « Bordure non comptée ». |
| B | Estimés grossièrement : supports = surface en surplomb × hauteur moyenne au-dessus du plateau × 15 % ; bordure = contour de la zone de contact × 5 mm × une couche. Ces chiffres sont inventés (aucune source), donc à valider un par un. |

### Q6. Sans filament choisi *(choix visible)*

La recommandation n'a besoin que d'une imprimante et d'un matériau. Sans filament, il manque le diamètre et souvent la densité (PLA, PETG).

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Sans filament : la durée, les couches et le coût de l'électricité sont montrés ; la longueur, le poids et le coût du filament montrent « — » avec « Choisis un filament pour le poids et le coût ». |
| B | Sans filament : diamètre 1,75 mm et densité de la famille quand elle est publiée (ABS, ASA, TPU), sinon « — ». |

### Q7. Devise *(format des données, choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Une liste : euro (EUR), dollar américain (USD), shekel (ILS), livre sterling (GBP), franc suisse (CHF), dollar canadien (CAD), dollar australien (AUD), yen (JPY). Au premier démarrage : EUR en français, ILS en hébreu, USD en anglais ; ensuite seulement ton choix compte (changer de langue ne change pas la devise). Les prix déjà saisis **ne sont pas convertis** quand tu changes de devise (une ligne le dit). Nouveau champ `cost.currency` dans le User Preferences Schema (DATA_SCHEMA 3.15.0, USER_SETTINGS_SPEC 2.3.0). La devise s'affiche aussi à côté du prix au kg des filaments. |
| B | Pas de devise par défaut : aucun coût n'est montré tant que tu n'en as pas choisi une. |
| C | Pas de devise : les montants sont des nombres sans symbole. |

### Q8. Prix de l'électricité *(format des données, choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Un prix du kWh dans ta devise (`cost.electricityPrice`, vide au départ). Vide : le coût de l'électricité montre « — » et le total compte seulement le filament, avec « électricité non comptée » (voir Q10). |
| B | Comme A, avec une valeur par défaut selon la devise (par exemple 0,25 €/kWh). Je n'ai pas de source officielle stable à citer pour ces valeurs. |

### Q9. Puissance de l'imprimante *(format des données, choix visible)*

Aucun profil d'imprimante n'a de puissance, et les fabricants publient rarement une consommation **moyenne** (souvent seulement la puissance maximale de l'alimentation, bien plus haute).

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Tu saisis la puissance moyenne (en W) de **chaque imprimante** que tu utilises ; elle est gardée dans les préférences, par imprimante (`cost.printerPower`, une valeur par id d'imprimante). Vide : pas de coût d'électricité pour cette imprimante. Aucun changement des profils d'imprimantes. |
| B | Nouveau champ `averagePower` dans le Printer Schema (null pour les 79 profils livrés, à remplir plus tard dans `slicyweb-profiles` quand un fabricant le publie clairement), modifiable seulement pour tes imprimantes. Les imprimantes livrées n'auraient donc pas de coût d'électricité tant qu'aucun profil n'est mis à jour. |
| C | Une seule puissance pour toutes les imprimantes, dans les préférences. |

### Q10. Prix des filaments livrés et coût total *(format des données, choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Tu peux donner un prix au kg à **n'importe quel filament**, livré ou à toi. Pour un filament à toi, c'est son champ `pricePerKg` actuel ; pour un filament livré (qui ne se modifie pas), le prix est gardé dans les préférences (`cost.filamentPrices`, une valeur par id de filament). **Total** = filament + électricité ; quand l'un des deux manque, le total compte l'autre et le dit (« électricité non comptée » ou « filament non compté ») ; quand les deux manquent, le total montre « — ». |
| B | Pas de prix pour les filaments livrés : pour un coût, tu crées ton propre filament (fenêtre Filaments). Total montré seulement quand les deux coûts sont connus. |

### Q11. Où saisir la devise, le prix du kWh, la puissance et le prix au kg *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Une nouvelle section **« Coûts »** dans l'onglet Imprimante, sous Filament : Devise (liste), Prix de l'électricité (par kWh), Puissance moyenne de l'imprimante choisie (W), Prix au kg du filament choisi. Chaque champ s'enregistre dès que tu quittes le champ. Comme la case « Vérifier les mises à jour des profils », ces réglages iront dans la fenêtre Préférences quand elle existera. |
| B | Créer la fenêtre **Préférences** maintenant (Édition > Préférences), avec une partie « Coûts » (devise, prix du kWh, puissance de chaque imprimante) ; le prix au kg reste dans la fenêtre Filaments. Plus de code d'interface ; le réglage « Écart entre les objets » que tu as demandé pour plus tard viendrait ensuite dans cette fenêtre, dans un autre envoi (un sujet à la fois). |

### Q12. Où voir l'estimation *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Une nouvelle section **« Estimation »** dans l'onglet Réglages, sous Recommandation, pour l'objet sélectionné (la somme quand plusieurs objets sont sélectionnés) : Durée ≈ 2 h 35 min ; Couches 512 ; Filament ≈ 12,40 m · 37 g ; Coût du filament ≈ 0,93 € ; Électricité ≈ 0,08 € ; Total ≈ 1,01 € ; puis les lignes « non compté ». Et dans la barre d'état, à droite : « Plateau ≈ 5 h 10 min · 74 g · 2,02 € » (tous les objets visibles ; les objets masqués ne comptent pas, comme à l'export). |
| B | Comme A, mais la section est dans l'onglet Objet, sous Analyse. |
| C | Comme A, sans le total du plateau dans la barre d'état. |

Format proposé : durée en heures et minutes (« < 1 min » sous une minute), longueur en mètres avec 2 décimales, poids en grammes entiers (une décimale sous 10 g), montants avec 2 décimales (0 pour le yen) et le symbole de la devise, selon la langue (« 1,01 € » en français, « €1.01 » en anglais, en hébreu comme en anglais, de gauche à droite, comme les autres valeurs avec unité depuis le lot 89).

### Q13. Quand l'estimation est calculée *(choix visible)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | **Toute seule**, dès que la recommandation de l'objet est à jour (comme la recommandation après l'analyse) ; refaite dès qu'un réglage de la section Coûts change. Quand la recommandation devient périmée (rotation, échelle, autre imprimante, autre matériau), l'estimation montre « — » jusqu'à la nouvelle. Le total du plateau dit « incomplet » quand un objet visible n'a pas encore d'estimation (« Plateau ≈ … (2 objets sans estimation) »). Aucun nouveau menu, aucun bouton. |
| B | Seulement à la demande : un élément Outils > Estimer le coût. |

### Q14. Ce qui est enregistré *(format des données)*

| Option | Contenu |
|---|---|
| **A (Recommandé)** | **L'estimation n'est pas enregistrée** : elle se recalcule à partir de l'analyse et de la recommandation (comme le résultat de l'optimisation, ADR-036 D5). DATA_SCHEMA 3.15.0 ajoute seulement les règles du Cost Estimation Schema et du Print Estimation Schema (unités, arrondis, `null` quand une valeur manque, total) et le bloc `cost` du User Preferences Schema (Q7 à Q10). Un `settings.json` sans `cost` se lit sans erreur. Aucun changement du format WYPROJ (3.0.0), aucun nouveau canal IPC (29). |
| B | L'estimation est aussi gardée dans le projet (phase 13) : nouveau champ du Project Schema et nouvelle version du format WYPROJ. |

### Q15. Avertissement « durée excessive » *(choix visible)*

PROJECT_SPEC §13 cite « Excessive Print Time », sans seuil.

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Pas d'avertissement en phase 12 : aucun seuil n'est défini, je ne l'invente pas. Noté comme manque de la documentation. |
| B | Un avertissement non bloquant au-dessus de 24 h estimées (seuil à valider). |

### Q16. Code existant, suppressions et documents en désaccord *(suppression de code, contradiction)*

| Élément | Proposition |
|---|---|
| `TimeEstimator.ts`, `MaterialEstimator.ts`, `EnergyEstimator.ts`, `CostCalculator.ts` | **Réécrits sous le même nom** (calculs de Q2, Q3, Q8 à Q10, avec `null` quand une valeur manque). |
| `getMaterialCostRatio`, `getElectricityCostRatio`, `calculateTotalCost` de `CostCalculator.ts` | **Supprimées** (jamais utilisées, aucun pourcentage demandé). |
| `CostEstimation.ts` | Gardé ; `materialCost`, `electricityCost`, `totalCost` et les valeurs du filament acceptent `null` ; schéma Zod strict ajouté. |
| API_SPEC.md, Cost API (`energyCost`) | Le DATA_SCHEMA (priorité 0) l'emporte : `electricityCost`. Nouveau Known Issue KI-031, comme KI-030 : aucune API HTTP n'existe. |
| PRINTER_PROFILE_SPEC.md (`power`), MATERIAL_PROFILE_SPEC.md et FILAMENT_SETTINGS_SPEC.md (`cost.pricePerKg`) | Une note dans chaque document : ces blocs ne sont pas dans le DATA_SCHEMA ; la puissance et les prix viennent des préférences (Q9, Q10) et du champ `pricePerKg` du filament. |

| Option | Contenu |
|---|---|
| **A (Recommandé)** | Le tableau ci-dessus ; chaque suppression rappelée dans le `LOTN.md` de l'envoi. |
| B | Rien n'est supprimé : les 3 méthodes restent, jamais appelées. |

---

## 4. Envoi proposé

Selon ta règle du 2026-11-18 (un sujet = toutes les questions, puis un seul envoi) :

| Lot | Contenu | Contrôles manuels |
|---|---|---|
| 108 | Toute la phase 12 en un envoi : documentation (ADR-037, DATA_SCHEMA 3.15.0, USER_SETTINGS_SPEC 2.3.0, GUI_SPEC, PERFORMANCE_SPEC, TEST_PLAN, notes de Q16, plan technique), calcul (Web Worker des surfaces, `src/cost_engine/` réécrit, tests sur des modèles construits : cube plein, cube creux, tour, vase), interface (section Coûts, section Estimation, barre d'état, textes dans les 3 langues, tests e2e) | Oui, une seule série, avec la comparaison avec ton slicer (Q4) |
| 109 | Clôture : facteur de vitesse et largeur de ligne ajustés si besoin (avec ton accord), phase 12 Completed | Seulement si un réglage change |

---

## 5. Ce qui reste hors de la phase 12 (avec l'option A partout)

- Supports, bordure et jupe dans l'estimation (Q5) ; avertissement de durée (Q15).
- Optimisation du temps et du matériau : phase 15 (ADR-036 D1).
- Estimation exacte : seulement dans le slicer, après l'export (phase 14).
- Cost API HTTP : aucune API HTTP (KI-031 proposé).
- Fenêtre Préférences et réglage « Écart entre les objets » (ta demande du 2026-11-19) : un autre sujet, plus tard.
