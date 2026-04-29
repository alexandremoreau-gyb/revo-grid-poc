import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'
import DataGrid from '~/components/grid/DataGrid.vue'
import { useToast } from '~/composables/app/useToast'
import { useHistory } from '~/composables/app/useHistory'
import type { CellEditPayload, RowData } from '~/types/grid'

export function useTablePageEditing(pagedRows: Ref<RowData[]>) {
  const { addEntry } = useHistory()
  const { show: showToast } = useToast()
  const gridRef = ref<InstanceType<typeof DataGrid> | null>(null)
  const hasPendingEdits = ref(false)

  function onPendingChange(has: boolean) {
    hasPendingEdits.value = has
  }

  function onConfirmRow() {
    gridRef.value?.confirmPendingRow()
  }

  function onEnterKey(e: KeyboardEvent) {
    if (e.key !== 'Enter') return
    if (!hasPendingEdits.value) return
    const tag = (e.target as HTMLElement).tagName.toLowerCase()
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return
    e.preventDefault()
    onConfirmRow()
  }

  function onCellEdit(payload: CellEditPayload) {
    const row = pagedRows.value[payload.rowIndex] as Record<string, unknown> | undefined
    if (row) {
      const oldVal = row[payload.prop]
      row[payload.prop] = payload.val
      showToast('Modification réussie')
      addEntry(
        String(row.reference ?? `Ligne ${payload.rowIndex + 1}`),
        payload.prop,
        oldVal,
        payload.val,
      )
    }
  }

  onMounted(() => document.addEventListener('keydown', onEnterKey))
  onUnmounted(() => document.removeEventListener('keydown', onEnterKey))

  return {
    gridRef,
    hasPendingEdits,
    onPendingChange,
    onConfirmRow,
    onCellEdit,
  }
}
