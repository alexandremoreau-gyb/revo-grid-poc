import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MobileDossierRevoGridCell from '~/components/layout/MobileDossierRevoGridCell.vue'

const row = {
  id: 1,
  reference: 'DOS-001',
  statut: 'Déposé',
  fiche: 'BAT_TH_122',
}

function mountEditingField(type: 'date' | 'number') {
  return mount(MobileDossierRevoGridCell, {
    props: {
      model: {
        id: '1-details',
        rowKind: 'details',
        row,
        rowId: 1,
      },
      editableFields: ['dateDepot'],
      fieldLabel: () => 'Date dépôt',
      fieldType: () => type,
      isEditing: () => true,
      editValue: () => (type === 'date' ? '2026-04-30' : '42'),
      displayValue: () => 'value',
      isPendingField: () => false,
      formatCurrency: () => '0',
    },
    global: {
      stubs: {
        Teleport: true,
        MobileGridActionsBar: true,
      },
    },
  })
}

describe('MobileDossierRevoGridCell', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })
  })

  it('focuses date inputs without trying to set a text selection', () => {
    expect(() => mountEditingField('date')).not.toThrow()
  })

  it('focuses number inputs without trying to set a text selection', () => {
    expect(() => mountEditingField('number')).not.toThrow()
  })
})
