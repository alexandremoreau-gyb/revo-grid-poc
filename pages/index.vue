<script setup lang="ts">
import TablePage from '~/components/layout/TablePage.vue'
import ClearFiltersButton from '~/components/grid/ClearFiltersButton.vue'
import MultiSelect from '~/components/grid/MultiSelect.vue'
import { useDossiersTable } from '~/domains/dossiers/useDossiersTable'

const {
  columns,
  editors,
  filteredRows,
  hasActiveFilters,
  resetFilters,
  selectedStatuts,
  selectedRisques,
  selectedFiches,
  selectedClients,
  statutOptions,
  risqueOptions,
  ficheOptions,
  clientOptions,
} = useDossiersTable()
</script>

<template>
  <TablePage
    title="Suivi des dossiers"
    unit-label="dossiers"
    :columns="columns"
    :rows="filteredRows"
    :editable="true"
    :editors="editors"
    :search-fields="['reference', 'client', 'raisonSociale', 'fiche', 'lp', 'tf', 'date', 'statut', 'risque']"
    search-placeholder="Référence, client, raison sociale…"
    :default-page-size="50"
  >
    <template #filters>
      <MultiSelect v-model="selectedStatuts" :options="[...statutOptions]" placeholder="Statut" />
      <MultiSelect v-model="selectedRisques" :options="[...risqueOptions]" placeholder="Risque" />
      <MultiSelect v-model="selectedFiches" :options="ficheOptions" placeholder="Fiche" />
      <MultiSelect v-model="selectedClients" :options="[...clientOptions]" placeholder="Client" />
      <ClearFiltersButton
        v-if="hasActiveFilters"
        @click="resetFilters"
      />
    </template>
  </TablePage>
</template>
