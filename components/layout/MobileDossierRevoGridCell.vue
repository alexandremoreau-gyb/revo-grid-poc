<!--
  MobileDossierRevoGridCell — renderer Vue pour une cellule de MobileDossierRevoGrid

  Même mécanique que MobileUserRevoGridCell :
    • summary  — référence + badge statut, cliquable pour ouvrir l'accordéon
    • details  — champs éditables (tap-to-edit) + champs en lecture seule
    • actions  — barre Enregistrer / Annuler
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { RowData } from '~/types/grid'
import GridTagBadge from '~/components/grid/GridTagBadge.vue'
import MobileGridActionsBar from '~/components/layout/MobileGridActionsBar.vue'
import { DOSSIER_STATUS_DEFAULT, DOSSIER_STATUS_STYLES, RISK_DEFAULT, RISK_STYLES } from '~/utils/grid/cellStyles'

type MobileGridRow = {
  id: string
  rowKind: 'summary' | 'details' | 'actions'
  row: RowData
  rowId: number
}

type EditableField = string

interface Props {
  model?: MobileGridRow
  editableFields?: string[]
  toggle?: (rowId: number) => void
  isOpen?: (rowId: number) => boolean
  fieldLabel?: (prop: string) => string
  fieldType?: (prop: string) => 'text' | 'number' | 'date' | 'select'
  fieldOptions?: (prop: string) => readonly string[]
  isEditing?: (rowId: number, prop: string) => boolean
  displayValue?: (row: RowData, prop: string) => string
  isPendingField?: (row: RowData, prop: string) => boolean
  editValue?: (row: RowData, prop: string) => string
  startEdit?: (rowId: number, prop: string, originalVal: string) => void
  updateDraftValue?: (val: string) => void
  storeEdit?: (row: RowData, prop: string, val: string) => void
  cancelFieldEdit?: () => void
  liveHasPendingChanges?: (row: RowData) => boolean
  commitRow?: (row: RowData) => void
  cancelRow?: (rowId: number) => void
  formatCurrency?: (val: unknown) => string
}

const props = defineProps<Props>()

const TEXT_SELECTION_INPUT_TYPES = new Set(['', 'email', 'password', 'search', 'tel', 'text', 'url'])

function statutClass(val: string) {
  return DOSSIER_STATUS_STYLES[val] ?? DOSSIER_STATUS_DEFAULT
}

function risqueClass(val: string) {
  return RISK_STYLES[val] ?? RISK_DEFAULT
}

function selectBadgeClass(prop: string, val: string) {
  if (prop === 'statut') return statutClass(val)
  if (prop === 'risque') return risqueClass(val)
  return ''
}

function selectBadgeLabel(row: RowData, prop: string) {
  return props.displayValue?.(row, prop) || '—'
}

function useTagBadge(prop: string, val: string) {
  return !!selectBadgeClass(prop, val)
}

const vFocusEnd = {
  mounted(el: HTMLInputElement) {
    el.focus({ preventScroll: true })
    requestAnimationFrame(() => {
      if (!TEXT_SELECTION_INPUT_TYPES.has(el.type)) return
      el.setSelectionRange(el.value.length, el.value.length)
    })
  },
}

function onValueClick(event: MouseEvent, row: RowData, prop: EditableField) {
  event.stopPropagation()
  props.startEdit?.(props.model!.rowId, prop, String(row[prop] ?? ''))
}

function onStoreText(row: RowData, prop: EditableField, event: Event) {
  props.storeEdit?.(row, prop, (event.target as HTMLInputElement).value)
}

function onDraftInput(event: Event) {
  props.updateDraftValue?.((event.target as HTMLInputElement).value)
}

const openSelectProp = ref<string | null>(null)
const selectPos = ref({ top: 0, left: 0, width: 0 })

function openSelectMenu(event: MouseEvent | PointerEvent, prop: string) {
  event.stopPropagation()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  openSelectProp.value = prop
  selectPos.value = { top: rect.bottom + 2, left: rect.left, width: rect.width }
}

function closeSelectMenu() {
  openSelectProp.value = null
}

function pickOption(row: RowData, prop: string, val: string) {
  props.storeEdit?.(row, prop, val)
  openSelectProp.value = null
}
</script>

