<script setup lang="ts">
import GridTooltip from '~/components/ui/GridTooltip.vue'

defineProps<{
  value: string
}>()
</script>

<template>
  <span
    class="inline-flex max-w-full items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
  >
    <GridTooltip :text="value" class="truncate" />
  </span>
</template>
