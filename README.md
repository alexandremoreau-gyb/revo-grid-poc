# revo-grid-poc

POC Nuxt 4 + RevoGrid v4 — démo crypto grid 50k lignes avec tri, filtres, dark mode et colonnes responsives.

## Architecture RevoGrid

```
revo-grid-poc/
│
├── components/grid/
│   ├── DataGrid.vue          # Wrapper principal RevoGrid.
│   │                         # Gère : colonnes normalisées, renderers custom,
│   │                         # tri, filtres, édition inline, sélection de lignes,
│   │                         # hauteur responsive (height:100% dans flex-1),
│   │                         # et filtrage des colonnes par priorité responsive.
│   │
│   ├── GridCellRenderer.vue  # Renderer Vue injecté dans les cellules via VGridVueTemplate.
│   │                         # Reçoit `variant` en prop et switche sur le bon affichage :
│   │                         # price, trend, progress, tags, bool, symbol, etc.
│   │
│   ├── GridToolbar.vue       # Barre d'outils au-dessus du grid (recherche, filtres UI).
│   │                         # Émet des events vers la page parente, ne touche pas au grid.
│   │
│   └── GridPagination.vue    # Contrôles de pagination découplés du DataGrid.
│                             # Expose v-model:page / v-model:pageSize + emits métier.
│
├── composables/
│   ├── useContainerWidth.ts  # ResizeObserver sur un élément DOM.
│   │                         # Retourne `width` (ref réactive) — utilisé par DataGrid
│   │                         # pour adapter le nombre de colonnes visibles sans
│   │                         # dépendre de window.innerWidth (réagit au collapse sidebar).
│   │
│   ├── useTheme.ts           # Toggle dark/light. useState pour partage global entre
│   │                         # NavBar et DataGrid (:theme="gridTheme" sur RevoGrid).
│   │
│   └── useSidebar.ts         # État collapsed/expanded de la sidebar. useState global.
│
├── types/grid.ts             # Types partagés : ColumnDef (+ colPriority responsive),
│                             # RowData, GridFilterState, GridSortState.
│
└── data/mock/
    └── cryptoData.ts         # Générateur déterministe de 50k lignes crypto + définition
                              # des colonnes avec leur colPriority (1→4).
                              # colPriority détermine à quelle largeur la colonne apparaît :
                              #   1 = toujours | 2 = ≥500px | 3 = ≥750px | 4 = ≥1050px
```

### Responsive colonnes — logique

`DataGrid.vue` observe sa propre largeur via `useContainerWidth` et calcule `visiblePriority` :

| Largeur conteneur | Colonnes visibles | Priorités affichées |
|-------------------|-------------------|---------------------|
| < 500 px          | 4 (rank, symbol, price, 24h%) | 1 |
| 500 – 749 px      | 6 (+ name, market cap)        | 1–2 |
| 750 – 1049 px     | 9 (+ 7d%, volume, score)      | 1–3 |
| ≥ 1050 px         | 16 (toutes)                   | 1–4 |

### Theming RevoGrid

Les variables CSS `--revo-grid-*` sont surchargées globalement dans `assets/css/main.css`
via les sélecteurs `revo-grid[theme="compact"]` et `revo-grid[theme="darkCompact"]`.
Le thème est calculé depuis `useTheme` : `isDark ? 'darkCompact' : 'compact'`.

---



Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
