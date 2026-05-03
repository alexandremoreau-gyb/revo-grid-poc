<script setup lang="ts">
import { computed } from 'vue'
import type { EditorCtr } from '@revolist/revogrid'
import DataGrid from '~/components/grid/DataGrid.vue'
import type { ColumnDef, RowData } from '~/types/grid'
import ConfirmModal from '~/components/ui/ConfirmModal.vue'
import GridPagination from '~/components/grid/GridPagination.vue'
import TablePageHeader from '~/components/layout/TablePageHeader.vue'
import { useTablePageRows } from '~/composables/grid/useTablePageRows'
import TablePageToolbar from '~/components/layout/TablePageToolbar.vue'
import { useTablePageEditing } from '~/composables/grid/useTablePageEditing'

interface Props {
  title: string
  eyebrow?: string
  unitLabel?: string
  columns: ColumnDef[]
  rows: RowData[]
  searchFields?: string[]
  searchPlaceholder?: string
  editable?: boolean
  editors?: Record<string, EditorCtr>
  defaultPageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: 'OTC Flow',
  unitLabel: 'lignes',
  searchFields: () => [],
  searchPlaceholder: 'Rechercher…',
  editable: false,
  editors: () => ({}),
  defaultPageSize: 25,
})

const rows = computed(() => props.rows)
const searchFields = computed(() => props.searchFields)
const { search, page, pageSize, pagedRows, total, filtered } = useTablePageRows(
  rows,
  searchFields,
  props.defaultPageSize,
)
const { hasPendingEdits, onPendingChange, onConfirmRow, onCellEdit } = useTablePageEditing(pagedRows)
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <ClientOnly>
      <ConfirmModal />
    </ClientOnly>

    <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <TablePageHeader
        :eyebrow="eyebrow"
        :title="title"
        :total="total"
        :filtered="filtered"
        :unit-label="unitLabel"
      />

      <TablePageToolbar
        v-model:search="search"
        :has-pending-edits="hasPendingEdits"
        :search-fields-count="searchFields.length"
        :search-placeholder="searchPlaceholder"
        @confirm="onConfirmRow"
      >
        <template #filters>
          <slot name="filters" />
        </template>
      </TablePageToolbar>

      <!-- Grid -->
      <div class="flex-1 min-h-0 overflow-hidden p-4">
        <DataGrid
          ref="gridRef"
          :columns="columns"
          :rows="pagedRows"
          :editable="editable"
          :editors="editors"
          :enable-sorting="true"
          :framed="false"
          height="100%"
          @cell-edit="onCellEdit"
          @pending-change="onPendingChange"
        />
      </div>

      <!-- Pagination -->
      <div class="shrink-0 border-t border-[var(--color-border)] px-6 py-4">
        <GridPagination
          v-model:page="page"
          v-model:pageSize="pageSize"
          :total="filtered"
        />
      </div>

    </section>
  </div>
</template>
