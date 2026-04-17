# Tableau RevoGrid

Le composant [`components/grid/DataGrid.vue`](../components/grid/DataGrid.vue) sert de
wrapper autour de `@revolist/vue3-datagrid` pour afficher les données avec un rendu plus riche et plus extensible.

## Comment ça fonctionne

### 1. Les données arrivent dans `DataGrid.vue`

`DataGrid.vue` reçoit principalement :

- `columns: ColumnDef[]`
- `rows: RowData[]`
- `loading: boolean`
- `height: number`
- `enableColumnFilters: boolean`

Le composant garde aussi des props prévues pour l'évolution future :

- `selectable`
- `enableSorting`
- `row-select` en emit

À ce jour, `enableColumnFilters` est la seule option métier qui pilote réellement le
comportement de `VGrid`.

### 2. Les colonnes sont normalisées avant d'être passées à RevoGrid

Chaque colonne est transformée dans `revoColumns` :

- `name` est rempli automatiquement avec `name`, puis `label`, puis `prop`
- les colonnes avec un `variant` reçoivent un `cellTemplate`
- les colonnes sans `variant` laissent RevoGrid rendre la valeur brute

Le `cellTemplate` est créé avec `VGridVueTemplate(GridCellRenderer, { variant })`.

L'idée est simple : RevoGrid gère la grille, et `GridCellRenderer.vue` gère le rendu
spécifique à chaque type de cellule.

### 3. Le rendu des cellules est externalisé

[`components/grid/GridCellRenderer.vue`](../components/grid/GridCellRenderer.vue) contient
toute la logique de présentation métier :

- `price`
- `trend`
- `tags`
- `bool`
- `status`
- `date`
- `progress`
- `email`
- `company`
- `actions`
- etc.

Le composant reçoit la valeur brute de RevoGrid et choisit le bon affichage selon
`variant`.

### 4. Les états loading et vide restent en dehors de la grille

Si `loading === true` ou si `rows.length === 0`, `DataGrid.vue` n'affiche pas RevoGrid.
Il affiche un bloc centré avec le texte traduit :

- `common.loading`
- `common.noData`

Ça évite de monter la grille pour rien et garde une UX simple pour les états extrêmes.

### 5. Les événements de RevoGrid sont relayés

`DataGrid.vue` écoute deux événements natifs de RevoGrid :

- `sortingconfigchanged`
- `filterconfigchanged`

Ils sont transformés en emits Vue plus lisibles :

- `sort-change`
- `filter-change`

Le composant parent peut donc réagir au tri ou aux filtres sans dépendre directement de
l'API interne de RevoGrid.

## Flux de lecture

En pratique, le flux est le suivant :

1. La page fournit `columns` et `rows`
2. `DataGrid.vue` normalise les colonnes
3. RevoGrid reçoit `columns` et `source`
4. Pour une colonne avec `variant`, RevoGrid appelle `GridCellRenderer`
5. Les événements de tri et de filtre remontent au parent

## Points forts

- Très bon support des gros volumes de données
- Rendu des cellules centralisé et réutilisable
- Intégration propre avec Vue via `VGridVueTemplate`
- Tri et filtres exposés via des emits clairs
- Composant plus scalable qu'une table HTML manuelle

## Limites actuelles

- Le comportement n'est pas entièrement exploité :
  - `enableSorting` existe dans les props, mais n'est pas encore branché dans `VGrid`
  - `selectable` existe aussi, mais la sélection de lignes n'est pas encore câblée
  - l'emit `row-select` est défini, mais aucun flux ne le déclenche pour l'instant
- RevoGrid est plus puissant qu'une table native, mais aussi plus opaque à tester visuellement
- Le rendu dépend d'un composant tiers, donc certaines personnalisations demandent de
  comprendre son API plutôt que de juste modifier du HTML

## Pourquoi ce choix

Ce composant a été migré vers RevoGrid pour :

- mieux supporter les gros jeux de données
- garder des cellules métier riches
- conserver une API Vue simple pour les pages consommatrices

En contrepartie, on échange une table HTML très lisible contre une abstraction plus
spécialisée.

### RevoGrid vs table d'une lib UI classique

RevoGrid a un vrai intérêt quand la grille devient un sujet à part entière.

#### Ce que RevoGrid apporte

- virtualisation des lignes et meilleures performances sur gros volumes
- cellules custom propres via `cellTemplate`
- tri, filtres, resize, scroll et sélection pensés pour une vraie grille
- meilleure base pour une interface dashboard avec beaucoup de données

#### Ce que RevoGrid coûte

- moins de simplicité qu'une table UI classique
- DOM interne moins lisible
- personnalisation plus orientée API que markup libre
- courbe d'apprentissage plus élevée qu'un composant table standard

#### Règle pratique

- Si tu affiches peu de lignes et que tu veux juste un tableau propre, une table de
  lib UI suffit largement.
- Si tu affiches beaucoup de données, avec rendu riche, tri, filtres et fortes
  contraintes de performance, RevoGrid devient plus intéressant.

#### Dans ce projet

Le choix RevoGrid a du sens parce que :

- le POC manipule de gros volumes de données
- les cellules métier sont riches
- le tri et les filtres doivent rester fluides
- le rendu doit rester performant même quand la grille grossit

Donc ici, RevoGrid n'est pas juste “plus sexy” qu'une table UI.
Il sert un besoin concret de grille performante et spécialisée.

## Fichiers utiles

- [`components/grid/DataGrid.vue`](../components/grid/DataGrid.vue)
- [`components/grid/GridCellRenderer.vue`](../components/grid/GridCellRenderer.vue)
- [`types/grid.ts`](../types/grid.ts)
- [`tests/unit/components/grid/DataGrid.spec.ts`](../tests/unit/components/grid/DataGrid.spec.ts)
