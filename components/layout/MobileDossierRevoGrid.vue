<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from '~/composables/app/useToast'
import type { ColumnDef, RowData } from '~/types/grid'
import VGrid, { VGridVueTemplate } from '@revolist/vue3-datagrid'
import type { ColumnRegular, RowDefinition } from '@revolist/revogrid'
import { useContainerWidth } from '~/composables/grid/useContainerWidth'
import MobileDossierRevoGridCell from '~/components/layout/MobileDossierRevoGridCell.vue'

interface Props {
  rows: RowData[]
  columns: ColumnDef[]
}

const props = defineProps<Props>()

type MobileGridRow = {
  id: string
  display: string
  rowKind: 'summary' | 'details' | 'actions'
  row: RowData
  rowId: number
}

const editableCols = computed(() => props.columns.filter(c => c.editable && c.mobileInputType))
const editableFieldsList = computed(() => editableCols.value.map(c => c.prop))

function fieldType(prop: string): 'text' | 'number' | 'date' | 'select' {
  return (editableCols.value.find(c => c.prop === prop)?.mobileInputType ?? 'text') as ReturnType<typeof fieldType>
}

function fieldLabel(prop: string): string {
  const col = props.columns.find(c => c.prop === prop)
  return col?.name ?? col?.label ?? prop
}

function fieldOptions(prop: string): readonly string[] {
  return props.columns.find(c => c.prop === prop)?.selectOptions ?? []
}

const gridNonce = ref(0)
const draftValue = ref('')
const { show: showToast } = useToast()
const openId = ref<number | null>(null)
const gridShell = ref<HTMLElement | null>(null)
const { width: shellWidth } = useContainerWidth(gridShell)
const editingField = ref<{ rowId: number; prop: string } | null>(null)
const pendingChanges = ref<Record<number, Record<string, string>>>({})

const rowIndexMap = computed(() => {
  const map = new WeakMap<RowData, number>()
  props.rows.forEach((row, i) => map.set(row, i))
  return map
})

function rowId(row: RowData): number {
  return rowIndexMap.value.get(row) ?? 0
}

function touchGrid() {
  gridNonce.value += 1
}

function toggle(id: number) {
  openId.value = openId.value === id ? null : id
  editingField.value = null
  touchGrid()
}

function isOpen(id: number): boolean {
  return openId.value === id
}

