<script setup lang="ts">
import NavBar from '~/components/navigation/NavBar.vue'
import { useSidebar } from '~/composables/useSidebar'

const { collapsed } = useSidebar()
</script>

<template>
  <div class="flex min-h-screen">
    <NavBar />
    <main
      class="flex-1 min-w-0 p-4 transition-all duration-200"
      :class="collapsed ? 'lg:pl-[64px]' : 'lg:pl-[228px]'"
    >
      <slot />
    </main>
  </div>
</template>
