import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GridHeaderRenderer from '~/components/grid/GridHeaderRenderer.vue'

const gridTooltipStub = {
  props: ['text'],
  template: '<span class="grid-tooltip-stub">{{ text }}</span>',
}

function mountHeader(name?: string) {
  return mount(GridHeaderRenderer, {
    global: {
      stubs: {
        GridTooltip: gridTooltipStub,
      },
    },
    props: name === undefined ? {} : { name },
  })
}

describe('GridHeaderRenderer', () => {
  it('transmet le nom au tooltip', () => {
    // Arrange / Act
    const wrapper = mountHeader('My column')

    // Assert
    expect(wrapper.get('.grid-tooltip-stub').text()).toBe('My column')
  })

  it('transmet une chaîne vide quand le nom est absent', () => {
    // Arrange / Act
    const wrapper = mountHeader()

    // Assert
    expect(wrapper.get('.grid-tooltip-stub').text()).toBe('')
  })
})
