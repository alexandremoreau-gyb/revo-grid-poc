import {
  createDateEditor,
  createNumberEditor,
  createStatusEditor,
  createTextEditor,
} from '~/utils/grid/inlineEditors'
import { DOSSIER_STATUTS } from './constants'

const DOSSIER_STATUS_EDITOR_STYLES: Record<string, Record<string, string>> = {
  'Déposé': { background: '#059669', color: '#ffffff', borderColor: '#059669', fontWeight: '500', borderRadius: '4px' },
  'En cours': { background: '#2563eb', color: '#ffffff', borderColor: '#2563eb', fontWeight: '500', borderRadius: '4px' },
  'En attente': { background: '#f59e0b', color: '#ffffff', borderColor: '#f59e0b', fontWeight: '500', borderRadius: '4px' },
  'Incomplet': { background: '#f97316', color: '#ffffff', borderColor: '#f97316', fontWeight: '500', borderRadius: '4px' },
  'Refusé': { background: '#dc2626', color: '#ffffff', borderColor: '#dc2626', fontWeight: '500', borderRadius: '4px' },
  'Annulé': { background: '#94a3b8', color: '#ffffff', borderColor: '#94a3b8', fontWeight: '500', borderRadius: '4px' },
}

export const editors = {
  'dossier-text': createTextEditor(),
  'dossier-date': createDateEditor(),
  'dossier-number': createNumberEditor(),
  'select-statut': createStatusEditor(
    [...DOSSIER_STATUTS],
    value => DOSSIER_STATUS_EDITOR_STYLES[value] ?? {},
  ),
}
