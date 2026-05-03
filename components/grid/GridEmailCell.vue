<script setup lang="ts">
import GridTooltip from '~/components/ui/GridTooltip.vue'

defineProps<{
  value: string
  editable?: boolean
}>()
</script>

<template>
  <a
    v-if="!editable"
    class="flex h-full min-w-0 items-center text-xs text-sky-600 hover:underline dark:text-sky-400"
    :href="`mailto:${value}`"
  >
    <GridTooltip :text="value" />
  </a>
  <span v-else class="flex h-full min-w-0 items-center">
    <GridTooltip :text="value" class="truncate text-xs text-[var(--color-text)]" />
  </span>
</template>
