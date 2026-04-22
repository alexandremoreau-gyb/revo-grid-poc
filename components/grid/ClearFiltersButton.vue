<script setup lang="ts">
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] py-1.5 pl-2.5 pr-3 text-sm text-[var(--color-text-muted)] transition hover:border-rose-300 hover:text-rose-500"
    @click="emit('click')"
  >
    <svg class="h-3 w-3" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
      <path d="M2 2l6 6M8 2l-6 6" />
    </svg>
    Réinitialiser
  </button>
</template>
