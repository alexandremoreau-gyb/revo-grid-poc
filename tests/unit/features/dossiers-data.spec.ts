import { describe, expect, it } from 'vitest'
import { columns } from '~/domains/dossiers/columns'
import { editors } from '~/domains/dossiers/editors'
import { createRows } from '~/domains/dossiers/mockRows'
import {
  CLIENTS,
  DOSSIER_RAISONS,
  DOSSIER_RISQUES,
  DOSSIER_STATUTS,
  FICHES,
  TF_CODES,
} from '~/domains/dossiers/constants'
import {
  CLIENTS as exportedClients,
  DOSSIER_RISQUES as exportedRisques,
  DOSSIER_STATUTS as exportedStatuts,
  FICHES as exportedFiches,
  TF_CODES as exportedTfCodes,
  columns as exportedColumns,
  createRows as exportedCreateRows,
  editors as exportedEditors,
} from '~/domains/dossiers/data'

describe('dossiers feature data', () => {
  it('exposes focused modules while keeping the data.ts public entrypoint compatible', () => {
    expect(exportedClients).toBe(CLIENTS)
    expect(exportedRisques).toBe(DOSSIER_RISQUES)
    expect(exportedStatuts).toBe(DOSSIER_STATUTS)
    expect(exportedFiches).toBe(FICHES)
    expect(exportedTfCodes).toBe(TF_CODES)
    expect(exportedColumns).toBe(columns)
    expect(exportedCreateRows).toBe(createRows)
    expect(exportedEditors).toBe(editors)
  })

  it('keeps dossier columns, editors, and generated rows deterministic', () => {
    const rows = createRows(84)

    expect(DOSSIER_RAISONS[0]).toBe('SAS COPRIM ILE-DE-FRANCE')
    expect(Object.keys(editors)).toEqual([
      'dossier-text',
      'dossier-date',
      'dossier-number',
      'select-statut',
    ])
    expect(columns.map((column) => column.prop)).toEqual([
      'reference',
      'client',
      'raisonSociale',
      'date',
      'lp',
      'tf',
      'cumac',
      'montantTTC',
      'volumeMwh',
      'statut',
      'risque',
    ])
    expect(rows[0]).toMatchObject({
      reference: 'BAR-TH-123-2024-01-01-001',
      fiche: 'BAR_TH_123',
      client: 'COPRIM',
      raisonSociale: 'SAS COPRIM ILE-DE-FRANCE',
      date: '2024-01-01',
      lp: 'LP-0001',
      tf: 'TOP',
      cumac: 203731,
      montantTTC: 1637,
      statut: 'En cours',
      risque: 'Attention',
    })
    expect(rows[83]).toMatchObject({
      reference: 'BAT-TH-122-2025-12-28-084-EXTENDED-TEST-OVERFLOW-2025',
      fiche: 'BAT_TH_122',
      client: 'SCHNEIDER ELECTRIC INDUSTRIES FRANCE',
      raisonSociale: 'SCHNEIDER ELECTRIC INDUSTRIES FRANCE SAS & ASSOCIÉS',
      date: '2025-12-28',
      lp: 'LP-LONGUE-REFERENCE-TEST-0084',
      tf: 'TF-EXTENDED-CODE-OVERFLOW',
      statut: 'Déposé',
      risque: 'OK',
    })
  })
})
