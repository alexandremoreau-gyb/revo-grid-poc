<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { RowData } from '~/types/grid'
import { useToast } from '~/composables/useToast'
import AppToast from '~/components/ui/AppToast.vue'
import DataGrid from '~/components/grid/DataGrid.vue'
import { useDateSort } from '~/composables/useDateSort'
import MultiSelect from '~/components/grid/MultiSelect.vue'
import GridPagination from '~/components/grid/GridPagination.vue'
import {
  CLIENTS,
  DOSSIER_RISQUES,
  DOSSIER_STATUTS,
  FICHES,
  TF_CODES,
  createDossierRows,
  dossierColumns,
  dossierEditors,
} from '~/data/mock/dossiersData'

// --- dataset ---
const allRows = ref<RowData[]>(createDossierRows(200))

// --- toolbar state ---
const search = ref('')
const page = ref(1)
const pageSize = ref(50)

// --- filters ---
const selectedStatuts = ref<string[]>([])
const selectedRisques = ref<string[]>([])
const selectedFiches = ref<string[]>([])
const selectedClients = ref<string[]>([])
const selectedTf = ref<string[]>([])

// Options pour les selects (fiche en format lisible avec tirets)
const ficheOptions = [...FICHES].map(f => f.replace(/_/g, '-'))

// --- date sort ---
const { sortDir } = useDateSort()

// --- toast ---
const { show: showToast } = useToast()

// --- filtering ---
const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return allRows.value.filter((row) => {
    if (selectedStatuts.value.length && !selectedStatuts.value.includes(String(row.statut))) return false
    if (selectedRisques.value.length && !selectedRisques.value.includes(String(row.risque))) return false
    if (selectedFiches.value.length) {
      const rowFiche = String(row.fiche ?? '').replace(/_/g, '-')
      if (!selectedFiches.value.includes(rowFiche)) return false
    }
    if (selectedClients.value.length && !selectedClients.value.includes(String(row.client))) return false
    if (selectedTf.value.length && !selectedTf.value.includes(String(row.tf))) return false
    if (!q) return true
    return (
      String(row.reference ?? '').toLowerCase().includes(q) ||
      String(row.client ?? '').toLowerCase().includes(q) ||
      String(row.raisonSociale ?? '').toLowerCase().includes(q)
    )
  })
})

// --- date sort ---
const sortedRows = computed(() => {
  return [...filteredRows.value].sort((a, b) => {
    const da = new Date(String(a.date ?? '')).getTime()
    const db = new Date(String(b.date ?? '')).getTime()
    return sortDir.value === 'desc' ? db - da : da - db
  })
})

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return sortedRows.value.slice(start, start + pageSize.value)
})

watch([search, selectedStatuts, selectedRisques, selectedFiches, selectedClients, selectedTf, pageSize, sortDir], () => {
  page.value = 1
})

function onCellEdit(payload: { rowIndex: number; prop: string; val: unknown }) {
  const rowRef = pagedRows.value[payload.rowIndex]
  if (!rowRef) return
  const absoluteIndex = allRows.value.indexOf(rowRef)
  if (absoluteIndex !== -1) {
    ;(allRows.value[absoluteIndex] as Record<string, unknown>)[payload.prop] = payload.val
    showToast('Modification réussie')
  }
}

const totalDossiers = computed(() => allRows.value.length)
const filteredCount = computed(() => filteredRows.value.length)
const isFiltered = computed(() => filteredCount.value < totalDossiers.value)

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' ||
  selectedStatuts.value.length > 0 ||
  selectedRisques.value.length > 0 ||
  selectedFiches.value.length > 0 ||
  selectedClients.value.length > 0 ||
  selectedTf.value.length > 0,
)

function resetAllFilters() {
  search.value = ''
  selectedStatuts.value = []
  selectedRisques.value = []
  selectedFiches.value = []
  selectedClients.value = []
  selectedTf.value = []
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <AppToast />

    <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <!-- Header -->
      <div class="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <div>
          <p class="eyebrow mb-0.5">OTC Flow</p>
          <h1 class="text-base font-bold text-[var(--color-text)]">Suivi des dossiers</h1>
        </div>
        <span class="text-xs text-[var(--color-text-soft)]">
          <template v-if="isFiltered">
            {{ filteredCount }} / {{ totalDossiers }} dossiers
          </template>
          <template v-else>
            {{ totalDossiers }} dossiers
          </template>
        </span>
      </div>

      <!-- Toolbar -->
      <div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-6 py-3">
        <!-- Recherche -->
        <div class="relative min-w-52 flex-1 max-w-xs">
          <svg
            class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-soft)]"
            viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"
          >
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path stroke-linecap="round" d="M10.5 10.5l3 3" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Référence, client, raison sociale…"
            class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-strong)] py-1.5 pl-8 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <!-- Filtres multi-select -->
        <MultiSelect
          v-model="selectedStatuts"
          :options="[...DOSSIER_STATUTS]"
          placeholder="Statut"
        />
        <MultiSelect
          v-model="selectedRisques"
          :options="[...DOSSIER_RISQUES]"
          placeholder="Risque"
        />
        <MultiSelect
          v-model="selectedFiches"
          :options="ficheOptions"
          placeholder="Fiche"
        />
        <MultiSelect
          v-model="selectedClients"
          :options="[...CLIENTS]"
          placeholder="Client"
        />
        <MultiSelect
          v-model="selectedTf"
          :options="[...TF_CODES]"
          placeholder="TF"
        />

        <button
          v-if="hasActiveFilters"
          type="button"
          class="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] py-1.5 pl-2.5 pr-3 text-sm text-[var(--color-text-muted)] transition hover:border-rose-300 hover:text-rose-500"
          @click="resetAllFilters"
        >
          <svg class="h-3 w-3" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
          Réinitialiser
        </button>
      </div>

      <!-- Grid -->
      <div class="flex-1 min-h-0 overflow-hidden p-4">
        <DataGrid
          :columns="dossierColumns"
          :rows="pagedRows"
          :editable="true"
          :editors="dossierEditors"
          :enable-sorting="true"
          :framed="false"
          height="100%"
          @cell-edit="onCellEdit"
        />
      </div>

      <!-- Pagination -->
      <div class="shrink-0 border-t border-[var(--color-border)] px-6 py-4">
        <GridPagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :total="filteredRows.length"
        />
      </div>
    </section>
  </div>
</template>
