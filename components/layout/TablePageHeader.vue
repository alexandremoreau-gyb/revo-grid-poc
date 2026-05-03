<script setup lang="ts">
import { useHistoryPanel } from '~/composables/app/useHistoryPanel'

defineProps<{
  eyebrow: string
  title: string
  total: number
  filtered: number
  unitLabel: string
}>()

const { open, toggle } = useHistoryPanel()
</script>

<template>
  <div class="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] pl-14 pr-6 py-4 lg:px-6">
    <div>
      <p class="eyebrow mb-0.5">{{ eyebrow }}</p>
      <h1 class="text-base font-bold text-[var(--color-text)]">{{ title }}</h1>
    </div>

    <div class="flex items-center gap-3">
      <span class="text-xs text-[var(--color-text-soft)]">
        <template v-if="filtered < total">{{ filtered }} / {{ total }} {{ unitLabel }}</template>
        <template v-else>{{ total }} {{ unitLabel }}</template>
      </span>

      <button
        class="flex items-center gap-1.5 rounded-lg border py-1.5 pl-2.5 pr-2 text-sm transition-colors"
        :class="open
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/8 text-[var(--color-primary)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-text)]'"
        @click="toggle"
      >
        <svg
          class="h-3.5 w-3.5"
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
        Historique
      </button>
    </div>
  </div>
</template>
