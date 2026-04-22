import type { ColumnDef } from '~/types/grid'

export const columns: ColumnDef[] = [
  { prop: 'reference', name: 'RÉFÉRENCE', size: 250, editable: false, variant: 'reference', headerAlign: 'start', colPriority: 1 },
  { prop: 'client', name: 'CLIENT', size: 160, editable: true, type: 'string', editor: 'dossier-text', headerAlign: 'start', colPriority: 1 },
  { prop: 'raisonSociale', name: 'RAISON SOCIALE', size: 200, editable: true, variant: 'company', type: 'string', editor: 'dossier-text', headerAlign: 'start', colPriority: 2 },
  { prop: 'date', name: 'DATE', size: 100, editable: true, variant: 'date', type: 'date', editor: 'dossier-date', centered: true, headerAlign: 'center', colPriority: 2 },
  { prop: 'lp', name: 'LP', size: 90, editable: true, type: 'string', editor: 'dossier-text', centered: true, headerAlign: 'center', colPriority: 4 },
  { prop: 'tf', name: 'TF', size: 80, editable: true, type: 'string', editor: 'dossier-text', centered: true, headerAlign: 'center', colPriority: 4 },
  { prop: 'cumac', name: 'CUMAC', size: 115, editable: false, variant: 'currency', centered: true, headerAlign: 'center', colPriority: 3 },
  { prop: 'montantTTC', name: 'MONTANT TTC', size: 120, editable: true, variant: 'currency', type: 'number', editor: 'dossier-number', centered: true, headerAlign: 'center', colPriority: 3 },
  { prop: 'volumeMwh', name: 'VOLUME MWh', size: 100, editable: false, type: 'number', centered: true, headerAlign: 'center', colPriority: 3 },
  { prop: 'statut', name: 'STATUT', size: 130, editable: true, variant: 'dossier-status', editor: 'select-statut', centered: true, headerAlign: 'center', colPriority: 1 },
  { prop: 'risque', name: 'RISQUE', size: 100, editable: false, variant: 'risk', centered: true, headerAlign: 'center', colPriority: 1 },
]
