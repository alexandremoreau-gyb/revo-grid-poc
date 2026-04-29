<script setup lang="ts">
import { ref } from 'vue'
import type { RowData } from '~/types/grid'
import { USER_COMPANIES, USER_ROLES, USER_STATUTS } from '~/domains/users/constants'

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

const editingField = ref<{ rowId: number; prop: EditableField } | null>(null)

const vFocus = {
  mounted(el: HTMLElement) {
    el.focus()
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

function startEdit(rowId: number, prop: EditableField) {
  editingField.value = { rowId, prop }
}

function commitEdit(row: RowData, prop: EditableField, val: string) {
  ;(row as Record<string, unknown>)[prop] = val
  editingField.value = null
}
</script>

<template>
  <div class="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
    <!-- Header -->
    <div class="flex items-center gap-3 bg-[var(--color-surface-alt,#fdf9ef)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
      <span class="size-4 shrink-0" />
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
        <span class="size-4 shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-surface)]" />
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
              :value="String(row[prop] ?? '')"
              @change="commitEdit(row, prop, ($event.target as HTMLSelectElement).value)"
              @blur="editingField = null"
            >
              <option v-for="opt in FIELD_OPTIONS[prop]" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <button
              v-else
              :data-edit="prop"
              class="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[var(--color-text)] hover:bg-[var(--color-surface)]"
              @click="startEdit(row.id as number, prop)"
            >
              <span class="flex-1">{{ row[prop] ?? '—' }}</span>
              <svg class="size-3 shrink-0 text-[var(--color-text-muted)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5l3 3M4 16l1-4 9.5-9.5a2.121 2.121 0 013 3L8 15.5 4 16z" />
              </svg>
            </button>
          </span>

          <!-- Input texte / email -->
          <span v-else>
            <input
              v-if="isEditing(row.id as number, prop)"
              :data-edit-input="prop"
              :type="FIELD_TYPE[prop]"
              class="w-full rounded border border-blue-400 bg-white px-2 py-1 text-sm text-[var(--color-text)] focus:outline-none"
              :value="String(row[prop] ?? '')"
              @blur="commitEdit(row, prop, ($event.target as HTMLInputElement).value)"
              @keydown.enter="commitEdit(row, prop, ($event.target as HTMLInputElement).value)"
              v-focus
            />
            <button
              v-else
              :data-edit="prop"
              class="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[var(--color-text)] hover:bg-[var(--color-surface)]"
              @click="startEdit(row.id as number, prop)"
            >
              <span class="flex-1 truncate">{{ row[prop] ?? '—' }}</span>
              <svg class="size-3 shrink-0 text-[var(--color-text-muted)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5l3 3M4 16l1-4 9.5-9.5a2.121 2.121 0 013 3L8 15.5 4 16z" />
              </svg>
            </button>
          </span>
        </template>

        <!-- Champs lecture seule -->
        <span class="text-[var(--color-text-muted)]">Créé le</span>
        <span class="text-[var(--color-text)]">{{ formatDate(row.dateCreation) }}</span>

        <span class="text-[var(--color-text-muted)]">Dernier accès</span>
        <span class="text-[var(--color-text)]">{{ formatDate(row.dernierAcces) }}</span>

        <!-- Actions -->
        <span class="text-[var(--color-text-muted)]">Action</span>
        <div class="flex items-center gap-3">
          <button class="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <svg class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 10C3.732 5.943 7.523 3 12 3c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              <circle cx="12" cy="10" r="3" stroke-linecap="round" />
            </svg>
          </button>
          <button class="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <svg class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5l3 3M4 16l1-4 9.5-9.5a2.121 2.121 0 013 3L8 15.5 4 16z" />
            </svg>
          </button>
          <button class="text-[var(--color-text-muted)] hover:text-red-500">
            <svg class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 7h8M9 7V5h2v2m-5 0v9a1 1 0 001 1h6a1 1 0 001-1V7H8z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
