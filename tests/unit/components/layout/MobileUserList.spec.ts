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

// Helper: open the first accordion row
async function openRow(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('button').trigger('click')
  await nextTick()
}

describe('tap-to-edit — champs texte', () => {
  it('affiche un input[type=text] quand on clique sur la valeur "nom"', async () => {
    const wrapper = mountList()
    await openRow(wrapper)

    const nomBtn = wrapper.find('[data-edit="nom"]')
    expect(nomBtn.exists()).toBe(true)

    await nomBtn.trigger('click')
    await nextTick()

    const input = wrapper.find('input[data-edit-input="nom"]')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).type).toBe('text')
    expect((input.element as HTMLInputElement).value).toBe('Dupont')
  })

  it('stocke le brouillon sur blur sans sauvegarder dans le row', async () => {
    const rows = [makeRow()]
    const wrapper = mountList(rows)
    await openRow(wrapper)

    await wrapper.find('[data-edit="nom"]').trigger('click')
    await nextTick()

    await wrapper.find('input[data-edit-input="nom"]').setValue('Martin')
    await wrapper.find('input[data-edit-input="nom"]').trigger('blur')
    await nextTick()

    expect(rows[0]!.nom).toBe('Dupont') // row not mutated yet
    expect(wrapper.find('input[data-edit-input="nom"]').exists()).toBe(false)
    expect(wrapper.find('[data-edit="nom"]').text()).toContain('Martin') // display updated
    expect(wrapper.find('[data-row-confirm]').exists()).toBe(true) // save bar visible
  })

  it('commit toutes les modifs sur clic Enregistrer', async () => {
    const rows = [makeRow()]
    const wrapper = mountList(rows)
    await openRow(wrapper)

    await wrapper.find('[data-edit="nom"]').trigger('click')
    await nextTick()
    await wrapper.find('input[data-edit-input="nom"]').setValue('Martin')
    await wrapper.find('input[data-edit-input="nom"]').trigger('blur')
    await nextTick()

    await wrapper.find('[data-edit="prenom"]').trigger('click')
    await nextTick()
    await wrapper.find('input[data-edit-input="prenom"]').setValue('Paul')
    await wrapper.find('input[data-edit-input="prenom"]').trigger('blur')
    await nextTick()

    await wrapper.find('[data-row-confirm]').trigger('click')
    await nextTick()

    expect(rows[0]!.nom).toBe('Martin')
    expect(rows[0]!.prenom).toBe('Paul')
    expect(wrapper.find('[data-row-confirm]').exists()).toBe(false)
  })

  it('annule toutes les modifs sur clic Annuler', async () => {
    const rows = [makeRow()]
    const wrapper = mountList(rows)
    await openRow(wrapper)

    await wrapper.find('[data-edit="nom"]').trigger('click')
    await nextTick()
    await wrapper.find('input[data-edit-input="nom"]').setValue('Martin')
    await wrapper.find('input[data-edit-input="nom"]').trigger('blur')
    await nextTick()

    await wrapper.find('[data-row-cancel]').trigger('click')
    await nextTick()

    expect(rows[0]!.nom).toBe('Dupont')
    expect(wrapper.find('[data-edit="nom"]').text()).toContain('Dupont')
    expect(wrapper.find('[data-row-confirm]').exists()).toBe(false)
  })

  it("n'affiche pas la barre de sauvegarde si la valeur n'a pas changé", async () => {
    const rows = [makeRow()]
    const wrapper = mountList(rows)
    await openRow(wrapper)

    await wrapper.find('[data-edit="nom"]').trigger('click')
    await nextTick()
    // blur without changing value
    await wrapper.find('input[data-edit-input="nom"]').trigger('blur')
    await nextTick()

    expect(wrapper.find('[data-row-confirm]').exists()).toBe(false)
  })
})

describe('tap-to-edit — champs select', () => {
  it('affiche un <select> quand on clique sur la valeur "role"', async () => {
    const wrapper = mountList()
    await openRow(wrapper)

    await wrapper.find('[data-edit="role"]').trigger('click')
    await nextTick()

    const sel = wrapper.find('select[data-edit-input="role"]')
    expect(sel.exists()).toBe(true)
    expect((sel.element as HTMLSelectElement).value).toBe('Manager')
  })

  it('stocke le brouillon sur change du select sans sauvegarder dans le row', async () => {
    const rows = [makeRow()]
    const wrapper = mountList(rows)
    await openRow(wrapper)

    await wrapper.find('[data-edit="role"]').trigger('click')
    await nextTick()

    await wrapper.find('select[data-edit-input="role"]').setValue('Admin')
    await nextTick()

    expect(rows[0]!.role).toBe('Manager') // row not mutated yet
    expect(wrapper.find('select[data-edit-input="role"]').exists()).toBe(false)
    expect(wrapper.find('[data-edit="role"]').text()).toContain('Admin')
    expect(wrapper.find('[data-row-confirm]').exists()).toBe(true)
  })
})

describe('champs non-éditables', () => {
  it('dateCreation et dernierAcces ne rendent pas de bouton éditable', async () => {
    const wrapper = mountList()
    await openRow(wrapper)

    // Positive anchor: editable fields are rendered
    expect(wrapper.find('[data-edit="nom"]').exists()).toBe(true)
    // Date fields have no edit button
    expect(wrapper.find('[data-edit="dateCreation"]').exists()).toBe(false)
    expect(wrapper.find('[data-edit="dernierAcces"]').exists()).toBe(false)
  })
})

describe("exclusivité d'édition", () => {
  it('ouvrir un second champ ferme le premier', async () => {
    const wrapper = mountList()
    await openRow(wrapper)

    await wrapper.find('[data-edit="nom"]').trigger('click')
    await nextTick()
    expect(wrapper.find('input[data-edit-input="nom"]').exists()).toBe(true)

    await wrapper.find('[data-edit="prenom"]').trigger('click')
    await nextTick()
    expect(wrapper.find('input[data-edit-input="nom"]').exists()).toBe(false)
    expect(wrapper.find('input[data-edit-input="prenom"]').exists()).toBe(true)
  })
})
