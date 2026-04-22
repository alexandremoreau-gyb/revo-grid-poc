<script setup lang="ts">
defineProps<{
  hasPendingEdits: boolean
  searchFieldsCount: number
  searchPlaceholder: string
}>()

const search = defineModel<string>('search', { required: true })

defineEmits<{
  confirm: []
}>()
</script>

<template>
  <div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-6 py-3">
    <div v-if="searchFieldsCount > 0" class="relative min-w-52 flex-1 max-w-xs">
      <svg
        class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-soft)]"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="6.5" cy="6.5" r="4.5" />
        <path stroke-linecap="round" d="M10.5 10.5l3 3" />
      </svg>

      <input
        v-model="search"
        type="text"
        :placeholder="searchPlaceholder"
        class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-strong)] py-1.5 pl-8 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] focus:outline-none"
      />
    </div>

    <slot name="filters" />

    <Transition name="fade-slide">
      <button
        v-if="hasPendingEdits"
        class="ml-auto flex items-center gap-1.5 rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
        @click="$emit('confirm')"
      >
        <svg
          class="h-3.5 w-3.5"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2.5 8.5l3.5 3.5 7-7" />
        </svg>
        Valider
      </button>
    </Transition>
  </div>
</template>
