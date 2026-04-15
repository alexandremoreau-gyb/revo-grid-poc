import { nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'

import { useTheme } from '~/composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('retourne "light" comme thème par défaut', () => {
    // Arrange & Act
    const { theme } = useTheme()

    // Assert
    expect(theme.value).toBe('light')
  })

  it('toggle passe de light à dark', async () => {
    // Arrange
    const { theme, toggleTheme } = useTheme()

    // Act
    toggleTheme()
    await nextTick()

    // Assert
    expect(theme.value).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggle passe de dark à light', async () => {
    // Arrange
    const { theme, toggleTheme } = useTheme()
    toggleTheme() // → dark

    // Act
    toggleTheme() // → light

    // Assert
    expect(theme.value).toBe('light')
  })

  it('persiste le thème dans localStorage', async () => {
    // Arrange
    const { toggleTheme } = useTheme()

    // Act
    toggleTheme()
    await nextTick()

    // Assert
    expect(localStorage.getItem('revo-grid-poc.theme')).toBe('dark')
  })

  it('lit le thème depuis localStorage au démarrage', async () => {
    // Arrange
    localStorage.setItem('revo-grid-poc.theme', 'dark')

    // Act
    const { theme } = useTheme()
    await nextTick()

    // Assert
    expect(theme.value).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
