<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSidebar } from '~/composables/app/useSidebar'

const mobileOpen = ref(false)
const { collapsed } = useSidebar()

const navItems = [
  {
    href: '/',
    label: 'Suivi des dossiers',
    icon: `<rect x="2" y="3" width="12" height="2" rx="1"/><rect x="2" y="7" width="12" height="2" rx="1"/><rect x="2" y="11" width="8" height="2" rx="1"/>`,
  },
  {
    href: '/users',
    label: 'Utilisateurs',
    icon: `<circle cx="8" cy="5" r="2.5"/><path stroke-linecap="round" d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5"/>`,
  },
  {
    href: '/demo',
    label: 'Démo crypto (readonly)',
    icon: `<circle cx="8" cy="8" r="5.5"/><path stroke-linecap="round" d="M6 8h4M8 6v4"/>`,
  },
]

const route = useRoute()

const normalizedPath = computed(() => route.path.replace(/\/$/, '') || '/')

function isActive(href: string) {
  if (href === '/')
    return normalizedPath.value === '/'

  return normalizedPath.value === href || normalizedPath.value.startsWith(`${href}/`)
}
</script>

<template>
  <!-- overlay mobile -->
  <div
    v-if="mobileOpen"
    class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
    @click="mobileOpen = false"
  />

  <!-- mobile trigger -->
  <button
    class="fixed left-2 top-2 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm lg:hidden"
    type="button"
    @click="mobileOpen = !mobileOpen"
  >
    <svg class="h-4 w-4 text-[var(--color-text)]" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <path v-if="mobileOpen" stroke-linecap="round" d="M3 3l10 10M13 3L3 13" />
      <path v-else stroke-linecap="round" d="M2 4h12M2 8h12M2 12h12" />
    </svg>
  </button>

  <!-- sidebar -->
  <aside
    class="fixed left-0 top-0 z-40 flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-strong)] transition-all duration-200"
    :class="[
      collapsed ? 'w-[56px] cursor-pointer' : 'w-[220px]',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
    @click="collapsed && (collapsed = false)"
  >
    <!-- brand -->
    <div
      class="flex h-14 shrink-0 items-center border-b border-[var(--color-border)] px-4"
      :class="collapsed ? 'justify-center' : 'justify-between'"
    >
      <div v-if="!collapsed" class="flex items-center gap-2">
        <!-- Logo texte OTC Flow -->
        <span class="text-sm font-bold tracking-tight text-[var(--color-text)]">
          OTC<span class="text-[var(--color-primary)]">≡</span>FLOW
        </span>
        <span class="rounded-full bg-[var(--color-primary)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
          POC
        </span>
      </div>
      <div v-else class="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
        <span class="text-xs font-bold text-[var(--color-primary)]">O</span>
      </div>

      <button
        v-if="!collapsed"
        class="hidden shrink-0 rounded-lg p-1 text-[var(--color-text-soft)] transition hover:bg-[var(--color-bg-strong)] hover:text-[var(--color-text)] lg:flex"
        type="button"
        @click.stop="collapsed = !collapsed"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M9 2L4 7l5 5" />
        </svg>
      </button>
    </div>

    <!-- caption -->
    <div v-if="!collapsed" class="shrink-0 px-4 pt-4 pb-1">
      <p class="eyebrow">Navigation</p>
    </div>

    <!-- nav -->
    <nav class="flex-1 overflow-y-auto px-2 py-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.href"
        :to="item.href"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
        :class="[
          collapsed ? 'justify-center px-0' : '',
          isActive(item.href)
            ? 'bg-[var(--color-primary)]/8 text-[var(--color-primary)]'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-strong)] hover:text-[var(--color-text)]',
        ]"
        @click="mobileOpen = false"
      >
        <svg
          class="h-4 w-4 shrink-0"
          :class="isActive(item.href) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-soft)]'"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          v-html="item.icon"
        />
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- bas sidebar : bouton collapse -->
    <div class="shrink-0 border-t border-[var(--color-border)] p-2">
      <button
        v-if="collapsed"
        class="flex w-full items-center justify-center rounded-lg p-2 text-[var(--color-text-soft)] transition hover:bg-[var(--color-bg-strong)] hover:text-[var(--color-text)]"
        type="button"
        @click="collapsed = !collapsed"
      >
        <svg class="h-4 w-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M5 2l5 5-5 5" />
        </svg>
      </button>
      <div v-else class="px-1 pb-1">
        <p class="text-[10px] text-[var(--color-text-soft)]">OTC Flow © 2026</p>
      </div>
    </div>
  </aside>
</template>
