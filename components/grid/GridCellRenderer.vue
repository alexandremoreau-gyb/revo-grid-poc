<script setup lang="ts">
import { computed } from 'vue'

import type { GridColumnVariant } from '~/types/grid'

interface GridCellRendererProps {
  value?: unknown
  model?: Record<string, unknown>
  rowIndex?: number
  colIndex?: number
  colType?: string
  column?: unknown
  data?: unknown
  prop?: string
  type?: string
  variant?: GridColumnVariant
}

const props = defineProps<GridCellRendererProps>()

// Valeur brute : priorité à `value` (usage direct / tests), sinon dérivée de model[prop]
// (revo-grid cellTemplate injecte les données via model + prop, pas via value directement)
const rawValue = computed(() =>
  props.value !== undefined ? props.value : props.model?.[props.prop as string]
)

// Couleur de pastille par tag sémantique — chaque domaine crypto a sa teinte
const TAG_COLOR_MAP: Record<string, string> = {
  DeFi:             'bg-blue-50   text-blue-700   ring-blue-200/70   dark:bg-blue-500/12   dark:text-blue-300   dark:ring-blue-500/25',
  Layer1:           'bg-violet-50 text-violet-700 ring-violet-200/70 dark:bg-violet-500/12 dark:text-violet-300 dark:ring-violet-500/25',
  Layer2:           'bg-purple-50 text-purple-700 ring-purple-200/70 dark:bg-purple-500/12 dark:text-purple-300 dark:ring-purple-500/25',
  NFT:              'bg-pink-50   text-pink-700   ring-pink-200/70   dark:bg-pink-500/12   dark:text-pink-300   dark:ring-pink-500/25',
  Gaming:           'bg-orange-50 text-orange-700 ring-orange-200/70 dark:bg-orange-500/12 dark:text-orange-300 dark:ring-orange-500/25',
  DAO:              'bg-teal-50   text-teal-700   ring-teal-200/70   dark:bg-teal-500/12   dark:text-teal-300   dark:ring-teal-500/25',
  Bridge:           'bg-sky-50    text-sky-700    ring-sky-200/70    dark:bg-sky-500/12    dark:text-sky-300    dark:ring-sky-500/25',
  Oracle:           'bg-amber-50  text-amber-700  ring-amber-200/70  dark:bg-amber-500/12  dark:text-amber-300  dark:ring-amber-500/25',
  DEX:              'bg-indigo-50 text-indigo-700 ring-indigo-200/70 dark:bg-indigo-500/12 dark:text-indigo-300 dark:ring-indigo-500/25',
  Lending:          'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-500/25',
  'Store of Value': 'bg-yellow-50 text-yellow-700 ring-yellow-200/70 dark:bg-yellow-500/12 dark:text-yellow-300 dark:ring-yellow-500/25',
  'Smart Contracts':'bg-cyan-50   text-cyan-700   ring-cyan-200/70   dark:bg-cyan-500/12   dark:text-cyan-300   dark:ring-cyan-500/25',
  Metaverse:        'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/70 dark:bg-fuchsia-500/12 dark:text-fuchsia-300 dark:ring-fuchsia-500/25',
  Storage:          'bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-slate-500/12 dark:text-slate-300 dark:ring-slate-500/25',
  Privacy:          'bg-rose-50   text-rose-700   ring-rose-200/70   dark:bg-rose-500/12   dark:text-rose-300   dark:ring-rose-500/25',
}
const TAG_DEFAULT_COLOR = 'bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-slate-500/12 dark:text-slate-300 dark:ring-slate-500/25'

function tagColor(tag: string): string {
  return TAG_COLOR_MAP[tag] ?? TAG_DEFAULT_COLOR
}

// Couleurs des statuts dossier OTC Flow — style Notion (solide, fort contraste)
const DOSSIER_STATUS_STYLES: Record<string, string> = {
  'Déposé':     'bg-emerald-600 text-white',
  'En cours':   'bg-blue-600 text-white',
  'En attente': 'bg-amber-500 text-white',
  'Incomplet':  'bg-orange-500 text-white',
  'Refusé':     'bg-red-600 text-white',
  'Annulé':     'bg-slate-400 text-white',
}
const DOSSIER_STATUS_DEFAULT = 'bg-slate-400 text-white'

