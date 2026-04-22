import type { EditCell } from '@revolist/revogrid'
import type { CellEditPayload } from '~/types/grid'

interface EditCommitIntent {
  prop?: string
  rowIndex?: number
  expiresAt: number
}

let enterCommitIntent: EditCommitIntent | null = null

export function markEnterCommit(editCell?: EditCell): void {
  enterCommitIntent = {
    prop: typeof editCell?.prop === 'string' ? editCell.prop : undefined,
    rowIndex: typeof editCell?.rowIndex === 'number' ? editCell.rowIndex : undefined,
    expiresAt: Date.now() + 500,
  }
}

export function consumeEnterCommit(payload: CellEditPayload): boolean {
  if (!enterCommitIntent) return false

  const intent = enterCommitIntent
  enterCommitIntent = null

  if (Date.now() > intent.expiresAt) return false
  if (intent.prop !== undefined && intent.prop !== payload.prop) return false
  if (intent.rowIndex !== undefined && intent.rowIndex !== payload.rowIndex) return false

  return true
}
