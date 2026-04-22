import fr from '~/i18n/fr'
import en from '~/i18n/en'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GridPagination from '~/components/grid/GridPagination.vue'

// Suite de regression pour la pagination autonome du grid:
// affichage, bornes et emits de navigation.
type PaginationMountProps = {
  page: number
  pageSize: number
  total: number
}

const DEFAULT_PROPS = {
  page: 1,
  pageSize: 10,
  total: 42,
} satisfies PaginationMountProps

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: { fr, en },
})

function mountPagination(props: Partial<PaginationMountProps> = {}) {
  return mount(GridPagination, {
    global: {
      plugins: [i18n],
    },
    props: { ...DEFAULT_PROPS, ...props },
  })
}

type PaginationEventName =
  | 'update:page'
  | 'update:pageSize'
  | 'page-change'
  | 'page-size-change'

function expectEmittedValue(
  wrapper: ReturnType<typeof mountPagination>,
  eventName: PaginationEventName,
  value: number,
) {
  expect(wrapper.emitted(eventName)?.[0]).toEqual([value])
}

function expectTextContains(wrapper: ReturnType<typeof mountPagination>, text: string) {
  expect(wrapper.text()).toContain(text)
}

describe('GridPagination', () => {
  it('affiche la page courante et la plage de résultats', () => {
    // Arrange / Act
    const wrapper = mountPagination({ page: 2 })
    const text = wrapper.text()

    // Assert
    expect(text).toContain('Page 2')
    expect(text).toContain('sur 5')
    expect(text).toContain('42 lignes')
    expect(text).toContain('11-20')
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
    expectEmittedValue(wrapper, 'update:page', 2)
    expectEmittedValue(wrapper, 'page-change', 2)
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
    expectEmittedValue(wrapper, 'page-change', 2)
  })

  it('émet update:pageSize et page-size-change quand la taille change', async () => {
    // Arrange
    const wrapper = mountPagination()

    // Act
    await wrapper.get('select').setValue('25')

    // Assert
    expectEmittedValue(wrapper, 'update:pageSize', 25)
    expectEmittedValue(wrapper, 'page-size-change', 25)
  })

  it('désactive la pagination quand total vaut zéro', () => {
    // Arrange / Act
    const wrapper = mountPagination({ total: 0 })

    // Assert
    expectTextContains(wrapper, 'Page 1')
    expectTextContains(wrapper, '0 lignes')
    expectTextContains(wrapper, '0-0')
    expect((wrapper.get('button').element as HTMLButtonElement).disabled).toBe(true)
    expect((wrapper.get('[aria-label="next-page"]').element as HTMLButtonElement).disabled).toBe(true)
  })
})
