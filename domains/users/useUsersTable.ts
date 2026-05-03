import { ref } from 'vue'
import { columns } from './columns'
import { editors } from './editors'
import { createRows } from './mockRows'
import { useTableFilters } from '~/composables/grid/useTableFilters'
import { USER_COMPANIES, USER_ROLES, USER_STATUTS } from './constants'

export function useUsersTable() {
  const allRows = ref(createRows(120))
  const { selectedFilters, hasActiveFilters, filteredRows, resetFilters } = useTableFilters(allRows, {
    statut: row => String(row.statut),
    role: row => String(row.role),
    societe: row => String(row.societe),
  })

  return {
    columns,
    editors,
    filteredRows,
    hasActiveFilters,
    resetFilters,
    selectedStatuts: selectedFilters.statut,
    selectedRoles: selectedFilters.role,
    selectedCompanies: selectedFilters.societe,
    statutOptions: USER_STATUTS,
    roleOptions: USER_ROLES,
    companyOptions: USER_COMPANIES,
  }
}
