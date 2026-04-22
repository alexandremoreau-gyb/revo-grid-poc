<script setup lang="ts">
import { computed } from 'vue'
import VGrid from '@revolist/vue3-datagrid'
import type { EditorCtr } from '@revolist/revogrid'
import { useRevoGridColumns } from '~/composables/grid/useRevoGridColumns'
import { useGridPendingEdits } from '~/composables/grid/useGridPendingEdits'
import type { CellEditPayload, ColumnDef, GridFilterState, GridSortState, RowData } from '~/types/grid'

interface Props {
  columns: ColumnDef[]
  rows: RowData[]
  loading?: boolean
  height?: number | string
  selectable?: boolean
  editable?: boolean
  enableSorting?: boolean
  enableColumnFilters?: boolean
  framed?: boolean
  // Record d'éditeurs custom : { 'nom-editor': constructeur RevoGrid }
  editors?: Record<string, EditorCtr>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 520,
  selectable: false,
  editable: false,
  enableSorting: true,
  enableColumnFilters: false,
  framed: true,
  editors: () => ({}),
})

const emit = defineEmits<{
  'row-select': [rows: RowData[]]
  'sort-change': [state: GridSortState]
  'cell-edit': [payload: CellEditPayload]
  'pending-change': [hasPending: boolean]
  'filter-change': [state: GridFilterState]
}>()

const { t } = useI18n()
const rows = computed(() => props.rows)
const columns = computed(() => props.columns)
const editable = computed(() => props.editable)
const { revoColumns } = useRevoGridColumns(columns, editable)
const {
  gridKey,
  gridRows,
  confirmPendingRow,
  onAfterEdit,
  onBeforeEditStart,
  onEditClosed,
} = useGridPendingEdits({
  rows,
  emitCellEdit: payload => emit('cell-edit', payload),
  emitPendingChange: hasPending => emit('pending-change', hasPending),
})

const panelStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))
const loadingStyle = computed(() => ({
  minHeight: typeof props.height === 'number' ? `${props.height}px` : '320px',
}))
const gridStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))
const shellClasses = computed(() =>
  props.framed
    ? 'flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm'
    : 'flex h-full flex-col overflow-hidden bg-[var(--color-surface)]'
)

function onSortingConfigChanged(event: CustomEvent<GridSortState>) {
  emit('sort-change', event.detail)
}

function onFilterConfigChanged(event: CustomEvent<GridFilterState>) {
  emit('filter-change', event.detail)
}

defineExpose({ confirmPendingRow })
</script>

<template>
  <div
    ref="gridWrapper"
    :class="shellClasses"
    :style="panelStyle"
  >
    <div
      v-if="loading || !rows.length"
      class="flex flex-1 items-center justify-center text-sm text-[var(--color-text-muted)]"
      :style="loadingStyle"
    >
      {{ loading ? t('common.loading') : t('common.noData') }}
    </div>

    <ClientOnly v-else>
      <VGrid
        :key="gridKey"
        :columns="revoColumns"
        :source="gridRows"
        :filter="enableColumnFilters"
        :readonly="!editable"
        :editors="props.editors"
        :style="gridStyle"
        theme="compact"
        @sortingconfigchanged="onSortingConfigChanged"
        @filterconfigchanged="onFilterConfigChanged"
        @beforeeditstart="onBeforeEditStart"
        @canceledit="onEditClosed"
        @closeedit="onEditClosed"
        @afteredit="onAfterEdit"
      />
    </ClientOnly>
  </div>
</template>
