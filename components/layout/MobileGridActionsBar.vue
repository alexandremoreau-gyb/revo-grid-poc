<script setup lang="ts">
import type { RowData } from '~/types/grid'

interface Props {
  row: RowData
  rowId: number
  commitRow: (row: RowData) => void
  cancelRow: (rowId: number) => void
}

const props = defineProps<Props>()
</script>

<template>
  <div
    class="flex h-full w-full items-start gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-alt,#fdfaf3)] px-4 pt-3"
    @click.stop
  >
    <button
      data-row-confirm
      class="flex-1 rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
      type="button"
      @click.stop="props.commitRow(props.row)"
    >
      Enregistrer
    </button>
    <button
      data-row-cancel
      class="flex-1 rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-500 transition hover:bg-rose-50"
      type="button"
      @click.stop="props.cancelRow(props.rowId)"
    >
      Annuler
    </button>
  </div>
</template>
