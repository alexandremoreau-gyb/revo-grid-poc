import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MobileDossierRevoGridCell from '~/components/layout/MobileDossierRevoGridCell.vue'

const baseRow = {
  id: 1,
  reference: 'BAT-TH-122-2025-12-28-084',
  statut: 'Déposé',
  risque: 'OK',
  fiche: 'BAT_TH_122',
  cumac: 0,
  volumeMwh: 0,
}

describe('MobileDossierRevoGridCell badges', () => {
  it('uses the desktop dossier status badge styles in summary rows', () => {
    const wrapper = mount(MobileDossierRevoGridCell, {
      props: {
        model: {
          id: '1-summary',
          rowKind: 'summary',
          row: baseRow,
          rowId: 1,
        },
      },
      global: {
        stubs: {
          MobileGridActionsBar: true,
        },
      },
    })

    const badge = wrapper.find('span.rounded-sm')
    expect(badge.classes()).toContain('bg-emerald-600')
    expect(badge.classes()).toContain('text-white')
  })

  it('uses the desktop risk badge styles in details rows', () => {
    const wrapper = mount(MobileDossierRevoGridCell, {
      props: {
        model: {
          id: '1-details',
          rowKind: 'details',
          row: baseRow,
          rowId: 1,
        },
        editableFields: [],
        formatCurrency: () => '0 EUR',
      },
      global: {
        stubs: {
          Teleport: true,
          MobileGridActionsBar: true,
        },
      },
    })

    const badges = wrapper.findAll('span.rounded-sm')
    const riskBadge = badges.at(-1)

    expect(riskBadge?.classes()).toContain('bg-emerald-600')
    expect(riskBadge?.classes()).toContain('text-white')
  })

  it('renders the editable statut select as a badge in details rows', async () => {
    const wrapper = mount(MobileDossierRevoGridCell, {
      props: {
        model: {
          id: '1-details',
          rowKind: 'details',
          row: baseRow,
          rowId: 1,
        },
        editableFields: ['statut'],
        fieldLabel: () => 'Statut',
        fieldType: () => 'select',
        fieldOptions: () => ['Déposé', 'En attente', 'Refusé'],
        displayValue: () => 'Déposé',
        isPendingField: () => false,
        formatCurrency: () => '0 EUR',
      },
      attachTo: document.body,
      global: {
        stubs: {
          MobileGridActionsBar: true,
        },
      },
    })

    const selectButton = wrapper.find('button')
    expect(selectButton.find('span.rounded-sm').classes()).toContain('bg-emerald-600')

    await selectButton.trigger('pointerdown')

    const options = document.body.querySelectorAll('ul button span.rounded-sm')
    expect(options[0]?.className).toContain('bg-emerald-600')
    expect(options[1]?.className).toContain('bg-amber-500')

    wrapper.unmount()
  })
})
