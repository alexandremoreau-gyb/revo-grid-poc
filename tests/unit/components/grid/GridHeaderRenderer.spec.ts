import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GridHeaderRenderer from '~/components/grid/GridHeaderRenderer.vue'

type HeaderAlign = 'start' | 'center'

type HeaderProps = {
  name?: string
  align?: HeaderAlign
}

const gridTooltipStub = {
  props: ['text'],
  template: '<span class="grid-tooltip-stub">{{ text }}</span>',
}

function mountHeader(props: HeaderProps = {}) {
  return mount(GridHeaderRenderer, {
    global: {
      stubs: {
        GridTooltip: gridTooltipStub,
      },
    },
    props,
  })
}

function headerClasses(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('span.flex').classes()
}

describe('GridHeaderRenderer', () => {
  it('transmet le nom au tooltip', () => {
    expect(mountHeader({ name: 'My column' }).get('.grid-tooltip-stub').text()).toBe('My column')
  })

  it('transmet une chaîne vide quand le nom est absent', () => {
    expect(mountHeader().get('.grid-tooltip-stub').text()).toBe('')
  })

  it("aligne le header au centre quand demandé", () => {
    const centered = headerClasses(mountHeader({ name: 'Status', align: 'center' }))
    const start = headerClasses(mountHeader({ name: 'Name', align: 'start' }))

    expect(centered).toContain('justify-center')
    expect(centered).toContain('text-center')
    expect(start).toContain('justify-start')
    expect(start).toContain('text-left')
  })

  it('ne décale pas les headers alignés à gauche avec un padding interne', () => {
    expect(headerClasses(mountHeader({ name: 'Email', align: 'start' }))).not.toContain('px-2')
    expect(headerClasses(mountHeader({ name: 'Status', align: 'center' }))).toContain('px-2')
  })
})
