<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useIsMobile } from '~/composables/useIsMobile'
import TablePage from '~/components/layout/TablePage.vue'
import MultiSelect from '~/components/grid/MultiSelect.vue'
import { useUsersTable } from '~/domains/users/useUsersTable'
import GridPagination from '~/components/grid/GridPagination.vue'
import ClearFiltersButton from '~/components/grid/ClearFiltersButton.vue'
import MobileUserRevoGrid from '~/components/layout/MobileUserRevoGrid.vue'

const {
  columns,
  editors,
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

const mobilePage = ref(1)
const mobileSearch = ref('')
const mobilePageSize = ref(25)

const mobileRows = computed(() => {
  const q = mobileSearch.value.trim().toLowerCase()
  if (!q) return filteredRows.value
  return filteredRows.value.filter(row =>
    ['nom', 'prenom', 'email', 'societe', 'role']
      .some(field => String(row[field] ?? '').toLowerCase().includes(q)),
  )
})

const mobilePagedRows = computed(() => {
  const start = (mobilePage.value - 1) * mobilePageSize.value
  return mobileRows.value.slice(start, start + mobilePageSize.value)
})

watch(mobileRows, () => { mobilePage.value = 1 })
</script>

<template>
  <div v-if="isMobile" class="flex flex-col gap-3 p-4">
    <h1 class="text-lg font-semibold text-[var(--color-text)]">
      Gestion des utilisateurs
    </h1>

    <!-- Search -->
    <div class="relative">
      <svg class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-soft)]" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="6.5" cy="6.5" r="4" />
        <path stroke-linecap="round" d="M10 10l3 3" />
      </svg>
      <input
        v-model="mobileSearch"
        type="search"
        placeholder="Nom, email, société…"
        class="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
      />
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2">
      <MultiSelect v-model="selectedStatuts" :options="[...statutOptions]" placeholder="Statut" />
      <MultiSelect v-model="selectedRoles" :options="[...roleOptions]" placeholder="Rôle" />
      <MultiSelect v-model="selectedCompanies" :options="[...companyOptions]" placeholder="Société" />
      <ClearFiltersButton v-if="hasActiveFilters || mobileSearch" @click="resetFilters(); mobileSearch = ''" />
    </div>

    <MobileUserRevoGrid :key="mobilePage" :rows="mobilePagedRows" :columns="columns" />

    <GridPagination
      v-model:page="mobilePage"
      v-model:page-size="mobilePageSize"
      :total="mobileRows.length"
      :page-size-options="[10, 25, 50]"
    />
  </div>

  <TablePage
    v-else
    title="Gestion des utilisateurs"
    unit-label="utilisateurs"
    :columns="columns"
    :rows="filteredRows"
    :editable="true"
    :editors="editors"
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
