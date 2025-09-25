import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { useGetOrCreateUserUseCase, useUpdateUserThemeUseCase } from '@/src/infrastructure/di'
import type { Theme, ThemeMode, ThemeContextValue } from './types'
import type { ThemePreference } from '@/src/domain/entities'
import { createTheme } from './theme-factory'
import type { GetOrCreateUserUseCase, UpdateUserThemeUseCase } from '@/src/domain/usecases'

const ThemeContext = createContext<ThemeContextValue | null>(null)

// Observable theme state
const themeState = observable<{
  mode: ThemeMode
  theme: Theme
}>({
  mode: 'light',
  theme: createTheme('light')
})

// Observable services state
const servicesState = observable<{
  ready: boolean
  getUserUseCase: GetOrCreateUserUseCase | null
  updateThemeUseCase: UpdateUserThemeUseCase | null
}>({
  ready: false,
  getUserUseCase: null,
  updateThemeUseCase: null
})

// Helper function to convert ThemePreference to ThemeMode
const themePreferenceToMode = (preference: ThemePreference): ThemeMode => {
  if (preference === 'system') {
    // Default to light for now - can be enhanced with proper system detection
    return 'light'
  }
  return preference as ThemeMode
}

// Helper function to convert ThemeMode to ThemePreference
const themeModeToPreference = (mode: ThemeMode): ThemePreference => {
  return mode as ThemePreference // 'light' | 'dark' are compatible
}

interface ThemeProviderProps {
  children: React.ReactNode
  initialMode?: ThemeMode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = observer(({
  children,
  initialMode = 'light'
}) => {
  // Safely try to get services, handling DI container race condition
  let getOrCreateUserUseCase: GetOrCreateUserUseCase | null = null
  let updateUserThemeUseCase: UpdateUserThemeUseCase | null = null

  try {
    getOrCreateUserUseCase = useGetOrCreateUserUseCase()
    updateUserThemeUseCase = useUpdateUserThemeUseCase()
    servicesState.ready.set(true)
  } catch {
    // Services not ready yet, continue with fallback theme
    servicesState.ready.set(false)
  }

  // Store services in observable state
  useEffect(() => {
    if (getOrCreateUserUseCase && updateUserThemeUseCase) {
      servicesState.getUserUseCase.set(getOrCreateUserUseCase)
      servicesState.updateThemeUseCase.set(updateUserThemeUseCase)
    }
  }, [getOrCreateUserUseCase, updateUserThemeUseCase])

  // Initialize theme from user preferences (only if services are ready)
  useEffect(() => {
    const servicesReady = servicesState.ready.get()
    const getUserUseCase = servicesState.getUserUseCase.get()

    if (!servicesReady || !getUserUseCase) {
      // Use fallback theme when services aren't ready
      themeState.mode.set(initialMode)
      themeState.theme.set(createTheme(initialMode))
      return
    }

    const initializeTheme = async () => {
      try {
        const user = await getUserUseCase.execute()
        const mode = themePreferenceToMode(user.preferences.theme)

        themeState.mode.set(mode)
        themeState.theme.set(createTheme(mode))
      } catch {
        // Fallback to initial mode if user service fails
        themeState.mode.set(initialMode)
        themeState.theme.set(createTheme(initialMode))
      }
    }

    initializeTheme()
  }, [initialMode])

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      themeState.mode.set(mode)
      themeState.theme.set(createTheme(mode))

      // Update user preferences only if service is available
      const updateThemeUseCase = servicesState.updateThemeUseCase.get()
      if (updateThemeUseCase) {
        const themePreference = themeModeToPreference(mode)
        await updateThemeUseCase.execute(themePreference)
      }
    } catch {
      // Handle error gracefully - UI layer doesn't need detailed error handling
      console.warn('ThemeProvider: Failed to update user theme preference')
    }
  }, [])

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