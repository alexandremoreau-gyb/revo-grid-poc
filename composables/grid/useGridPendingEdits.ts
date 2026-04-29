import type { CellEditPayload, RowData } from '~/types/grid'
import { consumeEnterCommit } from '~/utils/grid/editCommitIntent'
import { useConfirmModal } from '~/composables/app/useConfirmModal'
import { nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import type { AfterEditEvent, BeforeSaveDataDetails } from '@revolist/revogrid'

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

function normalizeComparableValue(value: unknown): string {
  if (value == null) return ''
  return String(value)
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
  const activeEditRowIndex = ref<number | null>(null)
  let confirmPromise: Promise<void> | null = null

  let suppressDeepWatch = false

  watch(
    rows,
    (nextRows) => {
      if (suppressDeepWatch) return
      clearPendingState()
      gridRows.value = cloneRows(nextRows)
    },
    { deep: true },
  )

  watch(
    () => pendingEdits.value.length > 0,
    hasPending => emitPendingChange(hasPending),
  )

  function clearPendingState() {
    pendingRowIndex.value = null
    pendingEdits.value = []
    activeEdit.value = false
    activeEditRowIndex.value = null
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
    activeEditRowIndex.value = null
  }

  function hasPendingWork(): boolean {
    return pendingEdits.value.length > 0 || activeEdit.value
  }

  function isDifferentPendingRow(rowIndex: number): boolean {
    const guardedRowIndex = pendingRowIndex.value ?? activeEditRowIndex.value
    return guardedRowIndex !== null && rowIndex !== guardedRowIndex
  }

  function isUnchangedEdit(payload: CellEditPayload): boolean {
    const row = rows.value[payload.rowIndex]
    if (!row) return false

    return normalizeComparableValue(row[payload.prop]) === normalizeComparableValue(payload.val)
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
      suppressDeepWatch = true
      for (const edit of edits) emitCellEdit(edit)
      await nextTick()
      resetGridDraft()
      await nextTick()
      suppressDeepWatch = false
      return
    }

    resetGridDraft()
  }

  async function onClickOutside(event: PointerEvent) {
    if (!hasPendingWork()) return
    if (gridWrapper.value?.contains(event.target as Node)) return

    await confirmPendingRow()
  }

  async function onBeforeEditStart(event: CustomEvent<BeforeSaveDataDetails>) {
    const rowIndex = event.detail?.rowIndex

    if (typeof rowIndex === 'number' && isDifferentPendingRow(rowIndex)) {
      event.preventDefault()
      await confirmPendingRow()
      return
    }

    activeEdit.value = true
    activeEditRowIndex.value = typeof rowIndex === 'number' ? rowIndex : null
  }

  function onEditClosed() {
    activeEdit.value = false
    activeEditRowIndex.value = null
  }

  async function onAfterEdit(event: CustomEvent<AfterEditEvent>) {
    const payload = toCellEditPayload(event.detail)
    if (!payload) return

    if (isUnchangedEdit(payload)) {
      activeEdit.value = false
      activeEditRowIndex.value = null
      consumeEnterCommit(payload)
      return
    }

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
