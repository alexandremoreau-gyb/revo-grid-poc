<script setup lang="ts">
import { computed } from 'vue'
import GridTooltip from '~/components/ui/GridTooltip.vue'

const props = withDefaults(defineProps<{ name?: string, align?: 'start' | 'center' }>(), {
  align: 'start',
})

const alignClass = computed(() => props.align === 'center' ? 'justify-center text-center' : 'justify-start text-left')
const paddingClass = computed(() => props.align === 'center' ? 'px-2' : '')
</script>

<template>
  <span
    class="flex h-full w-full items-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
    :class="[alignClass, paddingClass]"
  >
    <GridTooltip :text="name ?? ''" />
  </span>
</template>
