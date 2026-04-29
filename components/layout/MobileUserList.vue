<script setup lang="ts">
import { ref } from 'vue'
import type { RowData } from '~/types/grid'
import { USER_COMPANIES, USER_ROLES, USER_STATUTS } from '~/domains/users/constants'
import { useToast } from '~/composables/app/useToast'

interface Props {
  rows: RowData[]
}

const props = defineProps<Props>()

// --- tap-to-edit ---

type EditableField = 'nom' | 'prenom' | 'email' | 'role' | 'statut' | 'societe'

const FIELD_TYPE: Record<EditableField, 'text' | 'email' | 'select'> = {
  nom: 'text',
  prenom: 'text',
  email: 'email',
  role: 'select',
  statut: 'select',
  societe: 'select',
}

const FIELD_OPTIONS: Partial<Record<EditableField, readonly string[]>> = {
  role: USER_ROLES,
  statut: USER_STATUTS,
  societe: USER_COMPANIES,
}

// Active field being typed in right now
const { show: showToast } = useToast()

const editingField = ref<{ rowId: number; prop: EditableField } | null>(null)
const draftValue = ref<string>('')

// Unsaved changes per row — only populated when value differs from original
const pendingChanges = ref<Record<number, Partial<Record<EditableField, string>>>>({})

const vFocus = {
  mounted(el: HTMLElement) {
    el.focus({ preventScroll: true })
  },
}

const openId = ref<number | null>(null)

function toggle(id: number) {
  openId.value = openId.value === id ? null : id
  editingField.value = null
}

