<script setup lang="ts">
import GridTooltip from '~/components/ui/GridTooltip.vue'

defineProps<{ name?: string }>()
</script>

<template>
  <span class="flex h-full w-full items-center px-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
    <GridTooltip :text="name ?? ''" />
  </span>
</template>
