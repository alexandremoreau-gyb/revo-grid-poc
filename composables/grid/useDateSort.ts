import { ref } from 'vue'

const sortDir = ref<'asc' | 'desc'>('desc')

export function useDateSort() {
  function toggle() {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  }
  return { sortDir, toggle }
}
