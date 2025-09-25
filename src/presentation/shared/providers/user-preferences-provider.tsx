import React, { createContext, useContext, useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { useGetOrCreateUserUseCase } from '@/src/infrastructure/di'
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
      return
    }

    const initializePreferences = async () => {
      try {
        userPreferencesState.isLoading.set(true)
        userPreferencesState.error.set(null)

        const user = await getOrCreateUserUseCase.execute()

        userPreferencesState.preferences.set(user.preferences)
        userPreferencesState.ready.set(true)
      } catch (error) {
        console.warn('UserPreferencesProvider: Failed to load user preferences', error)
        userPreferencesState.error.set(error instanceof Error ? error : new Error(String(error)))
        // Continue with default preferences
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
      userPreferencesState.isLoading.set(true)
      userPreferencesState.error.set(null)

      const user = await getOrCreateUserUseCase.execute()
      userPreferencesState.preferences.set(user.preferences)
    } catch (error) {
      console.warn('UserPreferencesProvider: Failed to refresh user preferences', error)
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

// Utility function to update preferences in observable state and refresh theme
export const updateUserPreferencesState = (preferences: Partial<UserPreferences>): void => {
  const currentPreferences = userPreferencesState.preferences.get()

  // Deep merge the preferences
  const updatedPreferences: UserPreferences = {
    ...currentPreferences,
    ...preferences,
    theme: {
      ...currentPreferences.theme,
      ...preferences.theme
    },
    locale: {
      ...currentPreferences.locale,
      ...preferences.locale
    },
    displaySettings: {
      ...currentPreferences.displaySettings,
      ...preferences.displaySettings
    },
    providerPreferences: {
      ...currentPreferences.providerPreferences,
      ...preferences.providerPreferences,
      enabledProviders: {
        ...currentPreferences.providerPreferences.enabledProviders,
        ...preferences.providerPreferences?.enabledProviders
      }
    },
    streamPreferences: {
      ...currentPreferences.streamPreferences,
      ...preferences.streamPreferences
    },
    notificationSettings: {
      ...currentPreferences.notificationSettings,
      ...preferences.notificationSettings
    }
  }

  userPreferencesState.preferences.set(updatedPreferences)

  // Note: Theme updates are handled by the theme context listening to user preferences
  // The theme context will automatically recreate themes when it detects preference changes
}