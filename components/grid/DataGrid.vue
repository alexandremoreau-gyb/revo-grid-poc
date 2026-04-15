<script setup lang="ts">
import { computed } from 'vue'

import GridCellRenderer from '~/components/grid/GridCellRenderer.vue'
import type { ColumnDef, RowData } from '~/types/grid'

interface Props {
  columns: ColumnDef[]
  rows: RowData[]
  loading?: boolean
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 420,
})

const { t } = useI18n()

const gridStyle = computed(() => ({
  minHeight: `${props.height}px`,
}))

const panelStyle = computed(() => ({
  maxHeight: '700px',
}))

const displayColumns = computed(() =>
  props.columns.map(column => ({
    ...column,
    name: column.name ?? column.label ?? String(column.prop),
  })),
)
</script>

<template>
  <div
    class="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
    :style="panelStyle"
  >
    <div
      v-if="loading || !rows.length"
      class="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,rgba(148,163,184,0.04),transparent)] text-sm text-[var(--color-text-muted)]"
      :style="gridStyle"
    >
      {{ loading ? t('common.loading') : t('common.noData') }}
    </div>

    <div
      v-else
      class="min-h-0 flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(148,163,184,0.03),transparent)]"
      :style="gridStyle"
    >
      <table class="min-w-full border-collapse text-sm">
        <thead class="sticky top-0 z-10 bg-[var(--color-surface)]/95 backdrop-blur">
          <tr class="border-b border-[var(--color-border)]">
            <th
              v-for="column in displayColumns"
              :key="column.prop"
              class="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]"
            >
              {{ column.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="String(row.id ?? rowIndex)"
            class="border-b border-[var(--color-border)] odd:bg-[rgba(148,163,184,0.03)] hover:bg-[rgba(59,130,246,0.05)] last:border-b-0"
          >
            <td
              v-for="column in displayColumns"
              :key="column.prop"
              class="whitespace-nowrap px-4 py-3 align-middle text-[var(--color-text)]"
            >
              <GridCellRenderer
                :value="row[column.prop]"
                :variant="column.variant"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
