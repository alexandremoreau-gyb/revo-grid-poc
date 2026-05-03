import type { ColumnDataSchemaModel, EditCell, EditorCtr } from '@revolist/revogrid'
import {
  asString,
  blurFirstInput,
  blurFirstSelect,
  focusInput,
  focusSelect,
  handleInputEditorKeyDown,
  inputStyles,
  type CloseFn,
  type HFn,
  type InlineEditorBase,
  normalizeNumberValue,
  type SaveFn,
  selectStyles,
} from '~/utils/grid/editorHelpers'

type SelectEditorStyleResolver = (value: string) => Record<string, string>

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
          handleInputEditorKeyDown(
            event,
            this.editCell,
            () => this.commit(false),
            () => this.moveNext(),
            () => this.cancel(),
          )
        },
        onBlur: () => {
          if (!this.committed) {
            this.commit(false)
          }
        },
      })
    }

    componentDidRender(): void {
      focusInput(this.element, inputType)
    }

    beforeDisconnect(): void {
      blurFirstInput(this.element)
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

    private moveNext(): void {
      if (this.committed) return
      this.committed = true
      const value = normalize(this.currentValue)
      this.save(value, true)
      this.close(true)
    }
  } as unknown as EditorCtr
}

function createSelectEditor(
  options: readonly string[],
  resolveStyle?: SelectEditorStyleResolver,
): EditorCtr {
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
          style: {
            ...selectStyles(),
            ...(resolveStyle?.(this.currentValue) ?? {}),
          },
          onChange: (event: Event) => {
            this.currentValue = (event.target as HTMLSelectElement).value
            this.commit(false)
          },
          onKeyDown: (event: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
              event.stopPropagation?.()
            }
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
      focusSelect(this.element)
    }

    beforeDisconnect(): void {
      blurFirstSelect(this.element)
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
  return createInputEditor('number', normalizeNumberValue)
}

export function createStatusEditor(
  options: readonly string[],
  resolveStyle?: SelectEditorStyleResolver,
): EditorCtr {
  return createSelectEditor(options, resolveStyle)
}
