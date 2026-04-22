<script setup lang="ts">
import GridTooltip from '~/components/ui/GridTooltip.vue'

withDefaults(defineProps<{
  text: string
  colorClass: string
  tooltip?: boolean
}>(), {
  tooltip: false,
})
</script>

<template>
  <span class="flex h-full min-w-0 max-w-full items-center">
    <span
      class="inline-flex min-w-0 max-w-full items-center rounded-sm px-1.5 py-px text-[11px] font-medium leading-4"
      :class="colorClass"
    >
      <GridTooltip
        v-if="tooltip"
        :text="text"
      />
      <template v-else>
        {{ text }}
      </template>
    </span>
  </span>
</template>
