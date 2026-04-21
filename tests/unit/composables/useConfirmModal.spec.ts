import { describe, it, expect, beforeEach } from 'vitest'
import { useConfirmModal } from '~/composables/useConfirmModal'

describe('useConfirmModal', () => {
  beforeEach(() => {
    const { _reset } = useConfirmModal()
    _reset()
  })

  it('visible vaut false par défaut', () => {
    const { visible } = useConfirmModal()
    expect(visible.value).toBe(false)
  })

  it('confirm() ouvre la modal et renvoie true quand on appelle _resolve(true)', async () => {
    const { visible, confirm, _resolve } = useConfirmModal()
    const promise = confirm()
    expect(visible.value).toBe(true)
    _resolve(true)
    const result = await promise
    expect(result).toBe(true)
    expect(visible.value).toBe(false)
  })

  it('confirm() renvoie false quand on appelle _resolve(false)', async () => {
    const { visible, confirm, _resolve } = useConfirmModal()
    const promise = confirm()
    _resolve(false)
    const result = await promise
    expect(result).toBe(false)
    expect(visible.value).toBe(false)
  })
})