function formatCurrency(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—'
  const n = Number(val)
  if (Number.isNaN(n)) return '—'
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function isEditing(id: number, prop: string): boolean {
  return editingField.value?.rowId === id && editingField.value?.prop === prop
}

function displayValue(row: RowData, prop: string): string {
  return pendingChanges.value[rowId(row)]?.[prop] ?? String(row[prop] ?? '')
}

function isPendingField(row: RowData, prop: string): boolean {
  return pendingChanges.value[rowId(row)]?.[prop] !== undefined
}

function editValue(row: RowData, prop: string): string {
  if (isEditing(rowId(row), prop))
    return draftValue.value
  return displayValue(row, prop)
}

function hasPendingChanges(id: number): boolean {
  const changes = pendingChanges.value[id]
  return !!changes && Object.keys(changes).length > 0
}

function liveHasPendingChanges(row: RowData): boolean {
  const id = rowId(row)
  if (editingField.value?.rowId === id) {
    const prop = editingField.value.prop
    return draftValue.value !== String(row[prop] ?? '')
  }
  return hasPendingChanges(id)
}

function startEdit(id: number, prop: string, originalVal: string) {
  editingField.value = { rowId: id, prop }
  draftValue.value = pendingChanges.value[id]?.[prop] ?? originalVal
  touchGrid()
}

function updateDraftValue(val: string) {
  draftValue.value = val
}

function storeEdit(row: RowData, prop: string, val: string) {
  const id = rowId(row)
  const originalVal = String(row[prop] ?? '')

  if (val === originalVal) {
    if (pendingChanges.value[id]) {
      delete pendingChanges.value[id]![prop]
      if (Object.keys(pendingChanges.value[id]!).length === 0)
        delete pendingChanges.value[id]
    }
  }
  else {
    if (!pendingChanges.value[id]) pendingChanges.value[id] = {}
    pendingChanges.value[id]![prop] = val
  }

  editingField.value = null
  touchGrid()
}

function cancelFieldEdit() {
  editingField.value = null
  draftValue.value = ''
  touchGrid()
}

function commitRow(row: RowData) {
  const id = rowId(row)
  const changes = pendingChanges.value[id]
  if (!changes) return

  for (const [prop, val] of Object.entries(changes)) {
    row[prop] = val
  }

  delete pendingChanges.value[id]
  editingField.value = null
  draftValue.value = ''
  touchGrid()
  showToast('Modifications enregistrées')
}

function cancelRow(id: number) {
  delete pendingChanges.value[id]
  editingField.value = null
  draftValue.value = ''
  touchGrid()
}

const cellTemplate = VGridVueTemplate(MobileDossierRevoGridCell, {
  toggle,
  isOpen,
  editableFields: editableFieldsList.value,
  fieldLabel,
  fieldType,
  fieldOptions,
  isEditing,
  displayValue,
  isPendingField,
  editValue,
  startEdit,
  updateDraftValue,
  storeEdit,
  cancelFieldEdit,
  liveHasPendingChanges,
  commitRow,
  cancelRow,
  formatCurrency,
})

const columns = computed<ColumnRegular[]>(() => [
  {
    prop: 'display',
    name: 'RÉFÉRENCE DOSSIER',
    size: Math.max(280, Math.floor(shellWidth.value || 320)),
    readonly: true,
    cellTemplate,
  },
])

const gridRows = computed<MobileGridRow[]>(() => {
  gridNonce.value

  return props.rows.flatMap((row, index) => {
    const id = index
    const rows: MobileGridRow[] = [
      {
        id: `${id}-summary-${openId.value === id ? 'open' : 'closed'}`,
        display: String(row.reference ?? ''),
        rowKind: 'summary',
        row,
        rowId: id,
      },
    ]

    if (openId.value === id) {
      rows.push({
        id: `${id}-details-${gridNonce.value}`,
        display: '',
        rowKind: 'details',
        row,
        rowId: id,
      })

      if (liveHasPendingChanges(row)) {
        rows.push({
          id: `${id}-actions-${gridNonce.value}`,
          display: '',
          rowKind: 'actions',
          row,
          rowId: id,
        })
      }
    }

    return rows
  })
})

const rowDefinitions = computed<RowDefinition[]>(() =>
  gridRows.value.map((row, index) => ({
    type: 'rgRow',
    index,
    size: row.rowKind === 'details' ? 380 : row.rowKind === 'actions' ? 56 : 52,
  })),
)

const gridHeight = computed(() => {
  const totalRowsHeight = rowDefinitions.value.reduce((total, row) => total + row.size, 0)
  return `${Math.min(720, Math.max(88, totalRowsHeight + 36))}px`
})
</script>

<template>
  <div ref="gridShell" class="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
    <ClientOnly>
      <VGrid
        class="mobile-dossier-revo-grid"
        :columns="columns"
        :source="gridRows"
        :row-definitions="rowDefinitions"
        :readonly="true"
        :can-focus="false"
        :style="{ height: gridHeight }"
        theme="compact"
      />
    </ClientOnly>
  </div>
</template>

<style>
.mobile-dossier-revo-grid .rgCell {
  padding: 0 !important;
}

.mobile-dossier-revo-grid .rgCell > span {
  display: block;
  width: 100%;
  height: 100%;
}

.mobile-dossier-revo-grid revogr-scroll-virtual.vertical {
  opacity: 0;
  pointer-events: none;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
}

.mobile-dossier-revo-grid revogr-scroll-virtual.horizontal {
  opacity: 0;
  pointer-events: none;
  min-height: 0 !important;
  max-height: 0 !important;
}

.mobile-dossier-revo-grid button,
.mobile-dossier-revo-grid input,
.mobile-dossier-revo-grid select {
  touch-action: manipulation;
}
</style>
