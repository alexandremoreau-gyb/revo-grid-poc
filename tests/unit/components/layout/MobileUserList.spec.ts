import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import MobileUserList from '~/components/layout/MobileUserList.vue'
import type { RowData } from '~/types/grid'

const mountedWrappers: ReturnType<typeof mount>[] = []

afterEach(() => {
  while (mountedWrappers.length) mountedWrappers.pop()?.unmount()
})

function makeRow(overrides: Partial<RowData> = {}): RowData {
  return {
    id: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@test.fr',
    societe: 'REXEL',
    role: 'Manager',
    statut: 'Active',
    dateCreation: '2024-03-15',
    dernierAcces: '2025-01-10',
    ...overrides,
  }
}

function mountList(rows: RowData[] = [makeRow()]) {
  const wrapper = mount(MobileUserList, { props: { rows } })
  mountedWrappers.push(wrapper)
  return wrapper
}

describe('tap-to-edit — champs texte', () => {
  it('affiche un input[type=text] quand on clique sur la valeur "nom"', async () => {
    const wrapper = mountList()

    // Ouvrir la ligne
    await wrapper.find('button').trigger('click')
    await nextTick()

    // Trouver le bouton de valeur "nom"
    const nomBtn = wrapper.find('[data-edit="nom"]')
    expect(nomBtn.exists()).toBe(true)

    await nomBtn.trigger('click')
    await nextTick()

    const input = wrapper.find('input[data-edit-input="nom"]')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('Dupont')
  })

  it('sauvegarde la valeur et repasse en lecture sur blur', async () => {
    const rows = [makeRow()]
    const wrapper = mountList(rows)

    await wrapper.find('button').trigger('click')
    await nextTick()

    await wrapper.find('[data-edit="nom"]').trigger('click')
    await nextTick()

    const input = wrapper.find('input[data-edit-input="nom"]')
    await input.setValue('Martin')
    await input.trigger('blur')
    await nextTick()

    expect(rows[0]!.nom).toBe('Martin')
    expect(wrapper.find('input[data-edit-input="nom"]').exists()).toBe(false)
    expect(wrapper.find('[data-edit="nom"]').text()).toContain('Martin')
  })
})

describe('tap-to-edit — champs select', () => {
  it('affiche un <select> quand on clique sur la valeur "role"', async () => {
    const wrapper = mountList()

    await wrapper.find('button').trigger('click')
    await nextTick()

    await wrapper.find('[data-edit="role"]').trigger('click')
    await nextTick()

    const sel = wrapper.find('select[data-edit-input="role"]')
    expect(sel.exists()).toBe(true)
    expect((sel.element as HTMLSelectElement).value).toBe('Manager')
  })

  it('sauvegarde immédiatement sur change du select', async () => {
    const rows = [makeRow()]
    const wrapper = mountList(rows)

    await wrapper.find('button').trigger('click')
    await nextTick()

    await wrapper.find('[data-edit="role"]').trigger('click')
    await nextTick()

    const sel = wrapper.find('select[data-edit-input="role"]')
    await sel.setValue('Admin')
    await sel.trigger('change')
    await nextTick()

    expect(rows[0]!.role).toBe('Admin')
    expect(wrapper.find('select[data-edit-input="role"]').exists()).toBe(false)
  })
})

describe('champs non-éditables', () => {
  it('dateCreation ne rend pas de bouton éditable', async () => {
    const wrapper = mountList()

    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-edit="dateCreation"]').exists()).toBe(false)
    expect(wrapper.find('[data-edit="dernierAcces"]').exists()).toBe(false)
  })
})

describe('exclusivité d\'édition', () => {
  it('ouvrir un second champ ferme le premier', async () => {
    const wrapper = mountList()

    await wrapper.find('button').trigger('click')
    await nextTick()

    await wrapper.find('[data-edit="nom"]').trigger('click')
    await nextTick()
    expect(wrapper.find('input[data-edit-input="nom"]').exists()).toBe(true)

    await wrapper.find('[data-edit="prenom"]').trigger('click')
    await nextTick()
    expect(wrapper.find('input[data-edit-input="nom"]').exists()).toBe(false)
    expect(wrapper.find('input[data-edit-input="prenom"]').exists()).toBe(true)
  })
})