<template>
  <button
    v-if="model?.rowKind === 'summary'"
    class="flex h-full w-full items-center gap-3 overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-left"
    type="button"
    @pointerdown.stop="toggle?.(model.rowId)"
  >
    <span class="min-w-0 flex-1 truncate text-sm font-mono font-medium leading-5 text-[var(--color-text)]">
      {{ model.row.reference }}
    </span>
    <GridTagBadge
      class="shrink-0"
      :text="String(model.row.statut ?? '')"
      :color-class="statutClass(String(model.row.statut ?? ''))"
    />
    <svg
      class="size-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200"
      :class="{ 'rotate-180': isOpen?.(model.rowId) }"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
    </svg>
  </button>

  <div
    v-else-if="model?.rowKind === 'details'"
    class="grid h-full w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 overflow-auto bg-[var(--color-surface-alt,#fdfaf3)] px-4 pb-4 pt-1 text-sm"
    @click.stop
  >
    <!-- Champs éditables -->
    <template v-for="prop in (editableFields ?? [])" :key="prop">
      <span class="self-center text-[var(--color-text-muted)]">
        {{ fieldLabel?.(prop) ?? prop }}
      </span>

      <span v-if="fieldType?.(prop) === 'select'">
        <button
          class="flex w-full items-center justify-between rounded px-1 py-0.5 text-left text-sm hover:bg-[var(--color-surface)]"
          type="button"
          @pointerdown.stop="openSelectMenu($event, prop)"
        >
          <GridTagBadge
            v-if="useTagBadge(prop, selectBadgeLabel(model.row, prop))"
            :text="selectBadgeLabel(model.row, prop)"
            :color-class="selectBadgeClass(prop, selectBadgeLabel(model.row, prop))"
          />
          <span
            v-else
            :class="isPendingField?.(model.row, prop) ? 'font-medium text-blue-600' : 'text-[var(--color-text)]'"
          >
            {{ selectBadgeLabel(model.row, prop) }}
          </span>
          <svg
            class="ml-2 size-4 shrink-0 text-[var(--color-text-muted)]"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
        <Teleport to="body">
          <template v-if="openSelectProp === prop">
            <div class="fixed inset-0 z-40" @pointerdown="closeSelectMenu" />
            <ul
              class="fixed z-50 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-xl"
              :style="{ top: selectPos.top + 'px', left: selectPos.left + 'px', minWidth: selectPos.width + 'px' }"
            >
              <li v-for="opt in fieldOptions?.(prop)" :key="opt">
                <button
                  class="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-[var(--color-surface-alt,#fdfaf3)]"
                  type="button"
                  @pointerdown.stop="pickOption(model.row, prop, opt)"
                >
                  <GridTagBadge
                    v-if="useTagBadge(prop, opt)"
                    :text="opt"
                    :color-class="selectBadgeClass(prop, opt)"
                  />
                  <span
                    v-else
                    :class="opt === displayValue?.(model.row, prop) ? 'text-[var(--color-primary,#4f46e5)]' : 'text-[var(--color-text)]'"
                  >
                    {{ opt }}
                  </span>
                  <svg
                    v-if="opt === displayValue?.(model.row, prop)"
                    class="size-4 shrink-0 text-[var(--color-primary,#4f46e5)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.03 7.03a1 1 0 01-1.415 0L3.296 8.776a1 1 0 111.414-1.414l4.256 4.255 6.323-6.326a1 1 0 011.415 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </li>
            </ul>
          </template>
        </Teleport>
      </span>

      <span v-else>
        <input
          v-if="isEditing?.(model.rowId, prop)"
          :type="fieldType?.(prop) ?? 'text'"
          class="min-w-0 w-full appearance-none rounded border border-blue-400 bg-white px-1 py-0.5 text-sm text-[var(--color-text)] focus:outline-none"
          :value="editValue?.(model.row, prop)"
          v-focus-end
          @input="onDraftInput"
          @blur="onStoreText(model.row, prop, $event)"
          @keydown.enter.prevent="onStoreText(model.row, prop, $event)"
          @keydown.escape="cancelFieldEdit?.()"
          @click.stop
        />
        <button
          v-else
          class="w-full truncate rounded px-1 py-0.5 text-left hover:bg-[var(--color-surface)]"
          :class="isPendingField?.(model.row, prop) ? 'font-medium text-blue-600' : 'text-[var(--color-text)]'"
          type="button"
          @click="onValueClick($event, model.row, prop)"
        >
          {{ displayValue?.(model.row, prop) || '—' }}
        </button>
      </span>
    </template>

    <!-- Champs lecture seule -->
    <span class="text-[var(--color-text-muted)]">Fiche</span>
    <span class="font-mono text-xs text-[var(--color-text)]">{{ model.row.fiche }}</span>

    <span class="text-[var(--color-text-muted)]">CUMAC</span>
    <span class="text-[var(--color-text)]">{{ formatCurrency?.(model.row.cumac) }}</span>

    <span class="text-[var(--color-text-muted)]">Volume MWh</span>
    <span class="text-[var(--color-text)]">{{ model.row.volumeMwh ?? '—' }}</span>

    <span class="text-[var(--color-text-muted)]">Risque</span>
    <GridTagBadge
      :text="String(model.row.risque ?? '')"
      :color-class="risqueClass(String(model.row.risque ?? ''))"
    />
  </div>

  <MobileGridActionsBar
    v-else-if="model?.rowKind === 'actions'"
    :row="model.row"
    :row-id="model.rowId"
    :commit-row="commitRow!"
    :cancel-row="cancelRow!"
  />
</template>
