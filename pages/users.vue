<script setup lang="ts">
import TablePage from '~/components/layout/TablePage.vue'
import MultiSelect from '~/components/grid/MultiSelect.vue'
import { useUsersTable } from '~/domains/users/useUsersTable'
import ClearFiltersButton from '~/components/grid/ClearFiltersButton.vue'

const {
  columns,
  filteredRows,
  hasActiveFilters,
  resetFilters,
  selectedStatuts,
  selectedRoles,
  selectedCompanies,
  statutOptions,
  roleOptions,
  companyOptions,
} = useUsersTable()
</script>

<template>
  <TablePage
    title="Gestion des utilisateurs"
    unit-label="utilisateurs"
    :columns="columns"
    :rows="filteredRows"
    :search-fields="['nom', 'prenom', 'email', 'societe', 'role']"
    search-placeholder="Nom, email, société…"
  >
    <template #filters>
      <MultiSelect v-model="selectedStatuts" :options="[...statutOptions]" placeholder="Statut" />
      <MultiSelect v-model="selectedRoles" :options="[...roleOptions]" placeholder="Rôle" />
      <MultiSelect v-model="selectedCompanies" :options="[...companyOptions]" placeholder="Société" />
      <ClearFiltersButton
        v-if="hasActiveFilters"
        @click="resetFilters"
      />
    </template>
  </TablePage>
</template>
