# revo-grid-poc

POC Nuxt 4 + RevoGrid v4 pour valider une grille de données riche, performante et réutilisable dans un contexte OTC Flow.

Le scope principal actuel est volontairement réduit :

- page dossiers
- page utilisateurs
- composants de tableau
- édition inline avec confirmation
- recherche, filtres, pagination, tri date dossier

La page crypto `/demo` existe encore comme laboratoire historique, mais elle n'est pas le centre de l'architecture métier.

## Vue D'ensemble

```
                         ┌──────────────────────────┐
                         │ pages/index.vue          │
                         │ pages/users.vue          │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ domains/*                │
                         │ columns, rows, filters   │
                         │ editors, constants       │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ components/layout        │
                         │ TablePage                │
                         │ Header / Toolbar         │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ components/grid          │
                         │ DataGrid + renderers     │
                         │ pagination + filters UI  │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ @revolist/vue3-datagrid  │
                         │ virtualisation, édition  │
                         │ tri, filtre, scroll      │
                         └──────────────────────────┘
```

## Arborescence Utile

```
revo-grid-poc/
├── pages/
│   ├── index.vue                  # Tableau dossiers
│   ├── users.vue                  # Tableau utilisateurs
│   └── demo.vue                   # Laboratoire crypto hors scope métier principal
│
├── domains/
│   ├── dossiers/
│   │   ├── columns.ts             # Colonnes RevoGrid du domaine dossiers
│   │   ├── constants.ts           # Options de filtres / statuts / risques
│   │   ├── editors.ts             # Editeurs custom du domaine
│   │   ├── mockRows.ts            # Données mock dossiers
│   │   └── useDossiersTable.ts    # Assemblage rows + filtres + tri
│   │
│   └── users/
│       ├── columns.ts
│       ├── constants.ts
│       ├── mockRows.ts
│       └── useUsersTable.ts
│
├── components/
│   ├── layout/
│   │   ├── TablePage.vue          # Layout générique d'une page tableau
│   │   ├── TablePageHeader.vue
│   │   └── TablePageToolbar.vue
│   │
│   ├── grid/
│   │   ├── DataGrid.vue           # Wrapper Vue autour de RevoGrid
│   │   ├── GridCellRenderer.vue   # Route vers les composants de cellule
│   │   ├── Grid*Cell.vue          # Cellules spécialisées
│   │   ├── GridPagination.vue
│   │   ├── MultiSelect.vue
│   │   └── ClearFiltersButton.vue
│   │
│   ├── ui/
│   │   ├── ConfirmModal.vue
│   │   ├── AppToast.vue
│   │   └── GridTooltip.vue
│   │
│   └── navigation/
│       └── NavBar.vue
│
├── composables/
│   ├── app/                       # Etat global UI simple
│   │   ├── useConfirmModal.ts
│   │   ├── useSidebar.ts
│   │   ├── useTheme.ts
│   │   └── useToast.ts
│   │
│   └── grid/                      # Logique réutilisable des tableaux
│       ├── useGridPendingEdits.ts
│       ├── useRevoGridColumns.ts
│       ├── useTableFilters.ts
│       ├── useTablePageRows.ts
│       └── useTablePageEditing.ts
│
├── utils/grid/
│   ├── cellFormatters.ts          # Formatage pur
│   ├── cellStyles.ts              # Classes CSS métier
│   ├── inlineEditors.ts           # Factories d'éditeurs RevoGrid
│   ├── editorHelpers.ts           # Helpers clavier/focus/styles éditeurs
│   └── editCommitIntent.ts        # Intention Enter pour ouvrir la confirmation
│
├── types/grid.ts                  # Contrat partagé colonnes, rows, edits
└── docs/table.md                  # Doc détaillée du tableau
```

## Qui Fait Quoi

### `domains/*`

Un domaine décrit ses données et son usage du tableau.

Il contient :

- les colonnes affichées
- les constantes métier des filtres
- les mocks
- les éditeurs si le domaine est éditable
- le composable qui assemble rows, filtres et options exposées à la page

La page ne fabrique donc pas les données elle-même. Elle consomme un composable de domaine.

### `TablePage.vue`

`TablePage` est le layout commun des pages tableau.

Il gère :

- header
- barre de recherche
- slot de filtres
- bouton de validation des edits pending
- pagination
- montage de `DataGrid`
- modale de confirmation
- toast de succès

Il ne connaît pas le métier dossiers ou utilisateurs.

### `DataGrid.vue`

