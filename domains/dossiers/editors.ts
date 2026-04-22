import {
  createDateEditor,
  createNumberEditor,
  createStatusEditor,
  createTextEditor,
} from '~/utils/grid/inlineEditors'
import { DOSSIER_STATUTS } from './constants'

export const editors = {
  'dossier-text': createTextEditor(),
  'dossier-date': createDateEditor(),
  'dossier-number': createNumberEditor(),
  'select-statut': createStatusEditor([...DOSSIER_STATUTS]),
}
