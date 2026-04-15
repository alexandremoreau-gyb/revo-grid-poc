<script setup lang="ts">
import { computed } from 'vue'

/**
 * GridPagination.vue
 * ------------------
 * Controles de pagination decouples du DataGrid.
 * Expose a la fois les v-models Vue et des emits metier plus explicites.
 */

interface Props {
  page: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [10, 25, 50, 100, 250],
})

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
  'page-change': [value: number]
  'page-size-change': [value: number]
}>()

const { t } = useI18n()

const pageCount = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize)),
)
const canGoPrev = computed(() => props.page > 1)
const canGoNext = computed(() => props.page < pageCount.value)
const rangeStart = computed(() =>
  props.total ? (props.page - 1) * props.pageSize + 1 : 0,
)
const rangeEnd = computed(() =>
  Math.min(props.page * props.pageSize, props.total),
)

function setPage(value: number) {
  const normalizedPage = Math.min(Math.max(1, value), pageCount.value)

  emit('update:page', normalizedPage)
  emit('page-change', normalizedPage)
}

function setPageSize(event: Event) {
  const pageSize = Number((event.target as HTMLSelectElement).value)

  emit('update:pageSize', pageSize)
  emit('page-size-change', pageSize)
}
</script>

<template>
  <div
    class="flex flex-col gap-2 border-t border-[var(--color-border)] px-5 py-3 lg:flex-row lg:items-center lg:justify-between"
  >
    <div class="space-y-1 text-sm text-[var(--color-text-muted)]">
      <p>
        {{ t('common.page') }} {{ page }} {{ t('common.of') }} {{ pageCount }} ·
        {{ t('common.rowsCount', { count: total }) }}
      </p>
      <p class="text-xs">{{ rangeStart }}-{{ rangeEnd }}</p>
    </div>

    <div class="flex items-center gap-3">
      <label
        class="flex items-center gap-2 text-sm text-[var(--color-text-muted)]"
      >
        <span>{{ t('common.rowsPerPage') }}</span>
        <select
          class="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm text-[var(--color-text)]"
          :value="pageSize"
          @change="setPageSize"
        >
          <option
            v-for="option in pageSizeOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </label>

      <div class="flex items-center gap-2">
        <button
          class="rounded border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          :disabled="!canGoPrev"
          type="button"
          @click="setPage(page - 1)"
        >
          {{ t('common.prev') }}
        </button>
        <button
          aria-label="next-page"
          class="rounded border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          :disabled="!canGoNext"
          type="button"
          @click="setPage(page + 1)"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>