function formatDate(val: unknown): string {
  if (!val) return '—'
  const d = new Date(String(val))
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function isEditing(rowId: number, prop: EditableField): boolean {
  return editingField.value?.rowId === rowId && editingField.value?.prop === prop
}

function displayValue(row: RowData, prop: EditableField): string {
  return pendingChanges.value[row.id as number]?.[prop] ?? String(row[prop] ?? '')
}

function hasPendingChanges(rowId: number): boolean {
  const changes = pendingChanges.value[rowId]
  return !!changes && Object.keys(changes).length > 0
}

// Also true while the user is actively typing a diff (before blur stores it)
function liveHasPendingChanges(row: RowData): boolean {
  if (hasPendingChanges(row.id as number)) return true
  if (editingField.value?.rowId !== (row.id as number)) return false
  return draftValue.value !== String(row[editingField.value.prop] ?? '')
}

function startEdit(rowId: number, prop: EditableField, originalVal: string) {
  editingField.value = { rowId, prop }
  // Resume from pending draft if any, otherwise start from original value
  draftValue.value = pendingChanges.value[rowId]?.[prop] ?? originalVal
}

function storeEdit(row: RowData, prop: EditableField, val: string) {
  const rowId = row.id as number
  const originalVal = String(row[prop] ?? '')
  if (val === originalVal) {
    // Value reverted to original — remove from pending
    if (pendingChanges.value[rowId]) {
      delete pendingChanges.value[rowId]![prop]
      if (Object.keys(pendingChanges.value[rowId]!).length === 0) {
        delete pendingChanges.value[rowId]
      }
    }
  } else {
    if (!pendingChanges.value[rowId]) pendingChanges.value[rowId] = {}
    pendingChanges.value[rowId]![prop] = val
  }
  editingField.value = null
}

function cancelFieldEdit() {
  editingField.value = null
}

function commitRow(row: RowData) {
  const rowId = row.id as number
  const changes = pendingChanges.value[rowId]
  if (changes) {
    for (const [prop, val] of Object.entries(changes)) {
      row[prop as EditableField] = val
    }
    delete pendingChanges.value[rowId]
    showToast('Modifications enregistrées')
  }
}

function cancelRow(rowId: number) {
  delete pendingChanges.value[rowId]
  editingField.value = null
}
</script>

<template>
  <div class="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
    <!-- Header -->
    <div class="flex items-center gap-3 bg-[var(--color-surface-alt,#fdf9ef)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
      <span>Nom utilisateur</span>
    </div>

    <!-- Rows -->
    <div
      v-for="row in props.rows"
      :key="(row.id as number)"
      class="border-t border-[var(--color-border)]"
    >
      <!-- Row header -->
      <button
        class="flex w-full items-center gap-3 px-4 py-3 text-left"
        @click="toggle(row.id as number)"
      >
        <span class="flex-1 text-sm font-medium text-[var(--color-text)]">
          {{ row.prenom }} {{ row.nom }}
        </span>
        <svg
          class="size-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200"
          :class="{ 'rotate-180': openId === (row.id as number) }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Expanded details -->
      <div
        v-if="openId === (row.id as number)"
        class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 bg-[var(--color-surface-alt,#fdfaf3)] px-4 pb-4 pt-1 text-sm"
      >
        <!-- Champs éditables -->
        <template v-for="prop in (['nom', 'prenom', 'email', 'role', 'statut', 'societe'] as const)" :key="prop">
          <span class="self-center text-[var(--color-text-muted)] capitalize">
            {{ prop === 'societe' ? 'Société' : prop }}
          </span>

          <!-- Select -->
          <span v-if="FIELD_TYPE[prop] === 'select'">
            <select
              v-if="isEditing(row.id as number, prop)"
              :data-edit-input="prop"
              class="w-full rounded border border-blue-400 bg-white px-2 py-1 text-sm text-[var(--color-text)] focus:outline-none"
              :value="draftValue"
              @change="storeEdit(row, prop, ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="opt in FIELD_OPTIONS[prop]" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <button
              v-else
              :data-edit="prop"
              class="w-full rounded px-1 py-0.5 text-left hover:bg-[var(--color-surface)]"
              :class="pendingChanges[row.id as number]?.[prop] !== undefined ? 'text-blue-600 font-medium' : 'text-[var(--color-text)]'"
              @click="startEdit(row.id as number, prop, String(row[prop] ?? ''))"
            >
              {{ displayValue(row, prop) || '—' }}
            </button>
          </span>

          <!-- Input texte / email -->
          <span v-else>
            <input
              v-if="isEditing(row.id as number, prop)"
              :data-edit-input="prop"
              :type="FIELD_TYPE[prop]"
              class="min-w-0 w-full rounded border border-blue-400 bg-white px-2 py-1 text-sm text-[var(--color-text)] focus:outline-none"
              v-model="draftValue"
              @blur="storeEdit(row, prop, draftValue)"
              @keydown.enter.prevent="storeEdit(row, prop, draftValue)"
              @keydown.escape="cancelFieldEdit()"
              v-focus
            />
            <button
              v-else
              :data-edit="prop"
              class="w-full truncate rounded px-1 py-0.5 text-left hover:bg-[var(--color-surface)]"
              :class="pendingChanges[row.id as number]?.[prop] !== undefined ? 'text-blue-600 font-medium' : 'text-[var(--color-text)]'"
              @click="startEdit(row.id as number, prop, String(row[prop] ?? ''))"
            >
              {{ displayValue(row, prop) || '—' }}
            </button>
          </span>
        </template>

        <!-- Champs lecture seule -->
        <span class="text-[var(--color-text-muted)]">Créé le</span>
        <span class="text-[var(--color-text)]">{{ formatDate(row.dateCreation) }}</span>

        <span class="text-[var(--color-text-muted)]">Dernier accès</span>
        <span class="text-[var(--color-text)]">{{ formatDate(row.dernierAcces) }}</span>

        <!-- Save bar — appears only when there are pending diffs -->
        <div
          v-if="liveHasPendingChanges(row)"
          class="col-span-2 mt-2 flex gap-2 border-t border-[var(--color-border)] pt-3"
        >
          <button
            data-row-confirm
            class="flex-1 rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
            @click="commitRow(row)"
          >
            Enregistrer
          </button>
          <button
            data-row-cancel
            class="flex-1 rounded-lg border border-rose-300 py-1.5 px-3 text-sm text-rose-500 transition hover:bg-rose-50"
            @click="cancelRow(row.id as number)"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
