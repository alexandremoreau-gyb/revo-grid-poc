import type { AfterEditEvent } from '@revolist/revogrid'
import type { CellEditPayload, RowData } from '~/types/grid'
import { consumeEnterCommit } from '~/utils/grid/editCommitIntent'
import { useConfirmModal } from '~/composables/app/useConfirmModal'
import { nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

function cloneRows(rows: RowData[]) {
  return rows.map(row => ({ ...row }))
}

function upsertEdit(edits: CellEditPayload[], payload: CellEditPayload): CellEditPayload[] {
  const idx = edits.findIndex(edit => edit.prop === payload.prop)
  if (idx < 0) return [...edits, payload]

  const nextEdits = [...edits]
  nextEdits[idx] = payload
  return nextEdits
}

interface UseGridPendingEditsOptions {
  rows: Ref<RowData[]>
  emitCellEdit: (payload: CellEditPayload) => void
  emitPendingChange: (hasPending: boolean) => void
}

function toCellEditPayload(detail: AfterEditEvent): CellEditPayload | null {
  if (!('prop' in detail) || !('rowIndex' in detail)) return null
  if (typeof detail.prop !== 'string') return null

  return {
    rowIndex: detail.rowIndex,
    prop: detail.prop,
    val: detail.val,
  }
}

export function useGridPendingEdits({
  rows,
  emitCellEdit,
  emitPendingChange,
}: UseGridPendingEditsOptions) {
  const { confirm } = useConfirmModal()
  const gridRows = ref<RowData[]>(cloneRows(rows.value))
  const gridKey = ref(0)
  const gridWrapper = ref<HTMLElement | null>(null)
  const pendingRowIndex = ref<number | null>(null)
  const pendingEdits = ref<CellEditPayload[]>([])
  const activeEdit = ref(false)
  let confirmPromise: Promise<void> | null = null

  watch(
    rows,
    (nextRows) => {
      clearPendingState()
      gridRows.value = cloneRows(nextRows)
    },
    { deep: true },
  )

  watch(
    () => activeEdit.value || pendingEdits.value.length > 0,
    emitPendingChange,
  )

  function clearPendingState() {
    pendingRowIndex.value = null
    pendingEdits.value = []
    activeEdit.value = false
  }

  function resetGridDraft() {
    // revo-grid mute gridRows via setCellData avant d'émettre afteredit.
    // On repart de rows (source parent jamais mutée par revo-grid) avant de forcer le remount.
    gridRows.value = cloneRows(rows.value)
    gridKey.value += 1
  }

  function collectPendingEdits(): CellEditPayload[] {
    const edits = [...pendingEdits.value]
    clearPendingState()
    return edits
  }

  function rememberEdit(payload: CellEditPayload) {
    pendingRowIndex.value = payload.rowIndex
    pendingEdits.value = upsertEdit(pendingEdits.value, payload)
    activeEdit.value = false
  }

  function hasPendingWork(): boolean {
    return pendingEdits.value.length > 0 || activeEdit.value
  }

  function isDifferentPendingRow(rowIndex: number): boolean {
    return pendingRowIndex.value !== null && rowIndex !== pendingRowIndex.value
  }

  async function waitForEditEvents(): Promise<void> {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()
  }

  async function confirmPendingRow(): Promise<void> {
    if (confirmPromise) return confirmPromise

    confirmPromise = runConfirmPendingRow().finally(() => {
      confirmPromise = null
    })

    return confirmPromise
  }

  async function runConfirmPendingRow(): Promise<void> {
    await waitForEditEvents()

    if (!pendingEdits.value.length) return

    const edits = collectPendingEdits()

    const confirmed = await confirm()
    if (confirmed) {
      for (const edit of edits) emitCellEdit(edit)
      return
    }

    resetGridDraft()
  }

  async function onClickOutside(event: PointerEvent) {
    if (!hasPendingWork()) return
    if (gridWrapper.value?.contains(event.target as Node)) return

    await confirmPendingRow()
  }

  function onBeforeEditStart() {
    activeEdit.value = true
  }

  function onEditClosed() {
    activeEdit.value = false
  }

  async function onAfterEdit(event: CustomEvent<AfterEditEvent>) {
    const payload = toCellEditPayload(event.detail)
    if (!payload) return

    if (isDifferentPendingRow(payload.rowIndex)) {
      await confirmPendingRow()
    }

    rememberEdit(payload)

    if (consumeEnterCommit(payload)) {
      await confirmPendingRow()
    }
  }

  onMounted(() => {
    document.addEventListener('pointerdown', onClickOutside, true)
  })

  onUnmounted(() => {
    document.removeEventListener('pointerdown', onClickOutside, true)
  })

  return {
    gridKey,
    gridRows,
    gridWrapper,
    confirmPendingRow,
    onAfterEdit,
    onBeforeEditStart,
    onEditClosed,
  }
}
