<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  total: number
  filtered: number
  unitLabel: string
}>()
</script>

<template>
  <div class="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
    <div>
      <p class="eyebrow mb-0.5">{{ eyebrow }}</p>
      <h1 class="text-base font-bold text-[var(--color-text)]">{{ title }}</h1>
    </div>

    <span class="text-xs text-[var(--color-text-soft)]">
      <template v-if="filtered < total">{{ filtered }} / {{ total }} {{ unitLabel }}</template>
      <template v-else>{{ total }} {{ unitLabel }}</template>
    </span>
  </div>
</template>
