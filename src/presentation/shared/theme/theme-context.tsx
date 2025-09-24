import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { useStorage } from '@/src/infrastructure/di'
import type { Theme, ThemeMode, ThemeContextValue } from './types'
import { createTheme } from './theme-factory'

const ThemeContext = createContext<ThemeContextValue | null>(null)

// Observable theme state
const themeState = observable<{
  mode: ThemeMode
  theme: Theme
}>({
  mode: 'light',
  theme: createTheme('light')
})

interface ThemeProviderProps {
  children: React.ReactNode
  initialMode?: ThemeMode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = observer(({
  children,
  initialMode = 'light'
}) => {
  const storageService = useStorage()

  // Initialize theme from storage
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedMode = await storageService.getItem('theme-mode') as ThemeMode | null
        const mode = savedMode ?? initialMode

        themeState.mode.set(mode)
        themeState.theme.set(createTheme(mode))
      } catch {
        // Fallback to initial mode if storage fails
        themeState.mode.set(initialMode)
        themeState.theme.set(createTheme(initialMode))
      }
    }

    initializeTheme()
  }, [storageService, initialMode])

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      themeState.mode.set(mode)
      themeState.theme.set(createTheme(mode))
      await storageService.setItem('theme-mode', mode)
    } catch {
      // Handle storage error gracefully - no logging needed in UI layer
    }
  }, [storageService])

  const toggleTheme = useCallback(() => {
    const newMode = themeState.mode.peek() === 'light' ? 'dark' : 'light'
    setThemeMode(newMode)
  }, [setThemeMode])

  const contextValue: ThemeContextValue = {
    theme: themeState.theme.get(),
    themeMode: themeState.mode.get(),
    setThemeMode,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
})

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context.theme
}

export const useThemeMode = (): ThemeMode => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider')
  }
  return context.themeMode
}

export const useThemeActions = (): Pick<ThemeContextValue, 'setThemeMode' | 'toggleTheme'> => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeActions must be used within a ThemeProvider')
  }
  return {
    setThemeMode: context.setThemeMode,
    toggleTheme: context.toggleTheme
  }
}