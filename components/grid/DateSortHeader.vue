<script setup lang="ts">
import { useDateSort } from '~/composables/grid/useDateSort'

withDefaults(defineProps<{ align?: 'start' | 'center' }>(), {
  align: 'start',
})

const { sortDir, toggle } = useDateSort()
</script>

<template>
  <button
    class="flex h-full w-full items-center gap-1 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
    :class="align === 'center' ? 'justify-center text-center' : 'justify-start text-left'"
    type="button"
    @click.stop="toggle"
  >
    DATE
    <svg class="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="currentColor">
      <path v-if="sortDir === 'desc'" d="M6 10L2 4h8l-4 6z" />
      <path v-else d="M6 2l4 6H2L6 2z" />
    </svg>
  </button>
</template>
