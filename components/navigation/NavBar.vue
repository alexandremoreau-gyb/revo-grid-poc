<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '~/composables/useTheme'
import { useSidebar } from '~/composables/useSidebar'

const mobileOpen = ref(false)
const { collapsed } = useSidebar()
const { isDark, toggle } = useTheme()
const { locale, setLocale } = useI18n()

function switchLocale() {
  setLocale(locale.value === 'fr' ? 'en' : 'fr')
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
    class="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm lg:hidden"
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
    class="fixed left-0 top-0 z-40 flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] transition-all duration-200"
    :class="[
      collapsed ? 'w-[56px]' : 'w-[220px]',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- brand -->
    <div
      class="flex h-14 shrink-0 items-center border-b border-[var(--color-border)] px-3.5"
      :class="collapsed ? 'justify-center' : 'justify-between'"
    >
      <div v-if="!collapsed" class="flex items-center gap-2 overflow-hidden">
        <span class="whitespace-nowrap text-sm font-bold tracking-tight text-[var(--color-text)]">
          Grid<span class="text-[var(--color-primary)]">Lab</span>
        </span>
        <span class="rounded-full bg-[var(--color-primary)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
          rv-grid
        </span>
      </div>

      <div v-else class="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
        <span class="text-xs font-bold text-[var(--color-primary)]">G</span>
      </div>

      <!-- collapse toggle (desktop only) -->
      <button
        class="hidden shrink-0 rounded-lg p-1 text-[var(--color-text-soft)] transition hover:bg-[var(--color-bg-strong)] hover:text-[var(--color-text)] lg:flex"
        :class="collapsed ? 'hidden' : ''"
        type="button"
        @click="collapsed = !collapsed"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M9 2L4 7l5 5" />
        </svg>
      </button>
    </div>

    <!-- nav items (placeholder) -->
    <nav class="flex-1 overflow-y-auto px-2 py-3">
      <a
        href="/"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-text)] bg-[var(--color-primary)]/8"
        :class="collapsed ? 'justify-center px-0' : ''"
      >
        <svg class="h-4 w-4 shrink-0 text-[var(--color-primary)]" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="1" y="1" width="6" height="6" rx="1.5" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" />
        </svg>
        <span v-if="!collapsed" class="truncate">Crypto Grid</span>
      </a>
    </nav>

    <!-- bottom controls -->
    <div class="shrink-0 border-t border-[var(--color-border)] p-2 space-y-1">
      <!-- theme toggle -->
      <button
        class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-strong)] hover:text-[var(--color-text)]"
        :class="collapsed ? 'justify-center px-0' : ''"
        type="button"
        @click="toggle"
      >
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
          <path v-if="isDark" stroke-linecap="round" stroke-linejoin="round" d="M8 1v1M8 14v1M1 8h1M14 8h1M3.05 3.05l.7.7M12.24 12.24l.7.7M12.24 3.75l-.7.7M3.76 12.24l-.7.7M8 5a3 3 0 100 6 3 3 0 000-6z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" d="M14 9.5A6 6 0 016.5 2a6 6 0 000 12 6 6 0 007.5-4.5z" />
        </svg>
        <span v-if="!collapsed" class="truncate text-xs font-medium">
          {{ isDark ? 'Mode clair' : 'Mode sombre' }}
        </span>
      </button>

      <!-- locale toggle -->
      <button
        class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-strong)] hover:text-[var(--color-text)]"
        :class="collapsed ? 'justify-center px-0' : ''"
        type="button"
        @click="switchLocale"
      >
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="8" cy="8" r="6.5" />
          <path stroke-linecap="round" d="M8 1.5c-2 2-3 4-3 6.5s1 4.5 3 6.5M8 1.5c2 2 3 4 3 6.5s-1 4.5-3 6.5M1.5 8h13" />
        </svg>
        <span v-if="!collapsed" class="truncate text-xs font-medium uppercase tracking-wide">
          {{ locale === 'fr' ? 'EN' : 'FR' }}
        </span>
      </button>
    </div>
  </aside>
</template>
