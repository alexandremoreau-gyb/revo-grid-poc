/**
 * SelectEditor — éditeur dropdown natif pour RevoGrid v4.
 * Implémente l'interface Editor de RevoGrid via duck typing.
 * Usage : new SelectEditor(['Option A', 'Option B'])
 */

interface EditCellConfig {
  val: unknown
  addEditEvent: (value: unknown) => void
  close: (focusNext?: boolean) => void
}

export class SelectEditor {
  element: Element | null = null
  private readonly options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  editCell(config: EditCellConfig): Element {
    const select = document.createElement('select')
    select.style.cssText = [
      'width:100%',
      'height:100%',
      'border:none',
      'outline:none',
      'background:white',
      'padding:0 6px',
      'font-size:12px',
      'font-family:inherit',
      'cursor:pointer',
    ].join(';')

    this.options.forEach((opt) => {
      const option = document.createElement('option')
      option.value = opt
      option.textContent = opt
      if (opt === String(config.val)) option.selected = true
      select.appendChild(option)
    })

    select.addEventListener('change', () => {
      config.addEditEvent(select.value)
      config.close()
    })

    // Ferme sans sauver si l'utilisateur clique ailleurs
    select.addEventListener('blur', () => config.close())

    this.element = select
    // Ouvre le dropdown automatiquement à l'activation
    requestAnimationFrame(() => {
      ;(select as HTMLSelectElement).focus()
    })

    return select
  }

  beforeUpdate(config: EditCellConfig): void {
    if (this.element instanceof HTMLSelectElement) {
      this.element.value = String(config.val)
    }
  }

  componentDidUnload(): void {
    this.element = null
  }
}
