<script setup lang="ts">
import { computed } from 'vue'
import { tagColor } from '~/utils/grid/cellStyles'
import { normalizeTags } from '~/utils/grid/cellFormatters'

const props = defineProps<{
  value: unknown
}>()

const tags = computed(() => normalizeTags(props.value))
</script>

<template>
  <span class="flex h-full items-center gap-1 overflow-hidden">
    <span
      v-for="tag in tags.slice(0, 2)"
      :key="tag"
      class="shrink-0 rounded-full px-2.5 py-px text-[11px] font-medium leading-[18px] ring-1 ring-inset"
      :class="tagColor(tag)"
    >
      {{ tag }}
    </span>
    <span
      v-if="tags.length > 2"
      class="shrink-0 rounded-full bg-slate-100 px-2 py-px text-[11px] font-medium leading-[18px] text-slate-500 ring-1 ring-inset ring-slate-200/70 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-500/25"
    >
      +{{ tags.length - 2 }}
    </span>
  </span>
</template>
