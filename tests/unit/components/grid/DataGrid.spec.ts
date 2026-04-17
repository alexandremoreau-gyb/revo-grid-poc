import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import VGrid from '@revolist/vue3-datagrid'
import { describe, expect, it } from 'vitest'

import DataGrid from '~/components/grid/DataGrid.vue'
import en from '~/i18n/en'
import fr from '~/i18n/fr'
import type { ColumnDef, RowData } from '~/types/grid'

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

  it('plafonne le panneau a 700px et conserve la hauteur minimale interne', () => {
    // Arrange / Act
    const wrapper = mountGrid({
      loading: true,
      height: 280,
    })

    // Assert
    const styledDivs = wrapper.findAll('div[style]')

    expect(styledDivs[0]?.attributes('style')).toContain('max-height: 700px')
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
})
