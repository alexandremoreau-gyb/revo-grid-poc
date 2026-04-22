import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import type { RowData } from '~/types/grid'

type FilterAccessors = Record<string, (row: RowData) => string>
type SelectedFilters<T extends FilterAccessors> = {
  [K in keyof T]: Ref<string[]>
}

export function useTableFilters<T extends FilterAccessors>(
  rows: Ref<RowData[]>,
  accessors: T,
) {
  const filterKeys = Object.keys(accessors) as Array<keyof T>
  const selectedFilters = Object.fromEntries(
    filterKeys.map(key => [key, ref<string[]>([])]),
  ) as SelectedFilters<T>

  const hasActiveFilters = computed(() =>
    filterKeys.some(key => selectedFilters[key].value.length > 0),
  )

  const filteredRows = computed(() =>
    rows.value.filter(row =>
      filterKeys.every((key) => {
        const selected = selectedFilters[key].value
        const accessor = accessors[key]

        return !selected.length || (accessor ? selected.includes(accessor(row)) : true)
      }),
    ),
  )

  function resetFilters() {
    filterKeys.forEach((key) => {
      selectedFilters[key].value = []
    })
  }

  return {
    selectedFilters,
    hasActiveFilters,
    filteredRows,
    resetFilters,
  }
}
