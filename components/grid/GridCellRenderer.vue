<script setup lang="ts">
import { computed } from 'vue'
import type { GridColumnVariant } from '~/types/grid'
import GridTooltip from '~/components/ui/GridTooltip.vue'
import GridBoolCell from '~/components/grid/GridBoolCell.vue'
import GridTagBadge from '~/components/grid/GridTagBadge.vue'
import GridTagsCell from '~/components/grid/GridTagsCell.vue'
import GridEmailCell from '~/components/grid/GridEmailCell.vue'
import GridTrendCell from '~/components/grid/GridTrendCell.vue'
import GridCompanyCell from '~/components/grid/GridCompanyCell.vue'
import GridProgressCell from '~/components/grid/GridProgressCell.vue'
import GridReferenceCell from '~/components/grid/GridReferenceCell.vue'
import {
  formatCurrency,
  formatDate,
  formatLargeNumber,
  formatPercent,
  formatPrice,
  toNumber,
} from '~/utils/grid/cellFormatters'
import {
  DOSSIER_STATUS_DEFAULT,
  DOSSIER_STATUS_STYLES,
  RISK_DEFAULT,
  RISK_STYLES,
  USER_ROLE_DEFAULT,
  USER_ROLE_STYLES,
  USER_STATUS_DEFAULT,
  USER_STATUS_STYLES,
  genericStatusClass,
} from '~/utils/grid/cellStyles'

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
  centered?: boolean
  editable?: boolean
}

const props = defineProps<GridCellRendererProps>()

// Valeur brute : priorité à `value` (usage direct / tests), sinon dérivée de model[prop]
// (revo-grid cellTemplate injecte les données via model + prop, pas via value directement)
const rawValue = computed(() =>
  props.value !== undefined ? props.value : props.model?.[props.prop as string]
)

const value = computed(() => String(rawValue.value ?? ''))

const numericValue = computed(() => toNumber(rawValue.value))
const priceValue = computed(() => formatPrice(numericValue.value))
const largeNumberValue = computed(() => formatLargeNumber(numericValue.value))
const percentFormatted = computed(() => formatPercent(numericValue.value))
const dateValue = computed(() => formatDate(value.value))
const statusClass = computed(() => genericStatusClass(value.value))
const currencyValue = computed(() => formatCurrency(numericValue.value))
const dossierStatusClass = computed(() => DOSSIER_STATUS_STYLES[value.value] ?? DOSSIER_STATUS_DEFAULT)
const riskClass = computed(() => RISK_STYLES[value.value] ?? RISK_DEFAULT)
const userRoleClass = computed(() => USER_ROLE_STYLES[value.value] ?? USER_ROLE_DEFAULT)
const userStatusClass = computed(() => USER_STATUS_STYLES[value.value] ?? USER_STATUS_DEFAULT)
</script>

<template>
  <div :class="centered ? 'flex h-full w-full items-center justify-center' : 'contents'">
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
  <GridTrendCell
    v-else-if="variant === 'trend'"
    :value="numericValue"
  />

  <!-- percent -->
  <span
    v-else-if="variant === 'percent'"
    class="font-mono text-xs font-medium text-[var(--color-text-muted)]"
  >
    {{ percentFormatted }}
  </span>

  <!-- tags : pastilles colorées par domaine, max 2 visibles + badge de débordement -->
  <GridTagsCell
    v-else-if="variant === 'tags'"
    :value="rawValue"
  />

  <!-- bool : badge circulaire avec icône checkmark ou croix -->
  <GridBoolCell
    v-else-if="variant === 'bool'"
    :value="rawValue"
  />

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
  <GridProgressCell
    v-else-if="variant === 'progress'"
    :value="numericValue"
  />

  <!-- email -->
  <GridEmailCell
    v-else-if="variant === 'email'"
    :value="value"
    :editable="editable"
  />

  <!-- company -->
  <GridCompanyCell
    v-else-if="variant === 'company'"
    :value="value"
  />

  <!-- actions -->
  <button
    v-else-if="variant === 'actions'"
    class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
    type="button"
  >
    Edit
  </button>

  <!-- dossier-status : badge OTC Flow style Notion — compact, fort contraste -->
  <GridTagBadge
    v-else-if="variant === 'dossier-status'"
    :text="value"
    :color-class="dossierStatusClass"
  />

  <!-- risk : badge compact style Notion -->
  <GridTagBadge
    v-else-if="variant === 'risk'"
    :text="value"
    :color-class="riskClass"
  />

  <!-- reference : tooltip + copie au clic -->
  <GridReferenceCell
    v-else-if="variant === 'reference'"
    :value="value"
  />

  <!-- user-role : badge compact avec couleur par rôle -->
  <GridTagBadge
    v-else-if="variant === 'user-role'"
    :text="value"
    :color-class="userRoleClass"
    tooltip
  />

  <!-- user-status : badge solide avec couleur par statut -->
  <GridTagBadge
    v-else-if="variant === 'user-status'"
    :text="value"
    :color-class="userStatusClass"
    tooltip
  />

  <!-- default -->
  <span v-else class="flex h-full min-w-0 items-center">
    <GridTooltip :text="value" class="truncate text-xs text-[var(--color-text)]" />
  </span>
  </div>
</template>
