import type { ColumnDef } from '~/types/grid'

export const columns: ColumnDef[] = [
  { prop: 'nom', name: 'NOM', size: 160, editable: false, variant: 'text', headerAlign: 'start', colPriority: 1 },
  { prop: 'prenom', name: 'PRÉNOM', size: 140, editable: false, variant: 'text', headerAlign: 'start', colPriority: 2 },
  { prop: 'email', name: 'EMAIL', size: 300, editable: false, variant: 'email', headerAlign: 'start', colPriority: 1 },
  { prop: 'societe', name: 'SOCIÉTÉ', size: 230, editable: false, variant: 'company', headerAlign: 'start', colPriority: 3 },
  { prop: 'role', name: 'RÔLE', size: 130, editable: false, variant: 'user-role', centered: true, headerAlign: 'center', colPriority: 2 },
  { prop: 'statut', name: 'STATUT', size: 120, editable: false, variant: 'user-status', centered: true, headerAlign: 'center', colPriority: 1 },
  { prop: 'dateCreation', name: 'CRÉÉ LE', size: 120, editable: false, variant: 'date', centered: true, headerAlign: 'center', colPriority: 4 },
  { prop: 'dernierAcces', name: 'DERNIER ACCÈS', size: 150, editable: false, variant: 'date', centered: true, headerAlign: 'center', colPriority: 3 },
]
