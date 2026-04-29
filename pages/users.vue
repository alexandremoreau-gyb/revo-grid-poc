<script setup lang="ts">
import { useIsMobile } from '~/composables/useIsMobile'
import TablePage from '~/components/layout/TablePage.vue'
import MultiSelect from '~/components/grid/MultiSelect.vue'
import { useUsersTable } from '~/domains/users/useUsersTable'
import MobileUserList from '~/components/layout/MobileUserList.vue'
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

const { isMobile } = useIsMobile()
</script>

<template>
  <!-- Mobile: accordion list -->
  <div v-if="isMobile" class="flex flex-col gap-4 p-4">
    <h1 class="text-lg font-semibold text-[var(--color-text)]">
      Gestion des utilisateurs
    </h1>
    <div class="flex items-center gap-2">
      <MultiSelect v-model="selectedStatuts" :options="[...statutOptions]" placeholder="Tous les statuts" />
    </div>
    <MobileUserList :rows="filteredRows" />
  </div>

  <!-- Desktop: revo-grid table -->
  <TablePage
    v-else
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
