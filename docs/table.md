# Tableau RevoGrid

Cette documentation décrit l'architecture du tableau utilisé par les pages dossiers et utilisateurs.

Le but du POC n'est pas seulement d'afficher une grille : il sert à valider une base propre pour des tableaux métier avec beaucoup de lignes, des cellules riches, des filtres, de la pagination et de l'édition inline confirmée.

## Vue Rapide

```
pages/
  index.vue ────────┐
  users.vue ────────┤
                    ▼
domains/
  dossiers/      useDossiersTable()
  users/         useUsersTable()
                    │
                    ▼
components/layout/
  TablePage.vue
                    │
                    ▼
components/grid/
  DataGrid.vue
                    │
                    ▼
@revolist/vue3-datagrid
```

Le principe : chaque couche a une responsabilité unique.

- `pages` choisit le domaine et pose les filtres dans le slot.
- `domains` prépare les colonnes, les rows, les options et les filtres.
- `TablePage` fournit le layout commun et les comportements de page.
- `DataGrid` adapte notre API Vue à RevoGrid.
- `RevoGrid` fait le travail de grille : rendu performant, édition, scroll, events.

## Pourquoi RevoGrid

Une table HTML ou une table de bibliothèque UI suffit quand :

- le volume est faible
- les cellules sont simples
- l'édition n'est pas centrale
- les performances de scroll ne sont pas un sujet

RevoGrid devient utile quand :

- il y a beaucoup de lignes
- les cellules ont des rendus différents
- le scroll doit rester fluide
- les comportements ressemblent plus à Excel/Notion qu'à une table statique
- l'édition inline doit rester rapide

Dans ce POC, RevoGrid est volontairement encapsulé. Le reste de l'app ne manipule pas directement son API.

## Architecture Détaillée

```
┌─────────────────────────────────────────────────────────────────┐
│ Page métier                                                     │
│ pages/index.vue ou pages/users.vue                              │
│ - appelle le composable de domaine                              │
│ - rend TablePage                                                │
│ - fournit les filtres via slot                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Domaine                                                         │
│ domains/dossiers ou domains/users                               │
│ - columns.ts: définition des colonnes                           │
│ - constants.ts: statuts, rôles, options                         │
│ - mockRows.ts: génération de données                            │
│ - editors.ts: éditeurs custom si besoin                         │
│ - use*Table.ts: assemble rows + filters + options               │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layout tableau                                                  │
│ components/layout/TablePage.vue                                 │
│ - recherche                                                     │
│ - pagination                                                    │
│ - toolbar                                                       │
│ - validation des pending edits                                  │
│ - ConfirmModal + AppToast                                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Wrapper grid                                                    │
│ components/grid/DataGrid.vue                                    │
│ - transforme ColumnDef en colonnes RevoGrid                     │
│ - branche les renderers Vue                                     │
│ - isole la source pour éviter les mutations parent              │
│ - gère le cycle pending edit                                    │
│ - relaie sort/filter/edit vers des emits Vue                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ RevoGrid                                                        │
│ @revolist/vue3-datagrid                                         │
│ - virtualisation                                                │
│ - édition inline                                                │
│ - tri/filtres natifs                                            │
│ - scroll et rendu de grille                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Contrat Des Colonnes

Les pages ne passent pas directement des colonnes RevoGrid brutes. Elles passent des `ColumnDef`.

```ts
export interface ColumnDef {
  prop: string
  name?: string
  type?: 'string' | 'number' | 'date'
  size?: number
  editable?: boolean
  variant?: GridColumnVariant
  centered?: boolean
  headerAlign?: 'start' | 'center'
  colPriority?: 1 | 2 | 3 | 4
}
```

`useRevoGridColumns` transforme ensuite ces colonnes :

```
ColumnDef[]
    │
    ▼
