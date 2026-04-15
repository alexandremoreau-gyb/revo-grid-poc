import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'

import GridPagination from '~/components/grid/GridPagination.vue'
import fr from '~/i18n/fr'

// Suite de regression pour la pagination autonome du grid:
// affichage, bornes et emits de navigation.
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: { fr },
})

function mountPagination(props: Record<string, unknown> = {}) {
  return mount(GridPagination, {
    global: {
      plugins: [i18n],
    },
    props: {
      page: 1,
      pageSize: 10,
      total: 42,
      ...props,
    },
  })
}

describe('GridPagination', () => {
  it('affiche la page courante et la plage de résultats', () => {
    // Arrange / Act
    const wrapper = mountPagination({
      page: 2,
      pageSize: 10,
      total: 42,
    })

    // Assert
    expect(wrapper.text()).toContain('Page 2')
    expect(wrapper.text()).toContain('sur 5')
    expect(wrapper.text()).toContain('42 lignes')
    expect(wrapper.text()).toContain('11-20')
  })

  it('émet update:page et page-change quand on va à la page suivante', async () => {
    // Arrange
    const wrapper = mountPagination({
      page: 1,
      total: 42,
    })

    // Act
    await wrapper.get('[aria-label="next-page"]').trigger('click')

    // Assert
    expect(wrapper.emitted('update:page')?.[0]).toEqual([2])
    expect(wrapper.emitted('page-change')?.[0]).toEqual([2])
  })

  it('émet page-change quand on revient à la page précédente', async () => {
    // Arrange
    const wrapper = mountPagination({
      page: 3,
      total: 42,
    })

    // Act
    await wrapper.get('button').trigger('click')

    // Assert
    expect(wrapper.emitted('page-change')?.[0]).toEqual([2])
  })

  it('émet update:pageSize et page-size-change quand la taille change', async () => {
    // Arrange
    const wrapper = mountPagination()

    // Act
    await wrapper.get('select').setValue('25')

    // Assert
    expect(wrapper.emitted('update:pageSize')?.[0]).toEqual([25])
    expect(wrapper.emitted('page-size-change')?.[0]).toEqual([25])
  })

  it('désactive la pagination quand total vaut zéro', () => {
    // Arrange / Act
    const wrapper = mountPagination({
      total: 0,
    })

    // Assert
    expect(wrapper.text()).toContain('Page 1')
    expect(wrapper.text()).toContain('0 lignes')
    expect(wrapper.text()).toContain('0-0')
    expect((wrapper.get('button').element as HTMLButtonElement).disabled).toBe(true)
    expect((wrapper.get('[aria-label="next-page"]').element as HTMLButtonElement).disabled).toBe(true)
  })
})
