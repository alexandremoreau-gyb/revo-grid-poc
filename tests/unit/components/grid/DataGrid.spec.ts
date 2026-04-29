import fr from '~/i18n/fr'
import en from '~/i18n/en'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import VGrid from '@revolist/vue3-datagrid'
import DataGrid from '~/components/grid/DataGrid.vue'
import type { ColumnDef, RowData } from '~/types/grid'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useConfirmModal } from '~/composables/app/useConfirmModal'

vi.mock('~/composables/app/useConfirmModal', () => ({
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

type GridColumn = {
  prop?: string
  name?: string
  cellTemplate?: unknown
  columnTemplate?: unknown
  editor?: unknown
  readonly?: boolean
}

type GridVmLike = {
  vm: {
    $attrs: {
      columns?: unknown
      source?: unknown
      editors?: unknown
      readonly?: unknown
    }
    $props: {
      columns?: unknown
      source?: unknown
      editors?: unknown
      readonly?: unknown
    }
  }
}

type MountGridProps = Partial<{
  columns: ColumnDef[]
  rows: RowData[]
  loading: boolean
  height: number | string
  selectable: boolean
  editable: boolean
  enableSorting: boolean
  enableColumnFilters: boolean
  framed: boolean
  editors: object
}>

function getGridColumns(grid: GridVmLike): GridColumn[] {
  return (grid.vm.$attrs.columns ?? grid.vm.$props.columns ?? []) as GridColumn[]
}

function getGridSource(grid: GridVmLike): RowData[] {
  return (grid.vm.$attrs.source ?? grid.vm.$props.source ?? []) as RowData[]
}

function hasProp(prop: string) {
  return (column: GridColumn) => column.prop === prop
}

function flushAsync() {
  return new Promise<void>(resolve => setTimeout(resolve, 0))
}

function mountGrid(props: MountGridProps = {}) {
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
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    })
  })

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
    const cols = getGridColumns(grid)
    const symbolCol = cols.find(hasProp('symbol'))
    const priceCol = cols.find(hasProp('price'))
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

    const cols = getGridColumns(grid)
    const centeredVariantCol = cols.find(hasProp('centeredVariant'))
    const centeredTextCol = cols.find(hasProp('centeredText'))
    const priceCol = cols.find(hasProp('price'))
    const symbolCol = cols.find(hasProp('symbol'))

    expect(centeredVariantCol?.name).toBe('Centered Variant')
    expect(centeredTextCol?.name).toBe('Centered Text')
    expect(typeof centeredVariantCol?.cellTemplate).toBe('function')
    expect(typeof centeredTextCol?.cellTemplate).toBe('function')
    expect(typeof priceCol?.cellTemplate).toBe('function')
    expect(typeof symbolCol?.cellTemplate).toBe('function')
    expect(centeredVariantCol?.cellTemplate).not.toBe(priceCol?.cellTemplate)
    expect(centeredTextCol?.cellTemplate).not.toBe(symbolCol?.cellTemplate)
  })

  it('filtre les colonnes selon colPriority et la largeur viewport', async () => {
    // Arrange
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 640,
    })

    const wrapper = mountGrid({
      columns: [
        { prop: 'name', name: 'Name', colPriority: 1 },
        { prop: 'email', name: 'Email', colPriority: 2 },
        { prop: 'company', name: 'Company', colPriority: 3 },
        { prop: 'createdAt', name: 'Created at', colPriority: 4 },
      ] as ColumnDef[],
      rows: [
        {
          name: 'Alexandre',
          email: 'alex@example.test',
          company: 'COPRIM',
          createdAt: '2026-04-22',
        },
      ] as RowData[],
    })

    // Act
    const grid = wrapper.findComponent(VGrid)
    await wrapper.vm.$nextTick()

    // Assert
    let cols = getGridColumns(grid)
    expect(cols.map(col => col.prop)).toEqual(['name', 'email'])

    // Act
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 900,
    })
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()

    // Assert
    cols = getGridColumns(grid)
    expect(cols.map(col => col.prop)).toEqual(['name', 'email', 'company'])
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
    const cols = getGridColumns(grid)
    expect(cols[0].name).toBe('Slug')
    expect(cols[1].name).toBe('value')
    const source = getGridSource(grid)
    expect(source).toHaveLength(1)
  })

  it("ne marque pas chaque colonne readonly quand l'ensemble du tableau est en lecture seule", () => {
    // Arrange
    const wrapper = mountGrid({
      editable: false,
      columns: [
        { prop: 'id', name: 'ID', editable: false },
        { prop: 'name', name: 'Name', editable: false },
      ] as ColumnDef[],
      rows: [{ id: 1, name: 'Sophie' }] as RowData[],
    })

    // Act
    const grid = wrapper.findComponent(VGrid)

    // Assert
    const cols = getGridColumns(grid)
    expect(grid.vm.$attrs.readonly ?? grid.vm.$props.readonly).toBe(true)
    expect(cols).toEqual([
      expect.not.objectContaining({ readonly: true }),
      expect.not.objectContaining({ readonly: true }),
    ])
  })

  it("isole la source envoyée à VGrid pour éviter qu'un edit annulé ne mute rows", async () => {
    // Arrange
    const rows = [{ id: 1, price: 42500 }] as RowData[]
    const mockConfirm = vi.fn().mockResolvedValue(false)
    ;(useConfirmModal as ReturnType<typeof vi.fn>).mockReturnValue({
      visible: { value: false },
      confirm: mockConfirm,
      _resolve: vi.fn(),
    })

    const wrapper = mountGrid({
      columns: [
        { prop: 'id', name: 'ID', variant: 'id' },
        { prop: 'price', name: 'Price', variant: 'price' },
      ] as ColumnDef[],
      rows,
    })

    const grid = wrapper.findComponent(VGrid)
    expect(grid.exists()).toBe(true)

    const source = (grid.vm.$attrs.source ?? grid.vm.$props.source) as RowData[]

    // Act — la source est une copie isolée des rows d'origine
    expect(source).not.toBe(rows)
    expect(source[0]).not.toBe(rows[0])

    grid.vm.$emit('afteredit', {
      detail: {
        rowIndex: 0,
        prop: 'price',
        val: 99999,
      },
    })
    await (wrapper.vm as unknown as { confirmPendingRow: () => Promise<void> }).confirmPendingRow()

    // Assert — l'annulation ne mute pas rows
    expect(mockConfirm).toHaveBeenCalled()
    expect(rows[0]?.price).toBe(42500)
  })

  it('relaie les edits pending vers cell-edit quand la confirmation est acceptée', async () => {
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
    await flushAsync()

    expect(mockConfirm).not.toHaveBeenCalled()
    expect(wrapper.emitted('pending-change')?.at(-1)).toEqual([true])

    await (wrapper.vm as unknown as { confirmPendingRow: () => Promise<void> }).confirmPendingRow()

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

  it("n'émet pas cell-edit quand la confirmation pending est refusée", async () => {
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
    expect(mockConfirm).not.toHaveBeenCalled()
    await (wrapper.vm as unknown as { confirmPendingRow: () => Promise<void> }).confirmPendingRow()

    // Assert
    expect(mockConfirm).toHaveBeenCalled()
    expect(wrapper.emitted('cell-edit')).toBeUndefined()
  })

  it('confirme ensemble plusieurs edits de la même ligne', async () => {
    // Arrange
    const mockConfirm = vi.fn().mockResolvedValue(true)
    ;(useConfirmModal as ReturnType<typeof vi.fn>).mockReturnValue({
      visible: { value: false },
      confirm: mockConfirm,
      _resolve: vi.fn(),
    })
    const wrapper = mountGrid()
    const grid = wrapper.findComponent(VGrid)

    // Act
    grid.vm.$emit('afteredit', {
      detail: {
        rowIndex: 0,
        prop: 'symbol',
        val: 'BTC-EDIT',
      },
    })
    grid.vm.$emit('afteredit', {
      detail: {
        rowIndex: 0,
        prop: 'price',
        val: 43000,
      },
    })
    await flushAsync()

    expect(mockConfirm).not.toHaveBeenCalled()

    await (wrapper.vm as unknown as { confirmPendingRow: () => Promise<void> }).confirmPendingRow()

    // Assert
    expect(mockConfirm).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('cell-edit')).toEqual([
      [
        {
          rowIndex: 0,
          prop: 'symbol',
          val: 'BTC-EDIT',
        },
      ],
      [
        {
          rowIndex: 0,
          prop: 'price',
          val: 43000,
        },
      ],
    ])
    expect(wrapper.emitted('pending-change')?.at(-1)).toEqual([false])
  })

  it("bloque l'édition d'une autre ligne tant que la ligne pending n'est pas confirmée", async () => {
    // Arrange
    const mockConfirm = vi.fn().mockResolvedValue(false)
    ;(useConfirmModal as ReturnType<typeof vi.fn>).mockReturnValue({
      visible: { value: false },
      confirm: mockConfirm,
      _resolve: vi.fn(),
    })
    const wrapper = mountGrid()
    const grid = wrapper.findComponent(VGrid)
    const preventDefault = vi.fn()

    // Act
    grid.vm.$emit('afteredit', {
      detail: {
        rowIndex: 0,
        prop: 'symbol',
        val: 'BTC-EDIT',
      },
    })
    await flushAsync()

    grid.vm.$emit('beforeeditstart', {
      detail: {
        rowIndex: 1,
        prop: 'price',
        val: 3210.5,
      },
      preventDefault,
    })
    await flushAsync()
    await flushAsync()

    // Assert
    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(mockConfirm).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('cell-edit')).toBeUndefined()
    expect(wrapper.emitted('pending-change')?.at(-1)).toEqual([false])
  })

  it("ignore une sortie d'éditeur sans changement et ne déclenche pas la confirmation", async () => {
    // Arrange
    const mockConfirm = vi.fn().mockResolvedValue(true)
    ;(useConfirmModal as ReturnType<typeof vi.fn>).mockReturnValue({
      visible: { value: false },
      confirm: mockConfirm,
      _resolve: vi.fn(),
    })
    const wrapper = mountGrid()
    const grid = wrapper.findComponent(VGrid)
    const preventDefault = vi.fn()

    // Act
    grid.vm.$emit('beforeeditstart', {
      detail: {
        rowIndex: 0,
        prop: 'symbol',
        val: 'BTC',
      },
      preventDefault: vi.fn(),
    })
    grid.vm.$emit('afteredit', {
      detail: {
        rowIndex: 0,
        prop: 'symbol',
        val: 'BTC',
      },
    })
    await flushAsync()

    grid.vm.$emit('beforeeditstart', {
      detail: {
        rowIndex: 1,
        prop: 'price',
        val: 3210.5,
      },
      preventDefault,
    })
    await flushAsync()
    await (wrapper.vm as unknown as { confirmPendingRow: () => Promise<void> }).confirmPendingRow()

    // Assert
    expect(preventDefault).not.toHaveBeenCalled()
    expect(mockConfirm).not.toHaveBeenCalled()
    expect(wrapper.emitted('cell-edit')).toBeUndefined()
    expect(wrapper.emitted('pending-change')).toBeUndefined()
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

    const cols = getGridColumns(grid)
    const dateCol = cols.find(hasProp('date'))
    const statusCol = cols.find(hasProp('status'))

    expect(grid.vm.$attrs.readonly ?? grid.vm.$props.readonly).toBe(false)
    expect(dateCol?.readonly).toBe(false)
    expect(dateCol?.editor).toBe(dateEditor)
    expect(typeof dateCol?.cellTemplate).toBe('function')
    expect(typeof dateCol?.columnTemplate).toBe('function')
    expect(statusCol?.readonly).toBe(true)
  })
})