useRevoGridColumns()
    │
    ├── ajoute cellTemplate si variant
    ├── ajoute columnTemplate si header custom
    ├── branche editor si la colonne est éditable
    ├── applique readonly selon editable
    └── filtre selon colPriority et largeur
    │
    ▼
Colonnes RevoGrid
```

## Rendu Des Cellules

Les cellules sont pilotées par `variant`.

```
RevoGrid cellTemplate
       │
       ▼
GridCellRenderer.vue
       │
       ├── email          → GridEmailCell.vue
       ├── company        → GridCompanyCell.vue
       ├── progress       → GridProgressCell.vue
       ├── tags           → GridTagsCell.vue
       ├── bool           → GridBoolCell.vue
       ├── trend          → GridTrendCell.vue
       ├── reference      → GridReferenceCell.vue
       ├── dossier-status → GridTagBadge.vue
       ├── risk           → GridTagBadge.vue
       ├── user-role      → GridTagBadge.vue
       ├── user-status    → GridTagBadge.vue
       └── default        → GridTooltip.vue
```

Les fonctions pures sont sorties dans `utils/grid` :

- `cellFormatters.ts` formate les valeurs
- `cellStyles.ts` choisit les classes CSS métier
- `GridTooltip.vue` gère l'affichage tronqué + tooltip

Le renderer reste donc un routeur de variantes, pas un fichier qui contient tout le style métier.

## Recherche, Filtres Et Pagination

La page domaine fournit d'abord des rows déjà filtrées par ses filtres métier.

Exemple dossiers :

```
mockRows
  │
  ▼
tri date via useDateSort
  │
  ▼
useTableFilters
  │
  ├── statut
  ├── risque
  ├── fiche
  └── client
  │
  ▼
filteredRows
```

Ensuite `TablePage` applique la recherche texte et la pagination :

```
filteredRows du domaine
       │
       ▼
useTablePageRows
       │
       ├── searchFiltered
       ├── page
       ├── pageSize
       └── pagedRows
       │
       ▼
DataGrid reçoit pagedRows
```

La pagination est volontairement en dehors de RevoGrid. RevoGrid reçoit uniquement les lignes de la page courante.

## Edition Inline

L'édition est la partie la plus sensible.

### Acteurs

- `utils/grid/inlineEditors.ts` crée les éditeurs RevoGrid custom.
- `utils/grid/editorHelpers.ts` gère clavier, focus, styles input/select.
- `utils/grid/editCommitIntent.ts` mémorise qu'un `Enter` vient de valider une cellule.
- `composables/grid/useGridPendingEdits.ts` stocke les edits pending et demande confirmation.
- `composables/grid/useTablePageEditing.ts` applique l'edit confirmé à la ligne affichée.

### Flux

```
Utilisateur entre en édition
        │
        ▼
RevoGrid monte un éditeur custom
        │
        ├── input texte/date/number
        └── select statut
        │
        ▼
L'utilisateur valide ou sort
        │
        ├── Enter  → save + close + markEnterCommit
        ├── Tab    → save + close + focus next
        ├── Escape → close sans save
        ├── blur   → save + close
        └── change select → save + close
        │
        ▼
RevoGrid émet afteredit
        │
        ▼
useGridPendingEdits
        │
        ├── accumule les edits de la ligne
        ├── affiche le bouton Valider
        ├── confirme immédiatement si Enter
        ├── confirme au clic extérieur
        └── confirme avant de passer à une autre ligne
        │
        ▼
ConfirmModal
        │
        ├── OK     → emit cell-edit
        └── Annule → reset gridRows depuis rows parent
```

### Pourquoi Une Source Isolée

RevoGrid peut muter sa source interne avant que la confirmation utilisateur soit terminée.

Pour éviter de muter les données parent trop tôt :

```
props.rows
   │
   ├── jamais donné directement à RevoGrid
   │
   ▼
cloneRows(props.rows)
   │
   ▼
gridRows
   │
   ▼
