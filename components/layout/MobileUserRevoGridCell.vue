<!--
  MobileUserRevoGridCell — renderer Vue pour une cellule de MobileUserRevoGrid

  Ce composant est injecté dans RevoGrid via VGridVueTemplate. RevoGrid lui passe
  la ligne courante via la prop `model` (de type MobileGridRow).

  Selon model.rowKind, le composant rend l'un des trois états :
    • summary  — bouton accordéon (nom + flèche)
    • details  — grille label/valeur avec champs éditables (tap-to-edit)
    • actions  — barre Enregistrer / Annuler (visible uniquement si pendingChanges)

  Toutes les fonctions d'état (toggle, startEdit, commitRow…) sont passées en props
  par le parent MobileUserRevoGrid, qui reste la source de vérité.

  Directive vFocusEnd : focus synchrone (pour ne pas casser le contexte de geste iOS)
  + setSelectionRange dans requestAnimationFrame (pour que la valeur soit bindée avant
  de placer le curseur en fin de texte).
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { RowData } from '~/types/grid'
import MobileGridActionsBar from '~/components/layout/MobileGridActionsBar.vue'

type MobileGridRow = {
  id: string
  rowKind: 'summary' | 'details' | 'actions'
  row: RowData
  rowId: number
}

interface Props {
  model?: MobileGridRow
  editableFields?: string[]
  toggle?: (rowId: number) => void
  isOpen?: (rowId: number) => boolean
  fieldLabel?: (prop: string) => string
  fieldType?: (prop: string) => 'text' | 'email' | 'number' | 'date' | 'select'
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
  formatDate?: (val: unknown) => string
}

const props = defineProps<Props>()

const TEXT_SELECTION_INPUT_TYPES = new Set(['', 'email', 'password', 'search', 'tel', 'text', 'url'])

const vFocusEnd = {
  mounted(el: HTMLInputElement) {
    el.focus({ preventScroll: true })
    requestAnimationFrame(() => {
      if (!TEXT_SELECTION_INPUT_TYPES.has(el.type)) return
      el.setSelectionRange(el.value.length, el.value.length)
    })
  },
}

function rowFullName(row: RowData): string {
  return `${row.prenom ?? ''} ${row.nom ?? ''}`.trim()
}

function onValueClick(event: MouseEvent, row: RowData, prop: string) {
  event.stopPropagation()
  props.startEdit?.(props.model!.rowId, prop, String(row[prop] ?? ''))
}

function onStoreText(row: RowData, prop: string, event: Event) {
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
    <span class="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-[var(--color-text)]">
      {{ rowFullName(model.row) }}
    </span>
    <svg
      class="size-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200"
      :class="{ 'rotate-180': isOpen?.(model.rowId) }"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
    </svg>
  </button>

  <div
    v-else-if="model?.rowKind === 'details'"
    class="grid h-full w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 bg-[var(--color-surface-alt,#fdfaf3)] px-4 pb-4 pt-1 text-sm"
    @click.stop
  >
    <template v-for="prop in (editableFields ?? [])" :key="prop">
      <span class="self-center text-[var(--color-text-muted)]">
        {{ fieldLabel?.(prop) ?? prop }}
      </span>

      <span v-if="fieldType?.(prop) === 'select'">
        <button
          :data-edit="prop"
          class="w-full rounded px-1 py-0.5 text-left text-sm hover:bg-[var(--color-surface)]"
          :class="isPendingField?.(model.row, prop) ? 'font-medium text-blue-600' : 'text-[var(--color-text)]'"
          type="button"
          @pointerdown.stop="openSelectMenu($event, prop)"
        >
          {{ displayValue?.(model.row, prop) || '—' }}
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
                  class="w-full px-3 py-2.5 text-left text-sm transition hover:bg-[var(--color-surface-alt,#fdfaf3)]"
                  :class="opt === displayValue?.(model.row, prop) ? 'font-medium text-[var(--color-primary,#4f46e5)]' : 'text-[var(--color-text)]'"
                  type="button"
                  @pointerdown.stop="pickOption(model.row, prop, opt)"
                >
                  {{ opt }}
                </button>
              </li>
            </ul>
          </template>
        </Teleport>
      </span>

      <span v-else>
        <input
          v-if="isEditing?.(model.rowId, prop)"
          :data-edit-input="prop"
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
          :data-edit="prop"
          class="w-full truncate rounded px-1 py-0.5 text-left hover:bg-[var(--color-surface)]"
          :class="isPendingField?.(model.row, prop) ? 'font-medium text-blue-600' : 'text-[var(--color-text)]'"
          type="button"
          @click="onValueClick($event, model.row, prop)"
        >
          {{ displayValue?.(model.row, prop) || '—' }}
        </button>
      </span>
    </template>

    <span class="text-[var(--color-text-muted)]">Créé le</span>
    <span class="text-[var(--color-text)]">{{ formatDate?.(model.row.dateCreation) }}</span>

    <span class="text-[var(--color-text-muted)]">Dernier accès</span>
    <span class="text-[var(--color-text)]">{{ formatDate?.(model.row.dernierAcces) }}</span>
  </div>

  <MobileGridActionsBar
    v-else-if="model?.rowKind === 'actions'"
    :row="model.row"
    :row-id="model.rowId"
    :commit-row="commitRow!"
    :cancel-row="cancelRow!"
  />
</template>
