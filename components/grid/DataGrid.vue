<script setup lang="ts">
import { computed } from 'vue'
import type { EditorCtr } from '@revolist/revogrid'
import VGrid, { VGridVueTemplate } from '@revolist/vue3-datagrid'
import DateSortHeader from '~/components/grid/DateSortHeader.vue'
import GridCellRenderer from '~/components/grid/GridCellRenderer.vue'
import type { ColumnDef, GridColumnVariant, GridFilterState, GridSortState, RowData } from '~/types/grid'

interface CellEditPayload {
  rowIndex: number
  prop: string
  val: unknown
}

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
  'sort-change': [state: GridSortState]
  'filter-change': [state: GridFilterState]
  'row-select': [rows: RowData[]]
  'cell-edit': [payload: CellEditPayload]
}>()

const { t } = useI18n()

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
// VGridVueTemplate doit être créé pendant setup() où getCurrentInstance() est valide.
// Son 2e argument est un objet de props STATIQUES mergé avec le cell-model de revo-grid.
const ALL_VARIANTS: GridColumnVariant[] = [
  'selection', 'id', 'symbol', 'price', 'large_number', 'trend', 'percent',
  'tags', 'bool', 'status', 'currency', 'date', 'progress', 'email', 'company',
  'actions', 'text', 'dossier-status', 'risk',
]
const variantTemplates = Object.fromEntries(
  ALL_VARIANTS.map(variant => [variant, VGridVueTemplate(GridCellRenderer, { variant })])
) as Record<GridColumnVariant, ReturnType<typeof VGridVueTemplate>>

const dateHeaderTemplate = VGridVueTemplate(DateSortHeader, {})

const revoColumns = computed(() =>
  props.columns.map((col) => {
    const isEditable = col.editable === true

    return {
      ...col,
      name: col.name ?? col.label ?? String(col.prop),
      ...(col.editable !== undefined ? { readonly: !col.editable } : {}),
      ...(isEditable ? { editor: col.editor } : {}),
      ...(col.variant ? { cellTemplate: variantTemplates[col.variant] } : {}),
      ...(col.prop === 'date' ? { columnTemplate: dateHeaderTemplate } : {}),
    }
  })
)

function onSortingConfigChanged(event: CustomEvent<GridSortState>) {
  emit('sort-change', event.detail)
}

function onFilterConfigChanged(event: CustomEvent<GridFilterState>) {
  emit('filter-change', event.detail)
}

function onAfterEdit(event: any) {
  const { val, prop, rowIndex } = event.detail as { val: unknown; prop: string; rowIndex: number }
  emit('cell-edit', { rowIndex, prop, val })
}
</script>

<template>
  <div
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
        :columns="revoColumns"
        :source="rows"
        :filter="enableColumnFilters"
        :readonly="!editable"
        :editors="props.editors"
        :style="gridStyle"
        theme="compact"
        @sortingconfigchanged="onSortingConfigChanged"
        @filterconfigchanged="onFilterConfigChanged"
        @afteredit="onAfterEdit"
      />
    </ClientOnly>
  </div>
</template>