source RevoGrid
```

Si la modale est refusée, on recrée `gridRows` depuis `props.rows` et on incrémente `gridKey` pour remonter la grille proprement.

## Responsive Colonnes

Chaque colonne peut déclarer `colPriority`.

```
1 = toujours visible
2 = visible à partir de 500px
3 = visible à partir de 750px
4 = visible à partir de 1050px
```

`useContainerWidth` observe la largeur du conteneur, pas seulement `window.innerWidth`. Ça permet de réagir correctement à une sidebar ouverte/fermée ou à un layout qui change.

## Theming Et UI

Les couleurs principales sont pilotées par les variables CSS dans `assets/css/main.css`.

Les composants UI transverses sont dans `components/ui` :

- `ConfirmModal.vue`
- `AppToast.vue`
- `GridTooltip.vue`

Les états globaux simples sont dans `composables/app` :

- `useTheme`
- `useSidebar`
- `useToast`
- `useConfirmModal`

## Tests Unitaires

La commande principale :

```bash
npm test
```

Elle cible `tests/unit/components/grid` avec coverage.

Au moment de cette doc, les fichiers grid testés visent 100% sur :

- statements
- branches
- functions
- lines

### Ce Que Chaque Spec Couvre

```
DataGrid.spec.ts
  ├── états loading / vide
  ├── colonnes RevoGrid générées
  ├── source clonée
  ├── pending edits acceptés/refusés
  └── events sort/filter

GridEditors.spec.ts
  ├── DateSortHeader
  ├── SelectEditor legacy
  ├── text/date/number editors
  ├── Enter / Tab / Escape
  └── blur / change select

GridCellRenderer.spec.ts
  ├── variants métier dossiers/users
  ├── variants crypto conservés pour demo
  ├── tooltips
  ├── tags
  └── reference copy

GridPagination.spec.ts
  ├── page courante
  ├── pageSize
  ├── bornes
  └── emits v-model

MultiSelect.spec.ts
  ├── ouverture/fermeture
  ├── sélection multiple
  ├── reset
  └── listener extérieur

GridToolbar.spec.ts
  ├── recherche
  ├── filtre
  ├── actions clear/refresh
  └── ClearFiltersButton

GridHeaderRenderer.spec.ts
  └── rendu header / alignement / tooltip
```

### Limite Des Tests

Les tests unitaires verrouillent surtout les contrats Vue et les callbacks.

Ils ne remplacent pas une vérification manuelle de RevoGrid dans le navigateur pour :

- navigation clavier réelle
- focus visible
- scroll
- tooltip au survol
- sensation d'édition inline
- alignement visuel des cellules

## Checklist Manuelle Après Refactor Grid

- pages dossiers et utilisateurs chargent correctement
- recherche texte fonctionne
- filtres multi-select fonctionnent
- bouton reset filtres apparaît/disparaît
- pagination et page size restent synchronisés
- cellules email/client/société sont centrées verticalement
- tags et statuts gardent le style attendu
- édition Enter ouvre la modale
- Tab conserve la valeur sans ouvrir directement la modale
- Escape annule l'édition
- refuser la modale reset la cellule
- accepter la modale garde la valeur
- deux edits sur la même ligne sont confirmés ensemble

## Fichiers Clés

- [`components/layout/TablePage.vue`](../components/layout/TablePage.vue)
- [`components/grid/DataGrid.vue`](../components/grid/DataGrid.vue)
- [`components/grid/GridCellRenderer.vue`](../components/grid/GridCellRenderer.vue)
- [`composables/grid/useGridPendingEdits.ts`](../composables/grid/useGridPendingEdits.ts)
- [`composables/grid/useRevoGridColumns.ts`](../composables/grid/useRevoGridColumns.ts)
- [`utils/grid/inlineEditors.ts`](../utils/grid/inlineEditors.ts)
- [`types/grid.ts`](../types/grid.ts)
