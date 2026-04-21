import type { ColumnDef, RowData } from '~/types/grid'
import {
  createDateEditor,
  createNumberEditor,
  createStatusEditor,
  createTextEditor,
} from '~/components/grid/inlineEditors'

export const DOSSIER_STATUTS = [
  'Déposé',
  'En cours',
  'En attente',
  'Incomplet',
  'Refusé',
  'Annulé',
] as const

export const DOSSIER_RISQUES = ['OK', 'Attention', 'Critique'] as const

export const FICHES = [
  'BAR_TH_123', 'BAR_TH_171', 'BAT_EQ_127', 'BAT_TH_122',
  'BAT_EN_107', 'BAR_TH_143', 'BAR_SE_104', 'BAT_TH_116',
] as const

export const CLIENTS = [
  'COPRIM', 'ENGIE HOME SERVICES', 'REXEL', 'POINT P', 'SCHNEIDER',
  'SOMFY', 'ATLANTIC', 'DAIKIN', 'VIESSMANN', 'SAUNIER DUVAL',
  'THERMOR', 'DE DIETRICH', 'BOSCH', 'VAILLANT', 'CHAFFOTEAUX',
] as const

const RAISONS = [
  'SAS COPRIM ILE-DE-FRANCE', 'ENGIE HOME SERVICES SA', 'REXEL FRANCE',
  'POINT P DISTRIBUTION', 'SCHNEIDER ELECTRIC FRANCE', 'SOMFY SAS',
  'ATLANTIC CLIMATISATION', 'DAIKIN FRANCE SAS', 'VIESSMANN SAS',
  'SAUNIER DUVAL FRANCE', 'THERMOR BRANDT SA', 'DE DIETRICH THERMIQUE',
  'BOSCH THERMOTECHNIK FR', 'VAILLANT GROUP FRANCE', 'CHAFFOTEAUX ET MAURY',
] as const

export const TF_CODES = ['TOP', 'TF1', 'TF2', 'TF3', 'TF4'] as const

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Colonnes de la grille dossiers
export const dossierColumns: ColumnDef[] = [
  { prop: 'reference',     name: 'RÉFÉRENCE',       size: 250, editable: false, variant: 'reference' },
  { prop: 'client',        name: 'CLIENT',          size: 160, editable: true, type: 'string', editor: 'dossier-text', centered: true },
  { prop: 'raisonSociale', name: 'RAISON SOCIALE',  size: 200, editable: true, variant: 'company', type: 'string', editor: 'dossier-text' },
  { prop: 'date',          name: 'DATE',            size: 100, editable: true, variant: 'date', type: 'date', editor: 'dossier-date' },
  { prop: 'lp',            name: 'LP',              size: 90,  editable: true, type: 'string', editor: 'dossier-text' },
  { prop: 'tf',            name: 'TF',              size: 80,  editable: true, type: 'string', editor: 'dossier-text' },
  { prop: 'cumac',         name: 'CUMAC',           size: 115, editable: false, variant: 'currency' },
  { prop: 'montantTTC',    name: 'MONTANT TTC',     size: 120, editable: true, variant: 'currency', type: 'number', editor: 'dossier-number', centered: true },
  { prop: 'volumeMwh',     name: 'VOLUME MWh',      size: 100, editable: false, type: 'number', centered: true },
  { prop: 'statut',        name: 'STATUT',          size: 130, editable: true, variant: 'dossier-status', editor: 'select-statut', centered: true },
  { prop: 'risque',        name: 'RISQUE',          size: 100, editable: false, variant: 'risk', centered: true },
]

// Éditeurs custom à passer à DataGrid — doit rester en dehors du composant Vue
// pour éviter la recréation à chaque render
export const dossierEditors = {
  'dossier-text': createTextEditor(),
  'dossier-date': createDateEditor(),
  'dossier-number': createNumberEditor(),
  'select-statut': createStatusEditor([...DOSSIER_STATUTS]),
}

export function createDossierRows(count = 200): RowData[] {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1
    const fiche = pick(FICHES, i)
    const year = 2024 + (i % 2)
    const month = (i % 12) + 1
    const day = (i % 28) + 1
    const dateStr = formatDate(year, month, day)

    // Génère une référence lisible type BAR-TH-123-2024-03-15-042
    const refCode = fiche.replace(/_/g, '-')
    const reference = `${refCode}-${dateStr}-${String(id).padStart(3, '0')}`

    const cumac = 200000 + (id * 3731) % 800000
    const montantTTC = 1500 + (id * 137) % 12000
    const volumeMwh = 50000 + (id * 2113) % 500000

    // Statuts pondérés : plus de "En cours" et "Déposé" que d'erreurs
    const statutWeights = [0, 0, 0, 1, 1, 2, 2, 2, 3, 4, 5]
    const statut = DOSSIER_STATUTS[pick(statutWeights, i * 7 + 3)]!

    // Risque corrélé au statut
    let risque: (typeof DOSSIER_RISQUES)[number]
    if (statut === 'Refusé' || statut === 'Incomplet') risque = 'Critique'
    else if (statut === 'En attente') risque = (i % 3 === 0) ? 'Attention' : 'OK'
    else risque = (i % 7 === 0) ? 'Attention' : 'OK'

    const isLongRow = id === 84
    return {
      reference:     isLongRow ? `${reference}-EXTENDED-TEST-OVERFLOW-2025` : reference,
      fiche,
      client:        isLongRow ? 'SCHNEIDER ELECTRIC INDUSTRIES FRANCE' : pick(CLIENTS, i),
      raisonSociale: isLongRow ? 'SCHNEIDER ELECTRIC INDUSTRIES FRANCE SAS & ASSOCIÉS' : pick(RAISONS, i),
      date:          dateStr,
      lp:            isLongRow ? `LP-LONGUE-REFERENCE-TEST-${String(id).padStart(4, '0')}` : `LP-${String(id).padStart(4, '0')}`,
      tf:            isLongRow ? 'TF-EXTENDED-CODE-OVERFLOW' : pick(TF_CODES, i),
      cumac,
      montantTTC,
      volumeMwh:     new Intl.NumberFormat('fr-FR').format(volumeMwh),
      statut,
      risque,
    }
  })
}
