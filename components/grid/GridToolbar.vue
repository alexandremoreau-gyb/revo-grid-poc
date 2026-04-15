<script setup lang="ts">
/**
 * GridToolbar.vue
 * ---------------
 * Barre d'actions legere pour la grille.
 * Gere la recherche globale et expose des hooks optionnels
 * pour clear/refresh sans imposer une orchestration unique aux pages.
 */
interface Props {
  modelValue: string
  filterActive?: boolean
  searchLabel?: string
  filterLabel?: string
  resultCount?: number
  showClear?: boolean
  showRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  filterActive: false,
  resultCount: undefined,
  showClear: false,
  showRefresh: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  filter: [active: boolean]
  clear: []
  refresh: []
}>()

const { t } = useI18n()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function clearSearch() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
  >
    <div
      class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
    >
      <label class="flex-1">
        <span class="sr-only">{{
          searchLabel ?? t('dashboard.grid.search')
        }}</span>
        <input
          :value="modelValue"
          class="w-full rounded-[18px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          :placeholder="searchLabel ?? t('dashboard.grid.search')"
          type="search"
          @input="onInput"
        />
      </label>

      <div class="flex flex-wrap items-center gap-2">
        <button
          class="rounded-[18px] border px-4 py-3 text-sm font-medium transition"
          :class="
            filterActive
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] bg-transparent text-[var(--color-text)]'
          "
          type="button"
          @click="emit('filter', !filterActive)"
        >
          {{ filterLabel ?? t('dashboard.grid.filter') }}
        </button>

        <button
          v-if="showClear"
          class="rounded-[18px] border border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-text)] transition"
          type="button"
          @click="clearSearch"
        >
          {{ t('common.cancel') }}
        </button>

        <button
          v-if="showRefresh"
          class="rounded-[18px] border border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-text)] transition"
          type="button"
          @click="emit('refresh')"
        >
          {{ t('common.refresh') }}
        </button>
      </div>
    </div>

    <div
      v-if="typeof resultCount === 'number'"
      class="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]"
    >
      {{ t('common.rowsCount', { count: resultCount }) }}
      <span
        v-if="modelValue"
        class="rounded-full bg-[var(--color-surface-muted)] px-2 py-1 text-xs font-medium text-[var(--color-text)]"
      >
        {{ modelValue }}
      </span>

      <span
        v-if="filterActive"
        class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
      >
        {{ filterLabel ?? t('dashboard.grid.filter') }}
      </span>
    </div>
  </div>
</template>
