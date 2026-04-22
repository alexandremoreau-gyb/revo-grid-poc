<script setup lang="ts">
import { ref } from 'vue'
import GridTooltip from '~/components/ui/GridTooltip.vue'

const props = defineProps<{
  value: string
}>()

const copied = ref(false)

async function copyReference() {
  await navigator.clipboard.writeText(props.value).catch(() => {})
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}
</script>

<template>
  <span
    class="flex h-full w-full min-w-0 cursor-pointer items-center"
    :class="copied ? 'text-emerald-600' : 'text-[var(--color-text)]'"
    @click.stop="copyReference"
  >
    <GridTooltip :text="value" class="truncate text-xs font-mono" />
    <svg
      v-if="copied"
      class="ml-1 h-3 w-3 shrink-0 text-emerald-500"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M2 6l3 3 5-5" />
    </svg>
  </span>
</template>
