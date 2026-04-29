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

    <!--
      TODO Export Excel — à brancher :
      - passer les filteredRows en prop (depuis useTablePageRows)
      - utiliser xlsx ou exceljs pour générer le fichier
      - n'exporter que les lignes visibles (filtrées + paginées ou toutes filtrées selon le besoin)
    -->
    <button
      class="ml-auto flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-strong)] py-1.5 pl-2.5 pr-2 text-sm text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      @click="() => console.log('coucou')"
    >
      <svg
        class="h-3.5 w-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 2v8M5 7l3 3 3-3" />
        <path d="M2 12h12" />
      </svg>
      Export Excel
    </button>

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
        Enregistrer
      </button>
    </Transition>
  </div>
</template>
