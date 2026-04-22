<script setup lang="ts">
import { progressWidth } from '~/utils/grid/cellFormatters'
import { progressColor as getProgressColor } from '~/utils/grid/cellStyles'

defineProps<{
  value: number
}>()
</script>

<template>
  <span class="flex min-w-28 items-center gap-2.5">
    <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <span
        class="block h-full rounded-full transition-all"
        :class="getProgressColor(value)"
        :style="{ width: progressWidth(value) }"
      />
    </span>
    <span class="w-7 text-right text-xs font-semibold text-[var(--color-text-muted)]">
      {{ Math.round(value) }}
    </span>
  </span>
</template>
