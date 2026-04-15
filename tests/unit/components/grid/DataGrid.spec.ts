import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
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

function mountGrid(props: Record<string, unknown> = {}) {
  return mount(DataGrid, {
    global: {
      plugins: [i18n],
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

  it('rend les cellules avec les variantes de mise en forme produit', () => {
    // Arrange / Act
    const wrapper = mountGrid()

    // Assert
    expect(wrapper.find('thead').text()).toContain('Symbol')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.text()).toContain('BTC')
    expect(wrapper.text()).toContain('$42,500')
    expect(wrapper.text()).toContain('+3.42%')
    expect(wrapper.text()).toContain('DeFi')
    expect(wrapper.text()).toContain('+1')
    expect(wrapper.html()).toContain('bg-emerald-500')
    expect(wrapper.html()).toContain('bg-violet-50')
  })

  it('utilise les libelles de colonnes et les clefs de lignes de secours', () => {
    // Arrange
    const wrapper = mountGrid({
      columns: [
        { prop: 'slug', label: 'Slug' },
        { prop: 'value' },
      ] as ColumnDef[],
      rows: [
        { slug: 'alpha', value: 'A' },
      ] as RowData[],
    })

    // Act
    const headers = wrapper.findAll('thead th').map(th => th.text())

    // Assert
    expect(headers).toEqual(['Slug', 'value'])
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.text()).toContain('alpha')
    expect(wrapper.text()).toContain('A')
  })
})
