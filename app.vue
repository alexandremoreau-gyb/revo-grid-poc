<script setup lang="ts">
import AppToast from '~/components/ui/AppToast.vue'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ClientOnly>
    <AppToast />
  </ClientOnly>
</template>
