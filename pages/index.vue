<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AppToast from '~/components/ui/AppToast.vue'
import DataGrid from '~/components/grid/DataGrid.vue'
import GridPagination from '~/components/grid/GridPagination.vue'
import { useToast } from '~/composables/useToast'
import { createDossierRows, dossierColumns, dossierEditors, DOSSIER_STATUTS } from '~/data/mock/dossiersData'
import type { RowData } from '~/types/grid'

// --- dataset ---
// Tableau réactif muté localement — pas de persistance backend pour le POC
const allRows = ref<RowData[]>(createDossierRows(200))

// --- toolbar state ---
const search = ref('')
const page = ref(1)
const pageSize = ref(50)
const selectedStatut = ref('')

// --- toast ---
const { show: showToast } = useToast()

// --- filtering ---
const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return allRows.value.filter((row) => {
    if (selectedStatut.value && row.statut !== selectedStatut.value) return false
    if (!q) return true
    return (
      String(row.reference ?? '').toLowerCase().includes(q) ||
      String(row.client ?? '').toLowerCase().includes(q) ||
      String(row.raisonSociale ?? '').toLowerCase().includes(q)
    )
  })
})

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

// Réinitialise la pagination quand les filtres changent
watch([search, selectedStatut, pageSize], () => {
  page.value = 1
})

// Reçu depuis DataGrid après édition inline.
// rowIndex est relatif à pagedRows. On utilise indexOf par référence objet
// pour retrouver l'index absolu dans allRows — fonctionne même avec des filtres actifs
// car Vue 3 Proxy préserve les références des objets dans les computed.
function onCellEdit(payload: { rowIndex: number; prop: string; val: unknown }) {
  const rowRef = pagedRows.value[payload.rowIndex]
  if (!rowRef) return
  const absoluteIndex = allRows.value.indexOf(rowRef)
  if (absoluteIndex !== -1) {
    // Mutation directe — Vue 3 Proxy détecte le changement sur l'objet
    ;(allRows.value[absoluteIndex] as Record<string, unknown>)[payload.prop] = payload.val
    showToast('Modification réussie')
  }
}

// Compteurs résumé
const totalDossiers = computed(() => allRows.value.length)
const filteredCount = computed(() => filteredRows.value.length)
const isFiltered = computed(() => filteredCount.value < totalDossiers.value)
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
        <div class="flex items-center gap-2">
          <span class="text-xs text-[var(--color-text-soft)]">
            <template v-if="isFiltered">
              {{ filteredCount }} / {{ totalDossiers }} dossiers
            </template>
            <template v-else>
              {{ totalDossiers }} dossiers
            </template>
          </span>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" d="M2 4h12M4 8h8M6 12h4" />
            </svg>
            Filtrer
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 2v8M5 7l3 3 3-3M3 13h10" />
            </svg>
            Exporter
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-6 py-3">
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

        <select
          v-model="selectedStatut"
          class="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-2.5 py-1.5 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          <option v-for="s in DOSSIER_STATUTS" :key="s" :value="s">{{ s }}</option>
        </select>

        <span class="flex-1" />

        <select
          v-model.number="pageSize"
          class="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-2.5 py-1.5 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option :value="25">25 / page</option>
          <option :value="50">50 / page</option>
          <option :value="100">100 / page</option>
        </select>
      </div>

      <!-- Summary -->
      <div class="flex shrink-0 flex-col gap-3 border-b border-[var(--color-border)] px-6 py-3 md:flex-row md:items-center md:justify-between">
        <div class="text-sm text-[var(--color-text-muted)]">
          {{ filteredCount }} dossier(s) affiché(s)
          <button
            type="button"
            class="ml-2 font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]"
          >
            Voir toutes les colonnes ({{ dossierColumns.length }})
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium text-[var(--color-text-soft)]">Groupes de colonnes :</span>
          <span class="rounded-full bg-[var(--color-bg-strong)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]">Identité</span>
          <span class="rounded-full bg-[var(--color-bg-strong)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]">Technique</span>
          <span class="rounded-full bg-[var(--color-bg-strong)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]">Financier</span>
        </div>
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