// Couleurs des niveaux de risque — style Notion
const RISK_STYLES: Record<string, string> = {
  'OK':        'bg-emerald-600 text-white',
  'Attention': 'bg-amber-500 text-white',
  'Critique':  'bg-red-600 text-white',
}
const RISK_DEFAULT = 'bg-slate-400 text-white'

const value = computed(() => String(rawValue.value ?? ''))
const numericValue = computed(() => Number(rawValue.value ?? 0))
const dateLocale = 'fr-FR'

// --- price ---
const priceValue = computed(() => {
  const n = numericValue.value
  if (n >= 1000) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  if (n >= 1) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(n)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(n)
})

// --- large number (market cap, volume) ---
const largeNumberValue = computed(() => {
  const n = numericValue.value
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString('en-US')}`
})

// --- trend (change %) ---
const trendIsPositive = computed(() => numericValue.value >= 0)
const trendFormatted = computed(() => {
  const n = numericValue.value
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
})

// --- percent ---
const percentFormatted = computed(() => `${numericValue.value.toFixed(2)}%`)

// --- date ---
const dateValue = computed(() => {
  const d = new Date(String(props.value ?? ''))
  if (Number.isNaN(d.getTime())) return value.value
  return new Intl.DateTimeFormat(dateLocale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(d)
})

// --- tags ---
const tagsArray = computed(() => {
  const v = rawValue.value
  if (Array.isArray(v)) return v as string[]
  if (typeof v === 'string') return v.split(',').map(t => t.trim())
  return []
})

// --- bool ---
const boolValue = computed(() => {
  const v = rawValue.value
  if (typeof v === 'boolean') return v
  return String(v).toLowerCase() === 'true'
})

// --- status ---
const statusClass = computed(() => {
  const n = value.value.toLowerCase()
  if (n.includes('inactive') || n.includes('danger')) return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
  if (n.includes('active') || n.includes('success')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
  if (n.includes('pending') || n.includes('draft')) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
  return 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300'
})

// --- progress ---
const progressWidth = computed(() => `${Math.max(0, Math.min(100, numericValue.value))}%`)
const progressColor = computed(() => {
  const n = numericValue.value
  if (n >= 70) return 'bg-emerald-500'
  if (n >= 40) return 'bg-amber-500'
  return 'bg-rose-500'
})

// --- currency (legacy) ---
const currencyValue = computed(() =>
  new Intl.NumberFormat(dateLocale, {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(numericValue.value),
)
</script>

<template>
  <!-- selection : flex wrapper pour centrer dans la cellule -->
  <span
    v-if="variant === 'selection'"
    class="flex h-full w-full items-center justify-center"
  >
    <span
      class="inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] font-semibold transition-colors"
      :class="value === 'true'
        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
        : 'border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-primary)]'"
    >
      <svg v-if="value === 'true'" viewBox="0 0 10 8" fill="currentColor" class="h-2.5 w-2.5">
        <path d="M1 4l3 3 5-6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </span>

  <!-- id / rank -->
  <span
    v-else-if="variant === 'id'"
    class="inline-flex min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300"
  >
    {{ value }}
  </span>

  <!-- symbol : pill avec un dot d'accent -->
  <span
    v-else-if="variant === 'symbol'"
    class="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)]/8 px-2 py-0.5 text-xs font-bold tracking-wide text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/15"
  >
    <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]/50" />
    {{ value }}
  </span>

  <!-- price -->
  <span
    v-else-if="variant === 'price'"
    class="font-mono text-xs font-semibold text-[var(--color-text)]"
  >
    {{ priceValue }}
  </span>

  <!-- large_number -->
  <span
    v-else-if="variant === 'large_number'"
    class="font-mono text-xs font-medium text-[var(--color-text-muted)]"
  >
    {{ largeNumberValue }}
  </span>

  <!-- trend (24h / 7d change %) -->
  <span
    v-else-if="variant === 'trend'"
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="trendIsPositive
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300'"
  >
    <svg class="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
      <path v-if="trendIsPositive" d="M6 2l4 6H2l4-6z" />
      <path v-else d="M6 10L2 4h8l-4 6z" />
    </svg>
    {{ trendFormatted }}
  </span>

  <!-- percent -->
  <span
    v-else-if="variant === 'percent'"
    class="font-mono text-xs font-medium text-[var(--color-text-muted)]"
  >
    {{ percentFormatted }}
  </span>

  <!-- tags : pastilles colorées par domaine, max 2 visibles + badge de débordement -->
  <span
    v-else-if="variant === 'tags'"
    class="flex h-full items-center gap-1 overflow-hidden"
  >
    <span
      v-for="tag in tagsArray.slice(0, 2)"
      :key="tag"
      class="shrink-0 rounded-full px-2.5 py-px text-[11px] font-medium leading-[18px] ring-1 ring-inset"
      :class="tagColor(tag)"
    >
      {{ tag }}
    </span>
    <span
      v-if="tagsArray.length > 2"
      class="shrink-0 rounded-full bg-slate-100 px-2 py-px text-[11px] font-medium leading-[18px] text-slate-500 ring-1 ring-inset ring-slate-200/70 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-500/25"
    >
      +{{ tagsArray.length - 2 }}
    </span>
  </span>

  <!-- bool : badge circulaire avec icône checkmark ou croix -->
  <span
    v-else-if="variant === 'bool'"
    class="inline-flex items-center justify-center"
  >
    <span
      class="flex h-5 w-5 items-center justify-center rounded-full ring-1"
      :class="boolValue
        ? 'bg-emerald-50 text-emerald-600 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30'
        : 'bg-slate-100 text-slate-400 ring-slate-200/80 dark:bg-slate-700 dark:text-slate-500 dark:ring-slate-500/30'"
    >
      <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path v-if="boolValue" d="M2 6.5l2.5 2.5 5.5-6" />
        <path v-else d="M3 3l6 6M9 3l-6 6" />
      </svg>
    </span>
  </span>

  <!-- status -->
  <span
    v-else-if="variant === 'status'"
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="statusClass"
  >
    {{ value }}
  </span>

  <!-- currency (legacy) -->
  <span
    v-else-if="variant === 'currency'"
    class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
  >
    {{ currencyValue }}
  </span>

  <!-- date -->
  <span
    v-else-if="variant === 'date'"
    class="text-xs text-[var(--color-text-muted)]"
  >
    {{ dateValue }}
  </span>

  <!-- progress (score) -->
  <span
    v-else-if="variant === 'progress'"
    class="flex min-w-28 items-center gap-2.5"
  >
    <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <span
        class="block h-full rounded-full transition-all"
        :class="progressColor"
        :style="{ width: progressWidth }"
      />
    </span>
    <span class="w-7 text-right text-xs font-semibold text-[var(--color-text-muted)]">
      {{ Math.round(numericValue) }}
    </span>
  </span>

  <!-- email -->
  <a
    v-else-if="variant === 'email'"
    class="truncate text-xs text-sky-600 hover:underline dark:text-sky-400"
    :href="`mailto:${value}`"
  >
    {{ value }}
  </a>

  <!-- company -->
  <span
    v-else-if="variant === 'company'"
    class="inline-flex max-w-full items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
  >
    <span class="truncate">{{ value }}</span>
  </span>

  <!-- actions -->
  <button
    v-else-if="variant === 'actions'"
    class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
    type="button"
  >
    Edit
  </button>

  <!-- dossier-status : badge OTC Flow style Notion — compact, fort contraste -->
  <span v-else-if="variant === 'dossier-status'" class="flex h-full items-center">
    <span
      class="inline-flex w-fit items-center rounded-sm px-1.5 py-px text-[11px] font-medium leading-4"
      :class="DOSSIER_STATUS_STYLES[value] ?? DOSSIER_STATUS_DEFAULT"
    >
      {{ value }}
    </span>
  </span>

  <!-- risk : badge compact style Notion -->
  <span v-else-if="variant === 'risk'" class="flex h-full items-center">
    <span
      class="inline-flex w-fit items-center rounded-sm px-1.5 py-px text-[11px] font-medium leading-4"
      :class="RISK_STYLES[value] ?? RISK_DEFAULT"
    >
      {{ value }}
    </span>
  </span>

  <!-- default -->
  <span v-else class="truncate text-xs text-[var(--color-text)]">
    {{ value }}
  </span>
</template>
