import { USER_COMPANIES, USER_ROLES, USER_STATUTS } from './constants'
import { createStatusEditor, createTextEditor } from '~/utils/grid/inlineEditors'

export const editors = {
  'user-text': createTextEditor(),
  'user-role': createStatusEditor([...USER_ROLES]),
  'user-statut': createStatusEditor([...USER_STATUTS]),
  'user-select': createStatusEditor([...USER_COMPANIES]),
}
