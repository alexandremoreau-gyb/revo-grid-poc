<script setup lang="ts">
import { computed } from 'vue'
import { toBoolean } from '~/utils/grid/cellFormatters'

const props = defineProps<{
  value: unknown
}>()

const boolValue = computed(() => toBoolean(props.value))
</script>

<template>
  <span class="inline-flex items-center justify-center">
    <span
      class="flex h-5 w-5 items-center justify-center rounded-full ring-1"
      :class="boolValue
        ? 'bg-emerald-50 text-emerald-600 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30'
        : 'bg-slate-100 text-slate-400 ring-slate-200/80 dark:bg-slate-700 dark:text-slate-500 dark:ring-slate-500/30'"
    >
      <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path v-if="boolValue" d="M2 6.5l2.5 2.5 5.5-6" />
        <path v-else d="M3 3l6 6M9 3l-6 6" />
      </svg>
    </span>
  </span>
</template>
