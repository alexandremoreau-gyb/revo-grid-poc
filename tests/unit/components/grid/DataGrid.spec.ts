import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import VGrid from '@revolist/vue3-datagrid'
import { describe, expect, it, vi } from 'vitest'
import DataGrid from '~/components/grid/DataGrid.vue'
import { useConfirmModal } from '~/composables/useConfirmModal'
import fr from '~/i18n/fr'
import en from '~/i18n/en'
import type { ColumnDef, RowData } from '~/types/grid'

vi.mock('~/composables/useConfirmModal', () => ({
  useConfirmModal: vi.fn(),
}))

const defaultConfirmMock = vi.fn().mockResolvedValue(true)

;(useConfirmModal as ReturnType<typeof vi.fn>).mockReturnValue({
  visible: { value: false },
  confirm: defaultConfirmMock,
  _resolve: vi.fn(),
})

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: { fr, en },
})

const baseColumns: ColumnDef[] = [
  { prop: 'id', name: 'ID', variant: 'id' },
  { prop: 'symbol', name: 'Symbol', variant: 'symbol' },
  { prop: 'price', name: 'Price', variant: 'price' },
  { prop: 'change_24h', name: '24h %', variant: 'trend' },
  { prop: 'tags', name: 'Tags', variant: 'tags' },
  { prop: 'trending', name: 'Trending', variant: 'bool' },
]

const baseRows: RowData[] = [
  {
    id: 1,
    symbol: 'BTC',
    price: 42500,
    change_24h: 3.42,
    tags: ['DeFi', 'Layer1', 'Store of Value'],
    trending: true,
  },
  {
    id: 2,
    symbol: 'ETH',
    price: 3210.5,
    change_24h: -1.27,
    tags: ['Smart Contracts', 'Layer1'],
    trending: false,
  },
]

// ClientOnly est un composant Nuxt qui ne rend rien côté serveur/test.
// On le remplace par un stub transparent qui passe simplement son slot.
const ClientOnlyStub = { template: '<slot />' }

const dateEditor = function DateEditor() {}

function mountGrid(props: Record<string, unknown> = {}) {
  return mount(DataGrid, {
    global: {
      plugins: [i18n],
      stubs: { ClientOnly: ClientOnlyStub },
    },
    props: {
      columns: baseColumns,
      rows: baseRows,
      ...props,
    },
  })
}

