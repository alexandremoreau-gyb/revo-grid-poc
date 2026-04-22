import type { EditCell } from '@revolist/revogrid'
import { markEnterCommit } from '~/utils/grid/editCommitIntent'

export type CloseFn = (focusNext?: boolean) => void
export type SaveFn = (value?: unknown, preventFocus?: boolean) => void
export type HFn = (tag: string, props?: Record<string, unknown>, children?: unknown[]) => unknown

export interface InlineEditorBase {
  element?: Element | null
  editCell?: EditCell
  beforeDisconnect?(): void
  componentDidRender?(): void
  disconnectedCallback?(): void
  render(h: HFn): unknown
}

export function asString(value: unknown): string {
  return value == null ? '' : String(value)
}

export function normalizeNumberValue(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (!normalized) return null

  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

export function inputStyles(): Record<string, string> {
  return {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    border: '1px solid var(--color-primary)',
    borderRadius: '6px',
    outline: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    padding: '0 8px',
    font: 'inherit',
  }
}

export function selectStyles(): Record<string, string> {
  return {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    border: '1px solid var(--color-primary)',
    borderRadius: '6px',
    outline: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    padding: '0 8px',
    font: 'inherit',
    cursor: 'pointer',
  }
}

export function handleInputEditorKeyDown(
  event: KeyboardEvent,
  editCell: EditCell | undefined,
  commit: () => void,
  moveNext: () => void,
  cancel: () => void,
): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    markEnterCommit(editCell)
    commit()
    return
  }

  if (event.key === 'Tab') {
    event.preventDefault()
    moveNext()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
  }
}

export function focusInput(element: Element | null | undefined, inputType: 'text' | 'date' | 'number'): void {
  const input = element?.firstElementChild as HTMLInputElement | null
  if (!input) return

  requestAnimationFrame(() => {
    input.focus()
    if (inputType !== 'date') {
      input.select()
    }
  })
}

export function focusSelect(element: Element | null | undefined): void {
  const select = element?.firstElementChild as HTMLSelectElement | null
  if (!select) return

  requestAnimationFrame(() => {
    select.focus()
  })
}

export function blurFirstInput(element: Element | null | undefined): void {
  const input = element?.firstElementChild as HTMLInputElement | null
  input?.blur()
}

export function blurFirstSelect(element: Element | null | undefined): void {
  const select = element?.firstElementChild as HTMLSelectElement | null
  select?.blur()
}
