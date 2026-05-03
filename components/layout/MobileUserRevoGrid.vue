<!--
  MobileUserRevoGrid — accordéon utilisateurs via RevoGrid (POC)

  Approche : chaque utilisateur est éclaté en 1 à 3 lignes virtuelles selon l'état :
    • summary  (52px)  — en-tête cliquable, toujours visible
    • details  (280px) — champs éditables, affiché si la ligne est ouverte
    • actions  (56px)  — barre Enregistrer/Annuler, affiché uniquement si des changements sont en attente

  Les champs éditables et leur métadonnée (label, type, options) sont dérivés de la prop
  `columns` (ColumnDef[]) plutôt que hardcodés ici — source de vérité unique dans columns.ts.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from '~/composables/app/useToast'
import type { RowData, ColumnDef } from '~/types/grid'
import VGrid, { VGridVueTemplate } from '@revolist/vue3-datagrid'
import type { ColumnRegular, RowDefinition } from '@revolist/revogrid'
import { useContainerWidth } from '~/composables/grid/useContainerWidth'
import MobileUserRevoGridCell from '~/components/layout/MobileUserRevoGridCell.vue'

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

function fieldType(prop: string): 'text' | 'number' | 'date' | 'email' | 'select' {
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

function touchGrid() {
  gridNonce.value += 1
}

function toggle(rowId: number) {
  openId.value = openId.value === rowId ? null : rowId
  editingField.value = null
  touchGrid()
}

function isOpen(rowId: number): boolean {
  return openId.value === rowId
}

function formatDate(val: unknown): string {
  if (!val) return '—'
  const d = new Date(String(val))
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function isEditing(rowId: number, prop: string): boolean {
  return editingField.value?.rowId === rowId && editingField.value?.prop === prop
}

function displayValue(row: RowData, prop: string): string {
  return pendingChanges.value[row.id as number]?.[prop] ?? String(row[prop] ?? '')
}

function isPendingField(row: RowData, prop: string): boolean {
  return pendingChanges.value[row.id as number]?.[prop] !== undefined
}

function editValue(row: RowData, prop: string): string {
  if (isEditing(row.id as number, prop))
    return draftValue.value
  return displayValue(row, prop)
}

function hasPendingChanges(rowId: number): boolean {
  const changes = pendingChanges.value[rowId]
  return !!changes && Object.keys(changes).length > 0
}

function liveHasPendingChanges(row: RowData): boolean {
  if (editingField.value?.rowId === (row.id as number)) {
    const prop = editingField.value.prop
    return draftValue.value !== String(row[prop] ?? '')
  }
  return hasPendingChanges(row.id as number)
}

function startEdit(rowId: number, prop: string, originalVal: string) {
  editingField.value = { rowId, prop }
  draftValue.value = pendingChanges.value[rowId]?.[prop] ?? originalVal
  touchGrid()
}

function updateDraftValue(val: string) {
  draftValue.value = val
}

function storeEdit(row: RowData, prop: string, val: string) {
  const rowId = row.id as number
  const originalVal = String(row[prop] ?? '')

  if (val === originalVal) {
    if (pendingChanges.value[rowId]) {
      delete pendingChanges.value[rowId]![prop]
      if (Object.keys(pendingChanges.value[rowId]!).length === 0)
        delete pendingChanges.value[rowId]
    }
  }
  else {
    if (!pendingChanges.value[rowId]) pendingChanges.value[rowId] = {}
    pendingChanges.value[rowId]![prop] = val
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
  const rowId = row.id as number
  const changes = pendingChanges.value[rowId]
  if (!changes) return

  for (const [prop, val] of Object.entries(changes)) {
    row[prop] = val
  }

  delete pendingChanges.value[rowId]
  editingField.value = null
  draftValue.value = ''
  touchGrid()
  showToast('Modifications enregistrées')
}

function cancelRow(rowId: number) {
  delete pendingChanges.value[rowId]
  editingField.value = null
  draftValue.value = ''
  touchGrid()
}

function rowFullName(row: RowData): string {
  return `${row.prenom ?? ''} ${row.nom ?? ''}`.trim()
}

const cellTemplate = VGridVueTemplate(MobileUserRevoGridCell, {
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
  formatDate,
})

const columns = computed<ColumnRegular[]>(() => [
  {
    prop: 'display',
    name: 'NOM UTILISATEUR',
    size: Math.max(280, Math.floor(shellWidth.value || 320)),
    readonly: true,
    cellTemplate,
  },
])

const gridRows = computed<MobileGridRow[]>(() => {
  gridNonce.value

  return props.rows.flatMap((row) => {
    const rowId = row.id as number
    const rows: MobileGridRow[] = [
      {
        id: `${rowId}-summary-${openId.value === rowId ? 'open' : 'closed'}`,
        display: rowFullName(row),
        rowKind: 'summary',
        row,
        rowId,
      },
    ]

    if (openId.value === rowId) {
      rows.push({
        id: `${rowId}-details-${gridNonce.value}`,
        display: '',
        rowKind: 'details',
        row,
        rowId,
      })

      if (liveHasPendingChanges(row)) {
        rows.push({
          id: `${rowId}-actions-${gridNonce.value}`,
          display: '',
          rowKind: 'actions',
          row,
          rowId,
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
    size: row.rowKind === 'details' ? 280 : row.rowKind === 'actions' ? 56 : 52,
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
        class="mobile-user-revo-grid"
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
.mobile-user-revo-grid .rgCell {
  padding: 0 !important;
}

.mobile-user-revo-grid .rgCell > span {
  display: block;
  width: 100%;
  height: 100%;
}

.mobile-user-revo-grid revogr-scroll-virtual.vertical {
  opacity: 0;
  pointer-events: none;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
}

.mobile-user-revo-grid revogr-scroll-virtual.horizontal {
  opacity: 0;
  pointer-events: none;
  min-height: 0 !important;
  max-height: 0 !important;
}

.mobile-user-revo-grid button,
.mobile-user-revo-grid input,
.mobile-user-revo-grid select {
  touch-action: manipulation;
}
</style>
