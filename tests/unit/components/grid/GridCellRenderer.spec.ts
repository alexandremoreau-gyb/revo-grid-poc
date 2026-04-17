import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import en from '~/i18n/en'
import fr from '~/i18n/fr'
import type { GridColumnVariant } from '~/types/grid'
import GridCellRenderer from '~/components/grid/GridCellRenderer.vue'

// Cette suite couvre les variantes de rendu de cellule RevoGrid.
// L'objectif est de verrouiller le formatage métier, pas le HTML exact.
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: { fr, en },
})

function mountRenderer(value: unknown, variant?: GridColumnVariant) {
  return mount(GridCellRenderer, {
    global: {
      plugins: [i18n],
    },
    props: {
      colIndex: 0,
      colType: 'text',
      column: {},
      data: [],
      model: {},
      prop: 'value',
      rowIndex: 0,
      type: 'text',
      value,
      variant,
    },
  })
}

describe('GridCellRenderer', () => {
  it('rend la sélection en état coché ou décoché', () => {
    // Arrange / Act
    const checked = mountRenderer('true', 'selection')
    const unchecked = mountRenderer('false', 'selection')

    // Assert
    expect(checked.find('svg').exists()).toBe(true)
    expect(checked.get('span span').classes()).toContain('bg-[var(--color-primary)]')
    expect(unchecked.find('svg').exists()).toBe(false)
    expect(unchecked.get('span span').classes()).toContain('border-[var(--color-border)]')
  })

  it('rend les variantes id et symbol', () => {
    // Arrange / Act
    const id = mountRenderer(42, 'id')
    const symbol = mountRenderer('BTC', 'symbol')

    // Assert
    expect(id.text()).toBe('42')
    expect(id.get('span').classes()).toContain('rounded-full')
    expect(symbol.text()).toBe('BTC')
    expect(symbol.get('span').classes()).toContain('tracking-wide')
  })

  it('formate les prix sur toutes les plages', () => {
    // Arrange / Act
    const low = mountRenderer(0.5, 'price')
    const mid = mountRenderer(12.34, 'price')
    const high = mountRenderer(1500, 'price')
    const zero = mountRenderer(undefined, 'price')

    // Assert
    expect(low.text()).toContain('$0.5')
    expect(mid.text()).toContain('$12.34')
    expect(high.text()).toContain('$1,500')
    expect(zero.text()).toMatch(/^\$0(?:\.0+)?$/)
  })

  it('formate les grands nombres selon leur ordre de grandeur', () => {
    // Arrange / Act
    const thousand = mountRenderer(1234, 'large_number')
    const million = mountRenderer(2_500_000, 'large_number')
    const billion = mountRenderer(3_200_000_000, 'large_number')
    const trillion = mountRenderer(4_500_000_000_000, 'large_number')

    // Assert
    expect(thousand.text()).toBe('$1,234')
    expect(million.text()).toBe('$2.50M')
    expect(billion.text()).toBe('$3.20B')
    expect(trillion.text()).toBe('$4.50T')
  })

  it('formate le trend et le pourcentage', () => {
    // Arrange / Act
    const positive = mountRenderer(12.345, 'trend')
    const negative = mountRenderer(-12.345, 'trend')
    const percent = mountRenderer(87.654, 'percent')

    // Assert
    expect(positive.text()).toContain('+12.35%')
    expect(positive.get('span').classes()).toContain('bg-emerald-50')
    expect(negative.text()).toContain('-12.35%')
    expect(negative.get('span').classes()).toContain('bg-rose-50')
    expect(percent.text()).toBe('87.65%')
  })

  it('formate les dates valides et conserve les valeurs invalides', () => {
    // Arrange / Act
    const valid = mountRenderer('2024-02-01', 'date')
    const invalid = mountRenderer('not-a-date', 'date')
    const empty = mountRenderer(undefined, 'date')

    // Assert
    expect(valid.text()).toContain('01/02/2024')
    expect(invalid.text()).toBe('not-a-date')
    expect(empty.text()).toBe('')
  })

  it('gère les tags depuis un tableau, une chaîne et une valeur vide', () => {
    // Arrange / Act
    const arrayTags = mountRenderer(['alpha', 'beta', 'gamma'], 'tags')
    const stringTags = mountRenderer('alpha, beta', 'tags')
    const emptyTags = mountRenderer(42, 'tags')

    // Assert
    expect(arrayTags.text()).toContain('alpha')
    expect(arrayTags.text()).toContain('beta')
    expect(arrayTags.text()).toContain('+1')
    expect(stringTags.text()).toContain('alpha')
    expect(stringTags.text()).toContain('beta')
    expect(stringTags.text()).not.toContain('+')
    expect(emptyTags.text()).toBe('')
  })

  it('gère les booléens et les statuts', () => {
    // Arrange / Act
    const boolTrue = mountRenderer(true, 'bool')
    const boolFalse = mountRenderer('false', 'bool')
    const active = mountRenderer('Active', 'status')
    const pending = mountRenderer('Pending', 'status')
    const inactive = mountRenderer('Inactive', 'status')
    const fallback = mountRenderer('Archived', 'status')

    // Assert — le bool rend désormais un badge circulaire (ring + bg-emerald-50/bg-slate-100)
    expect(boolTrue.get('span span').classes()).toContain('bg-emerald-50')
    expect(boolFalse.get('span span').classes()).toContain('bg-slate-100')
    expect(active.find('.bg-emerald-100').exists()).toBe(true)
    expect(pending.find('.bg-amber-100').exists()).toBe(true)
    expect(inactive.find('.bg-rose-100').exists()).toBe(true)
    expect(fallback.find('.bg-slate-100').exists()).toBe(true)
  })

  it('rend les variantes currency, date, progress, email, company, actions et fallback', () => {
    // Arrange / Act
    const currency = mountRenderer(1234, 'currency')
    const date = mountRenderer('2024-02-01', 'date')
    const progressLow = mountRenderer(10, 'progress')
    const progressMid = mountRenderer(50, 'progress')
    const progressHigh = mountRenderer(90, 'progress')
    const email = mountRenderer('alice@test.com', 'email')
    const company = mountRenderer('Acme', 'company')
    const actions = mountRenderer('ignored', 'actions')
    const fallback = mountRenderer('plain text')

    // Assert
    expect(currency.text()).toContain('€')
    expect(date.text()).toContain('01/02/2024')
    expect(progressLow.text()).toContain('10')
    expect(progressLow.get('span span span').classes()).toContain('bg-rose-500')
    expect(progressMid.get('span span span').classes()).toContain('bg-amber-500')
    expect(progressHigh.get('span span span').classes()).toContain('bg-emerald-500')
    expect(email.get('a').attributes('href')).toBe('mailto:alice@test.com')
    expect(company.text()).toContain('Acme')
    expect(actions.text()).toContain('Edit')
    expect(fallback.text()).toBe('plain text')
  })
})
