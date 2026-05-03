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
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '36px',
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
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '36px',
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
  event.stopPropagation?.()

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
  const input = resolveEditorInput(element)
  if (!input) return

  const applyFocus = (requireConnected = true) => {
    if (requireConnected && !input.isConnected) return
    input.focus({ preventScroll: true })
    if (inputType !== 'date') {
      const len = input.value.length
      input.select()
      input.setSelectionRange(len, len)
    }
  }

  applyFocus(false)
  queueMicrotask(() => applyFocus())
  requestAnimationFrame(() => applyFocus())
  setTimeout(() => applyFocus(), 0)
  setTimeout(() => applyFocus(), 50)
}

export function focusSelect(element: Element | null | undefined): void {
  const select = element?.firstElementChild as HTMLSelectElement | null
  if (!select) return

  select.focus()
  setTimeout(() => {
    if (!select.isConnected) return
    select.focus()
  }, 0)
}

export function blurFirstInput(element: Element | null | undefined): void {
  const input = resolveEditorInput(element)
  input?.blur()
}

export function blurFirstSelect(element: Element | null | undefined): void {
  const select = element?.firstElementChild as HTMLSelectElement | null
  select?.blur()
}

function resolveEditorInput(element: Element | null | undefined): HTMLInputElement | null {
  if (!element) return null
  if (element instanceof HTMLInputElement) return element

  return element.querySelector('input')
}
