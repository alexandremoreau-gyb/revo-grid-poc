<script setup lang="ts">
import GridTooltip from '~/components/ui/GridTooltip.vue'

defineProps<{
  value: string
}>()
</script>

<template>
  <a
    class="flex h-full min-w-0 items-center text-xs text-sky-600 hover:underline dark:text-sky-400"
    :href="`mailto:${value}`"
  >
    <GridTooltip :text="value" />
  </a>
</template>
