<script setup lang="ts">
import { ref } from 'vue'


const showTooltip = ref(false)
const el = ref<HTMLElement | null>(null)
const props = defineProps<{ text: string }>()
const tooltipStyle = ref({ top: '0px', left: '0px' })

function onMouseEnter() {
  if (!el.value || el.value.scrollWidth <= el.value.clientWidth) return
  const rect = el.value.getBoundingClientRect()
  tooltipStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
  }
  showTooltip.value = true
}
</script>

<template>
  <span
    ref="el"
    class="block w-full truncate"
    @mouseenter="onMouseEnter"
    @mouseleave="showTooltip = false"
  >
    {{ text }}
  </span>
  <Teleport to="body">
    <span
      v-if="showTooltip"
      :style="tooltipStyle"
      class="pointer-events-none fixed z-[9999] max-w-xs rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg animate-tooltip-fade"
    >
      {{ text }}
    </span>
  </Teleport>
</template>

<style scoped>
@keyframes tooltip-fade {
  0% { opacity: 0; }
  30% { opacity: 0; }
  100% { opacity: 1; }
}

.animate-tooltip-fade {
  animation: tooltip-fade 0.35s ease forwards;
}
</style>
