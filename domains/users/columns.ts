import type { ColumnDef } from '~/types/grid'
import { USER_COMPANIES, USER_ROLES, USER_STATUTS } from './constants'

export const columns: ColumnDef[] = [
  { prop: 'nom', name: 'NOM', size: 160, editable: true, editor: 'user-text', variant: 'text', headerAlign: 'start', mobileInputType: 'text', colPriority: 1 },
  { prop: 'prenom', name: 'PRÉNOM', size: 140, editable: true, editor: 'user-text', variant: 'text', headerAlign: 'start', mobileInputType: 'text', colPriority: 2 },
  { prop: 'email', name: 'EMAIL', size: 300, editable: true, editor: 'user-text', variant: 'email', headerAlign: 'start', mobileInputType: 'email', colPriority: 1 },
  { prop: 'societe', name: 'SOCIÉTÉ', size: 230, editable: true, editor: 'user-select', variant: 'company', headerAlign: 'start', mobileInputType: 'select', selectOptions: USER_COMPANIES, colPriority: 3 },
  { prop: 'role', name: 'RÔLE', size: 130, editable: true, editor: 'user-role', variant: 'user-role', centered: true, headerAlign: 'center', mobileInputType: 'select', selectOptions: USER_ROLES, colPriority: 2 },
  { prop: 'statut', name: 'STATUT', size: 120, editable: true, editor: 'user-statut', variant: 'user-status', centered: true, headerAlign: 'center', mobileInputType: 'select', selectOptions: USER_STATUTS, colPriority: 1 },
  { prop: 'dateCreation', name: 'CRÉÉ LE', size: 120, editable: false, variant: 'date', centered: true, headerAlign: 'center', colPriority: 4 },
  { prop: 'dernierAcces', name: 'DERNIER ACCÈS', size: 150, editable: false, variant: 'date', centered: true, headerAlign: 'center', colPriority: 3 },
]
