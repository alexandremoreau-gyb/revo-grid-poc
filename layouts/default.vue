<script setup lang="ts">
import NavBar from '~/components/navigation/NavBar.vue'
import { useSidebar } from '~/composables/app/useSidebar'

const { collapsed } = useSidebar()
</script>

<template>
  <div class="flex min-h-screen bg-[var(--color-bg)]">
    <NavBar />
    <main
      class="flex flex-1 min-w-0 flex-col bg-[var(--color-surface)] p-4 transition-all duration-200"
      :class="collapsed ? 'lg:pl-[64px]' : 'lg:pl-[228px]'"
    >
      <slot />
    </main>
  </div>
</template>
