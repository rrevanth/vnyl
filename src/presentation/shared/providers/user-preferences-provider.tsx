import React, { createContext, useContext, useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { useGetOrCreateUserUseCase } from '@/src/infrastructure/di'
import { SettingsLogger } from '@/src/presentation/shared/utils/settings-logger'
import type {
  UserPreferences,
  ThemePreference,
  LocalePreferences,
  DisplaySettings,
  ProviderPreferences
} from '@/src/domain/entities'
import { DEFAULT_USER_PREFERENCES } from '@/src/domain/entities'

interface UserPreferencesContextValue {
  preferences: UserPreferences
  // Theme preferences
  themePreference: ThemePreference
  // Locale preferences
  localePreferences: LocalePreferences
  // Display settings
  displaySettings: DisplaySettings
  // Provider preferences
  providerPreferences: ProviderPreferences
  // Loading state
  isLoading: boolean
  // Error state
  error: Error | null
  // Refresh function
  refresh: () => Promise<void>
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null)

// Observable user preferences state
const userPreferencesState = observable<{
  preferences: UserPreferences
  isLoading: boolean
  error: Error | null
  ready: boolean
}>({
  preferences: DEFAULT_USER_PREFERENCES,
  isLoading: true,
  error: null,
  ready: false
})

interface UserPreferencesProviderProps {
  children: React.ReactNode
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = observer(({
  children
}) => {
  // Safely try to get services, handling DI container race condition
  let getOrCreateUserUseCase: any = null

  try {
    getOrCreateUserUseCase = useGetOrCreateUserUseCase()
  } catch {
    // Services not ready yet, continue with default preferences
  }

  // Initialize user preferences from backend
  useEffect(() => {
    if (!getOrCreateUserUseCase) {
      SettingsLogger.providerNotReady()
      return
    }

    const initializePreferences = async () => {
      try {
        SettingsLogger.providerStart('user preferences initialization')
        userPreferencesState.isLoading.set(true)
        userPreferencesState.error.set(null)

        const user = await getOrCreateUserUseCase.execute()
        SettingsLogger.providerLoaded({
          userId: user.userId,
          themeMode: user.preferences.theme?.mode,
          accentColor: user.preferences.theme?.accentColor,
          fontSize: user.preferences.displaySettings?.fontSize,
          fontFamily: user.preferences.displaySettings?.fontFamily,
          compactMode: user.preferences.displaySettings?.compactMode
        })

        userPreferencesState.preferences.set(user.preferences)
        userPreferencesState.ready.set(true)
        SettingsLogger.providerSuccess('User preferences state')
      } catch (error) {
        SettingsLogger.providerError('load user preferences', error)
        userPreferencesState.error.set(error instanceof Error ? error : new Error(String(error)))
        // Continue with default preferences
        SettingsLogger.providerFallback('default preferences')
        userPreferencesState.preferences.set(DEFAULT_USER_PREFERENCES)
      } finally {
        userPreferencesState.isLoading.set(false)
      }
    }

    initializePreferences()
  }, [getOrCreateUserUseCase])

  const refresh = async (): Promise<void> => {
    if (!getOrCreateUserUseCase) return

    try {
      SettingsLogger.providerRefreshing()
      userPreferencesState.isLoading.set(true)
      userPreferencesState.error.set(null)

      const user = await getOrCreateUserUseCase.execute()
      SettingsLogger.providerRefreshed({
        userId: user.userId,
        themeMode: user.preferences.theme?.mode,
        accentColor: user.preferences.theme?.accentColor,
        fontSize: user.preferences.displaySettings?.fontSize,
        fontFamily: user.preferences.displaySettings?.fontFamily,
        compactMode: user.preferences.displaySettings?.compactMode
      })
      userPreferencesState.preferences.set(user.preferences)
    } catch (error) {
      SettingsLogger.providerError('refresh user preferences', error)
      userPreferencesState.error.set(error instanceof Error ? error : new Error(String(error)))
    } finally {
      userPreferencesState.isLoading.set(false)
    }
  }

  const contextValue: UserPreferencesContextValue = {
    preferences: userPreferencesState.preferences.get(),
    themePreference: userPreferencesState.preferences.theme.get(),
    localePreferences: userPreferencesState.preferences.locale.get(),
    displaySettings: userPreferencesState.preferences.displaySettings.get(),
    providerPreferences: userPreferencesState.preferences.providerPreferences.get(),
    isLoading: userPreferencesState.isLoading.get(),
    error: userPreferencesState.error.get(),
    refresh
  }

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  )
})

// Hooks for accessing user preferences
export const useUserPreferences = (): UserPreferencesContextValue => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}

export const useThemePreference = (): ThemePreference => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useThemePreference must be used within a UserPreferencesProvider')
  }
  return context.themePreference
}

export const useLocalePreferences = (): LocalePreferences => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useLocalePreferences must be used within a UserPreferencesProvider')
  }
  return context.localePreferences
}

export const useDisplaySettings = (): DisplaySettings => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useDisplaySettings must be used within a UserPreferencesProvider')
  }
  return context.displaySettings
}

export const useProviderPreferences = (): ProviderPreferences => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useProviderPreferences must be used within a UserPreferencesProvider')
  }
  return context.providerPreferences
}

// Export observable state for theme context to observe
export const getUserPreferencesObservable = () => userPreferencesState.preferences