import { computed } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'revo-grid-poc.theme'

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

function syncTheme(value: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', value === 'dark')
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, value)
  }
}

export function useTheme() {
  // useState partage le même state entre tous les composants (NavBar, DataGrid, etc.)
  const theme = useState<Theme>('app-theme', () => readStoredTheme())
  const isDark = computed(() => theme.value === 'dark')

  syncTheme(theme.value)

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    syncTheme(theme.value)
  }

  return { theme, isDark, toggle }
}
