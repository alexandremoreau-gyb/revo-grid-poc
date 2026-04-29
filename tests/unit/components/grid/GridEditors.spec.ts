import { h, type Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { SelectEditor } from '~/utils/grid/SelectEditor'
import type { CloseFn, HFn, InlineEditorBase, SaveFn } from '~/utils/grid/editorHelpers'
import DateSortHeader from '~/components/grid/DateSortHeader.vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDateEditor,
  createNumberEditor,
  createStatusEditor,
  createTextEditor,
} from '~/utils/grid/inlineEditors'

type InlineEditorCtor = new (
  column: unknown,
  save: SaveFn,
  close: CloseFn,
) => InlineEditorBase

type InlineEditorVNodeProps = {
  value?: unknown
  onBlur?: () => void
  onChange?: (event: { target: { value: string } }) => void
  onInput?: (event: { target: { value: string } }) => void
  onKeyDown?: (event: { key: string, preventDefault: () => void }) => void
}

type InlineEditorVNode = {
  props: InlineEditorVNodeProps
}

const statusOptions = ['Active', 'Inactive'] as const

const dateSortState = vi.hoisted(() => ({
  sortDir: null as unknown as Ref<'asc' | 'desc'>,
  toggle: vi.fn(),
}))

const confirmModalState = vi.hoisted(() => ({
  confirm: vi.fn(),
}))

vi.mock('~/composables/grid/useDateSort', async () => {
  const { ref } = await import('vue')

  dateSortState.sortDir = ref<'asc' | 'desc'>('desc')
  dateSortState.toggle = vi.fn(() => {
    dateSortState.sortDir.value = dateSortState.sortDir.value === 'desc' ? 'asc' : 'desc'
  })

  return {
    useDateSort: () => ({
      sortDir: dateSortState.sortDir,
      toggle: dateSortState.toggle,
    }),
  }
})

vi.mock('~/composables/app/useConfirmModal', () => ({
  useConfirmModal: () => ({
    confirm: confirmModalState.confirm,
  }),
}))

function resetDateSortState() {
  dateSortState.sortDir.value = 'desc'
  dateSortState.toggle.mockClear()
}

function resetConfirmModalState() {
  confirmModalState.confirm.mockReset()
}

function stubAnimationFrame() {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 0
  })
}

function makeInlineEditorHarness(ctor: InlineEditorCtor, value: unknown) {
  const save = vi.fn()
  const close = vi.fn()
  const editor = new ctor({}, save, close)

  editor.editCell = { val: value }

  const vnode = editor.render(h as unknown as HFn) as InlineEditorVNode

  return {
    close,
    editor,
    save,
    vnode,
  }
}

function attachHostElement(editor: InlineEditorBase, tagName: 'input'): HTMLInputElement
function attachHostElement(editor: InlineEditorBase, tagName: 'select'): HTMLSelectElement
function attachHostElement(editor: InlineEditorBase, tagName: 'input' | 'select') {
  const host = document.createElement('div')
  const element = document.createElement(tagName)

  host.appendChild(element)
  editor.element = host

  return element
}

function flushMicrotasks() {
  return new Promise<void>(resolve => setTimeout(resolve, 0))
}

beforeEach(() => {
  stubAnimationFrame()
  resetDateSortState()
  resetConfirmModalState()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  resetDateSortState()
  resetConfirmModalState()
})

describe('DateSortHeader', () => {
  it('rend l’état descendant puis montant et stoppe le clic parent', async () => {
    const onParentClick = vi.fn()

    const wrapper = mount({
      components: { DateSortHeader },
      setup() {
        return { onParentClick }
      },
      template: `
        <div @click="onParentClick">
          <DateSortHeader />
        </div>
      `,
    })

    const initialPath = wrapper.get('path').attributes('d')

    await wrapper.get('button').trigger('click')

    expect(dateSortState.toggle).toHaveBeenCalledTimes(1)
    expect(onParentClick).not.toHaveBeenCalled()
    expect(wrapper.get('path').attributes('d')).not.toBe(initialPath)
  })

  it('centre le header quand align vaut center', () => {
    const wrapper = mount(DateSortHeader, {
      props: {
        align: 'center',
      },
    })

    expect(wrapper.get('button').classes()).toContain('justify-center')
    expect(wrapper.get('button').classes()).toContain('text-center')
  })
})