describe('DataGrid', () => {
  it('affiche les états chargement et vide sans rendre le tableau', () => {
    // Arrange / Act
    const loadingWrapper = mountGrid({
      loading: true,
    })
    const emptyWrapper = mountGrid({
      rows: [],
    })

    // Assert
    expect(loadingWrapper.text()).toContain('Chargement')
    expect(loadingWrapper.find('table').exists()).toBe(false)
    expect(emptyWrapper.text()).toContain('Aucune donnee disponible')
    expect(emptyWrapper.find('table').exists()).toBe(false)
  })

  it('utilise une hauteur explicite et conserve la hauteur minimale interne', () => {
    // Arrange / Act
    const wrapper = mountGrid({
      loading: true,
      height: 280,
    })

    // Assert
    const styledDivs = wrapper.findAll('div[style]')

    expect(styledDivs[0]?.attributes('style')).toContain('height: 280px')
    expect(styledDivs[1]?.attributes('style')).toContain('min-height: 280px')
  })

  it('passe les colonnes avec cellTemplate aux colonnes qui ont un variant', () => {
    // Arrange / Act
    const wrapper = mountGrid()
    const grid = wrapper.findComponent(VGrid)

    // Assert
    expect(grid.exists()).toBe(true)
    const cols = (grid.vm.$attrs.columns ?? grid.vm.$props.columns) as any[]
    const symbolCol = cols.find((c: any) => c.prop === 'symbol')
    const priceCol = cols.find((c: any) => c.prop === 'price')
    expect(typeof symbolCol?.cellTemplate).toBe('function')
    expect(typeof priceCol?.cellTemplate).toBe('function')
  })

  it('gère les variantes centrées et les cellules centrées sans variant', () => {
    // Arrange
    const wrapper = mountGrid({
      columns: [
        {
          prop: 'centeredVariant',
          name: 'Centered Variant',
          variant: 'price',
          centered: true,
        },
        {
          prop: 'centeredText',
          name: 'Centered Text',
          centered: true,
        },
        {
          prop: 'price',
          name: 'Price',
          variant: 'price',
        },
        {
          prop: 'symbol',
          name: 'Symbol',
        },
      ] as ColumnDef[],
      rows: [
        {
          centeredVariant: 1234.56,
          centeredText: 'Aligned',
          price: 987.65,
          symbol: 'BTC',
        },
      ] as RowData[],
    })

    // Act
    const grid = wrapper.findComponent(VGrid)

    // Assert
    expect(grid.exists()).toBe(true)

    const cols = (grid.vm.$attrs.columns ?? grid.vm.$props.columns) as any[]
    const centeredVariantCol = cols.find((c: any) => c.prop === 'centeredVariant')
    const centeredTextCol = cols.find((c: any) => c.prop === 'centeredText')
    const priceCol = cols.find((c: any) => c.prop === 'price')
    const symbolCol = cols.find((c: any) => c.prop === 'symbol')

    expect(centeredVariantCol?.name).toBe('Centered Variant')
    expect(centeredTextCol?.name).toBe('Centered Text')
    expect(typeof centeredVariantCol?.cellTemplate).toBe('function')
    expect(typeof centeredTextCol?.cellTemplate).toBe('function')
    expect(typeof priceCol?.cellTemplate).toBe('function')
    expect(typeof symbolCol?.cellTemplate).toBe('function')
    expect(centeredVariantCol?.cellTemplate).not.toBe(priceCol?.cellTemplate)
    expect(centeredTextCol?.cellTemplate).not.toBe(symbolCol?.cellTemplate)
  })

  it('passe les lignes dans source et résout les noms de colonnes de secours', () => {
    // Arrange
    const wrapper = mountGrid({
      columns: [
        { prop: 'slug', label: 'Slug' },
        { prop: 'value' },
      ] as ColumnDef[],
      rows: [{ slug: 'alpha', value: 'A' }] as RowData[],
    })

    // Act
    const grid = wrapper.findComponent(VGrid)

    // Assert
    expect(grid.exists()).toBe(true)
    const cols = (grid.vm.$attrs.columns ?? grid.vm.$props.columns) as any[]
    expect(cols[0].name).toBe('Slug')
    expect(cols[1].name).toBe('value')
    const source = (grid.vm.$attrs.source ?? grid.vm.$props.source) as any[]
    expect(source).toHaveLength(1)
  })

  it('relaie afteredit vers cell-edit quand la confirmation est acceptée', async () => {
    // Arrange
    const mockConfirm = vi.fn().mockResolvedValue(true)
    ;(useConfirmModal as ReturnType<typeof vi.fn>).mockReturnValue({
      visible: { value: false },
      confirm: mockConfirm,
      _resolve: vi.fn(),
    })
    const wrapper = mountGrid()
    const grid = wrapper.findComponent(VGrid)
    const payload = {
      detail: {
        rowIndex: 1,
        prop: 'price',
        val: 43000,
      },
    }

    // Act
    grid.vm.$emit('afteredit', payload)
    await new Promise(r => setTimeout(r, 0))

    // Assert
    expect(mockConfirm).toHaveBeenCalled()
    expect(wrapper.emitted('cell-edit')?.[0]).toEqual([
      {
        rowIndex: 1,
        prop: 'price',
        val: 43000,
      },
    ])
  })

  it('n’émet pas cell-edit quand la confirmation est refusée', async () => {
    // Arrange
    const mockConfirm = vi.fn().mockResolvedValue(false)
    ;(useConfirmModal as ReturnType<typeof vi.fn>).mockReturnValue({
      visible: { value: false },
      confirm: mockConfirm,
      _resolve: vi.fn(),
    })
    const wrapper = mountGrid()
    const grid = wrapper.findComponent(VGrid)
    const payload = {
      detail: {
        rowIndex: 1,
        prop: 'price',
        val: 43000,
      },
    }

    // Act
    grid.vm.$emit('afteredit', payload)
    await new Promise(r => setTimeout(r, 0))

    // Assert
    expect(mockConfirm).toHaveBeenCalled()
    expect(wrapper.emitted('cell-edit')).toBeUndefined()
  })

  it('relaie les events de tri et de filtre vers les emits métier', () => {
    // Arrange
    const wrapper = mountGrid({
      enableColumnFilters: true,
    })
    const grid = wrapper.findComponent(VGrid)
    const sortState = { columns: [{ prop: 'price', order: 'asc' }] }
    const filterState = { columns: [{ prop: 'symbol', value: 'BTC' }] }

    // Act
    grid.vm.$emit('sortingconfigchanged', { detail: sortState })
    grid.vm.$emit('filterconfigchanged', { detail: filterState })

    // Assert
    expect(wrapper.emitted('sort-change')?.[0]).toEqual([sortState])
    expect(wrapper.emitted('filter-change')?.[0]).toEqual([filterState])
  })

  it('utilise une hauteur en string et supprime le cadre quand framed vaut false', () => {
    // Arrange / Act
    const wrapper = mountGrid({
      loading: true,
      framed: false,
      height: '60vh',
    })

    // Assert
    const styledDivs = wrapper.findAll('div[style]')

    expect(wrapper.classes()).not.toContain('rounded-2xl')
    expect(wrapper.classes()).not.toContain('border')
    expect(styledDivs[0]?.attributes('style')).toContain('height: 60vh')
    expect(styledDivs[1]?.attributes('style')).toContain('min-height: 320px')
  })

  it('passe les éditeurs et mappe les colonnes éditables et date', () => {
    // Arrange
    const editors = {
      date: dateEditor,
    }
    const wrapper = mountGrid({
      editable: true,
      editors,
      height: '60vh',
      columns: [
        {
          prop: 'date',
          name: 'Date',
          variant: 'date',
          editable: true,
          editor: dateEditor as unknown as ColumnDef['editor'],
        },
        {
          prop: 'status',
          name: 'Status',
          editable: false,
        },
      ] as ColumnDef[],
    })

    // Act
    const grid = wrapper.findComponent(VGrid)

    // Assert
    expect(grid.exists()).toBe(true)
    expect((grid.vm.$attrs.editors ?? grid.vm.$props.editors)).toStrictEqual(editors)

    const cols = (grid.vm.$attrs.columns ?? grid.vm.$props.columns) as any[]
    const dateCol = cols.find((c: any) => c.prop === 'date')
    const statusCol = cols.find((c: any) => c.prop === 'status')

    expect(grid.vm.$attrs.readonly ?? grid.vm.$props.readonly).toBe(false)
    expect(dateCol?.readonly).toBe(false)
    expect(dateCol?.editor).toBe(dateEditor)
    expect(typeof dateCol?.cellTemplate).toBe('function')
    expect(typeof dateCol?.columnTemplate).toBe('function')
    expect(statusCol?.readonly).toBe(true)
  })
})
