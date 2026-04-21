import { ref } from 'vue'

let resolveRef: ((value: boolean) => void) | null = null
const visible = ref(false)

export function useConfirmModal() {
  function confirm(): Promise<boolean> {
    visible.value = true
    return new Promise<boolean>((resolve) => {
      resolveRef = resolve
    })
  }

  function _resolve(value: boolean) {
    visible.value = false
    resolveRef?.(value)
    resolveRef = null
  }

  /** For test teardown only — abandons any pending confirm() promise. */
  function _reset() {
    visible.value = false
    resolveRef = null
  }

  return { visible, confirm, _resolve, _reset }
}
