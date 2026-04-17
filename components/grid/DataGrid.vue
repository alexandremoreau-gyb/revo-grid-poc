<script setup lang="ts">
import { computed } from 'vue'
import VGrid, { VGridVueTemplate } from '@revolist/vue3-datagrid'

import GridCellRenderer from '~/components/grid/GridCellRenderer.vue'
import type { ColumnDef, GridColumnVariant, GridFilterState, GridSortState, RowData } from '~/types/grid'

interface Props {
  columns: ColumnDef[]
  rows: RowData[]
  loading?: boolean
  height?: number
  selectable?: boolean
  enableSorting?: boolean
  enableColumnFilters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 420,
  selectable: false,
  enableSorting: true,
  enableColumnFilters: false,
})

const emit = defineEmits<{
  'sort-change': [state: GridSortState]
  'filter-change': [state: GridFilterState]
  'row-select': [rows: RowData[]]
}>()

const { t } = useI18n()

const panelStyle = computed(() => ({ maxHeight: '700px' }))
const loadingStyle = computed(() => ({ minHeight: `${props.height}px` }))
const gridStyle = computed(() => ({ height: `${props.height}px` }))

// Les templates doivent être créés pendant le setup() où getCurrentInstance() est valide.
// VGridVueTemplate() appelle getCurrentInstance() en interne pour capturer le contexte Vue.
// Son 2e argument est un objet de props STATIQUES mergé avec le cell-model de revo-grid
// (qui fournit `model` et `prop` — d'où GridCellRenderer tire la valeur réelle).
const ALL_VARIANTS: GridColumnVariant[] = [
  'selection', 'id', 'symbol', 'price', 'large_number', 'trend', 'percent',
  'tags', 'bool', 'status', 'currency', 'date', 'progress', 'email', 'company', 'actions', 'text',
]
const variantTemplates = Object.fromEntries(
  ALL_VARIANTS.map(variant => [variant, VGridVueTemplate(GridCellRenderer, { variant })])
) as Record<GridColumnVariant, ReturnType<typeof VGridVueTemplate>>

const revoColumns = computed(() =>
  props.columns.map(col => ({
    ...col,
    name: col.name ?? col.label ?? String(col.prop),
    ...(col.variant ? { cellTemplate: variantTemplates[col.variant] } : {}),
  }))
)

function onSortingConfigChanged(event: CustomEvent<GridSortState>) {
  emit('sort-change', event.detail)
}

function onFilterConfigChanged(event: CustomEvent<GridFilterState>) {
  emit('filter-change', event.detail)
}
</script>

<template>
  <div
    class="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
    :style="panelStyle"
  >
    <div
      v-if="loading || !rows.length"
      class="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,rgba(148,163,184,0.04),transparent)] text-sm text-[var(--color-text-muted)]"
      :style="loadingStyle"
    >
      {{ loading ? t('common.loading') : t('common.noData') }}
    </div>

    <ClientOnly v-else>
      <VGrid
        :columns="revoColumns"
        :source="rows"
        :filter="enableColumnFilters"
        :readonly="true"
        :style="gridStyle"
        theme="compact"
        @sortingconfigchanged="onSortingConfigChanged"
        @filterconfigchanged="onFilterConfigChanged"
      />
    </ClientOnly>
  </div>
</template>
