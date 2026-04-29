<script setup lang="ts">
import { computed } from 'vue'
import { useHistory } from '~/composables/app/useHistory'
import { useHistoryPanel } from '~/composables/app/useHistoryPanel'
import {
  DOSSIER_STATUS_STYLES,
  DOSSIER_STATUS_DEFAULT,
  RISK_STYLES,
  RISK_DEFAULT,
} from '~/utils/grid/cellStyles'

const { open, close } = useHistoryPanel()
const { entries } = useHistory()

function valueBadgeClass(field: string, value: string): string {
  if (field === 'statut') return DOSSIER_STATUS_STYLES[value] ?? DOSSIER_STATUS_DEFAULT
  if (field === 'risque') return RISK_STYLES[value] ?? RISK_DEFAULT
  return 'bg-[var(--color-surface-strong)] text-[var(--color-text)]'
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (diffDays === 0) return `Aujourd'hui ${time}`
  if (diffDays === 1) return `Hier ${time}`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ` ${time}`
}

const grouped = computed(() => {
  const groups: { label: string; items: typeof entries.value }[] = []
  for (const entry of entries.value) {
    const label = formatGroupLabel(entry.at)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(entry)
    else groups.push({ label, items: [entry] })
  }
  return groups
})

function formatGroupLabel(date: Date): string {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}
</script>

<template>
  <Transition name="panel-slide">
    <aside
      v-if="open"
      class="fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
    >
      <!-- Header -->
      <div class="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <div class="flex items-center gap-2">
          <svg
            class="h-4 w-4 text-[var(--color-text-soft)]"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3.5l2 1.5" />
          </svg>
          <span class="text-sm font-semibold text-[var(--color-text)]">Historique</span>
        </div>
        <button
          class="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]"
          @click="close"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>

      <!-- Entries -->
      <div class="flex-1 overflow-y-auto py-2">
        <template v-if="entries.length === 0">
          <p class="px-4 py-8 text-center text-sm text-[var(--color-text-soft)]">Aucune modification pour l'instant.</p>
        </template>

        <template v-for="group in grouped" :key="group.label">
          <p class="sticky top-0 bg-[var(--color-surface)] px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-soft)]">
            {{ group.label }}
          </p>

          <div
            v-for="entry in group.items"
            :key="entry.id"
            class="group px-4 py-2.5 transition-colors hover:bg-[var(--color-surface-strong)]"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-xs font-medium text-[var(--color-text)]">{{ entry.reference }}</p>
                <p class="mt-0.5 text-xs text-[var(--color-text-soft)]">
                  <span class="font-medium text-[var(--color-text)]">{{ entry.user }}</span>
                  · {{ entry.field }}
                </p>
                <div class="mt-1 flex items-center gap-1.5 text-[11px]">
                  <span class="rounded px-1.5 py-0.5 opacity-50 line-through" :class="valueBadgeClass(entry.field, entry.from)">{{ entry.from }}</span>
                  <svg class="h-2.5 w-2.5 shrink-0 text-[var(--color-text-soft)]" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 5h6M6 2.5l2.5 2.5L6 7.5" />
                  </svg>
                  <span class="rounded px-1.5 py-0.5 font-medium" :class="valueBadgeClass(entry.field, entry.to)">{{ entry.to }}</span>
                </div>
              </div>
              <span class="shrink-0 text-[10px] text-[var(--color-text-soft)]">
                {{ entry.at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer note -->
      <div class="shrink-0 border-t border-[var(--color-border)] px-4 py-3">
        <p class="text-[11px] text-[var(--color-text-soft)]">Historique local — session uniquement. En prod, les modifications sont tracées en base.</p>
      </div>
    </aside>
  </Transition>

  <!-- Backdrop (mobile) -->
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-30 bg-black/20 lg:hidden"
      @click="close"
    />
  </Transition>
</template>

<style scoped>
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
