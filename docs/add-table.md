# Ajouter un tableau — guide rapide

Chaque tableau suit exactement le même pattern. Exemple ci-dessous avec `products` — remplace par ton nom de domaine.

---

## 1. Créer le dossier domaine

```
domains/
└── products/
    ├── constants.ts       ← valeurs possibles (dropdown, statuts…)
    ├── columns.ts         ← définition des colonnes
    ├── mockRows.ts        ← générateur de données fictives
    ├── editors.ts         ← éditeurs inline (si tableau éditable)
    ├── useProductsTable.ts ← composable : filtres + données
    └── data.ts            ← re-exports (barrel)
```

---

## 2. `constants.ts` — valeurs des dropdowns

```typescript
export const PRODUCT_STATUTS = ['Actif', 'Brouillon', 'Archivé'] as const
export const PRODUCT_CATEGORIES = ['Matériel', 'Logiciel', 'Service'] as const
```

---

## 3. `columns.ts` — définition des colonnes

```typescript
import type { ColumnDef } from '~/types/grid'

export const columns: ColumnDef[] = [
  { prop: 'id',       size: 65,  editable: false, variant: 'id',     centered: true, colPriority: 1 },
  { prop: 'nom',      size: 200, editable: true,  variant: 'text',   headerAlign: 'start', colPriority: 1 },
  { prop: 'statut',   size: 130, editable: true,  variant: 'status', editor: 'select-statut', centered: true, colPriority: 1 },
  { prop: 'categorie',size: 150, editable: true,  variant: 'text',   headerAlign: 'start', colPriority: 2 },
  { prop: 'prix',     size: 120, editable: true,  variant: 'currency', type: 'number', centered: true, colPriority: 2 },
]
```

**`colPriority`** : 1 = toujours visible, 4 = masqué sur petits écrans.

**`variant`** disponibles : `id` `text` `date` `currency` `email` `company` `status` `progress` `actions` `bool` `tags` `reference`

---

## 4. `mockRows.ts` — données fictives

```typescript
import type { RowData } from '~/types/grid'
import { PRODUCT_STATUTS, PRODUCT_CATEGORIES } from './constants'

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!
}

export function createRows(count = 100): RowData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    nom: `Produit ${i + 1}`,
    statut: pick(PRODUCT_STATUTS, i),
    categorie: pick(PRODUCT_CATEGORIES, i * 2),
    prix: 50 + (i * 13) % 500,
  }))
}
```

---

## 5. `editors.ts` — éditeurs inline (tableau éditable seulement)

```typescript
import { createTextEditor, createNumberEditor, createStatusEditor } from '~/utils/grid/inlineEditors'
import { PRODUCT_STATUTS } from './constants'

export const editors = {
  'product-text':  createTextEditor(),
  'product-number': createNumberEditor(),
  'select-statut': createStatusEditor([...PRODUCT_STATUTS]),
}
```

> Si ton tableau est **read-only**, saute cette étape et omets `:editors` + `:editable` dans la page.

---

## 6. `useProductsTable.ts` — composable

```typescript
import { ref } from 'vue'
import { columns } from './columns'
import { editors } from './editors'
import { createRows } from './mockRows'
import { useTableFilters } from '~/composables/grid/useTableFilters'
import { PRODUCT_STATUTS, PRODUCT_CATEGORIES } from './constants'

export function useProductsTable() {
  const allRows = ref(createRows(150))

  const { selectedFilters, filteredRows, hasActiveFilters, resetFilters } =
    useTableFilters(allRows, {
      statut:    row => String(row.statut),
      categorie: row => String(row.categorie),
    })

  return {
    columns,
    editors,
    filteredRows,
    hasActiveFilters,
    resetFilters,
    selectedStatuts:    selectedFilters.statut,
    selectedCategories: selectedFilters.categorie,
    statutOptions:    PRODUCT_STATUTS,
    categorieOptions: PRODUCT_CATEGORIES,
  }
}
```

---

## 7. `data.ts` — barrel

```typescript
export { columns }   from './columns'
export { editors }   from './editors'
export { createRows } from './mockRows'
export { PRODUCT_STATUTS, PRODUCT_CATEGORIES } from './constants'
```

---

## 8. `pages/products.vue` — la page

```vue
<script setup lang="ts">
import TablePage from '~/components/layout/TablePage.vue'
import MultiSelect from '~/components/grid/MultiSelect.vue'
import ClearFiltersButton from '~/components/grid/ClearFiltersButton.vue'
import { useProductsTable } from '~/domains/products/useProductsTable'

const {
  columns, editors, filteredRows,
  hasActiveFilters, resetFilters,
  selectedStatuts, selectedCategories,
  statutOptions, categorieOptions,
} = useProductsTable()
</script>

<template>
  <TablePage
    title="Produits"
    unit-label="produits"
    :columns="columns"
    :rows="filteredRows"
    :editable="true"
    :editors="editors"
    :search-fields="['nom', 'categorie']"
    search-placeholder="Nom, catégorie…"
    :default-page-size="50"
  >
    <template #filters>
      <MultiSelect v-model="selectedStatuts"    :options="[...statutOptions]"    placeholder="Statut" />
      <MultiSelect v-model="selectedCategories" :options="[...categorieOptions]" placeholder="Catégorie" />
      <ClearFiltersButton v-if="hasActiveFilters" @click="resetFilters" />
    </template>
  </TablePage>
</template>
```

> Nuxt route automatiquement `pages/products.vue` vers `/products` — **pas besoin de configurer le router**.

---

## 9. Ajouter le lien dans la sidebar

Dans `components/navigation/NavBar.vue`, ajouter dans `navItems` :

```typescript
{
  href: '/products',
  label: 'Produits',
  icon: `<rect x="2" y="2" width="12" height="12" rx="2"/><path d="M8 2v12"/>`,
},
```

---

## Récap des fichiers à créer/modifier

| Action | Fichier |
|--------|---------|
| Créer | `domains/products/constants.ts` |
| Créer | `domains/products/columns.ts` |
| Créer | `domains/products/mockRows.ts` |
| Créer | `domains/products/editors.ts` _(si éditable)_ |
| Créer | `domains/products/useProductsTable.ts` |
| Créer | `domains/products/data.ts` |
| Créer | `pages/products.vue` |
| Modifier | `components/navigation/NavBar.vue` |
