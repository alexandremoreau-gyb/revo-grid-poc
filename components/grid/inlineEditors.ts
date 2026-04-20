import type { ColumnDataSchemaModel, EditCell, EditorCtr } from '@revolist/revogrid'

type CloseFn = (focusNext?: boolean) => void
type SaveFn = (value?: unknown, preventFocus?: boolean) => void
type HFn = (tag: string, props?: Record<string, unknown>, children?: unknown[]) => unknown

interface InlineEditorBase {
  element?: Element | null
  editCell?: EditCell
  beforeDisconnect?(): void
  componentDidRender?(): void
  disconnectedCallback?(): void
  render(h: HFn): unknown
}

function asString(value: unknown): string {
  return value == null ? '' : String(value)
}

function inputStyles(): Record<string, string> {
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

function selectStyles(): Record<string, string> {
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

function createInputEditor(
  inputType: 'text' | 'date' | 'number',
  normalize: (raw: string) => unknown,
): EditorCtr {
  return class InlineInputEditor implements InlineEditorBase {
    element: Element | null = null
    editCell?: EditCell

    private currentValue = ''
    private committed = false

    constructor(
      private readonly _column: ColumnDataSchemaModel,
      private readonly save: SaveFn,
      private readonly close: CloseFn,
    ) {}

    render(h: HFn): unknown {
      this.currentValue = asString(this.editCell?.val)
      this.committed = false

      return h('input', {
        type: inputType,
        value: this.currentValue,
        inputMode: inputType === 'number' ? 'decimal' : undefined,
        autoComplete: 'off',
        style: inputStyles(),
        onInput: (event: Event) => {
          this.currentValue = (event.target as HTMLInputElement).value
        },
        onKeyDown: (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            this.commit(false)
          }

          if (event.key === 'Tab') {
            event.preventDefault()
            this.commit(true)
          }

          if (event.key === 'Escape') {
            event.preventDefault()
            this.cancel()
          }
        },
        onBlur: () => {
          if (!this.committed) {
            this.commit(false)
          }
        },
      })
    }

    componentDidRender(): void {
      const input = this.element?.firstElementChild as HTMLInputElement | null
      if (!input) return

      requestAnimationFrame(() => {
        input.focus()
        if (inputType !== 'date') {
          input.select()
        }
      })
    }

    beforeDisconnect(): void {
      const input = this.element?.firstElementChild as HTMLInputElement | null
      input?.blur()
    }

    disconnectedCallback(): void {
      this.element = null
    }

    private commit(focusNext: boolean): void {
      if (this.committed) return
      this.committed = true

      const value = normalize(this.currentValue)
      this.save(value, focusNext)
      this.close(focusNext)
    }

    private cancel(): void {
      if (this.committed) return
      this.committed = true
      this.close(false)
    }
  } as unknown as EditorCtr
}

function createSelectEditor(options: readonly string[]): EditorCtr {
  return class InlineSelectEditor implements InlineEditorBase {
    element: Element | null = null
    editCell?: EditCell

    private currentValue = ''
    private committed = false

    constructor(
      private readonly _column: ColumnDataSchemaModel,
      private readonly save: SaveFn,
      private readonly close: CloseFn,
    ) {}

    render(h: HFn): unknown {
      this.currentValue = asString(this.editCell?.val)
      this.committed = false

      return h(
        'select',
        {
          value: this.currentValue,
          style: selectStyles(),
          onChange: (event: Event) => {
            this.currentValue = (event.target as HTMLSelectElement).value
            this.commit(false)
          },
          onKeyDown: (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              this.cancel()
            }
          },
          onBlur: () => {
            if (!this.committed) {
              this.close(false)
            }
          },
        },
        options.map(option =>
          h('option', { value: option }, [option]),
        ),
      )
    }

    componentDidRender(): void {
      const select = this.element?.firstElementChild as HTMLSelectElement | null
      if (!select) return

      requestAnimationFrame(() => {
        select.focus()
      })
    }

    beforeDisconnect(): void {
      const select = this.element?.firstElementChild as HTMLSelectElement | null
      select?.blur()
    }

    disconnectedCallback(): void {
      this.element = null
    }

    private commit(focusNext: boolean): void {
      if (this.committed) return
      this.committed = true
      this.save(this.currentValue, focusNext)
      this.close(focusNext)
    }

    private cancel(): void {
      if (this.committed) return
      this.committed = true
      this.close(false)
    }
  } as unknown as EditorCtr
}

export function createTextEditor(): EditorCtr {
  return createInputEditor('text', raw => raw)
}

export function createDateEditor(): EditorCtr {
  return createInputEditor('date', raw => raw)
}

export function createNumberEditor(): EditorCtr {
  return createInputEditor('number', (raw) => {
    const normalized = raw.trim().replace(',', '.')
    if (!normalized) return null

    const value = Number(normalized)
    return Number.isFinite(value) ? value : null
  })
}

export function createStatusEditor(options: readonly string[]): EditorCtr {
  return createSelectEditor(options)
}
