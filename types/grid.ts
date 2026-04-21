import type {
  ColumnRegular,
  FilterCollectionItem,
  SortingConfig,
} from '@revolist/vue3-datagrid'

export type GridColumnVariant =
  | 'selection'
  | 'id'
  | 'text'
  | 'date'
  | 'currency'
  | 'email'
  | 'company'
  | 'status'
  | 'progress'
  | 'actions'
  | 'dossier-status'
  | 'risk'
  | 'reference'
  // variants crypto (conservés pour /demo)
  | 'symbol'
  | 'price'
  | 'large_number'
  | 'trend'
  | 'percent'
  | 'tags'
  | 'bool'

export interface ColumnDef extends Partial<ColumnRegular> {
  prop: string
  name?: string
  label?: string
  type?: 'string' | 'number' | 'date'
  size?: number
  width?: number
  editable?: boolean
  variant?: GridColumnVariant
  centered?: boolean
  /**
   * Priorité d'affichage responsive (1 = toujours visible, 4 = large écran uniquement).
   * Omis = toujours visible (équivalent à 1).
   *
   * Breakpoints appliqués dans DataGrid.vue :
   *   < 500px  → priorité 1 seulement
   *   500–749  → priorité ≤ 2
   *   750–1049 → priorité ≤ 3
   *   ≥ 1050   → tout
   */
  colPriority?: 1 | 2 | 3 | 4
}

export interface RowData {
  [key: string]: unknown
}

export type GridFilterState = Record<string, FilterCollectionItem>
export type GridSortState = SortingConfig

export interface KpiData {
  key: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  color?: 'primary' | 'success' | 'warning' | 'danger'
}
