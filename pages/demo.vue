<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import DataGrid from '~/components/grid/DataGrid.vue'
import GridPagination from '~/components/grid/GridPagination.vue'
import type { GridFilterState, GridSortState, RowData } from '~/types/grid'
import { createCryptoRows, cryptoColumns } from '~/data/mock/cryptoData'

// --- dataset ---
const ALL_ROWS = createCryptoRows(50000)

// --- toolbar state ---
const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const showTrendingOnly = ref(false)
const showWatchlistOnly = ref(false)
const selectedCategory = ref('')

// --- grid state ---
const loading = ref(false)
const isGridMounted = ref(false)
const selectedRows = ref<RowData[]>([])
const sortState = ref<GridSortState | null>(null)
const filterState = ref<GridFilterState | null>(null)

// --- categories ---
const categories = computed(() => {
  const set = new Set(ALL_ROWS.map(r => String(r.category ?? '')))
  return ['', ...Array.from(set).sort()]
})

// --- filtering ---
const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return ALL_ROWS.filter((row) => {
    if (showTrendingOnly.value && !row.trending) return false
    if (showWatchlistOnly.value && !row.watchlisted) return false
    if (selectedCategory.value && row.category !== selectedCategory.value) return false
    if (!q) return true
    return (
      String(row.symbol ?? '').toLowerCase().includes(q) ||
      String(row.name ?? '').toLowerCase().includes(q) ||
      String(row.category ?? '').toLowerCase().includes(q)
    )
  })
})

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

// --- kpis ---
const totalMarketCap = computed(() => {
  const sum = filteredRows.value.reduce((acc, r) => acc + Number(r.market_cap ?? 0), 0)
  if (sum >= 1e12) return `$${(sum / 1e12).toFixed(1)}T`
  return `$${(sum / 1e9).toFixed(0)}B`
})

const avgChange = computed(() => {
  const avg = filteredRows.value.reduce((acc, r) => acc + Number(r.change_24h ?? 0), 0) / (filteredRows.value.length || 1)
  const sign = avg >= 0 ? '+' : ''
  return `${sign}${avg.toFixed(2)}%`
})

const avgChangePositive = computed(() => filteredRows.value.reduce((acc, r) => acc + Number(r.change_24h ?? 0), 0) / (filteredRows.value.length || 1) >= 0)

const trendingCount = computed(() => filteredRows.value.filter(r => r.trending).length)
const formattedAssetCount = computed(() =>
  new Intl.NumberFormat('fr-FR').format(filteredRows.value.length),
)

watch([search, showTrendingOnly, showWatchlistOnly, selectedCategory, pageSize], () => {
  page.value = 1
  selectedRows.value = []
})

onMounted(() => {
  isGridMounted.value = true
})

function handleSelection(rows: RowData[]) {
  selectedRows.value = rows
}

function handleSort(s: GridSortState) {
  sortState.value = s
}

function handleFilter(f: GridFilterState) {
  filterState.value = f
}
</script>

<template>
  <div>

    <!-- header -->
    <div class="flex flex-col gap-3 border-b border-[var(--color-border)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="eyebrow mb-0.5">Crypto Market</p>
        <h1 class="text-base font-semibold text-[var(--color-text)]">Portfolio Grid — 50k assets</h1>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="rounded border px-2 py-0.5 text-xs font-semibold"
          :class="avgChangePositive
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'"
        >
          24h {{ avgChange }}
        </span>
        <span class="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
          Cap {{ totalMarketCap }}
        </span>
        <span class="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
          {{ trendingCount }} trending
        </span>
      </div>
    </div>

    <!-- toolbar -->
    <div class="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-6 py-2.5">
      <div class="relative min-w-44 flex-1 max-w-xs">
        <svg class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-soft)]" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="6.5" cy="6.5" r="4.5" />
          <path stroke-linecap="round" d="M10.5 10.5l3 3" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher…"
          class="w-full rounded border border-[var(--color-border)] bg-transparent py-1.5 pl-8 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      <select
        v-model="selectedCategory"
        class="rounded border border-[var(--color-border)] bg-transparent px-2.5 py-1.5 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
      >
        <option value="">Toutes catégories</option>
        <option v-for="cat in categories.slice(1)" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <button
        type="button"
        class="rounded border px-2.5 py-1.5 text-xs font-medium transition"
        :class="showTrendingOnly
          ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
        @click="showTrendingOnly = !showTrendingOnly"
      >
        Trending
      </button>

      <button
        type="button"
        class="rounded border px-2.5 py-1.5 text-xs font-medium transition"
        :class="showWatchlistOnly
          ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
        @click="showWatchlistOnly = !showWatchlistOnly"
      >
        Watchlist
      </button>

      <span class="flex-1" />

      <span class="text-xs text-[var(--color-text-soft)]">
        {{ formattedAssetCount }} assets
        <template v-if="selectedRows.length"> · {{ selectedRows.length }} sél.</template>
      </span>

      <select
        v-model.number="pageSize"
        class="rounded border border-[var(--color-border)] bg-transparent px-2.5 py-1.5 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
      >
        <option :value="10">10 / page</option>
        <option :value="25">25 / page</option>
        <option :value="50">50 / page</option>
        <option :value="100">100 / page</option>
        <option :value="250">250 / page</option>
      </select>
    </div>

    <!-- grid pleine largeur -->
    <div v-if="isGridMounted">
      <DataGrid
        :columns="cryptoColumns"
        :rows="pagedRows"
        :loading="loading"
        :selectable="true"
        :enable-column-filters="true"
        :enable-sorting="true"
        @row-select="handleSelection"
        @sort-change="handleSort"
        @filter-change="handleFilter"
      />
    </div>

    <!-- pagination -->
    <GridPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

  </div>
</template>
