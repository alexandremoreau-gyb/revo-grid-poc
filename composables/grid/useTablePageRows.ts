import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import type { RowData } from '~/types/grid'

export function useTablePageRows(
  rows: Ref<RowData[]>,
  searchFields: Ref<string[]>,
  defaultPageSize: number,
) {
  const search = ref('')
  const page = ref(1)
  const pageSize = ref(defaultPageSize)

  const searchFiltered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q || !searchFields.value.length) return rows.value

    return rows.value.filter(row =>
      searchFields.value.some(field => String(row[field] ?? '').toLowerCase().includes(q)),
    )
  })

  const pagedRows = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return searchFiltered.value.slice(start, start + pageSize.value)
  })

  watch([rows, search, pageSize], () => {
    page.value = 1
  })

  const total = computed(() => rows.value.length)
  const filtered = computed(() => searchFiltered.value.length)

  return {
    search,
    page,
    pageSize,
    pagedRows,
    total,
    filtered,
  }
}
