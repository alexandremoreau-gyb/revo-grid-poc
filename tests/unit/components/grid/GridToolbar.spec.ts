import fr from '~/i18n/fr'
import en from '~/i18n/en'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GridToolbar from '~/components/grid/GridToolbar.vue'
import ClearFiltersButton from '~/components/grid/ClearFiltersButton.vue'

type ToolbarMountProps = {
  modelValue: string
  filterActive?: boolean
  searchLabel?: string
  filterLabel?: string
  resultCount?: number
  showClear?: boolean
  showRefresh?: boolean
}

const defaultToolbarProps = {
  modelValue: '',
} satisfies ToolbarMountProps

// Suite de regression pour la barre d'outils:
// recherche, toggle de filtre et actions secondaires.
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: { fr, en },
})

function mountToolbar(props: Partial<ToolbarMountProps> = {}) {
  return mount(GridToolbar, {
    global: {
      plugins: [i18n],
    },
    props: {
      ...defaultToolbarProps,
      ...props,
    },
  })
}

function getActionButton(wrapper: ReturnType<typeof mountToolbar>, index: number) {
  const button = wrapper.findAll('button')[index]
  if (!button) throw new Error(`Missing toolbar action button at index ${index}`)
  return button
}

describe('GridToolbar', () => {
  it('émet la saisie de recherche et le filtre', async () => {
    // Arrange
    const wrapper = mountToolbar({
      modelValue: '',
      filterActive: false,
      resultCount: 10,
    })

    // Act
    await wrapper.get('input').setValue('alice')
    await wrapper.get('button').trigger('click')

    // Assert
    expect(wrapper.text()).toContain('10 lignes')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['alice'])
    expect(wrapper.emitted('filter')?.[0]).toEqual([true])
  })

  it('émet clear et refresh quand les actions sont activées', async () => {
    // Arrange
    const wrapper = mountToolbar({
      modelValue: 'alice',
      filterActive: true,
      showClear: true,
      showRefresh: true,
    })

    const clearButton = getActionButton(wrapper, 1)
    const refreshButton = getActionButton(wrapper, 2)

    // Act
    await clearButton.trigger('click')
    await refreshButton.trigger('click')

    // Assert
    expect(wrapper.emitted('clear')?.[0]).toEqual([])
    expect(wrapper.emitted('refresh')?.[0]).toEqual([])
  })

  it('affiche un résumé de densité et l’état du filtre actif', () => {
    // Arrange / Act
    const wrapper = mountToolbar({
      modelValue: 'alice',
      filterActive: true,
      resultCount: 3,
    })

    // Assert
    expect(wrapper.text()).toContain('3 lignes')
    expect(wrapper.text()).toContain('alice')
  })
})

describe('ClearFiltersButton', () => {
  it('émet click quand le bouton est activé', async () => {
    const wrapper = mount(ClearFiltersButton)

    await wrapper.get('button').trigger('click')

    expect(wrapper.text()).toContain('Réinitialiser')
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.emitted('click')?.[0]).toEqual([])
  })
})
