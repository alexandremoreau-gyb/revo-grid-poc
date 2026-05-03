import type { Ref } from 'vue'
import { VGridVueTemplate } from '@revolist/vue3-datagrid'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ColumnDef, GridColumnVariant } from '~/types/grid'
import DateSortHeader from '~/components/grid/DateSortHeader.vue'
import GridCellRenderer from '~/components/grid/GridCellRenderer.vue'
import GridHeaderRenderer from '~/components/grid/GridHeaderRenderer.vue'

const ALL_VARIANTS: GridColumnVariant[] = [
  'selection',
  'id',
  'symbol',
  'price',
  'large_number',
  'trend',
  'percent',
  'tags',
  'bool',
  'status',
  'currency',
  'date',
  'progress',
  'email',
  'company',
  'actions',
  'text',
  'dossier-status',
  'risk',
  'reference',
  'user-role',
  'user-status',
]

function columnPriorityForWidth(width: number): NonNullable<ColumnDef['colPriority']> {
  if (width < 500) return 1
  if (width < 750) return 2
  if (width < 1050) return 3
  return 4
}

export function useRevoGridColumns(
  columns: Ref<ColumnDef[]>,
  editable: Ref<boolean>,
) {
  const maxColumnPriority = ref<NonNullable<ColumnDef['colPriority']>>(4)

  const variantTemplates = Object.fromEntries(
    ALL_VARIANTS.map(variant => [variant, VGridVueTemplate(GridCellRenderer, { variant })]),
  ) as Record<GridColumnVariant, ReturnType<typeof VGridVueTemplate>>

  const centeredVariantTemplates = Object.fromEntries(
    ALL_VARIANTS.map(variant => [variant, VGridVueTemplate(GridCellRenderer, { variant, centered: true })]),
  ) as Record<GridColumnVariant, ReturnType<typeof VGridVueTemplate>>

  const defaultCellTemplate = VGridVueTemplate(GridCellRenderer, {})
  const centeredDefaultTemplate = VGridVueTemplate(GridCellRenderer, { centered: true })
  const editableEmailTemplate = VGridVueTemplate(GridCellRenderer, { variant: 'email', editable: true })

  const dateHeaderTemplate = VGridVueTemplate(DateSortHeader, {})
  const centeredDateHeaderTemplate = VGridVueTemplate(DateSortHeader, { align: 'center' })
  const defaultHeaderTemplate = VGridVueTemplate(GridHeaderRenderer, {})
  const centeredHeaderTemplate = VGridVueTemplate(GridHeaderRenderer, { align: 'center' })

  function updateColumnPriority() {
    if (typeof window === 'undefined') return
    maxColumnPriority.value = columnPriorityForWidth(window.innerWidth)
  }

  const visibleColumns = computed(() =>
    columns.value.filter(col => (col.colPriority ?? 1) <= maxColumnPriority.value),
  )

  const revoColumns = computed(() =>
    visibleColumns.value.map((col) => {
      const isEditable = col.editable === true
      const hasColumnEditState = editable.value && col.editable !== undefined
      const isCentered = col.centered === true
      const isHeaderCentered = col.headerAlign === 'center'

      let cellTemplate: ReturnType<typeof VGridVueTemplate>
      if (col.variant === 'email' && isEditable) {
        cellTemplate = editableEmailTemplate
      } else if (col.variant && isCentered) {
        cellTemplate = centeredVariantTemplates[col.variant]
      } else if (col.variant) {
        cellTemplate = variantTemplates[col.variant]
      } else if (isCentered) {
        cellTemplate = centeredDefaultTemplate
      } else {
        cellTemplate = defaultCellTemplate
      }

      return {
        ...col,
        name: col.name ?? col.label ?? String(col.prop),
        ...(hasColumnEditState ? { readonly: !col.editable } : {}),
        ...(isEditable ? { editor: col.editor } : {}),
        cellTemplate,
        ...(col.prop === 'date'
          ? { columnTemplate: isHeaderCentered ? centeredDateHeaderTemplate : dateHeaderTemplate }
          : { columnTemplate: isHeaderCentered ? centeredHeaderTemplate : defaultHeaderTemplate }),
      }
    }),
  )

  onMounted(() => {
    updateColumnPriority()
    window.addEventListener('resize', updateColumnPriority)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateColumnPriority)
  })

  return {
    revoColumns,
  }
}