`DataGrid` est l'adaptateur entre notre API Vue et RevoGrid.

Il gère :

- transformation des `ColumnDef` en colonnes RevoGrid
- injection des renderers Vue dans les cellules
- source isolée pour éviter les mutations directes sur les rows parent
- cycle d'édition pending
- relais des événements RevoGrid vers des emits Vue lisibles

### `GridCellRenderer.vue`

`GridCellRenderer` choisit le bon rendu selon `variant`.

Les cellules spécialisées sont sorties dans des composants dédiés :

- `GridEmailCell`
- `GridCompanyCell`
- `GridProgressCell`
- `GridTagsCell`
- `GridBoolCell`
- `GridTrendCell`
- `GridReferenceCell`
- `GridTagBadge`

L'objectif est que le renderer orchestre, sans redevenir un gros fichier qui contient tous les styles.

### `utils/grid`

Ce dossier contient les fonctions sans état Vue fort :

- formatage de valeurs
- mapping couleur/style
- factories d'éditeurs
- helpers clavier/focus
- intention de commit Enter

Si ce n'est pas un composant et que ce n'est pas un état réactif partagé, c'est souvent ici.

## Flux D'Une Page Tableau

```
┌──────────────┐
│ page Vue     │
│ index/users  │
└──────┬───────┘
       │ appelle useDossiersTable/useUsersTable
       ▼
┌──────────────┐
│ domain       │
│ rows/filters │
│ columns      │
└──────┬───────┘
       │ passe columns + rows + filtres UI
       ▼
┌──────────────┐
│ TablePage    │
│ search       │
│ pagination   │
│ validation   │
└──────┬───────┘
       │ passe pagedRows + columns
       ▼
┌──────────────┐
│ DataGrid     │
│ Revo wrapper │
└──────┬───────┘
       │ passe source + revoColumns
       ▼
┌──────────────┐
│ RevoGrid     │
│ grille réelle│
└──────────────┘
```

## Flux D'Edition

```
Utilisateur édite une cellule
          │
          ▼
RevoGrid ouvre un éditeur custom
          │
          ▼
Enter / Tab / blur / select change
          │
          ▼
afteredit RevoGrid
          │
          ▼
useGridPendingEdits stocke l'edit pending
          │
          ├── Enter              → confirmation immédiate
          ├── clic hors tableau  → confirmation
          ├── bouton Valider     → confirmation
          └── changement de ligne→ confirmation ligne précédente
          │
          ▼
ConfirmModal
          │
          ├── accepté → emit cell-edit → TablePage applique la valeur + toast
          └── refusé  → reset depuis rows parent + remount RevoGrid
```

Ce fonctionnement évite que RevoGrid mute définitivement les données parent avant confirmation.

## RevoGrid En Bref

RevoGrid apporte surtout :

- virtualisation performante
- rendu cellule custom via templates Vue
- édition inline
- tri et filtres natifs
- comportement de vraie grille plutôt que simple table HTML

Dans ce projet, on l'encapsule volontairement derrière `DataGrid.vue` pour éviter que toute l'application dépende directement de son API.

Le contrat côté app reste simple :

```ts
columns: ColumnDef[]
rows: RowData[]
editable?: boolean
editors?: Record<string, EditorCtr>
```

## Tests Unitaires

La commande principale couvre les composants grid :

```bash
npm test
```

Elle lance `vitest run --coverage tests/unit/components/grid`.

Objectif actuel sur les fichiers testés :

- 100% statements
- 100% branches
- 100% functions
- 100% lines

Les specs importantes :

- `DataGrid.spec.ts` : wrapper RevoGrid, colonnes, source isolée, pending edits
- `GridEditors.spec.ts` : éditeurs inline, Enter, Tab, Escape, blur, select
- `GridCellRenderer.spec.ts` : variantes de cellules
- `GridPagination.spec.ts` : pagination et page size
- `MultiSelect.spec.ts` : filtres
- `GridToolbar.spec.ts` : toolbar et reset filters
- `GridHeaderRenderer.spec.ts` : rendu header

Les tests ne remplacent pas la vérification manuelle du comportement RevoGrid, surtout pour l'édition clavier.

## Commandes

Installer :

```bash
npm install
```

Développement :

```bash
npm run dev
```

Tests grid + coverage :

```bash
npm run test
```

Build :

```bash
npm run build
```

## Doc Complémentaire

Voir [docs/table.md](docs/table.md) pour le détail du fonctionnement du tableau, des composants RevoGrid, du cycle d'édition et des tests.
