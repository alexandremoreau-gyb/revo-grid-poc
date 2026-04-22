import { computed, ref } from 'vue'
import { editors } from './editors'
import { columns } from './columns'
import { createRows } from './mockRows'
import { useDateSort } from '~/composables/grid/useDateSort'
import { useTableFilters } from '~/composables/grid/useTableFilters'
import { CLIENTS, DOSSIER_RISQUES, DOSSIER_STATUTS, FICHES } from './constants'

export function useDossiersTable() {
  const allRows = ref(createRows(200))
  const { sortDir } = useDateSort()

  const sortedRows = computed(() =>
    [...allRows.value].sort((a, b) => {
      const da = new Date(String(a.date ?? '')).getTime()
      const db = new Date(String(b.date ?? '')).getTime()
      return sortDir.value === 'desc' ? db - da : da - db
    })
  )

  const { selectedFilters, hasActiveFilters, filteredRows, resetFilters } = useTableFilters(sortedRows, {
    statut: row => String(row.statut),
    risque: row => String(row.risque),
    fiche: row => String(row.fiche ?? '').replace(/_/g, '-'),
    client: row => String(row.client),
  })

  return {
    columns,
    editors,
    filteredRows,
    hasActiveFilters,
    resetFilters,
    selectedStatuts: selectedFilters.statut,
    selectedRisques: selectedFilters.risque,
    selectedFiches: selectedFilters.fiche,
    selectedClients: selectedFilters.client,
    statutOptions: DOSSIER_STATUTS,
    risqueOptions: DOSSIER_RISQUES,
    ficheOptions: [...FICHES].map(f => f.replace(/_/g, '-')),
    clientOptions: CLIENTS,
  }
}
