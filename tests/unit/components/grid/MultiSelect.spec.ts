import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import MultiSelect from '~/components/grid/MultiSelect.vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const options = ['Alpha', 'Beta', 'Gamma']
type MultiSelectProps = Partial<{
  modelValue: string[]
  options: string[]
  placeholder: string
}>

type MountedWrapper = ReturnType<typeof mount>
type ClassListWrapper = {
  classes: () => string[]
}

const mountedWrappers: MountedWrapper[] = []

afterEach(() => {
  while (mountedWrappers.length) {
    mountedWrappers.pop()?.unmount()
  }
})

function mountMultiSelect(props: MultiSelectProps = {}): MountedWrapper {
  const wrapper = mount(MultiSelect, {
    props: {
      modelValue: [],
      options,
      ...props,
    },
  })

  mountedWrappers.push(wrapper)
  return wrapper
}

function expectButtonClasses(button: ClassListWrapper, ...classNames: string[]) {
  for (const className of classNames) {
    expect(button.classes()).toContain(className)
  }
}

async function openMultiSelect(wrapper: MountedWrapper) {
  await wrapper.get('button').trigger('click')
  await nextTick()
}

describe('MultiSelect', () => {
  it('affiche le libellé par défaut et le style inactif quand rien n’est sélectionné', () => {
    const wrapper = mountMultiSelect()

    const button = wrapper.get('button')

    expect(button.text()).toContain('Tous')
    expectButtonClasses(
      button,
      'border-[var(--color-border)]',
      'bg-[var(--color-surface-strong)]',
      'text-[var(--color-text)]',
    )
    expect(button.find('svg').exists()).toBe(true)
  })

  it('utilise un placeholder personnalisé quand il est fourni', () => {
    const wrapper = mountMultiSelect({
      placeholder: 'Filtrer',
    })

    expect(wrapper.get('button').text()).toContain('Filtrer')
  })

  it('ajoute les classes actives quand une valeur est sélectionnée', () => {
    const wrapper = mountMultiSelect({
      modelValue: ['Alpha'],
    })

    const button = wrapper.get('button')

    expect(button.text()).toContain('Alpha')
    expectButtonClasses(
      button,
      'border-[var(--color-primary)]',
      'bg-[var(--color-primary)]/8',
      'text-[var(--color-primary)]',
    )
    expect(wrapper.findAll('button').some(item => item.classes().includes('ml-0.5'))).toBe(true)
  })

  it('affiche le compteur des sélections quand plusieurs valeurs sont choisies', () => {
    const wrapper = mountMultiSelect({
      modelValue: ['Alpha', 'Beta'],
    })

    expect(wrapper.get('button').text()).toContain('Alpha +1')
  })

  it('ouvre la liste et affiche toutes les options au clic', async () => {
    const wrapper = mountMultiSelect()

    expect(wrapper.findAll('label')).toHaveLength(0)

    await openMultiSelect(wrapper)

    const labels = wrapper.findAll('label')

    expect(labels).toHaveLength(options.length)
    expect(labels.map(label => label.text())).toEqual(options)
  })

  it('émet les sélections ajoutées et retirées depuis les cases à cocher', async () => {
    const wrapper = mountMultiSelect()

    await openMultiSelect(wrapper)

    const firstCheckbox = wrapper.find<HTMLInputElement>('input[type="checkbox"]')

    expect(firstCheckbox.exists()).toBe(true)
    firstCheckbox.element.checked = true
    await firstCheckbox.trigger('change')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['Alpha']])

    await wrapper.setProps({
      modelValue: ['Alpha'],
    })

    firstCheckbox.element.checked = false
    await firstCheckbox.trigger('change')

    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[]])
  })

  it('émet une remise à zéro quand on clique sur le bouton de suppression', async () => {
    const wrapper = mountMultiSelect({
      modelValue: ['Alpha'],
    })

    const clearButton = wrapper.findAll('button').find(item => item.classes().includes('ml-0.5'))

    await clearButton!.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])
  })

  it('referme la liste lorsqu’un clic extérieur survient', async () => {
    const wrapper = mountMultiSelect()

    await openMultiSelect(wrapper)

    expect(wrapper.findAll('label')).toHaveLength(options.length)

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.findAll('label')).toHaveLength(0)
  })

  it('conserve la liste ouverte lorsqu’un clic document vient du composant', async () => {
    const wrapper = mountMultiSelect()

    await openMultiSelect(wrapper)

    wrapper.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.findAll('label')).toHaveLength(options.length)
  })

  it('gère un clic document après démontage', async () => {
    let clickListener: EventListener | undefined
    const addListenerSpy = vi.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
      if (type === 'click')
        clickListener = listener as EventListener

      return EventTarget.prototype.addEventListener.call(document, type, listener, options)
    })
    const removeListenerSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mountMultiSelect()

    wrapper.unmount()
    clickListener?.(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(clickListener).toBeDefined()
    expect(removeListenerSpy).toHaveBeenCalledWith('click', clickListener!)

    addListenerSpy.mockRestore()
    removeListenerSpy.mockRestore()
  })

})