describe('SelectEditor', () => {
  it('sauve au change, ferme au blur sans changement et sélectionne la valeur active', () => {
    const closeOnBlur = vi.fn()
    const blurEditor = new SelectEditor(['One'])
    const blurSelect = blurEditor.editCell({
      val: 'One',
      addEditEvent: vi.fn(),
      close: closeOnBlur,
    }) as HTMLSelectElement

    blurSelect.dispatchEvent(new Event('blur'))

    expect(closeOnBlur).toHaveBeenCalledTimes(1)

    const addEditEvent = vi.fn()
    const close = vi.fn()
    const editor = new SelectEditor(['Draft', 'Active'])
    const select = editor.editCell({
      val: 'Active',
      addEditEvent,
      close,
    }) as HTMLSelectElement

    expect([...select.options].map(option => option.selected)).toEqual([false, true])

    select.value = 'Draft'
    select.dispatchEvent(new Event('change'))
    select.dispatchEvent(new Event('blur'))

    expect(addEditEvent).toHaveBeenCalledWith('Draft')
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('met à jour la valeur avant update puis libère la référence au unload', () => {
    const editor = new SelectEditor(['Draft', 'Active'])
    const select = editor.editCell({
      val: 'Draft',
      addEditEvent: vi.fn(),
      close: vi.fn(),
    }) as HTMLSelectElement

    editor.beforeUpdate({
      val: 'Active',
      addEditEvent: vi.fn(),
      close: vi.fn(),
    })

    expect(select.value).toBe('Active')

    editor.componentDidUnload()

    expect(editor.element).toBeNull()
  })

  it("ignore beforeUpdate quand l'élément actif n'est pas un select", () => {
    const editor = new SelectEditor(['Draft', 'Active'])
    const host = document.createElement('div')

    editor.element = host
    editor.beforeUpdate({
      val: 'Active',
      addEditEvent: vi.fn(),
      close: vi.fn(),
    })

    expect(editor.element).toBe(host)
  })
})

describe('inlineEditors', () => {
  it('createTextEditor et createStatusEditor transforment les valeurs nulles en chaîne vide', () => {
    const nullTextHarness = makeInlineEditorHarness(createTextEditor(), null)
    const undefinedSelectHarness = makeInlineEditorHarness(createStatusEditor(statusOptions), undefined)

    expect(nullTextHarness.vnode.props.value).toBe('')
    expect(undefinedSelectHarness.vnode.props.value).toBe('')
  })

  it("garde une typo compacte dans l'éditeur pour éviter le zoom du contenu", () => {
    const textHarness = makeInlineEditorHarness(createTextEditor(), 'draft')
    const selectHarness = makeInlineEditorHarness(createStatusEditor(statusOptions), 'Inactive')

    expect(textHarness.vnode.props.style).toMatchObject({
      fontSize: '12px',
      lineHeight: '36px',
    })
    expect(selectHarness.vnode.props.style).toMatchObject({
      fontSize: '12px',
      lineHeight: '36px',
    })
  })

  it('garde le rendu et le detach quand aucun enfant n’est monté', () => {
    const inputHarness = makeInlineEditorHarness(createTextEditor(), 'draft')
    const selectHarness = makeInlineEditorHarness(createStatusEditor(statusOptions), 'Inactive')

    expect(() => inputHarness.editor.componentDidRender()).not.toThrow()
    expect(() => inputHarness.editor.beforeDisconnect?.()).not.toThrow()
    expect(() => selectHarness.editor.componentDidRender()).not.toThrow()
    expect(() => selectHarness.editor.beforeDisconnect?.()).not.toThrow()
  })

  it("focus l'éditeur texte immédiatement avec le curseur à la fin", () => {
    const harness = makeInlineEditorHarness(createTextEditor(), 'draft')
    const input = attachHostElement(harness.editor, 'input')

    input.value = 'draft'
    document.body.appendChild(harness.editor.element as Node)

    harness.editor.componentDidRender()

    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(5)
    expect(input.selectionEnd).toBe(5)

    harness.editor.element?.remove()
  })

  it("reprend le focus et remet le curseur à la fin si la grille vole le focus après Enter", async () => {
    const harness = makeInlineEditorHarness(createTextEditor(), 'draft')
    const input = attachHostElement(harness.editor, 'input')
    const gridFocusTrap = document.createElement('button')

    input.value = 'draft'
    document.body.appendChild(gridFocusTrap)
    document.body.appendChild(harness.editor.element as Node)

    harness.editor.componentDidRender()
    gridFocusTrap.focus()
    await flushMicrotasks()

    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(5)
    expect(input.selectionEnd).toBe(5)

    harness.editor.element?.remove()
    gridFocusTrap.remove()
  })

  it("focus aussi l'input quand RevoGrid expose directement l'élément éditeur", () => {
    const harness = makeInlineEditorHarness(createTextEditor(), 'draft')
    const input = document.createElement('input')

    input.value = 'draft'
    document.body.appendChild(input)
    harness.editor.element = input

    harness.editor.componentDidRender()

    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(5)
    expect(input.selectionEnd).toBe(5)

    input.remove()
  })

  it("createTextEditor enregistre immédiatement sur Enter (la confirmation est gérée par DataGrid)", async () => {
    const enterHarness = makeInlineEditorHarness(createTextEditor(), 'draft')
    const enterInput = attachHostElement(enterHarness.editor, 'input')
    const enterFocus = vi.spyOn(enterInput, 'focus')
    const enterSelect = vi.spyOn(enterInput, 'select')
    const enterBlur = vi.spyOn(enterInput, 'blur')

    enterHarness.vnode.props.onInput({ target: { value: 'edited' } })
    enterHarness.vnode.props.onKeyDown({ key: 'Enter', preventDefault: vi.fn() })
    enterHarness.editor.componentDidRender()
    enterHarness.editor.beforeDisconnect()
    enterHarness.editor.disconnectedCallback()

    expect(enterHarness.save).toHaveBeenCalledWith('edited', false)
    expect(enterHarness.close).toHaveBeenCalledWith(false)
    expect(enterHarness.save).toHaveBeenCalledTimes(1)
    expect(enterFocus).toHaveBeenCalledTimes(1)
    expect(enterSelect).toHaveBeenCalledTimes(1)
    expect(enterBlur).toHaveBeenCalledTimes(1)
    expect(enterHarness.editor.element).toBeNull()
  })

  it('createTextEditor enregistre avec Tab puis navigue, et gère Escape', () => {
    const tabHarness = makeInlineEditorHarness(createTextEditor(), 'draft')
    tabHarness.vnode.props.onInput({ target: { value: 'next' } })
    tabHarness.vnode.props.onKeyDown({ key: 'Tab', preventDefault: vi.fn() })

    expect(tabHarness.save).toHaveBeenCalledWith('next', true)
    expect(tabHarness.close).toHaveBeenCalledWith(true)

    const escapeHarness = makeInlineEditorHarness(createTextEditor(), 'draft')
    escapeHarness.vnode.props.onKeyDown({ key: 'Escape', preventDefault: vi.fn() })

    expect(escapeHarness.save).not.toHaveBeenCalled()
    expect(escapeHarness.close).toHaveBeenCalledWith(false)
  })

  it("createTextEditor enregistre immédiatement au blur (la confirmation est gérée par DataGrid)", () => {
    const blurHarness = makeInlineEditorHarness(createTextEditor(), 'draft')

    blurHarness.vnode.props.onInput({ target: { value: 'edited' } })
    blurHarness.vnode.props.onBlur()

    expect(blurHarness.save).toHaveBeenCalledWith('edited', false)
    expect(blurHarness.close).toHaveBeenCalledWith(false)
  })

  it('createTextEditor ne rejoue pas commit ou cancel après fermeture', () => {
    const commitHarness = makeInlineEditorHarness(createTextEditor(), 'draft')
    const commitPreventDefault = vi.fn()

    commitHarness.vnode.props.onInput({ target: { value: 'edited' } })
    commitHarness.vnode.props.onKeyDown({ key: 'Enter', preventDefault: commitPreventDefault })
    commitHarness.vnode.props.onBlur()
    commitHarness.vnode.props.onKeyDown({ key: 'Escape', preventDefault: vi.fn() })

    expect(commitPreventDefault).toHaveBeenCalledTimes(1)
    expect(commitHarness.save).toHaveBeenCalledWith('edited', false)
    expect(commitHarness.save).toHaveBeenCalledTimes(1)
    expect(commitHarness.close).toHaveBeenCalledWith(false)
    expect(commitHarness.close).toHaveBeenCalledTimes(1)

    const cancelHarness = makeInlineEditorHarness(createTextEditor(), 'draft')
    const cancelPreventDefault = vi.fn()

    cancelHarness.vnode.props.onKeyDown({ key: 'Escape', preventDefault: cancelPreventDefault })
    cancelHarness.vnode.props.onBlur()
    cancelHarness.vnode.props.onKeyDown({ key: 'Enter', preventDefault: vi.fn() })

    expect(cancelPreventDefault).toHaveBeenCalledTimes(1)
    expect(cancelHarness.save).not.toHaveBeenCalled()
    expect(cancelHarness.close).toHaveBeenCalledWith(false)
    expect(cancelHarness.close).toHaveBeenCalledTimes(1)
  })

  it('createDateEditor garde la date brute et ne sélectionne pas le texte', () => {
    const harness = makeInlineEditorHarness(createDateEditor(), '2024-02-01')
    const input = attachHostElement(harness.editor, 'input')
    const focus = vi.spyOn(input, 'focus')
    const select = vi.spyOn(input, 'select')

    harness.vnode.props.onInput({ target: { value: '2024-03-04' } })
    harness.vnode.props.onBlur()
    harness.editor.componentDidRender()

    expect(harness.save).toHaveBeenCalledWith('2024-03-04', false)
    expect(harness.close).toHaveBeenCalledWith(false)
    expect(focus).toHaveBeenCalledTimes(1)
    expect(select).not.toHaveBeenCalled()
  })

  it('createNumberEditor normalise les nombres et retourne null sur une saisie vide ou invalide', () => {
    const numberHarness = makeInlineEditorHarness(createNumberEditor(), '1')

    numberHarness.vnode.props.onInput({ target: { value: ' 1,5 ' } })
    numberHarness.vnode.props.onBlur()

    expect(numberHarness.save).toHaveBeenCalledWith(1.5, false)
    expect(numberHarness.close).toHaveBeenCalledWith(false)

    const emptyHarness = makeInlineEditorHarness(createNumberEditor(), '1')
    emptyHarness.vnode.props.onInput({ target: { value: '   ' } })
    emptyHarness.vnode.props.onBlur()

    expect(emptyHarness.save).toHaveBeenCalledWith(null, false)

    const invalidHarness = makeInlineEditorHarness(createNumberEditor(), '1')
    invalidHarness.vnode.props.onInput({ target: { value: 'abc' } })
    invalidHarness.vnode.props.onBlur()

    expect(invalidHarness.save).toHaveBeenCalledWith(null, false)

    const infinityHarness = makeInlineEditorHarness(createNumberEditor(), '1')
    infinityHarness.vnode.props.onInput({ target: { value: 'Infinity' } })
    infinityHarness.vnode.props.onBlur()

    expect(infinityHarness.save).toHaveBeenCalledWith(null, false)
  })

  it('createStatusEditor gère Escape, blur et le cycle de vie', () => {
    const escapeHarness = makeInlineEditorHarness(createStatusEditor(statusOptions), 'Inactive')
    escapeHarness.vnode.props.onKeyDown({ key: 'Escape', preventDefault: vi.fn() })

    expect(escapeHarness.save).not.toHaveBeenCalled()
    expect(escapeHarness.close).toHaveBeenCalledWith(false)

    const blurHarness = makeInlineEditorHarness(createStatusEditor(statusOptions), 'Inactive')
    blurHarness.vnode.props.onBlur()

    expect(blurHarness.save).not.toHaveBeenCalled()
    expect(blurHarness.close).toHaveBeenCalledWith(false)
  })

  it('createStatusEditor enregistre immédiatement au change (la confirmation est gérée par DataGrid)', async () => {
    const changeHarness = makeInlineEditorHarness(createStatusEditor(statusOptions), 'Inactive')
    const changeSelect = attachHostElement(changeHarness.editor, 'select')
    const focus = vi.spyOn(changeSelect, 'focus')
    const blur = vi.spyOn(changeSelect, 'blur')

    changeHarness.vnode.props.onChange({ target: { value: 'Active' } })
    changeHarness.vnode.props.onBlur()
    changeHarness.editor.componentDidRender()
    changeHarness.editor.beforeDisconnect()
    changeHarness.editor.disconnectedCallback()

    expect(changeHarness.save).toHaveBeenCalledWith('Active', false)
    expect(changeHarness.close).toHaveBeenCalledWith(false)
    expect(focus).toHaveBeenCalledTimes(1)
    expect(blur).toHaveBeenCalledTimes(1)
    expect(changeHarness.editor.element).toBeNull()
  })

  it('createStatusEditor ignore les touches non Escape et ne rejoue pas commit ou cancel après fermeture', () => {
    const keyHarness = makeInlineEditorHarness(createStatusEditor(statusOptions), undefined)
    const preventDefault = vi.fn()

    expect(keyHarness.vnode.props.value).toBe('')

    keyHarness.vnode.props.onKeyDown({ key: 'ArrowDown', preventDefault })

    expect(preventDefault).not.toHaveBeenCalled()
    expect(keyHarness.save).not.toHaveBeenCalled()
    expect(keyHarness.close).not.toHaveBeenCalled()

    keyHarness.vnode.props.onChange({ target: { value: 'Active' } })
    keyHarness.vnode.props.onBlur()
    keyHarness.vnode.props.onKeyDown({ key: 'Escape', preventDefault: vi.fn() })
    keyHarness.vnode.props.onChange({ target: { value: 'Inactive' } })

    expect(keyHarness.save).toHaveBeenCalledWith('Active', false)
    expect(keyHarness.save).toHaveBeenCalledTimes(1)
    expect(keyHarness.close).toHaveBeenCalledWith(false)
    expect(keyHarness.close).toHaveBeenCalledTimes(1)
  })
})
