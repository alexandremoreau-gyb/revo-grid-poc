import fr from '~/i18n/fr'
import en from '~/i18n/en'
import { createI18n } from 'vue-i18n'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GridColumnVariant } from '~/types/grid'
import GridCellRenderer from '~/components/grid/GridCellRenderer.vue'

// Cette suite couvre les variantes de rendu de cellule RevoGrid.
// L'objectif est de verrouiller le formatage métier, pas le HTML exact.
const CELL_SPAN_SELECTOR = 'span span'
const REFERENCE_CELL_SELECTOR = 'span.flex.h-full.w-full.min-w-0.cursor-pointer.items-center'
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: { fr, en },
})

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

type RendererWrapper = ReturnType<typeof mountRenderer>

function mountRenderer(value: unknown, variant?: GridColumnVariant, centered = false, editable = false) {
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
      centered,
      editable,
    },
  })
}

function getCellSpan(wrapper: RendererWrapper) {
  return wrapper.get(CELL_SPAN_SELECTOR)
}

function getReferenceCell(wrapper: RendererWrapper) {
  return wrapper.get(REFERENCE_CELL_SELECTOR)
}

function expectSpanClass(wrapper: RendererWrapper, className: string) {
  expect(getCellSpan(wrapper).classes()).toContain(className)
}

describe('GridCellRenderer', () => {
  it('rend la sélection en état coché ou décoché', () => {
    // Arrange / Act
    const checked = mountRenderer('true', 'selection')
    const unchecked = mountRenderer('false', 'selection')

    // Assert
    expect(checked.find('svg').exists()).toBe(true)
    expectSpanClass(checked, 'bg-[var(--color-primary)]')
    expect(unchecked.find('svg').exists()).toBe(false)
    expectSpanClass(unchecked, 'border-[var(--color-border)]')
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
    const cases = [
      { value: 0.5, expected: '$0.5' },
      { value: 12.34, expected: '$12.34' },
      { value: 1500, expected: '$1,500' },
    ] as const
    const zero = mountRenderer(undefined, 'price')

    // Assert
    for (const { value, expected } of cases) {
      expect(mountRenderer(value, 'price').text()).toContain(expected)
    }
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
    expectSpanClass(boolTrue, 'bg-emerald-50')
    expectSpanClass(boolFalse, 'bg-slate-100')
    expect(active.find('.bg-emerald-100').exists()).toBe(true)
    expect(pending.find('.bg-amber-100').exists()).toBe(true)
    expect(inactive.find('.bg-rose-100').exists()).toBe(true)
    expect(fallback.find('.bg-slate-100').exists()).toBe(true)
  })

  it('rend les badges dossier-status connus et de repli', () => {
    // Arrange / Act
    const known = mountRenderer('Déposé', 'dossier-status')
    const fallback = mountRenderer('Archivé', 'dossier-status')

    // Assert
    expect(known.text()).toBe('Déposé')
    expectSpanClass(known, 'bg-emerald-600')
    expectSpanClass(known, 'text-white')
    expect(fallback.text()).toBe('Archivé')
    expectSpanClass(fallback, 'bg-slate-400')
    expectSpanClass(fallback, 'text-white')
  })

  it('rend les badges risk connus et de repli', () => {
    // Arrange / Act
    const known = mountRenderer('OK', 'risk')
    const fallback = mountRenderer('Inconnu', 'risk')

    // Assert
    expect(known.text()).toBe('OK')
    expectSpanClass(known, 'bg-emerald-600')
    expectSpanClass(known, 'text-white')
    expect(fallback.text()).toBe('Inconnu')
    expectSpanClass(fallback, 'bg-slate-400')
    expectSpanClass(fallback, 'text-white')
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
    expect(email.get('a').attributes('title')).toBeUndefined()
    expect(email.get('a span.block.w-full.truncate').text()).toBe('alice@test.com')
    expect(company.text()).toContain('Acme')
    expect(actions.text()).toContain('Edit')
    expect(fallback.text()).toBe('plain text')
  })

  it("rend l'email éditable sans lien mailto", () => {
    // Arrange / Act
    const email = mountRenderer('alice@test.com', 'email', false, true)

    // Assert
    expect(email.find('a').exists()).toBe(false)
    expect(email.get('span span.block.w-full.truncate').text()).toBe('alice@test.com')
  })

  it('rend les badges utilisateur avec tooltip tronquable', () => {
    // Arrange / Act
    const role = mountRenderer('Administrateur principal multi-agences', 'user-role')
    const status = mountRenderer('Activation en attente de validation longue', 'user-status')

    // Assert
    expect(role.text()).toBe('Administrateur principal multi-agences')
    expectSpanClass(role, 'max-w-full')
    expect(role.get('span span span.block.w-full.truncate').text()).toBe('Administrateur principal multi-agences')
    expect(status.text()).toBe('Activation en attente de validation longue')
    expectSpanClass(status, 'max-w-full')
    expect(status.get('span span span.block.w-full.truncate').text()).toBe('Activation en attente de validation longue')
  })

  it('copie la référence, affiche l’état copié puis le réinitialise', async () => {
    // Arrange
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText,
      },
    })

    const wrapper = mountRenderer('REF-123', 'reference')

    // Act
    await getReferenceCell(wrapper).trigger('click')
    await flushPromises()

    // Assert
    expect(writeText).toHaveBeenCalledWith('REF-123')
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(getReferenceCell(wrapper).classes()).toContain('text-emerald-600')

    // Act
    vi.advanceTimersByTime(1500)
    await flushPromises()

    // Assert
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(getReferenceCell(wrapper).classes()).toContain('text-[var(--color-text)]')
  })

  it('ignore une erreur du presse-papier sans empêcher l’état copié', async () => {
    // Arrange
    const writeText = vi.fn().mockRejectedValueOnce(new Error('clipboard unavailable'))
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText,
      },
    })

    const wrapper = mountRenderer('REF-404', 'reference')

    // Act
    await getReferenceCell(wrapper).trigger('click')
    await flushPromises()

    // Assert
    expect(writeText).toHaveBeenCalledWith('REF-404')
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(getReferenceCell(wrapper).classes()).toContain('text-emerald-600')

    // Act
    vi.advanceTimersByTime(1500)
    await flushPromises()

    // Assert
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('centre la cellule quand la prop centered est activée', () => {
    // Arrange / Act
    const wrapper = mountRenderer('plain text', undefined, true)

    // Assert
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('items-center')
    expect(wrapper.classes()).toContain('justify-center')
  })
})
