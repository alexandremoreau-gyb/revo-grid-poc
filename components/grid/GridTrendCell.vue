<script setup lang="ts">
import { computed } from 'vue'
import { formatTrend } from '~/utils/grid/cellFormatters'

const props = defineProps<{
  value: number
}>()

const isPositive = computed(() => props.value >= 0)
const formatted = computed(() => formatTrend(props.value))
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="isPositive
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300'"
  >
    <svg class="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
      <path v-if="isPositive" d="M6 2l4 6H2l4-6z" />
      <path v-else d="M6 10L2 4h8l-4 6z" />
    </svg>
    {{ formatted }}
  </span>
</template>
