import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'

import fr from '~/i18n/fr'
import GridToolbar from '~/components/grid/GridToolbar.vue'

// Suite de regression pour la barre d'outils:
// recherche, toggle de filtre et actions secondaires.
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: { fr },
})

describe('GridToolbar', () => {
  it('émet la saisie de recherche et le filtre', async () => {
    // Arrange
    const wrapper = mount(GridToolbar, {
      global: {
        plugins: [i18n],
      },
      props: {
        modelValue: '',
        filterActive: false,
        resultCount: 10,
      },
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
    const wrapper = mount(GridToolbar, {
      global: {
        plugins: [i18n],
      },
      props: {
        modelValue: 'alice',
        filterActive: true,
        showClear: true,
        showRefresh: true,
      },
    })

    const buttons = wrapper.findAll('button')

    // Act
    await buttons[1].trigger('click')
    await buttons[2].trigger('click')

    // Assert
    expect(wrapper.emitted('clear')?.[0]).toEqual([])
    expect(wrapper.emitted('refresh')?.[0]).toEqual([])
  })

  it('affiche un résumé de densité et l’état du filtre actif', () => {
    // Arrange / Act
    const wrapper = mount(GridToolbar, {
      global: {
        plugins: [i18n],
      },
      props: {
        modelValue: 'alice',
        filterActive: true,
        resultCount: 3,
      },
    })

    // Assert
    expect(wrapper.text()).toContain('3 lignes')
    expect(wrapper.text()).toContain('alice')
  })
})
