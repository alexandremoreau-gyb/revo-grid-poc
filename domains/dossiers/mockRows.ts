import type { RowData } from '~/types/grid'
import {
  CLIENTS,
  DOSSIER_RAISONS,
  DOSSIER_RISQUES,
  DOSSIER_STATUTS,
  FICHES,
  TF_CODES,
} from './constants'

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function createRows(count = 200): RowData[] {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1
    const fiche = pick(FICHES, i)
    const year = 2024 + (i % 2)
    const month = (i % 12) + 1
    const day = (i % 28) + 1
    const dateStr = formatDate(year, month, day)

    const refCode = fiche.replace(/_/g, '-')
    const reference = `${refCode}-${dateStr}-${String(id).padStart(3, '0')}`

    const cumac = 200000 + (id * 3731) % 800000
    const montantTTC = 1500 + (id * 137) % 12000
    const volumeMwh = 50000 + (id * 2113) % 500000

    const statutWeights = [0, 0, 0, 1, 1, 2, 2, 2, 3, 4, 5]
    const statut = DOSSIER_STATUTS[pick(statutWeights, i * 7 + 3)]!

    let risque: (typeof DOSSIER_RISQUES)[number]
    if (statut === 'Refusé' || statut === 'Incomplet') risque = 'Critique'
    else if (statut === 'En attente') risque = (i % 3 === 0) ? 'Attention' : 'OK'
    else risque = (i % 7 === 0) ? 'Attention' : 'OK'

    const isLongRow = id === 84

    return {
      reference: isLongRow ? `${reference}-EXTENDED-TEST-OVERFLOW-2025` : reference,
      fiche,
      client: isLongRow ? 'SCHNEIDER ELECTRIC INDUSTRIES FRANCE' : pick(CLIENTS, i),
      raisonSociale: isLongRow ? 'SCHNEIDER ELECTRIC INDUSTRIES FRANCE SAS & ASSOCIÉS' : pick(DOSSIER_RAISONS, i),
      date: dateStr,
      lp: isLongRow ? `LP-LONGUE-REFERENCE-TEST-${String(id).padStart(4, '0')}` : `LP-${String(id).padStart(4, '0')}`,
      tf: isLongRow ? 'TF-EXTENDED-CODE-OVERFLOW' : pick(TF_CODES, i),
      cumac,
      montantTTC,
      volumeMwh: new Intl.NumberFormat('fr-FR').format(volumeMwh),
      statut,
      risque,
    }
  })
}
